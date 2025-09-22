import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
//import { signupService } from '../../../services/userService';

interface SignupState {
  username: string;
  loading: boolean;
  error: string | null;
}

const initialState: SignupState = {
  username: '',
  loading: false,
  error: null,
};

// Async thunk for signup
export const signupThunk = createAsyncThunk(
  'signup/signupUser',
  async (username: string, { rejectWithValue }) => {
    try {
      // const success = await signupService.signup(username);
      // if (!success) return rejectWithValue('Username already taken');
      return username;
    } catch (err) {
      return rejectWithValue('Signup failed');
    }
  },
);

const signupSlice = createSlice({
  name: 'signup',
  initialState,
  reducers: {
    setUsername(state, action) {
      state.username = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(signupThunk.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.username = action.payload;
      })
      .addCase(signupThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUsername } = signupSlice.actions;
export default signupSlice.reducer;
