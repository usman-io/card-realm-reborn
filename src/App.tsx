import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Cards from '@/pages/Cards';
import CardDetail from '@/pages/CardDetail';
import Sets from '@/pages/Sets';
import SetDetail from '@/pages/SetDetail';
import UserCollection from '@/pages/UserCollection';
import UserWishlist from '@/pages/UserWishlist';
import UserGradedCards from '@/pages/UserGradedCards';
import Premium from '@/pages/Premium';
import PaymentSuccess from '@/pages/PaymentSuccess';
import Activities from '@/pages/Activities';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import SharedDashboard from '@/pages/SharedDashboard';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cards" element={<Cards />} />
                <Route path="/cards/:id" element={<CardDetail />} />
                <Route path="/sets" element={<Sets />} />
                <Route path="/sets/:id" element={<SetDetail />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard">
                  <Route index element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="collection" element={
                    <ProtectedRoute>
                      <UserCollection />
                    </ProtectedRoute>
                  } />
                  <Route path="wishlist" element={
                    <ProtectedRoute>
                      <UserWishlist />
                    </ProtectedRoute>
                  } />
                  <Route path="graded" element={
                    <ProtectedRoute>
                      <UserGradedCards />
                    </ProtectedRoute>
                  } />
                  <Route path="activities" element={
                    <ProtectedRoute>
                      <Activities />
                    </ProtectedRoute>
                  } />
                  <Route path="premium" element={
                    <ProtectedRoute>
                      <Premium />
                    </ProtectedRoute>
                  } />
                  <Route path="payment-success" element={
                    <ProtectedRoute>
                      <PaymentSuccess />
                    </ProtectedRoute>
                  } />
                </Route>
                
                {/* Public Shared Dashboard Route */}
                <Route path="/dashboard/shared/:userId" element={<SharedDashboard />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
