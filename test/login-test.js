// Test file to verify login API and Redux storage
// This is a manual test that can be run in the browser console

import { loginUser } from "../utilities/kozeoApi.js";

// Test login function
export const testLogin = async () => {
  console.log("Testing login API...");

  try {
    const response = await loginUser({
      email: "test@example.com",
      password: "testpassword123",
    });

    console.log("Login response:", response);
    console.log("Token:", response.token);
    console.log("User:", response.user);

    // Verify the response structure matches API.md
    if (response.token && response.user) {
      console.log("✅ Login API response structure is correct");
      console.log("✅ Token present:", !!response.token);
      console.log("✅ User object present:", !!response.user);
      console.log("✅ User ID present:", !!response.user.id);
      console.log("✅ User email present:", !!response.user.email);
      console.log("✅ User username present:", !!response.user.username);

      return response;
    } else {
      console.error("❌ Login API response structure is incorrect");
      return null;
    }
  } catch (error) {
    console.error("❌ Login API failed:", error);
    return null;
  }
};

// Test Redux storage
export const testReduxStorage = () => {
  console.log("Testing Redux storage...");

  // Check localStorage
  const storedUser = localStorage.getItem("kozeo_user");
  const storedToken = localStorage.getItem("kozeo_auth_token");

  console.log("Stored user in localStorage:", storedUser);
  console.log("Stored token in localStorage:", storedToken);

  if (storedUser && storedToken) {
    console.log("✅ Data successfully stored in localStorage");

    try {
      const parsedUser = JSON.parse(storedUser);
      console.log("✅ User data is valid JSON:", parsedUser);

      return {
        user: parsedUser,
        token: storedToken,
      };
    } catch (error) {
      console.error("❌ User data is not valid JSON:", error);
      return null;
    }
  } else {
    console.error("❌ Data not found in localStorage");
    return null;
  }
};

// Combined test
export const runLoginTest = async () => {
  console.log("=== Running Login & Redux Storage Test ===");

  const loginResult = await testLogin();
  if (loginResult) {
    console.log("=== Testing Redux Storage ===");
    const storageResult = testReduxStorage();

    if (storageResult) {
      console.log("✅ All tests passed!");
      return true;
    }
  }

  console.log("❌ Some tests failed");
  return false;
};
