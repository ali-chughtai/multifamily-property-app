import React, { useState, useRef, useEffect, useCallback } from 'react';

interface InteractiveMapProps {
  initialLocation?: string;
  onLocationSelect: (locationName: string, lat: number, lng: number) => void;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  initialLocation = '', 
  onLocationSelect 
}) => {
  const [searchTerm, setSearchTerm] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  const searchLocations = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data || []);
      
      if (initialLocation && data.length > 0 && !selectedLocation && !initialized) {
        const firstResult = data[0];
        handleLocationClick(firstResult);
        setInitialized(true);
      }
    } catch (error) {
      setSuggestions([]);
      throw (error)
    } finally {
      setIsSearching(false);
    }
  }, [initialLocation, selectedLocation, initialized]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  const handleLocationClick = useCallback(async (location: any) => {
    setSelectedLocation(location);
    setSearchTerm(location.display_name);
    setSuggestions([]);
    
    const lat = parseFloat(location.lat);
    const lng = parseFloat(location.lon);
    
    onLocationSelect(location.display_name, lat, lng);
    
    await drawSatelliteMap(lat, lng);
  }, [onLocationSelect]);

  const loadTile = (tileX: number, tileY: number, zoom: number, drawX: number, drawY: number, ctx: CanvasRenderingContext2D): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const providers = [
        `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${tileY}/${tileX}`,
        `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`
      ];

      let providerIndex = 0;

      const tryLoadTile = () => {
        if (providerIndex >= providers.length) {
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(drawX, drawY, 256, 256);
          ctx.fillStyle = '#999';
          ctx.font = '12px Arial';
          ctx.fillText('No Image', drawX + 110, drawY + 128);
          resolve();
          return;
        }

        const tileUrl = providers[providerIndex];
        img.src = tileUrl;
        
        img.onload = () => {
          try {
            ctx.drawImage(img, drawX, drawY);
            resolve();
          } catch (error) {
            providerIndex++;
            tryLoadTile();
          }
        };

        img.onerror = () => {
          providerIndex++;
          setTimeout(tryLoadTile, 100);
        };
      };

      tryLoadTile();
    });
  };

  const drawSatelliteMap = useCallback(async (lat: number, lon: number) => {
    if (!canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    setMapLoading(true);

    try {
      const zoom = 17;
      const tileSize = 256;
      const mapSize = 3;

      canvas.width = tileSize * mapSize;
      canvas.height = tileSize * mapSize;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerTileX = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
      const centerTileY = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));


      const tilePromises = [];
      for (let x = -1; x <= 1; x++) {
        for (let y = -1; y <= 1; y++) {
          const tileX = centerTileX + x;
          const tileY = centerTileY + y;
          
          tilePromises.push(loadTile(tileX, tileY, zoom, (x + 1) * tileSize, (y + 1) * tileSize, ctx));
        }
      }

      await Promise.all(tilePromises);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      ctx.beginPath();
      ctx.arc(centerX + 2, centerY + 2, 10, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
      ctx.fillStyle = '#ff4444';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255, 68, 68, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

    } catch (error) {
      throw (error)
    } finally {
      setMapLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLocation) {
      const lat = parseFloat(selectedLocation.lat);
      const lng = parseFloat(selectedLocation.lon);
      drawSatelliteMap(lat, lng);
    }
  }, [selectedLocation, drawSatelliteMap]);

  useEffect(() => {
    if (initialLocation && !initialized) {
      setSearchTerm(initialLocation);
      searchLocations(initialLocation);
    }
  }, [initialLocation, initialized, searchLocations]);

  useEffect(() => {
    if (initialLocation) {
      setInitialized(false);
      setSelectedLocation(null);
      setSearchTerm('');
    }
  }, [initialLocation]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search for an address (e.g: Maple Street, Robins, Linn County, Iowa, United States)"
            className="input-field pr-10"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isSearching ? (
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>

        {suggestions.length > 0 && (
  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
    {suggestions.map((suggestion, index) => (
      <button
        key={index}
        onClick={() => handleLocationClick(suggestion)}
        className="w-full text-left px-4 py-3 bg-white hover:bg-blue-50 text-gray-900 hover:text-blue-900 border-b border-gray-100 last:border-b-0 transition-colors duration-150 focus:outline-none focus:bg-blue-50 focus:text-blue-900"
      >
        <div className="font-medium truncate">
          📍 {suggestion.display_name}
        </div>
        <div className="text-sm text-gray-500 hover:text-blue-600">
          Lat: {parseFloat(suggestion.lat).toFixed(4)}, Lng: {parseFloat(suggestion.lon).toFixed(4)}
        </div>
      </button>
    ))}
  </div>
)}
      </div>

      <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden">
        {selectedLocation ? (
          <>
            {mapLoading && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                <div className="text-center">
                  <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm text-gray-600">Loading satellite imagery...</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedLocation.display_name.length > 50 
                      ? selectedLocation.display_name.substring(0, 50) + '...'
                      : selectedLocation.display_name
                    }
                  </p>
                </div>
              </div>
            )}
            
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
              style={{ imageRendering: 'crisp-edges' }}
            />

            <div className="absolute top-2 right-2 bg-black bg-opacity-80 text-white px-3 py-1 rounded text-xs font-bold">
              🛰️ HD Satellite
            </div>
            
            <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-80 text-white px-3 py-2 rounded text-xs">
              <div className="font-bold mb-1">
                📍 {selectedLocation.display_name.length > 60 
                  ? selectedLocation.display_name.substring(0, 60) + '...' 
                  : selectedLocation.display_name}
              </div>
              <div className="opacity-80">
                Coordinates: {parseFloat(selectedLocation.lat).toFixed(6)}, {parseFloat(selectedLocation.lon).toFixed(6)}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-6">
            <div>
              <div className="text-4xl sm:text-5xl mb-4">🗺️</div>
              <div className="text-base sm:text-lg font-medium mb-2 text-gray-700">
                {initialLocation ? 'Loading location...' : 'Search for a location'}
              </div>
              <div className="text-sm text-gray-500 max-w-xs">
                {initialLocation 
                  ? `Finding: ${initialLocation}`
                  : 'Type an address above and select from suggestions to view satellite imagery'
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveMap;