import { useDispatch } from "react-redux";
import { clearUser } from "./userSlice.js";

// Custom hook for logout functionality
export const useLogout = () => {
  const dispatch = useDispatch();

  const logout = () => {
    console.log("Logout function called");

    // Clear Redux state (this will also clear localStorage)
    console.log("Dispatching clearUser action");
    dispatch(clearUser());

    // Verify localStorage is cleared
    console.log("LocalStorage after clearUser:", {
      token: localStorage.getItem("kozeo_auth_token"),
      user: localStorage.getItem("kozeo_user"),
      refresh: localStorage.getItem("kozeo_refresh_token"),
    });

    // Optional: redirect to login
    if (typeof window !== "undefined") {
      console.log("Redirecting to login page");
      window.location.href = "/";
    }
  };

  return logout;
};
