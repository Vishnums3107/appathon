import { WeatherData } from '../types';

const WEATHER_API_KEY = 'YOUR_API_KEY_HERE'; // Replace with actual OpenWeatherMap API key
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

/**
 * Fetch weather data from API
 */
export const fetchWeatherData = async (location: string): Promise<WeatherData | null> => {
  try {
    const response = await fetch(
      `${WEATHER_API_URL}?q=${location}&appid=${WEATHER_API_KEY}&units=metric`
    );

    if (!response.ok) {
      console.error('Weather API error:', response.status);
      return null;
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      season: getSeason(new Date()),
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null;
  }
};

/**
 * Get current season based on date
 */
export const getSeason = (date: Date): 'spring' | 'summer' | 'fall' | 'winter' => {
  const month = date.getMonth();

  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
};

/**
 * Mock weather data for testing (when API key is not available)
 */
export const getMockWeatherData = (): WeatherData => {
  const date = new Date();
  const season = getSeason(date);

  // Generate realistic temperature based on season
  let baseTemp = 20;
  if (season === 'summer') baseTemp = 30;
  if (season === 'winter') baseTemp = 10;

  return {
    temperature: baseTemp + Math.floor(Math.random() * 5),
    condition: season === 'summer' ? 'Clear' : season === 'winter' ? 'Cloudy' : 'Partly Cloudy',
    humidity: 50 + Math.floor(Math.random() * 30),
    season,
  };
};
