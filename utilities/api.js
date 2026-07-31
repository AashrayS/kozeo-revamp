// utilities/api.js

// GraphQL API configuration

const GRAPHQL_ENDPOINT =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql";

// Log the endpoint being used for debugging
console.log("GraphQL Endpoint:", GRAPHQL_ENDPOINT);

// Token management
const TOKEN_KEY = "kozeo_auth_token";
const REFRESH_TOKEN_KEY = "kozeo_refresh_token";

/**
 * Get JWT token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
export const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

/**
 * Set JWT token in localStorage
 * @param {string} token - JWT token to store
 */
export const setToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Get refresh token from localStorage
 * @returns {string|null} Refresh token or null if not found
 */
export const getRefreshToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

/**
 * Set refresh token in localStorage
 * @param {string} refreshToken - Refresh token to store
 */
export const setRefreshToken = (refreshToken) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

/**
 * Remove tokens from localStorage (logout)
 */
export const clearTokens = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem("kozeo_user"); // Also clear user data
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Refresh JWT token using refresh token
 * @returns {Promise<boolean>}
 */
export const refreshAuthToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    console.error("No refresh token available");
    return false;
  }

  try {
    const refreshMutation = `
      mutation RefreshToken($refreshToken: String!) {
        refreshToken(refreshToken: $refreshToken) {
          accessToken
          refreshToken
          user {
            id
            email
            username
          }
        }
      }
    `;

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: refreshMutation,
        variables: { refreshToken },
      }),
    });

    const result = await response.json();

    if (result.errors) {
      console.error("Token refresh failed:", result.errors);
      clearTokens();
      return false;
    }

    if (result.data?.refreshToken) {
      setToken(result.data.refreshToken.accessToken);
      setRefreshToken(result.data.refreshToken.refreshToken);
      return true;
    }

    return false;
  } catch (error) {
    console.error("Network error during token refresh:", error);
    clearTokens();
    return false;
  }
};

/**
 * Convenience function for queries
 * @param {string} query - GraphQL query string
 * @param {Object} variables - Query variables
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Query result
 */

export const query = (queryString, variables = {}, options = {}) => {
  return callApi({ query: queryString, variables, ...options });
};

export const mutate = (mutationString, variables = {}, options = {}) => {
  return callApi({ query: mutationString, variables, ...options });
};

// Generic GraphQL API call function
export async function callApi({ query, variables = {}, token = null }) {
  // Validate variables for common GraphQL input mistakes
  if (variables && typeof variables === "object") {
    // Check for $input being a string (should be an object)
    if ("input" in variables && typeof variables.input !== "object") {
      throw new Error(
        "GraphQL $input variable must be an object (e.g., { email, password }), not a string."
      );
    }
  }
  const endpoint =
    process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql";
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  const result = await res.json();
  if (result.errors)
    throw new Error(result.errors.map((e) => e.message).join(", "));
  return result.data;
}
