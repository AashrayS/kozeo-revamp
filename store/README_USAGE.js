// Example: How to use the Redux user state in any component

import { useUser } from "../store/hooks.js";
import { useLogout } from "../store/useLogout.js";

export function ExampleComponent() {
  const { user, isAuthenticated, loading } = useUser();
  const logout = useLogout();

  if (loading) {
    return <div>Loading user data...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.first_name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Username: {user?.username}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

// You can also use useSelector directly:
// import { useSelector } from 'react-redux';
// const user = useSelector((state) => state.user.user);
// const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
