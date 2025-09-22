import { configureStore } from '@reduxjs/toolkit';
import signupReducer from '../screens/Signup/slice';
import authReducer from './authSlice';
export const store = configureStore({
  reducer: {
    signup: signupReducer,
    auth: authReducer,
  },
});

// Types for use in hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
