from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from django.conf import settings
import stripe
import json
import logging
from .models import Subscription
from .serializers import SubscriptionSerializer

logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY

class SubscriptionListCreateView(generics.ListCreateAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SubscriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_checkout_session(request):
    try:
        plan = request.data.get('plan', 'monthly')
        
        # Check if user already has an active subscription
        try:
            existing_subscription = Subscription.objects.get(user=request.user)
            if existing_subscription.status == 'active':
                logger.warning(f"User {request.user.email} already has an active subscription.")
                return Response({'error': 'User already has an active subscription'}, status=400)
        except Subscription.DoesNotExist:
            pass

        # Create or get Stripe customer
        try:
            customer = stripe.Customer.list(email=request.user.email).data[0]
        except IndexError:
            customer = stripe.Customer.create(
                email=request.user.email,
                name=f"{request.user.first_name} {request.user.last_name}".strip()
            )

        # Set price based on plan
        if plan == 'yearly':
            price_data = {
                'currency': 'usd',
                'product_data': {
                    'name': 'Premium Plan - Yearly',
                },
                'unit_amount': 4000,  # $40.00
                'recurring': {
                    'interval': 'year',
                },
            }
        else:
            price_data = {
                'currency': 'usd',
                'product_data': {
                    'name': 'Premium Plan - Monthly',
                },
                'unit_amount': 399,  # $3.99
                'recurring': {
                    'interval': 'month',
                },
            }

        # Create checkout session
        checkout_session = stripe.checkout.Session.create(
            customer=customer.id,
            payment_method_types=['card'],
            line_items=[{
                'price_data': price_data,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f'{settings.FRONTEND_URL}/payment-success?session_id={{CHECKOUT_SESSION_ID}}',
            cancel_url=f'{settings.FRONTEND_URL}/premium?canceled=true',
        )

        return Response({'url': checkout_session.url})

    except Exception as e:
        logger.error(f"Error creating checkout session: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_portal_session(request):
    try:
        # Get user's Stripe customer
        try:
            customer = stripe.Customer.list(email=request.user.email).data[0]
        except IndexError:
            return Response({'error': 'No Stripe customer found'}, status=404)

        # Create portal session
        portal_session = stripe.billing_portal.Session.create(
            customer=customer.id,
            return_url=f'{settings.FRONTEND_URL}/premium',
        )

        return Response({'url': portal_session.url})

    except Exception as e:
        logger.error(f"Error creating portal session: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_subscription(request):
    try:
        # Get user's active subscription
        try:
            subscription = Subscription.objects.get(user=request.user, status='active')
        except Subscription.DoesNotExist:
            return Response({'error': 'No active subscription found'}, status=404)

        # Cancel the Stripe subscription at period end to allow access until end of billing period
        if subscription.stripe_subscription_id:
            stripe_subscription = stripe.Subscription.modify(
                subscription.stripe_subscription_id,
                cancel_at_period_end=True
            )
            logger.info(f"Stripe subscription {subscription.stripe_subscription_id} set to cancel at period end")

        # Update local subscription status
        subscription.status = 'canceled'
        subscription.save()
        logger.info(f"Local subscription {subscription.id} marked as canceled")

        return Response({'message': 'Subscription canceled successfully. Access will continue until the end of your billing period.'})

    except Exception as e:
        logger.error(f"Error canceling subscription: {str(e)}")
        return Response({'error': str(e)}, status=500)

@csrf_exempt
@require_POST
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError:
        logger.error("Invalid payload")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid signature")
        return HttpResponse(status=400)

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        handle_checkout_completed(event['data']['object'])
    elif event['type'] == 'invoice.payment_succeeded':
        handle_payment_succeeded(event['data']['object'])
    elif event['type'] == 'customer.subscription.updated':
        handle_subscription_updated(event['data']['object'])
    elif event['type'] == 'customer.subscription.deleted':
        handle_subscription_deleted(event['data']['object'])
    else:
        logger.info(f'Unhandled event type: {event["type"]}')

    return HttpResponse(status=200)

def handle_checkout_completed(session):
    try:
        customer_email = session['customer_details']['email']
        stripe_customer_id = session['customer']
        stripe_subscription_id = session['subscription']
        
        # Get the user
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.get(email=customer_email)
        
        # Get subscription details from Stripe
        stripe_subscription = stripe.Subscription.retrieve(stripe_subscription_id)
        plan = 'yearly' if stripe_subscription['items']['data'][0]['price']['recurring']['interval'] == 'year' else 'monthly'
        
        # Create or update subscription
        subscription, created = Subscription.objects.update_or_create(
            user=user,
            defaults={
                'stripe_customer_id': stripe_customer_id,
                'stripe_subscription_id': stripe_subscription_id,
                'plan': plan,
                'is_active': True,
            }
        )
        
        logger.info(f"Subscription {'created' if created else 'updated'} for user {user.email}")
        
    except Exception as e:
        logger.error(f"Error handling checkout completed: {str(e)}")

def handle_payment_succeeded(invoice):
    try:
        if 'subscription' not in invoice:
            logger.info("Invoice not related to subscription, skipping")
            return
            
        subscription_id = invoice['subscription']
        stripe_subscription = stripe.Subscription.retrieve(subscription_id)
        customer = stripe.Customer.retrieve(stripe_subscription['customer'])
        
        # Update subscription status
        try:
            subscription = Subscription.objects.get(stripe_subscription_id=subscription_id)
            subscription.is_active = True
            subscription.save()
            logger.info(f"Updated subscription status for {customer['email']}")
        except Subscription.DoesNotExist:
            logger.warning(f"Local subscription not found for Stripe subscription {subscription_id}")
            
    except Exception as e:
        logger.error(f"Error handling payment succeeded: {str(e)}")

def handle_subscription_updated(subscription):
    try:
        stripe_subscription_id = subscription['id']
        
        # Update local subscription
        try:
            local_subscription = Subscription.objects.get(stripe_subscription_id=stripe_subscription_id)
            local_subscription.is_active = subscription['status'] == 'active'
            local_subscription.save()
            logger.info(f"Updated subscription {stripe_subscription_id}")
        except Subscription.DoesNotExist:
            logger.warning(f"Local subscription not found for {stripe_subscription_id}")
            
    except Exception as e:
        logger.error(f"Error handling subscription updated: {str(e)}")

def handle_subscription_deleted(subscription):
    try:
        stripe_subscription_id = subscription['id']
        
        # Update local subscription
        try:
            local_subscription = Subscription.objects.get(stripe_subscription_id=stripe_subscription_id)
            local_subscription.is_active = False
            local_subscription.save()
            logger.info(f"Canceled subscription {stripe_subscription_id}")
        except Subscription.DoesNotExist:
            logger.warning(f"Local subscription not found for {stripe_subscription_id}")
            
    except Exception as e:
        logger.error(f"Error handling subscription deleted: {str(e)}")
