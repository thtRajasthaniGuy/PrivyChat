import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  username: string | null;
  publicId: string | null;
}

const initialState: AuthState = {
  username: null,
  publicId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ username: string; publicId: string }>,
    ) => {
      state.username = action.payload.username;
      state.publicId = action.payload.publicId;
    },
    clearUser: state => {
      state.username = null;
      state.publicId = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
