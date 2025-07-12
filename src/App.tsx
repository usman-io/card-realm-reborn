
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/sonner';
import Header from '@/components/Header';
import Home from '@/pages/Home';
import Cards from '@/pages/Cards';
import Sets from '@/pages/Sets';
import CardDetail from '@/pages/CardDetail';
import SetDetail from '@/pages/SetDetail';
import Dashboard from '@/pages/Dashboard';
import Premium from '@/pages/Premium';
import PaymentSuccess from '@/pages/PaymentSuccess';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/ProtectedRoute';

const queryClient = new QueryClient();

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
                <Route path="/cards" element={<Cards />} />
                <Route path="/cards/:id" element={<CardDetail />} />
                <Route path="/sets" element={<Sets />} />
                <Route path="/sets/:id" element={<SetDetail />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
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
