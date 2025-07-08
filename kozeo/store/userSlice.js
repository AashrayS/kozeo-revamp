import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
};

// User slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("kozeo_user", JSON.stringify(action.payload));
      }
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;

      // Remove from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("kozeo_user");
      }
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    restoreUser: (state, action) => {
      // Used to restore user from localStorage without saving again
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },
  },
});

// Export actions
export const { setUser, clearUser, setLoading, restoreUser } =
  userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.user;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserLoading = (state) => state.user.loading;

// Export reducer
export default userSlice.reducer;
