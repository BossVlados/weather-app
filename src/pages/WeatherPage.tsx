import React, { useState, useEffect } from 'react';
import { LineChart } from '../components/charts/LineChart';
import { HistogramChart } from '../components/charts/HistogramChart';
import { MovingAverageChart } from '../components/charts/MovingAverageChart';
import { DualAxisChart } from '../components/charts/DualAxisChart';
import { WeatherCard } from '../components/WeatherCard';
import { LocationSearch } from '../components/LocationSearch';
import { ChartControls, ChartType, TimeRange } from '../components/ChartControls';
import { WeatherService, WeatherData } from '../services/weatherApi';
import { RefreshCw, MapPin, AlertCircle } from 'lucide-react';

export function WeatherPage() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Moscow');
  const [selectedChartType, setSelectedChartType] = useState<ChartType>('line');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('24h');

  const weatherService = WeatherService.getInstance();

  const fetchWeatherData = async (location: string) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await weatherService.getCurrentWeather(location);
      setWeatherData(data);
    } catch (err) {
      setError('Ошибка при загрузке данных о погоде');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData(selectedLocation);
  }, [selectedLocation]);

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };

  const handleRefresh = () => {
    fetchWeatherData(selectedLocation);
  };

  // Фильтрация данных по временному диапазону
  const getFilteredData = () => {
    if (!weatherData) return [];
    
    const hours = selectedTimeRange === '6h' ? 6 : selectedTimeRange === '12h' ? 12 : 24;
    return weatherData.forecast.slice(0, hours);
  };

  const renderChart = () => {
    const filteredData = getFilteredData();
    if (filteredData.length === 0) return null;

    const chartProps = {
      data: filteredData,
      width: 600,
      height: 350,
    };

    switch (selectedChartType) {
      case 'line':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <LineChart
              {...chartProps}
              type="temperature"
              title="Температура"
            />
            <LineChart
              {...chartProps}
              type="humidity"
              title="Влажность"
            />
          </div>
        );
      
      case 'histogram':
        return (
          <HistogramChart
            data={filteredData}
            title="Распределение температуры"
            width={600}
            height={350}
          />
        );
      
      case 'moving-average':
        return (
          <MovingAverageChart
            data={filteredData}
            title="Температура со скользящим средним"
            windowSize={3}
            width={600}
            height={350}
          />
        );
      
      case 'dual-axis':
        return (
          <DualAxisChart
            {...chartProps}
            title="Температура и влажность"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Погодная панель
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Актуальная информация о погоде и прогнозы
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <LocationSearch
            onLocationSelect={handleLocationChange}
            currentLocation={selectedLocation}
          />
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="btn-secondary flex items-center space-x-2 disabled:opacity-50 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Обновить</span>
          </button>
        </div>
      </div>

      {!import.meta.env.VITE_OPENWEATHER_API_KEY && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Демо-режим</p>
            <p className="text-sm">
              Для получения реальных данных о погоде добавьте API ключ OpenWeather в переменную окружения VITE_OPENWEATHER_API_KEY
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : weatherData ? (
        <div className="space-y-8">
          <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
            <MapPin className="w-5 h-5" />
            <span className="font-medium">{weatherData.location}</span>
          </div>
          
          <WeatherCard weather={weatherData.current} />
          
          <ChartControls
            selectedChartType={selectedChartType}
            onChartTypeChange={setSelectedChartType}
            selectedTimeRange={selectedTimeRange}
            onTimeRangeChange={setSelectedTimeRange}
          />
          
          <div className="space-y-6">
            {renderChart()}
          </div>
        </div>
      ) : null}
    </div>
  );
}