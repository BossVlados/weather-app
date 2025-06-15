import React from 'react';
import { Calendar, BarChart3, TrendingUp, Activity, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export type ChartType = 'line' | 'histogram' | 'moving-average' | 'dual-axis';
export type TimeRange = '6h' | '12h' | '24h';

interface ChartControlsProps {
  selectedChartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
  selectedTimeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export function ChartControls({
  selectedChartType,
  onChartTypeChange,
  selectedTimeRange,
  onTimeRangeChange,
}: ChartControlsProps) {
  const { isDark, toggleTheme } = useTheme();

  const chartTypes = [
    { id: 'line' as ChartType, label: 'Линейный', icon: TrendingUp },
    { id: 'histogram' as ChartType, label: 'Гистограмма', icon: BarChart3 },
    { id: 'moving-average' as ChartType, label: 'Скользящее среднее', icon: Activity },
    { id: 'dual-axis' as ChartType, label: 'Двойная ось', icon: Calendar },
  ];

  const timeRanges = [
    { id: '6h' as TimeRange, label: '6 часов' },
    { id: '12h' as TimeRange, label: '12 часов' },
    { id: '24h' as TimeRange, label: '24 часа' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Настройки графиков
        </h3>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          title={isDark ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Тип графика
        </label>
        <div className="grid grid-cols-2 gap-2">
          {chartTypes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onChartTypeChange(id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedChartType === id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Временной диапазон
        </label>
        <div className="flex space-x-2">
          {timeRanges.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => onTimeRangeChange(id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                selectedTimeRange === id
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}