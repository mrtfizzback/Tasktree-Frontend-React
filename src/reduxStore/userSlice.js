import { createSlice } from '@reduxjs/toolkit';

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    userName: null,
    email: null,
    roles: null,
    accessToken: null,
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.userName = action.payload.userName;
      state.email = action.payload.email;
      state.roles = action.payload.roles;
      state.accessToken = action.payload.accessToken;
    },
    logout: (state) => {
      state.userName = null;
      state.email = null;
      state.roles = null;
      state.accessToken = null;
    },
  },
});

export const { loginSuccess, logout } = userSlice.actions;

export const selectUser = (state) => state.user;

export default userSlice.reducer;
