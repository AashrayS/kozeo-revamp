import { useDispatch } from "react-redux";
import { clearUser } from "./userSlice.js";
import { clearTokens } from "../utilities/api.js";

// Custom hook for logout functionality
export const useLogout = () => {
  const dispatch = useDispatch();

  const logout = () => {
    // Clear Redux state
    dispatch(clearUser());

    // Clear auth tokens
    clearTokens();

    // Optional: redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  return logout;
};
