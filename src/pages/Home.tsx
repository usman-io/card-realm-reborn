
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-700 mb-6">
            {t('home.heroTitle')}
            <span className="text-brand-dark-blue block">{t('home.heroSubtitle')}</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {t('home.heroDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto bg-brand-dark-blue hover:bg-brand-dark-blue/80">
                  {t('home.goToDashboard')}
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-brand-dark-blue hover:bg-brand-dark-blue/80">
                    {t('home.startCollecting')}
                  </Button>
                </Link>
                <Link to="/cards">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-brand-dark-blue">
                    {t('home.browseCards')}
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
            {t('home.featuresTitle')}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    📊
                  </div>
                  {t('home.trackCollectionTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('home.trackCollectionDesc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    🎯
                  </div>
                  {t('home.wishlistTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('home.wishlistDesc')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    🔍
                  </div>
                  {t('home.databaseTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('home.databaseDesc')}
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
            {t('home.ctaTitle')}
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            {t('home.ctaDescription')}
          </p>
          {!isAuthenticated && (
            <Link to="/register">
              <Button size="lg" variant="secondary">
                {t('home.createFreeAccount')}
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
