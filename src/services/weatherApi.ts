interface WeatherApiData {
  main: {
    temp: number;
    humidity: number;
    feels_like: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  name: string;
  dt: number;
}

interface ForecastApiData {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
      pressure: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
  }>;
  city: {
    name: string;
  };
}

export interface WeatherData {
  location: string;
  current: {
    temperature: number;
    humidity: number;
    description: string;
    icon: string;
    feelsLike: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
  };
  forecast: Array<{
    time: string;
    temperature: number;
    humidity: number;
    pressure: number;
    description: string;
    windSpeed: number;
  }>;
}

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Функция для получения иконки эмодзи по коду OpenWeather
const getWeatherEmoji = (iconCode: string): string => {
  const iconMap: { [key: string]: string } = {
    '01d': '☀️', '01n': '🌙',
    '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️',
    '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️',
    '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️',
  };
  return iconMap[iconCode] || '🌤️';
};

export class WeatherService {
  private static instance: WeatherService;

  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  async getCurrentWeather(city: string): Promise<WeatherData> {
    if (!API_KEY) {
      // Возвращаем моковые данные если нет API ключа
      return this.getMockWeatherData(city);
    }

    try {
      const response = await fetch(
        `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ru`
      );

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`);
      }

      const data: WeatherApiData = await response.json();
      
      // Получаем прогноз на 5 дней
      const forecastResponse = await fetch(
        `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=ru`
      );

      if (!forecastResponse.ok) {
        throw new Error(`Forecast API error: ${forecastResponse.status}`);
      }

      const forecastData: ForecastApiData = await forecastResponse.json();

      return {
        location: data.name,
        current: {
          temperature: Math.round(data.main.temp),
          humidity: data.main.humidity,
          description: data.weather[0].description,
          icon: getWeatherEmoji(data.weather[0].icon),
          feelsLike: Math.round(data.main.feels_like),
          pressure: data.main.pressure,
          windSpeed: data.wind.speed,
          windDirection: data.wind.deg,
        },
        forecast: forecastData.list.slice(0, 24).map(item => ({
          time: new Date(item.dt * 1000).toISOString(),
          temperature: Math.round(item.main.temp),
          humidity: item.main.humidity,
          pressure: item.main.pressure,
          description: item.weather[0].description,
          windSpeed: item.wind.speed,
        })),
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Возвращаем моковые данные в случае ошибки
      return this.getMockWeatherData(city);
    }
  }

  private getMockWeatherData(city: string): WeatherData {
    const generateForecast = () => {
      const forecast = [];
      const now = new Date();
      
      for (let i = 0; i < 24; i++) {
        const time = new Date(now.getTime() + i * 60 * 60 * 1000);
        const baseTemp = 15 + Math.sin(i / 4) * 8; // Имитация дневного цикла
        forecast.push({
          time: time.toISOString(),
          temperature: Math.round(baseTemp + Math.random() * 6 - 3),
          humidity: Math.round(40 + Math.random() * 40),
          pressure: Math.round(1000 + Math.random() * 40),
          description: ['ясно', 'облачно', 'дождь', 'снег'][Math.floor(Math.random() * 4)],
          windSpeed: Math.round(Math.random() * 10),
        });
      }
      
      return forecast;
    };

    return {
      location: city,
      current: {
        temperature: Math.round(15 + Math.random() * 20),
        humidity: Math.round(40 + Math.random() * 40),
        description: ['ясно', 'облачно', 'дождь', 'снег'][Math.floor(Math.random() * 4)],
        icon: '☀️',
        feelsLike: Math.round(15 + Math.random() * 20),
        pressure: Math.round(1000 + Math.random() * 40),
        windSpeed: Math.round(Math.random() * 10),
        windDirection: Math.round(Math.random() * 360),
      },
      forecast: generateForecast(),
    };
  }
}