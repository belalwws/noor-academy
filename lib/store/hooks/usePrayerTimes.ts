/**
 * Custom Hook for Prayer Times State
 * Provides backward-compatible interface for components using PrayerTimesContext
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import type { RootState, AppDispatch } from '../../store';
import {
  loadCountriesAsync,
  loadCitiesAsync,
  loadPrayerTimesAsync,
  loadPrayerTimesByCityAsync,
  updateSettings,
  clearError,
  setPrayerTimes,
} from '../slices/prayerTimesSlice';

export const usePrayerTimes = () => {
  const dispatch = useDispatch<AppDispatch>();
  const prayerTimes = useSelector((state: RootState) => state.prayerTimes);

  const loadCountries = useCallback(() => {
    dispatch(loadCountriesAsync());
  }, [dispatch]);

  const loadCities = useCallback((countryCode: string) => {
    dispatch(loadCitiesAsync(countryCode));
  }, [dispatch]);

  const loadPrayerTimes = useCallback((latitude: number, longitude: number) => {
    dispatch(loadPrayerTimesAsync({ latitude, longitude }));
  }, [dispatch]);

  const loadPrayerTimesByCity = useCallback((country: string, city: string) => {
    dispatch(loadPrayerTimesByCityAsync({ country, city }));
  }, [dispatch]);

  const updateSettingsCallback = useCallback((newSettings: Partial<typeof prayerTimes.settings> & { error?: string }) => {
    dispatch(updateSettings(newSettings));
  }, [dispatch]);

  const getCurrentLocation = useCallback(async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        dispatch(updateSettings({ error: 'الموقع الجغرافي غير مدعوم في هذا المتصفح' }));
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const result = await dispatch(loadPrayerTimesAsync({ 
              latitude: position.coords.latitude, 
              longitude: position.coords.longitude 
            }));
            if ('unwrap' in result && typeof result.unwrap === 'function') {
              await result.unwrap();
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          dispatch(updateSettings({ error: 'فشل في الحصول على الموقع الحالي' }));
          reject(error);
        }
      );
    });
  }, [dispatch]);

  return {
    prayerTimes: prayerTimes.prayerTimes,
    settings: prayerTimes.settings,
    countries: prayerTimes.countries,
    cities: prayerTimes.cities,
    loading: prayerTimes.loading,
    error: prayerTimes.error,
    loadCountries,
    loadCities,
    loadPrayerTimes,
    loadPrayerTimesByCity,
    updateSettings: updateSettingsCallback,
    getCurrentLocation,
    clearError: () => dispatch(clearError()),
    setPrayerTimes: (times: typeof prayerTimes.prayerTimes) => dispatch(setPrayerTimes(times)),
  };
};

