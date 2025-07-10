
import stripe
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Subscription
from .serializers import SubscriptionSerializer
import json
from datetime import datetime

stripe.api_key = settings.STRIPE_SECRET_KEY

class SubscriptionDetailView(generics.RetrieveAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        try:
            return Subscription.objects.get(user=self.request.user)
        except Subscription.DoesNotExist:
            return None
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance is None:
            return Response({'subscribed': False})
        serializer = self.get_serializer(instance)
        data = serializer.data
        data['subscribed'] = instance.is_active
        return Response(data)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_checkout_session(request):
    try:
        plan = request.data.get('plan', 'monthly')
        
        # Price configuration
        prices = {
            'monthly': {
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'Premium Subscription - Monthly',
                    },
                    'unit_amount': 399,  # $3.99
                    'recurring': {
                        'interval': 'month',
                    },
                },
            },
            'yearly': {
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'Premium Subscription - Yearly',
                    },
                    'unit_amount': 4000,  # $40.00
                    'recurring': {
                        'interval': 'year',
                    },
                },
            },
        }
        
        if plan not in prices:
            return Response({'error': 'Invalid plan'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if customer already exists
        try:
            subscription_obj = Subscription.objects.get(user=request.user)
            customer_id = subscription_obj.stripe_customer_id
        except Subscription.DoesNotExist:
            # Create new customer
            customer = stripe.Customer.create(
                email=request.user.email,
                metadata={
                    'user_id': request.user.id,
                }
            )
            customer_id = customer.id
        
        checkout_session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=['card'],
            line_items=[{
                'price_data': prices[plan]['price_data'],
                'quantity': 1,
            }],
            mode='subscription',
            success_url=request.build_absolute_uri('/premium?success=true'),
            cancel_url=request.build_absolute_uri('/premium?canceled=true'),
            metadata={
                'user_id': request.user.id,
                'plan': plan,
            }
        )
        
        return Response({'url': checkout_session.url})
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_portal_session(request):
    try:
        subscription_obj = Subscription.objects.get(user=request.user)
        customer_id = subscription_obj.stripe_customer_id
        
        portal_session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=request.build_absolute_uri('/premium'),
        )
        
        return Response({'url': portal_session.url})
        
    except Subscription.DoesNotExist:
        return Response({'error': 'No subscription found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return JsonResponse({'error': 'Invalid payload'}, status=400)
    except stripe.error.SignatureVerificationError:
        return JsonResponse({'error': 'Invalid signature'}, status=400)
    
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_checkout_session_completed(session)
    elif event['type'] == 'invoice.payment_succeeded':
        invoice = event['data']['object']
        handle_payment_succeeded(invoice)
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        handle_subscription_updated(subscription)
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        handle_subscription_deleted(subscription)
    
    return JsonResponse({'status': 'success'})

def handle_checkout_session_completed(session):
    user_id = session['metadata']['user_id']
    plan = session['metadata']['plan']
    customer_id = session['customer']
    subscription_id = session['subscription']
    
    try:
        from django.contrib.auth.models import User
        user = User.objects.get(id=user_id)
        
        # Get subscription details from Stripe
        stripe_subscription = stripe.Subscription.retrieve(subscription_id)
        
        subscription_obj, created = Subscription.objects.get_or_create(
            user=user,
            defaults={
                'stripe_customer_id': customer_id,
                'stripe_subscription_id': subscription_id,
                'plan': plan,
                'status': 'active',
                'current_period_start': datetime.fromtimestamp(stripe_subscription.current_period_start),
                'current_period_end': datetime.fromtimestamp(stripe_subscription.current_period_end),
            }
        )
        
        if not created:
            subscription_obj.stripe_customer_id = customer_id
            subscription_obj.stripe_subscription_id = subscription_id
            subscription_obj.plan = plan
            subscription_obj.status = 'active'
            subscription_obj.current_period_start = datetime.fromtimestamp(stripe_subscription.current_period_start)
            subscription_obj.current_period_end = datetime.fromtimestamp(stripe_subscription.current_period_end)
            subscription_obj.save()
            
    except Exception as e:
        print(f"Error handling checkout session: {e}")

def handle_payment_succeeded(invoice):
    subscription_id = invoice['subscription']
    
    try:
        subscription_obj = Subscription.objects.get(stripe_subscription_id=subscription_id)
        subscription_obj.status = 'active'
        subscription_obj.save()
    except Subscription.DoesNotExist:
        pass

def handle_subscription_updated(subscription):
    subscription_id = subscription['id']
    
    try:
        subscription_obj = Subscription.objects.get(stripe_subscription_id=subscription_id)
        subscription_obj.status = subscription['status']
        subscription_obj.current_period_start = datetime.fromtimestamp(subscription['current_period_start'])
        subscription_obj.current_period_end = datetime.fromtimestamp(subscription['current_period_end'])
        subscription_obj.save()
    except Subscription.DoesNotExist:
        pass

def handle_subscription_deleted(subscription):
    subscription_id = subscription['id']
    
    try:
        subscription_obj = Subscription.objects.get(stripe_subscription_id=subscription_id)
        subscription_obj.status = 'canceled'
        subscription_obj.save()
    except Subscription.DoesNotExist:
        pass
