// utilities/kozeoApi.js
import { callApi } from "./api.js";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper function for GraphQL queries
 * @param {string} query - GraphQL query string
 * @param {Object} variables - Query variables
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Query result
 */
export const query = async (queryString, variables = {}, options = {}) => {
  const { requireAuth = true } = options;
  let token = null;

  // Get token from localStorage if authentication is required
  if (requireAuth && typeof window !== "undefined") {
    token = localStorage.getItem("kozeo_auth_token");
  }

  return await callApi({ query: queryString, variables, token });
};

/**
 * Helper function for GraphQL mutations
 * @param {string} mutation - GraphQL mutation string
 * @param {Object} variables - Mutation variables
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Mutation result
 */
export const mutate = async (mutationString, variables = {}, options = {}) => {
  const { requireAuth = true } = options;
  let token = null;

  // Get token from localStorage if authentication is required
  if (requireAuth && typeof window !== "undefined") {
    token = localStorage.getItem("kozeo_auth_token");
  }

  return await callApi({ query: mutationString, variables, token });
};

// ============================================================================
// DEBUG/TEST FUNCTIONS
// ============================================================================

/**
 * Test function to check GraphQL schema and available queries
 * @returns {Promise<Object>} Schema information
 */
export const testGraphQLSchema = async () => {
  const introspectionQuery = `
    query IntrospectionQuery {
      __schema {
        queryType {
          fields {
            name
            type {
              name
            }
            args {
              name
              type {
                name
              }
            }
          }
        }
      }
    }
  `;

  try {
    console.log("Testing GraphQL schema...");
    const result = await query(introspectionQuery, {}, { requireAuth: false });
    console.log("Available queries:", result.__schema.queryType.fields);

    // Look specifically for user-related queries
    const userQueries = result.__schema.queryType.fields.filter((field) =>
      field.name.toLowerCase().includes("user")
    );
    console.log("User-related queries:", userQueries);

    return result;
  } catch (error) {
    console.error("Schema introspection failed:", error);
    throw error;
  }
};

/**
 * Test basic connectivity to GraphQL endpoint
 * @returns {Promise<boolean>} Connection status
 */
export const testConnection = async () => {
  const testQuery = `
    query TestConnection {
      __typename
    }
  `;

  try {
    console.log("Testing basic GraphQL connection...");
    const result = await query(testQuery, {}, { requireAuth: false });
    console.log("Connection test result:", result);
    return true;
  } catch (error) {
    console.error("Connection test failed:", error);
    return false;
  }
};

// ============================================================================
// USER API FUNCTIONS
// ============================================================================

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Auth payload with token and user data
 */
export async function registerUser(input) {
  const query = `
    mutation RegisterUser($input: RegisterUserInput!) {
      registerUser(input: $input) {
        token
        user {
          id
          first_name
          last_name
          username
          email
          role
        }
      }
    }
  `;
  const data = await callApi({ query, variables: { input } });
  return data.registerUser;
}

/**
 * Login user
 * @param {Object} input - Login input with email and password
 * @param {string} input.email - User's email address
 * @param {string} input.password - User's password
 * @returns {Promise<Object>} Auth payload with token and user data
 */
export async function loginUser(input) {
  const mutation = `
    mutation LoginUser($input: LoginUserInput!) {
      loginUser(input: $input) {
        token
        user {
          id
          first_name
          last_name
          email
          username
          country_Code
          bio
          phone
          profile_Picture
          resume
          role
          links
          rating
          createdAt
          updatedAt
        }
      }
    }
  `;

  // Use callApi directly without token since this is a login request
  const data = await callApi({
    query: mutation,
    variables: { input },
    token: null, // No token needed for login
  });

  return data.loginUser;
}

/**
 * Get current user data (me query)
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
  const meQuery = `
    query Me {
      me {
        id
        first_name
        last_name
        email
        username
        country_Code
        bio
        phone
        role
        profile_Picture
        resume
        links
        role
        rating
        wallet {
          currency
          amount
        }
        achievements {
          id
          title
          description
          icon
          category
          rarity
        }
        unreadNotificationCount
        createdAt
        updatedAt
      }
    }
  `;

  const result = await query(meQuery);
  return result.me;
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated user data
 */
export async function updateUserProfile(id, input) {
  const query = `
    mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
      updateUser(id: $id, input: $input) {
        id
        first_name
        last_name
        username
        email
        phone
        profile_Picture
        role
      }
    }
  `;
  const data = await callApi({
    query,
    variables: { id, input },
    token: localStorage.getItem("kozeo_auth_token"),
  });
  return data.updateUser;
}

