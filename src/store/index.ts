import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  persistStore,
  persistReducer,
  createMigrate,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import type { PersistedState } from 'redux-persist';
import surveyReducer from './surveySlice';
import chatReducer from './chatSlice';

const localStorageAdapter = {
  getItem: (key: string): Promise<string | null> =>
    Promise.resolve(localStorage.getItem(key)),
  setItem: (key: string, value: string): Promise<void> => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string): Promise<void> => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

// v1 → v2: rename SavedSurvey.status 'running' to 'published' so older
// localStorage entries surface with the new label/badge after this change.
const surveyMigrations = {
  2: (state: PersistedState) => {
    const s = state as PersistedState & { savedSurveys?: Array<{ status: string }> };
    if (!s?.savedSurveys) return state;
    return {
      ...s,
      savedSurveys: s.savedSurveys.map(sv =>
        sv.status === 'running' ? { ...sv, status: 'published' } : sv
      ),
    } as PersistedState;
  },
};

const surveyPersistConfig = {
  key: 'survey',
  storage: localStorageAdapter,
  whitelist: ['savedSurveys'],
  version: 2,
  migrate: createMigrate(surveyMigrations, { debug: false }),
};

const rootReducer = combineReducers({
  survey: persistReducer(surveyPersistConfig, surveyReducer),
  chat: chatReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
