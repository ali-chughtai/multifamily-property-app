import React, { useState, useEffect } from 'react';
import { trpc } from '../utils/trpc';

interface AmenitySuggestionsProps {
  tenantProfile: any;
  onStartOver: () => void;
}

const AmenitySuggestions: React.FC<AmenitySuggestionsProps> = ({ 
  tenantProfile, 
  onStartOver 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'cost' | 'category' | 'relevance'>('relevance');

  const { data: amenities, isLoading, error } = trpc.amenity.getSuggestions.useQuery({
    tenantProfileId: tenantProfile.id,
    ageRange: tenantProfile.ageRange,
    lifestyle: tenantProfile.lifestyle,
    incomeRange: tenantProfile.incomeRange,
    category: selectedCategory === 'all' ? undefined : selectedCategory,
  });

  const { data: categories } = trpc.amenity.getCategories.useQuery();

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(cost);
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      fitness: '💪',
      social: '🎉',
      work: '💼',
      family: '👨‍👩‍👧‍👦',
      pets: '🐕',
      luxury: '✨',
      convenience: '🛎️',
      security: '🔒'
    };
    return icons[category] || '🏗️';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      fitness: 'bg-green-100 text-green-800 border-green-200',
      social: 'bg-purple-100 text-purple-800 border-purple-200',
      work: 'bg-blue-100 text-blue-800 border-blue-200',
      family: 'bg-pink-100 text-pink-800 border-pink-200',
      pets: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      luxury: 'bg-amber-100 text-amber-800 border-amber-200',
      convenience: 'bg-gray-100 text-gray-800 border-gray-200',
      security: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const sortedAmenities = amenities ? [...amenities].sort((a, b) => {
    switch (sortBy) {
      case 'cost':
        return a.estimatedCost - b.estimatedCost;
      case 'category':
        return a.category.localeCompare(b.category);
      case 'relevance':
      default:
        return 0;
    }
  }) : [];

  const groupedAmenities = sortedAmenities.reduce((acc, amenity) => {
    if (!acc[amenity.category]) {
      acc[amenity.category] = [];
    }
    acc[amenity.category].push(amenity);
    return acc;
  }, {} as { [key: string]: any[] });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-medium text-gray-900">Generating Amenity Suggestions...</p>
          <p className="text-sm text-gray-500">Analyzing your tenant profile</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body text-center">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Suggestions</h3>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <button onClick={onStartOver} className="btn-secondary">
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Tenant Profile Summary */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <span className="text-xl mr-2">👤</span>
            Target Tenant Profile
          </h3>
        </div>
        
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Age Range</div>
              <div className="font-semibold text-gray-900">{tenantProfile.ageRange}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Income Range</div>
              <div className="font-semibold text-gray-900">{tenantProfile.incomeRange}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm text-gray-600">Lifestyle</div>
              <div className="font-semibold text-gray-900">{tenantProfile.lifestyle || 'Not specified'}</div>
            </div>
          </div>
          
          {tenantProfile.idealTenant && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="text-sm font-medium text-primary-800 mb-1">AI Generated Profile:</div>
              <div className="text-primary-700">{tenantProfile.idealTenant}</div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                <option value="all">All Categories</option>
                {categories?.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="input-field"
              >
                <option value="relevance">Relevance</option>
                <option value="cost">Cost (Low to High)</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities Grid */}
      {Object.keys(groupedAmenities).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedAmenities).map(([category, categoryAmenities]) => (
            <div key={category} className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="text-xl mr-2">{getCategoryIcon(category)}</span>
                  {category.charAt(0).toUpperCase() + category.slice(1)} Amenities
                  <span className="ml-2 text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                    {categoryAmenities.length}
                  </span>
                </h3>
              </div>
              
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryAmenities.map((amenity) => (
                    <div key={amenity.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-gray-900">{amenity.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getCategoryColor(amenity.category)}`}>
                          {amenity.category}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{amenity.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-primary-600">
                          {formatCost(amenity.estimatedCost)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Estimated Cost
                        </div>
                      </div>
                      
                      {amenity.targetDemographics && amenity.targetDemographics.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="text-xs text-gray-500 mb-1">Target Demographics:</div>
                          <div className="flex flex-wrap gap-1">
                            {amenity.targetDemographics.slice(0, 3).map((demo: string, index: number) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                {demo}
                              </span>
                            ))}
                            {amenity.targetDemographics.length > 3 && (
                              <span className="text-xs text-gray-400">+{amenity.targetDemographics.length - 3} more</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="card-body text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Amenities Found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or check back later for more suggestions.
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="text-center space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={onStartOver}
            className="btn-secondary"
          >
            🔄 Start Over
          </button>
          
          <button 
            onClick={() => window.print()}
            className="btn-primary"
          >
            📄 Export Report
          </button>
        </div>
        
        <p className="text-sm text-gray-500">
          Amenity costs are estimates and may vary based on location and specifications
        </p>
      </div>
    </div>
  );
};

export default AmenitySuggestions;