/**
 * Fetch User Profile (by ID, username, or email)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} User profile data
 */

export async function fetchUserProfile({ id, username, email }) {
  debugger;
  let query, variables;
  if (id) {
    query = `
      query GetUser($id: ID!) {
        user(id: $id) {
          id
          first_name
          last_name
          username
          email
          phone
          profile_Picture
          role
          gigsHosted { id title }
          gigsCollaborated { id title }
          reviewsReceived { id rating description }
          achievements { id title }
        }
      }
    `;
    variables = { id };
  } else if (username) {
    query = `
      query GetUserByUsername($username: String!) {
        userByUsername(username: $username) {
          id
          first_name
          last_name
          username
          email
          country_Code
          bio
          phone
          profile_Picture
          resume
          links
          rating
          role
          gigsHosted {
            id
            title
            looking_For
            description
            skills
            currency
            amount
            isActive
            host {
              id
              username
              first_name
              last_name
              profile_Picture
              rating
            }
            guest {
              id
              username
              first_name
              last_name
              profile_Picture
              rating
            }
            reviews {
              id
              title
              description
              rating
              author {
                username
                first_name
                last_name
                profile_Picture
              }
              receiver {
                username
                first_name
                last_name
              }
            }
          }
          gigsCollaborated {
            id
            title
            looking_For
            description
            skills
            currency
            amount
            isActive
            host {
              id
              username
              first_name
              last_name
              profile_Picture
              rating
            }
            guest {
              id
              username
              first_name
              last_name
              profile_Picture
              rating
            }
            reviews {
              id
              title
              description
              rating
              author {
                username
                first_name
                last_name
                profile_Picture
              }
              receiver {
                username
                first_name
                last_name
              }
            }
          }
          workedWith {
            id
            first_name
            last_name
            username
            profile_Picture
            rating
          }
          reviewsGiven {
            id
            title
            description
            rating
            receiver {
              username
              first_name
              last_name
            }
            gig {
              id
              title
            }
            createdAt
          }
          wallet {
            currency
            amount
          }
          achievements {
            id
            title
            description
            icon
            category
            rarity
          }
          activeGig {
            id
            title
            status
            amount
            currency
          }
          requestSent {
            id
            gigId
            status
            createdAt
          }
          notifications {
            id
            type
            content
            action
            read
            createdAt
            sender {
              username
              first_name
              last_name
            }
          }
          unreadNotificationCount
          createdAt
          updatedAt
        }
      }
    `;
    variables = { username };
  } else if (email) {
    query = `
      query GetUserByEmail($email: String!) {
        userByEmail(email: $email) {
          id
          first_name
          last_name
          username
          email
          phone
          profile_Picture
          role
          gigsHosted { id title }
          gigsCollaborated { id title }
          reviewsReceived { id rating description }
          achievements { id title }
        }
      }
    `;
    variables = { email };
  } else {
    throw new Error("Must provide id, username, or email");
  }
  const data = await callApi({
    query,
    variables,
    token: localStorage.getItem("kozeo_auth_token"),
  });
  return data.user || data.userByUsername || data.userByEmail;
}

/**
 * Get user by username (convenience function)
 * @param {string} username - Username to fetch
 * @returns {Promise<Object>} User profile data
 */
export const getUserByUsername = async (username) => {
  debugger;
  return await fetchUserProfile({ username });
};

/** 
 * getuser basic profile (only basics and reviews)
 * @param {string} username - Username to fetch
 * @returns {Promise<Object>} User profile data

 */
export const getUserBasicProfile = async (username) => {
  const userQuery = `
    query GetUserBasicProfile($username: String!) {
      userByUsername(username: $username) {
        id
        username
        bio
        country_Code
        rating
        profile_Picture
        reviewsReceived {
          id
          title
          description
          rating
          author {
            username
           
          }
          gig {
            title
          }
          createdAt
        }
        links
      }
    }
  `;

  const result = await query(userQuery, { username });
  return result.userByUsername;
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<boolean>} Success status
 */
export const changePassword = async (currentPassword, newPassword) => {
  const passwordMutation = `
    mutation ChangePassword($currentPassword: String!, $newPassword: String!) {
      changePassword(currentPassword: $currentPassword, newPassword: $newPassword)
    }
  `;

  const result = await mutate(passwordMutation, {
    currentPassword,
    newPassword,
  });
  return result.changePassword;
};

