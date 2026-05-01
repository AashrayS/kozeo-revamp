import { useSelector } from "react-redux";
import {
  selectUser,
  selectIsAuthenticated,
  selectUserLoading,
  selectUserName,
  selectUserEmail,
} from "./userSlice.js";

// Custom hook to easily access user state
export const useUser = () => {
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectUserLoading);
  const username = useSelector(selectUserName);
  const email = useSelector(selectUserEmail);

  return {
    user,
    isAuthenticated,
    loading,
    username,
    email,
  };
};
