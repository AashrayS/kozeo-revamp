"use client";

import { Provider } from "react-redux";
import { store } from "./index.js";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { restoreUser } from "./userSlice.js";

// Component to restore user from localStorage
function UserRestorer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Check localStorage for saved user on app start
    if (typeof window !== "undefined") {
      try {
        const savedUser = localStorage.getItem("kozeo_user");
        if (savedUser) {
          const userObject = JSON.parse(savedUser);
          dispatch(restoreUser(userObject));
          console.log("User restored from localStorage:", userObject);
        }
      } catch (error) {
        console.error("Error restoring user from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem("kozeo_user");
      }
    }
  }, [dispatch]);

  return null; // This component doesn't render anything
}

// Redux Provider wrapper
export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <UserRestorer />
      {children}
    </Provider>
  );
}