// ============================================================================
// GIG API FUNCTIONS
// ============================================================================

/**
 * Get all gigs
 * @returns {Promise<Array>} List of gigs
 */
export const getAllGigs = async () => {
  const gigsQuery = `
    query GetGigs {
      gigs {
        id
        title
        looking_For
        description
        skills
        currency
        amount
        status
        activeRequest {
            id
        }
        host {
          id
          username
          profile_Picture
          rating
        }
        createdAt
      }
    }
  `;

  const result = await query(gigsQuery, {}, { requireAuth: false });
  return result.gigs;
};

/**
 * Get active gigs
 * @returns {Promise<Array>} List of active gigs
 */
export const getActiveGigs = async () => {
  const activeGigsQuery = `
    query GetActiveGigs {
      activeGigs {
        id
        title
        looking_For
        description
        skills
        currency
        amount
        status
        host {
          id
          username
          profile_Picture
          rating
        }
        createdAt
      }
    }
  `;

  const result = await query(activeGigsQuery, {}, { requireAuth: false });
  return result.activeGigs;
};

/**
 * Get gig by ID
 * @param {string} gigId - Gig ID
 * @returns {Promise<Object>} Gig data
 */
export const getGigById = async (gigId) => {
  const gigQuery = `
    query GetGig($id: ID!) {
      gig(id: $id) {
        id
        title
        looking_For
        description
        skills
        currency
        amount
        paidTillNow
        remainingPayment
        status
        host {
          id
          username
          first_name
          last_name
          profile_Picture
          rating
        }
        guest {
          id
          username
          first_name
          last_name
          profile_Picture
        }
        activeRequest {
          id
          sender {
            id
            username
            profile_Picture
          }
        }
        createdAt
        updatedAt
      }
    }
  `;

  const result = await query(gigQuery, { id: gigId });
  return result.gig;
};

/**
 * Create new gig
 * @param {Object} gigData - Gig creation data
 * @returns {Promise<Object>} Created gig data
 */
export const createGig = async (gigData) => {
  const createGigMutation = `
    mutation CreateGig($input: CreateGigInput!) {
      createGig(input: $input) {
        id
        title
        looking_For
        description
        skills
        currency
        amount
        status
        host {
          id
          username
        }
        createdAt
      }
    }
  `;

  const result = await mutate(createGigMutation, { input: gigData });
  return result.createGig;
};

/**
 * Update gig
 * @param {string} gigId - Gig ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated gig data
 */
export const updateGig = async (gigId, updateData) => {
  const updateGigMutation = `
    mutation UpdateGig($id: ID!, $input: UpdateGigInput!) {
      updateGig(id: $id, input: $input) {
        id
        title
        looking_For
        description
        skills
        currency
        amount
        status
        updatedAt
      }
    }
  `;

  const result = await mutate(updateGigMutation, {
    id: gigId,
    input: updateData,
  });
  return result.updateGig;
};

/**
 * Complete a gig
 * @param {string} gigId - Gig ID
 * @returns {Promise<Object>} Completed gig data
 */
export const completeGig = async (gigId) => {
  const completeGigMutation = `
    mutation CompleteGig($id: ID!) {
      completeGig(id: $id) {
        id
        status
        updatedAt
      }
    }
  `;

  const result = await mutate(completeGigMutation, { id: gigId });
  return result.completeGig;
};

/**
 * Search gigs by term
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Search results
 */
export const searchGigs = async (searchTerm) => {
  const searchQuery = `
    query SearchGigs($searchTerm: String!) {
      searchGigs(searchTerm: $searchTerm) {
        id
        title
        looking_For
        description
        skills
        currency
        amount
        host {
          id
          username
          profile_Picture
        }
        createdAt
      }
    }
  `;

  const result = await query(searchQuery, { searchTerm });
  return result.searchGigs;
};

/**
 * Get user's gig statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User gig stats
 */
export const getUserGigStats = async (userId) => {
  const statsQuery = `
    query UserGigStats($userId: ID!) {
      userGigStats(userId: $userId) {
        totalGigs
        completedGigs
        activeGigs
        totalEarned
        averageRating
        totalReviews
      }
    }
  `;

  const result = await query(statsQuery, { userId });
  return result.userGigStats;
};

// ============================================================================
// REVIEW API FUNCTIONS
// ============================================================================

/**
 * Create a review
 * @param {Object} reviewData - Review data
 * @returns {Promise<Object>} Created review
 */
