import { Component, Inject, PLATFORM_ID, OnDestroy, OnInit } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';

interface WeatherData {
  temp: number | null;
  condition: string;
  icon: string;
  location: string;
  humidity: number | null;
  wind: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  locationName: string;
}

@Component({
  selector: 'app-weather-widget',
  templateUrl: './weather-widget.html',
  styleUrl: './weather-widget.scss',
  standalone: true,
  imports: [CommonModule],
})
export class WeatherWidgetComponent implements OnDestroy, OnInit {
  private isBrowser: boolean;
  private refreshTimeout?: number;

  statusMessage = '';

  weather: WeatherData = {
    temp: null,
    condition: 'Loading...',
    icon: '⛅',
    location: 'Detecting location...',
    humidity: null,
    wind: '--'
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.loadWeather();
    }
  }

  ngOnDestroy() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
  }

  private scheduleRefresh() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    this.refreshTimeout = window.setTimeout(() => {
      this.loadWeather();
    }, 10 * 60 * 1000);
  }

  private async loadWeather() {
    this.statusMessage = 'Detecting location...';

    try {
      const location = await this.getLocation();
      this.statusMessage = 'Fetching weather...';
      await this.fetchWeather(location);
      this.statusMessage = '';
    } catch {
      this.statusMessage = 'Unable to load weather.';
      this.weather.condition = 'Unavailable';
      this.weather.icon = '☁️';
    } finally {
      this.scheduleRefresh();
    }
  }

  private async getLocation(): Promise<LocationData> {
    const geoCoords = await this.getGeolocationCoords().catch(() => null);

    if (geoCoords) {
      const locationName = await this.reverseGeocode(geoCoords.latitude, geoCoords.longitude).catch(
        () => 'Current Location'
      );
      return {
        latitude: geoCoords.latitude,
        longitude: geoCoords.longitude,
        locationName,
      };
    }

    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) {
      throw new Error('IP location failed');
    }
    const data = await response.json();
    const locationName = [data.city, data.region, data.country_name]
      .filter(Boolean)
      .join(', ');

    return {
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      locationName: locationName || 'Unknown Location',
    };
  }

  private getGeolocationCoords(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation unavailable'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => reject(error),
        { timeout: 6000 }
      );
    });
  }

  private async reverseGeocode(latitude: number, longitude: number) {
    const url = new URL('https://geocoding-api.open-meteo.com/v1/reverse');
    url.searchParams.set('latitude', latitude.toString());
    url.searchParams.set('longitude', longitude.toString());
    url.searchParams.set('count', '1');

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Reverse geocode failed');
    }
    const data = await response.json();
    const result = data?.results?.[0];

    if (!result) {
      return 'Current Location';
    }

    return [result.name, result.admin1, result.country].filter(Boolean).join(', ');
  }

  private async fetchWeather(location: LocationData) {
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', location.latitude.toString());
    url.searchParams.set('longitude', location.longitude.toString());
    url.searchParams.set('current_weather', 'true');
    url.searchParams.set('hourly', 'relativehumidity_2m');
    url.searchParams.set('temperature_unit', 'fahrenheit');
    url.searchParams.set('wind_speed_unit', 'mph');

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Weather fetch failed');
    }

    const data = await response.json();
    const current = data.current_weather;

    if (!current) {
      throw new Error('Weather data missing');
    }

    const humidity = this.resolveHumidity(data, current.time);
    const condition = this.mapWeatherCode(current.weathercode);

    this.weather = {
      temp: Math.round(current.temperature),
      condition: condition.label,
      icon: condition.icon,
      location: location.locationName,
      humidity: humidity,
      wind: `${Math.round(current.windspeed)} mph`,
    };
  }

  private resolveHumidity(data: any, currentTime: string): number | null {
    const times: string[] = data?.hourly?.time ?? [];
    const values: number[] = data?.hourly?.relativehumidity_2m ?? [];

    if (!times.length || !values.length) {
      return null;
    }

    const index = Math.max(0, times.indexOf(currentTime));
    const humidity = values[index] ?? values[0];

    return typeof humidity === 'number' ? Math.round(humidity) : null;
  }

  private mapWeatherCode(code: number) {
    if (code === 0) return { label: 'Clear', icon: '☀️' };
    if (code === 1 || code === 2) return { label: 'Partly Cloudy', icon: '⛅' };
    if (code === 3) return { label: 'Overcast', icon: '☁️' };
    if (code === 45 || code === 48) return { label: 'Fog', icon: '🌫️' };
    if (code >= 51 && code <= 57) return { label: 'Drizzle', icon: '🌦️' };
    if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { label: 'Rain', icon: '🌧️' };
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return { label: 'Snow', icon: '🌨️' };
    if (code >= 95) return { label: 'Thunderstorm', icon: '⛈️' };
    return { label: 'Cloudy', icon: '☁️' };
  }
}
