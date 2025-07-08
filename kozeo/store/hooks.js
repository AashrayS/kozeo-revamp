import { useSelector } from "react-redux";
import {
  selectUser,
  selectIsAuthenticated,
  selectUserLoading,
} from "./userSlice.js";

// Custom hook to easily access user state
export const useUser = () => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectUserLoading);

  return {
    user,
    isAuthenticated,
    loading,
  };
};
