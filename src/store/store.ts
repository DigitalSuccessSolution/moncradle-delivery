import { configureStore } from '@reduxjs/toolkit';
import notificationReducer from './slices/notificationSlice';
import appReducer from './slices/appSlice';

export const store = configureStore({
  reducer: {
    notifications: notificationReducer,
    app: appReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
