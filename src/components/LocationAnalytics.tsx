
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LocationData {
  country: string;
  visits: number;
  percentage: number;
  cities?: { name: string; visits: number; percentage: number }[];
}

interface LocationAnalyticsProps {
  data?: LocationData[];
  loading?: boolean;
}

export const LocationAnalytics = ({ data = [], loading = false }: LocationAnalyticsProps) => {
  const [filter, setFilter] = useState<'country' | 'city'>('country');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  // Use mock data if no data is provided
  const displayData = data.length > 0 ? data : [
    { 
      country: 'United States', 
      visits: 1245, 
      percentage: 42,
      cities: [
        { name: 'New York, NY', visits: 320, percentage: 25.7 },
        { name: 'Los Angeles, CA', visits: 286, percentage: 23.0 },
        { name: 'Chicago, IL', visits: 189, percentage: 15.2 },
        { name: 'Houston, TX', visits: 142, percentage: 11.4 },
        { name: 'Miami, FL', visits: 96, percentage: 7.7 }
      ]
    },
    { country: 'United Kingdom', visits: 845, percentage: 28 },
    { country: 'Germany', visits: 438, percentage: 15 },
    { country: 'Canada', visits: 274, percentage: 9 },
    { country: 'Australia', visits: 189, percentage: 6 },
  ];

  const handleCountryClick = (country: string) => {
    const countryData = displayData.find(d => d.country === country);
    if (countryData?.cities && countryData.cities.length > 0) {
      setSelectedCountry(country);
      setFilter('city');
    }
  };

  const handleBackToCountries = () => {
    setSelectedCountry(null);
    setFilter('country');
  };

  const renderContent = () => {
    if (filter === 'country') {
      return displayData.map((item, index) => (
        <div 
          key={index} 
          className="space-y-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded-md transition-colors"
          onClick={() => handleCountryClick(item.country)}
        >
          <div className="flex justify-between items-center text-sm">
            <div className="font-medium flex items-center">
              <MapPin className="h-3 w-3 mr-1 text-gray-400" />
              {item.country}
              {item.cities && item.cities.length > 0 && (
                <span className="ml-1 text-xs text-gray-400">(tap for details)</span>
              )}
            </div>
            <div className="text-right">
              <span className="font-semibold text-claro-blue">{item.visits}</span>
              <span className="text-gray-500 text-xs ml-1">({item.percentage}%)</span>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div 
              className="bg-claro-blue h-1.5 rounded-full" 
              style={{ width: `${item.percentage}%` }}
            ></div>
          </div>
        </div>
      ));
    } else if (filter === 'city' && selectedCountry) {
      const countryData = displayData.find(d => d.country === selectedCountry);
      
      if (!countryData?.cities || countryData.cities.length === 0) {
        return (
          <div className="text-center py-4 text-gray-500">
            No city data available for {selectedCountry}
          </div>
        );
      }
      
      return (
        <>
          <div className="mb-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBackToCountries}
              className="text-xs"
            >
              ← Back to all countries
            </Button>
            <div className="mt-2 text-sm font-medium text-gray-600">
              Cities in {selectedCountry}
            </div>
          </div>
          {countryData.cities.map((city, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <div className="font-medium flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                  {city.name}
                </div>
                <div className="text-right">
                  <span className="font-semibold text-claro-blue">{city.visits}</span>
                  <span className="text-gray-500 text-xs ml-1">({city.percentage.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className="bg-claro-blue h-1.5 rounded-full" 
                  style={{ width: `${city.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </>
      );
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Visitor Locations</CardTitle>
          <div className="text-xs text-gray-500 flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {loading ? 'Loading...' : filter === 'country' ? 'By country' : `Cities in ${selectedCountry}`}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {renderContent()}
        </div>
      </CardContent>
    </Card>
  );
};
