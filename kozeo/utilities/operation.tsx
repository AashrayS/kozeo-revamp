export const logout = () => {
  // Example logout logic
  localStorage.removeItem("token"); // or your auth token key
  sessionStorage.clear();
  // Redirect if needed
  window.location.href = "/login";
};