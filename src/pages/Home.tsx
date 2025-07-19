
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-700 mb-6">
            Collect, Track, and Trade
            <span className="text-brand-dark-blue block">Pokémon Cards</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The ultimate platform for Pokémon TCG collectors. Build your collection, 
            track your progress, and discover new cards from every set.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto bg-brand-dark-blue hover:bg-brand-dark-blue/80">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-brand-dark-blue hover:bg-brand-dark-blue/80">
                    Start Collecting
                  </Button>
                </Link>
                <Link to="/cards">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-white bg-brand-dark-blue hover:bg-brand-dark-blue/80">
                    Browse Cards
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Everything You Need for TCG Collecting
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    📊
                  </div>
                  Track Your Collection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Keep track of every card you own with detailed statistics, 
                  condition tracking, and collection value estimates.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    🎯
                  </div>
                  Wishlist Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create wishlists for cards you want to collect and track 
                  their availability and market prices.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    🔍
                  </div>
                  Comprehensive Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Access the complete Pokémon TCG database with high-quality 
                  images, detailed information, and market data.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-brand-dark-blue text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Collection Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of collectors who trust TCG Collector to manage their Pokémon card collections.
          </p>
          {!isAuthenticated && (
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Create Your Free Account
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
