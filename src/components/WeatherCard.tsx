import React from 'react';
import { Thermometer, Droplets, Eye, Wind, Gauge } from 'lucide-react';

interface WeatherCardProps {
  weather: {
    temperature: number;
    humidity: number;
    description: string;
    icon: string;
    feelsLike: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
  };
}

export function WeatherCard({ weather }: WeatherCardProps) {
  const getWindDirection = (degrees: number) => {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    return directions[Math.round(degrees / 45) % 8];
  };

  return (
    <div className="card animate-slide-up dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-6xl">{weather.icon}</div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {weather.temperature}°C
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg capitalize">
              {weather.description}
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <Thermometer className="w-5 h-5 text-red-500" />
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-500">Ощущается</div>
            <div className="font-medium">{weather.feelsLike}°C</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <Droplets className="w-5 h-5 text-blue-500" />
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-500">Влажность</div>
            <div className="font-medium">{weather.humidity}%</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <Gauge className="w-5 h-5 text-purple-500" />
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-500">Давление</div>
            <div className="font-medium">{weather.pressure} гПа</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <Wind className="w-5 h-5 text-green-500" />
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-500">Ветер</div>
            <div className="font-medium">
              {weather.windSpeed} м/с {getWindDirection(weather.windDirection)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
          <Eye className="w-5 h-5 text-gray-500" />
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-500">Видимость</div>
            <div className="font-medium">Хорошая</div>
          </div>
        </div>
      </div>
    </div>
  );
}