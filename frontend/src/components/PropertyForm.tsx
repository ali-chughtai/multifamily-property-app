import React, { useState } from "react";
import { trpc } from "../utils/trpc";
import InteractiveMap from "./InteractiveMap";

interface PropertyFormProps {
  onPropertyCreated: (property: any) => void;
}

const PropertyForm: React.FC<PropertyFormProps> = ({ onPropertyCreated }) => {
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [units, setUnits] = useState(1);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [newPreference, setNewPreference] = useState("");
  const [loading, setLoading] = useState(false);
  const [propertyCreated, setPropertyCreated] = useState(false);

  const createProperty = trpc.property.create.useMutation({
    onSuccess: (data) => {
      setPropertyCreated(true);
      onPropertyCreated(data);
    },
    onError: (error) => {
      alert("Error creating property: " + error.message);
      throw (error)
    },
  });

  const handleLocationSelect = (
    locationName: string,
    lat: number,
    lng: number
  ) => {
    setSelectedLocation({
      address: locationName,
      lat,
      lng,
    });
  };

  const addPreference = () => {
    if (newPreference.trim() && !preferences.includes(newPreference.trim())) {
      setPreferences([...preferences, newPreference.trim()]);
      setNewPreference("");
    }
  };

  const removePreference = (index: number) => {
    setPreferences(preferences.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocation) {
      alert("Please select a location from the search suggestions");
      return;
    }

    setLoading(true);
    try {
      await createProperty.mutateAsync({
        location: selectedLocation.address,
        units,
        preferences:
          preferences.length > 0 ? preferences.join(", ") : undefined,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
      });
    } catch (error) {
      throw (error)
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setSelectedLocation(null);
    setUnits(1);
    setPreferences([]);
    setNewPreference("");
    setPropertyCreated(false);
  };

  if (propertyCreated && selectedLocation) {
    return (
      <div className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <span className="text-2xl mr-2">🎉</span>
              Property Created Successfully!
            </h2>
          </div>

          <div className="card-body space-y-4">
            <div className="alert-success">
              <div className="space-y-2">
                <div>
                  <strong>Property Location:</strong> {selectedLocation.address}
                </div>
                <div>
                  <strong>Units:</strong> {units}
                </div>
                {preferences.length > 0 && (
                  <div>
                    <strong>Features:</strong> {preferences.join(", ")}
                  </div>
                )}
                <div>
                  <strong>Coordinates:</strong>{" "}
                  {selectedLocation.lat.toFixed(6)},{" "}
                  {selectedLocation.lng.toFixed(6)}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Property Satellite View
              </h3>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                <InteractiveMap
                  initialLocation={selectedLocation.address}
                  onLocationSelect={() => {}}
                />
              </div>
            </div>

            <div className="flex justify-center pt-4">
              <button onClick={handleStartOver} className="btn-secondary">
                Create Another Property
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-xl mr-2">📍</span>
              Property Location
            </h3>
          </div>

          <div className="card-body">
            <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-4 mb-4">
              <p className="text-primary-800 text-sm font-medium mb-3">
                🔍 Search and select your property location:
              </p>
              <InteractiveMap
                initialLocation=""
                onLocationSelect={handleLocationSelect}
              />
            </div>

            {selectedLocation ? (
              <div className="alert-success">
                <div className="font-bold mb-2 flex items-center">
                  <span className="text-green-600 mr-2">✅</span>
                  Location Selected:
                </div>
                <div className="mb-2">
                  📍{" "}
                  {selectedLocation.address.length > 80
                    ? selectedLocation.address.substring(0, 80) + "..."
                    : selectedLocation.address}
                </div>
                <div className="text-sm opacity-80">
                  📍 Coordinates: {selectedLocation.lat.toFixed(6)},{" "}
                  {selectedLocation.lng.toFixed(6)}
                </div>
              </div>
            ) : (
              <div className="alert-warning">
                <span className="mr-2">⚠️</span>
                Please search and select a location from the suggestions above
                to continue
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-xl mr-2">🏠</span>
              Property Details
            </h3>
          </div>

          <div className="card-body">
            <div className="form-group">
              <label htmlFor="units" className="form-label">
                Number of Units
              </label>
              <input
                type="number"
                id="units"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
                min="1"
                max="1000"
                required
                className="input-field"
                placeholder="Enter number of units"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="text-xl mr-2">🏷️</span>
              Property Features & Preferences
            </h3>
          </div>

          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Add Features</label>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newPreference}
                  onChange={(e) => setNewPreference(e.target.value)}
                  placeholder="Enter a preference or feature..."
                  className="input-field"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
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
                          title="Remove preference"
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

        <div className="text-center space-y-4">
          <button
            type="submit"
            disabled={!selectedLocation || loading || createProperty.isLoading}
            className={`btn-primary text-lg px-8 py-4 ${
              !selectedLocation ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading || createProperty.isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Property...
              </span>
            ) : selectedLocation ? (
              "🏢 Create Property"
            ) : (
              "📍 Select Location First"
            )}
          </button>

          {!selectedLocation && (
            <p className="text-sm text-gray-500">
              Search for an address above to enable the Create Property button
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default PropertyForm;
