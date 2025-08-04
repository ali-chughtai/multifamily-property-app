import React, { useState } from 'react';
import { trpc } from '../utils/trpc';

interface TenantProfileFormProps {
  propertyId: string;
  onProfileCreated: (profile: any) => void;
}

const TenantProfileForm: React.FC<TenantProfileFormProps> = ({ 
  propertyId, 
  onProfileCreated 
}) => {
  const [ageRange, setAgeRange] = useState('');
  const [incomeRange, setIncomeRange] = useState('');
  const [lifestyle, setLifestyle] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [newPreference, setNewPreference] = useState('');
  const [loading, setLoading] = useState(false);

  const createProfile = trpc.tenant.generateProfile.useMutation({
    onSuccess: (data) => {
      onProfileCreated(data);
    },
    onError: (error) => {
      alert('Error creating tenant profile: ' + error.message);
      throw(error)
    },
  });

  const addPreference = () => {
    if (newPreference.trim() && !preferences.includes(newPreference.trim())) {
      setPreferences([...preferences, newPreference.trim()]);
      setNewPreference('');
    }
  };

  const removePreference = (index: number) => {
    setPreferences(preferences.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ageRange || !incomeRange) {
      alert('Please select both age range and income range');
      return;
    }

    setLoading(true);
    try {
      await createProfile.mutateAsync({
        propertyId,
        ageRange,
        incomeRange,
        lifestyle: lifestyle || undefined,
        preferences: preferences.length > 0 ? preferences : undefined,
      });
    } catch (error) {
      throw(error)
    } finally {
      setLoading(false);
    }
  };

  const ageRanges = [
    '18-25',
    '25-35',
    '35-45',
    '45-55',
    '55+'
  ];

  const incomeRanges = [
    '$30,000-$50,000',
    '$50,000-$75,000',
    '$75,000-$100,000',
    '$100,000+'
  ];

  const lifestyleOptions = [
    'Young Professional',
    'Student',
    'Family',
    'Retiree',
    'Professional',
    'Entrepreneur'
  ];

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-xl mr-2">👥</span>
              Tenant Demographics
            </h3>
          </div>
          
          <div className="card-body space-y-6">
            <div className="form-group">
              <label className="form-label">Age Range *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {ageRanges.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setAgeRange(range)}
                    className={`p-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                      ageRange === range
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Income Range *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {incomeRanges.map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setIncomeRange(range)}
                    className={`p-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                      incomeRange === range
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-xl mr-2">🎯</span>
              Lifestyle & Preferences
            </h3>
          </div>
          
          <div className="card-body space-y-6">
            <div className="form-group">
              <label className="form-label">Lifestyle Category</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {lifestyleOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setLifestyle(option)}
                    className={`p-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                      lifestyle === option
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Custom Preferences</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newPreference}
                  onChange={(e) => setNewPreference(e.target.value)}
                  placeholder="Add tenant preference (gym, parking, etc.)"
                  className="input-field"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addPreference();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={addPreference}
                  className="btn-success whitespace-nowrap"
                  disabled={!newPreference.trim()}
                >
                  Add
                </button>
              </div>
              
              {preferences.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-3">
                    Added preferences:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.map((pref, index) => (
                      <span key={index} className="tag">
                        {pref}
                        <button
                          type="button"
                          onClick={() => removePreference(index)}
                          className="ml-1 w-0 h-4 rounded-full bg-red-700 hover:bg-red-800 text-white flex items-center justify-center text-xs leading-none transition-colors duration-200"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {(ageRange || incomeRange || lifestyle) && (
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="text-xl mr-2">📋</span>
                Profile Summary
              </h3>
            </div>
            
            <div className="card-body">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                {ageRange && (
                  <div><strong>Age Range:</strong> {ageRange} years old</div>
                )}
                {incomeRange && (
                  <div><strong>Income:</strong> {incomeRange} annually</div>
                )}
                {lifestyle && (
                  <div><strong>Lifestyle:</strong> {lifestyle}</div>
                )}
                {preferences.length > 0 && (
                  <div><strong>Preferences:</strong> {preferences.join(', ')}</div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-center space-y-4">
          <button 
            type="submit" 
            disabled={!ageRange || !incomeRange || loading || createProfile.isLoading}
            className={`btn-primary text-lg px-8 py-4 ${
              (!ageRange || !incomeRange) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading || createProfile.isLoading 
              ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Profile...
                </span>
              ) 
              : (ageRange && incomeRange)
                ? '🎯 Generate Tenant Profile' 
                : '📋 Select Demographics First'
            }
          </button>
          
          {(!ageRange || !incomeRange) && (
            <p className="text-sm text-gray-500">
              Please select both age range and income range to continue
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default TenantProfileForm;