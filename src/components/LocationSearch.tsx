import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

interface LocationSearchProps {
  onLocationSelect: (location: string) => void;
  currentLocation: string;
}

const popularCities = [
  'Moscow',
  'Saint Petersburg',
  'Novosibirsk',
  'Yekaterinburg',
  'Kazan',
  'Nizhny Novgorod',
  'Chelyabinsk',
  'Samara',
  'Omsk',
  'Rostov-on-Don'
];

export function LocationSearch({ onLocationSelect, currentLocation }: LocationSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCities = popularCities.filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCitySelect = (city: string) => {
    onLocationSelect(city);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
      >
        <MapPin className="w-4 h-4 text-gray-500" />
        <span className="text-gray-700">{currentLocation}</span>
        <Search className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Поиск города..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          
          <div className="max-h-48 overflow-y-auto">
            {filteredCities.map((city) => (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors duration-200 ${
                  city === currentLocation ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                }`}
              >
                {city}
              </button>
            ))}
            
            {filteredCities.length === 0 && (
              <div className="px-4 py-2 text-gray-500 text-center">
                Города не найдены
              </div>
            )}
          </div>
        </div>
      )}
      
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}