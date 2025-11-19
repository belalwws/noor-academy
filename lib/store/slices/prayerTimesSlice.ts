/**
 * Prayer Times Redux Slice
 * Converted from React Context to Redux with async thunks
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getCountries, 
  getCitiesByCountry, 
  getPrayerTimes, 
  getPrayerTimesByCity,
} from '@/app/prayer-times/api/prayer-times';
import { 
  IPrayerTimes, 
  ISettings, 
  ICountry, 
  ICity,
  TimeNames,
  ITime 
} from '@/app/prayer-times/types';

interface PrayerTimesState {
  prayerTimes: IPrayerTimes | null;
  settings: ISettings;
  countries: ICountry[];
  cities: ICity[];
  loading: boolean;
  error: string | null;
}

const defaultSettings: ISettings = {
  country: null,
  city: null,
  adjustments: [0, 0, 0, 0, 0, 0], // Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha
};

// Get initial settings from localStorage
const getInitialSettings = (): ISettings => {
  if (typeof window === 'undefined') {
    return defaultSettings;
  }
  
  const savedSettings = localStorage.getItem('prayer-times-settings');
  if (savedSettings) {
    try {
      return { ...defaultSettings, ...JSON.parse(savedSettings) };
    } catch (error) {
      return defaultSettings;
    }
  }
  
  return defaultSettings;
};

const initialState: PrayerTimesState = {
  prayerTimes: null,
  settings: getInitialSettings(),
  countries: [],
  cities: [],
  loading: false,
  error: null,
};

// Async thunks
export const loadCountriesAsync = createAsyncThunk(
  'prayerTimes/loadCountries',
  async (_, { rejectWithValue }) => {
    try {
      const countriesData = await getCountries();
      return countriesData as ICountry[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في تحميل قائمة الدول');
    }
  }
);

export const loadCitiesAsync = createAsyncThunk(
  'prayerTimes/loadCities',
  async (countryCode: string, { rejectWithValue }) => {
    try {
      const citiesData = await getCitiesByCountry(countryCode);
      return citiesData as ICity[];
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في تحميل قائمة المدن');
    }
  }
);

export const loadPrayerTimesAsync = createAsyncThunk(
  'prayerTimes/loadPrayerTimes',
  async ({ latitude, longitude }: { latitude: number; longitude: number }, { rejectWithValue }) => {
    try {
      const data = await getPrayerTimes(latitude, longitude);
      
      // Convert to required format
      const times: ITime[] = [
        { name: TimeNames.Fajr, time: data.timings.Fajr },
        { name: TimeNames.Sunrise, time: data.timings.Sunrise },
        { name: TimeNames.Dhuhr, time: data.timings.Dhuhr },
        { name: TimeNames.Asr, time: data.timings.Asr },
        { name: TimeNames.Maghrib, time: data.timings.Maghrib },
        { name: TimeNames.Isha, time: data.timings.Isha },
      ];

      const prayerTimesData: IPrayerTimes = {
        date: `${data.date.day}-${data.date.month.number}-${data.date.year}`,
        hijri: `${data.hijri.day} ${data.hijri.month.ar} ${data.hijri.year}`,
        times: times,
      };

      // Save to localStorage and dispatch event for reminder service
      if (typeof window !== 'undefined') {
        localStorage.setItem('prayer-times-data', JSON.stringify(prayerTimesData));
        window.dispatchEvent(new CustomEvent('prayer-times-updated', { detail: prayerTimesData }));
      }

      return prayerTimesData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في تحميل مواقيت الصلاة');
    }
  }
);

export const loadPrayerTimesByCityAsync = createAsyncThunk(
  'prayerTimes/loadPrayerTimesByCity',
  async ({ country, city }: { country: string; city: string }, { rejectWithValue }) => {
    try {
      const data = await getPrayerTimesByCity(country, city);
      
      const times: ITime[] = [
        { name: TimeNames.Fajr, time: data.timings.Fajr },
        { name: TimeNames.Sunrise, time: data.timings.Sunrise },
        { name: TimeNames.Dhuhr, time: data.timings.Dhuhr },
        { name: TimeNames.Asr, time: data.timings.Asr },
        { name: TimeNames.Maghrib, time: data.timings.Maghrib },
        { name: TimeNames.Isha, time: data.timings.Isha },
      ];

      const prayerTimesData: IPrayerTimes = {
        date: `${data.date.day}-${data.date.month.number}-${data.date.year}`,
        hijri: `${data.hijri.day} ${data.hijri.month.ar} ${data.hijri.year}`,
        times: times,
      };

      // Save to localStorage and dispatch event
      if (typeof window !== 'undefined') {
        localStorage.setItem('prayer-times-data', JSON.stringify(prayerTimesData));
        window.dispatchEvent(new CustomEvent('prayer-times-updated', { detail: prayerTimesData }));
      }

      return prayerTimesData;
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في تحميل مواقيت الصلاة للمدينة المحددة');
    }
  }
);

const prayerTimesSlice = createSlice({
  name: 'prayerTimes',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<ISettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('prayer-times-settings', JSON.stringify(state.settings));
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setPrayerTimes: (state, action: PayloadAction<IPrayerTimes | null>) => {
      state.prayerTimes = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Load countries
    builder
      .addCase(loadCountriesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCountriesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.countries = action.payload;
      })
      .addCase(loadCountriesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Load cities
    builder
      .addCase(loadCitiesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCitiesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.cities = action.payload;
      })
      .addCase(loadCitiesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Load prayer times
    builder
      .addCase(loadPrayerTimesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPrayerTimesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.prayerTimes = action.payload;
      })
      .addCase(loadPrayerTimesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Load prayer times by city
    builder
      .addCase(loadPrayerTimesByCityAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadPrayerTimesByCityAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.prayerTimes = action.payload;
      })
      .addCase(loadPrayerTimesByCityAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateSettings, clearError, setPrayerTimes } = prayerTimesSlice.actions;
export default prayerTimesSlice.reducer;

