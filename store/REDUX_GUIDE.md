# Redux User State Management - Usage Guide

## Overview

This setup provides user state management with Redux that automatically:

1. Saves user data to Redux store for cross-component access
2. Persists user data in localStorage for reload persistence
3. Automatically restores user data on app startup

## Files Created

- `store/userSlice.js` - Redux slice with user actions and reducers
- `store/index.js` - Redux store configuration
- `store/Provider.js` - Redux provider with localStorage restoration
- `store/hooks.js` - Custom hook for easy user state access
- `store/useLogout.js` - Custom hook for logout functionality

## How It Works

### 1. User Login/Registration

When a user logs in or registers, the login page now:

```javascript
// Save token
setToken(response.token);

// Save user to Redux AND localStorage automatically
dispatch(setUser(response.user));

// Navigate to next page
navigateWithLoader("/Atrium");
```

### 2. App Startup

On app startup, the `UserRestorer` component automatically:

- Checks localStorage for saved user data
- If found, restores it to Redux state
- User stays logged in across browser refreshes

### 3. Using User Data in Components

```javascript
import { useUser } from "../store/hooks.js";

function MyComponent() {
  const { user, isAuthenticated, loading } = useUser();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.first_name}!</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

### 4. Logout

```javascript
import { useLogout } from "../store/useLogout.js";

function LogoutButton() {
  const logout = useLogout();

  return <button onClick={logout}>Logout</button>;
}
```

## Available Actions

### setUser(userObject)

- Saves user to Redux state
- Automatically saves to localStorage
- Sets isAuthenticated to true

### clearUser()

- Clears user from Redux state
- Removes from localStorage
- Sets isAuthenticated to false

### restoreUser(userObject)

- Restores user to Redux state (used internally on app startup)
- Does NOT save to localStorage (avoids infinite loop)

## Available Selectors

### useUser() hook returns:

- `user` - The user object
- `isAuthenticated` - Boolean authentication status
- `loading` - Boolean loading state

### Direct selectors:

- `selectUser(state)` - Gets user object
- `selectIsAuthenticated(state)` - Gets auth status
- `selectUserLoading(state)` - Gets loading state

## Usage Examples

### Check if user is authenticated before rendering:

```javascript
function ProtectedComponent() {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <div>Protected content</div>;
}
```

### Display user info:

```javascript
function UserProfile() {
  const { user } = useUser();

  return (
    <div>
      <img src={user?.profile_Picture} alt="Profile" />
      <h2>
        {user?.first_name} {user?.last_name}
      </h2>
      <p>@{user?.username}</p>
      <p>{user?.email}</p>
    </div>
  );
}
```

### Manual dispatch (if needed):

```javascript
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../store/userSlice.js";

function SomeComponent() {
  const dispatch = useDispatch();

  const updateUser = (newUserData) => {
    dispatch(setUser(newUserData));
  };

  const logoutUser = () => {
    dispatch(clearUser());
  };
}
```

## Integration Status

✅ Redux store configured and wrapped around the app
✅ Login page saves user to Redux + localStorage
✅ Registration page saves user to Redux + localStorage
✅ App automatically restores user on startup
✅ Logout clears both Redux and localStorage
✅ Custom hooks for easy usage

## Next Steps

You can now use `useUser()` in any component to access user data and `useLogout()` to handle logout functionality. The user will persist across page refreshes and stay logged in until they explicitly log out.