export const createReview = async (reviewData) => {
  const createReviewMutation = `
    mutation CreateReview($input: CreateReviewInput!) {
      createReview(input: $input) {
        id
        title
        description
        rating
        author {
          id
          username
          profile_Picture
        }
        receiver {
          id
          username
        }
        gig {
          id
          title
        }
        createdAt
      }
    }
  `;

  const result = await mutate(createReviewMutation, { input: reviewData });
  return result.createReview;
};

/**
 * Get user reviews
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User reviews
 */
export const getUserReviews = async (userId) => {
  const reviewsQuery = `
    query UserReviews($userId: $userId) {
      userReviews(userId: $userId) {
        id
        title
        description
        rating
        author {
          id
          username
          profile_Picture
        }
        gig {
          id
          title
        }
        createdAt
      }
    }
  `;

  const result = await query(reviewsQuery, { userId });
  return result.userReviews;
};

// ============================================================================
// REQUEST API FUNCTIONS
// ============================================================================

/**
 * Send gig request
 * @param {Object} requestData - Request data
 * @returns {Promise<Object>} Sent request
 */
export const sendGigRequest = async (requestData) => {
  const sendRequestMutation = `
    mutation SendGigRequest($input: SendGigRequestInput!) {
      sendGigRequest(input: $input) {
        id
        gigId {
          id
          title
        }
        sender {
          id
          username
        }
        receiver {
          id
          username
        }
        message
        proposedAmount
        status
        sentTime
      }
    }
  `;

  const result = await mutate(sendRequestMutation, { input: requestData });
  return result.sendGigRequest;
};

/**
 * Respond to gig request
 * @param {string} requestId - Request ID
 * @param {string} status - Response status (accepted/rejected)
 * @returns {Promise<Object>} Updated request
 */
export const respondToGigRequest = async (requestId, status) => {
  const respondMutation = `
    mutation RespondToGigRequest($requestId: ID!, $status: String!) {
      respondToGigRequest(requestId: $requestId, status: $status) {
        id
        status
        responseTime
        responseMessage
      }
    }
  `;

  const result = await mutate(respondMutation, { requestId, status });
  return result.respondToGigRequest;
};

/**
 * Get sent requests
 * @returns {Promise<Array>} Sent requests
 */
export const getSentRequests = async () => {
  const sentRequestsQuery = `
    query SentRequests {
      sentRequests {
        id
        gigId {
          id
          title
          host {
            username
          }
        }
        receiver {
          id
          username
          profile_Picture
        }
        message
        proposedAmount
        status
        sentTime
        responseTime
        responseMessage
      }
    }
  `;

  const result = await query(sentRequestsQuery);
  return result.sentRequests;
};

// ============================================================================
// CHAT API FUNCTIONS
// ============================================================================

/**
 * Get gig chat messages
 * @param {string} gigId - Gig ID
 * @returns {Promise<Array>} Chat messages
 */
export const getGigChats = async (gigId) => {
  const chatQuery = `
    query GigChats($gigId: ID!) {
      gigChats(gigId: $gigId) {
        id
        content
        timestamp
        messageType
        isRead
        sender {
          id
          username
          profile_Picture
        }
        receiver {
          id
          username
        }
        attachments {
          filename
          url
          fileType
          fileSize
        }
        createdAt
      }
    }
  `;

  const result = await query(chatQuery, { gigId });
  return result.gigChats;
};

/**
 * Send gig message
 * @param {Object} messageData - Message data
 * @returns {Promise<Object>} Sent message
 */
export const sendGigMessage = async (messageData) => {
  const sendMessageMutation = `
    mutation SendGigMessage($input: SendGigMessageInput!) {
      sendGigMessage(input: $input) {
        id
        content
        timestamp
        messageType
        sender {
          id
          username
          profile_Picture
        }
        createdAt
      }
    }
  `;

  const result = await mutate(sendMessageMutation, { input: messageData });
  return result.sendGigMessage;
};

// ============================================================================
// NOTIFICATION API FUNCTIONS
// ============================================================================

/**
 * Get user notifications
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User notifications
 */
export const getUserNotifications = async (userId) => {
  const notificationsQuery = `
    query UserNotifications($userId: ID!) {
      userNotifications(userId: $userId) {
        id
        type
        content
        action
        read
        sender {
          id
          username
          profile_Picture
        }
        createdAt
      }
    }
  `;

  const result = await query(notificationsQuery, { userId });
  return result.userNotifications;
};
