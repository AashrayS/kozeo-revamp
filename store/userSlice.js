import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  loginEntry: false,
};

// User slice
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token, loginEntry } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      state.loginEntry = loginEntry || false;

      // Save both user and token to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("kozeo_user", JSON.stringify(user));
        localStorage.setItem("kozeo_auth_token", token);
      }
    },
    clearUser: (state) => {
      console.log("clearUser action triggered");
      console.log("State before clearing:", {
        user: state.user,
        token: state.token,
        loginEntry: state.loginEntry,
        isAuthenticated: state.isAuthenticated,
      });

      // Reset to initial state
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.loginEntry = false;

      // Remove all auth-related data from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("kozeo_user");
        localStorage.removeItem("kozeo_auth_token");
        localStorage.removeItem("kozeo_refresh_token");
      }

      console.log("State after clearing:", {
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      });
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    restoreUser: (state, action) => {
      // Used to restore user from localStorage without saving again
      const { user, token, loginEntry } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.loginEntry = loginEntry || false; // loginEntry should be false for restored users
      state.loading = false;
    },
    clearLoginEntry: (state) => {
      state.loginEntry = false;
    },
  },
});

// Export actions
export const { setUser, clearUser, setLoading, restoreUser, clearLoginEntry } =
  userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.user;
export const selectUserName = (state) => state.user.user?.username || null;

export const selectUserEmail = (state) => state.user.user?.email || null;
export const selectToken = (state) => state.user.token;
export const selectIsAuthenticated = (state) => state.user.isAuthenticated;
export const selectUserLoading = (state) => state.user.loading;
export const selectLoginEntry = (state) => state.user.loginEntry || false;

// Export reducer
export default userSlice.reducer;
