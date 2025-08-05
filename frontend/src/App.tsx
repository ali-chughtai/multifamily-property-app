import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './utils/trpc';
import Layout from './components/Layout';
import PropertyForm from './components/PropertyForm';
import TenantProfileForm from './components/TenantProfileForm';
import AmenitySuggestions from './components/AmenitySuggestions';

const queryClient = new QueryClient();

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: process.env.REACT_APP_API_URL || "http://localhost:3001/trpc",
    }),
  ],
});

type AppStep = 'property' | 'tenant' | 'amenities';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('property');
  const [createdProperty, setCreatedProperty] = useState<any>(null);
  const [createdTenantProfile, setCreatedTenantProfile] = useState<any>(null);

  const handlePropertyCreated = (property: any) => {
    setCreatedProperty(property);
    setCurrentStep('tenant');
  };

  const handleTenantProfileCreated = (profile: any) => {
    setCreatedTenantProfile(profile);
    setCurrentStep('amenities');
  };

  const handleStartOver = () => {
    setCurrentStep('property');
    setCreatedProperty(null);
    setCreatedTenantProfile(null);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'property':
        return 'Create Your Property';
      case 'tenant':
        return 'Define Your Ideal Tenant';
      case 'amenities':
        return 'Discover Perfect Amenities';
      default:
        return 'Multifamily Property Management';
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 'property':
        return 'Start by adding your property location, units, and key features';
      case 'tenant':
        return 'Help us understand your target tenant demographics and preferences';
      case 'amenities':
        return 'Get personalized amenity suggestions based on your tenant profile';
      default:
        return '';
    }
  };

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Layout title={getStepTitle()} subtitle={getStepSubtitle()}>
          
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className={`flex items-center ${currentStep === 'property' ? 'text-primary-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 'property' ? 'bg-primary-600 text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:block">Property</span>
              </div>
              
              <div className="w-8 h-0.5 bg-gray-300"></div>
              
              <div className={`flex items-center ${currentStep === 'tenant' ? 'text-primary-600' : createdProperty ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 'tenant' ? 'bg-primary-600 text-white' : createdProperty ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:block">Tenant</span>
              </div>
              
              <div className="w-8 h-0.5 bg-gray-300"></div>
              
              <div className={`flex items-center ${currentStep === 'amenities' ? 'text-primary-600' : createdTenantProfile ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 'amenities' ? 'bg-primary-600 text-white' : createdTenantProfile ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:block">Amenities</span>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {currentStep === 'property' && (
              <div className="animate-slide-up">
                <PropertyForm onPropertyCreated={handlePropertyCreated} />
              </div>
            )}

            {currentStep === 'tenant' && createdProperty && (
              <div className="animate-slide-up">
                <TenantProfileForm 
                  propertyId={createdProperty.id}
                  onProfileCreated={handleTenantProfileCreated}
                />
              </div>
            )}

            {currentStep === 'amenities' && createdTenantProfile && (
              <div className="animate-slide-up">
                <AmenitySuggestions 
                  tenantProfile={createdTenantProfile}
                  onStartOver={handleStartOver}
                />
              </div>
            )}
          </div>
        </Layout>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;