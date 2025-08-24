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
            links
            rating
            role
            unreadNotificationCount
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
  // debugger;
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

// fetch sentrequets of a user by username
export async function fetchSentRequestsByUsername(username) {
  const query = `
    query GetSentRequestsByUsername($username: String!) {
      GetUserByEmail(username: $username) {
        id
        gigId
        status
        createdAt
      }
    }
  `;
  const variables = { username };
  const data = await callApi({
    query,
    variables,
    token: localStorage.getItem("kozeo_auth_token"),
  });
  return data.sentRequestsByUsername;
}

/**
 * Get user by username (convenience function)
 * @param {string} username - Username to fetch
 * @returns {Promise<Object>} User profile data
 */
export const getUserByUsername = async (username) => {
  // debugger;
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
          status
          sender {
            id
            username
            first_name
            last_name
            profile_Picture
            rating
            gigHostedCount
            gigCollaboratedCount
            bio
          }
            message
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
  // Validate input
  if (
    !gigData.title ||
    !gigData.looking_For ||
    !gigData.description ||
    !gigData.skills
  ) {
    throw new Error("All required fields must be provided");
  }

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
        isActive
        host {
          id
          username
          first_name
          last_name
          profile_Picture
          rating
        }
        createdAt
        updatedAt
      }
    }
  `;

  try {
    const result = await mutate(createGigMutation, { input: gigData });

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.createGig;
  } catch (error) {
    console.error("Error creating gig:", error);
    throw error;
  }
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
 * Delete a gig
 * @param {string} gigId - Gig ID to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteGig = async (gigId) => {
  const deleteGigMutation = `
    mutation DeleteGig($id: ID!) {
      deleteGig(id: $id)
    }
  `;

  const result = await mutate(deleteGigMutation, { id: gigId });
  return result.deleteGig;
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
          rating
        }
        activeRequest {
          id
        }
        createdAt
      }
    }
  `;

  const result = await query(searchQuery, { searchTerm });
  return result.searchGigs;
};

/** Search Users */
export const searchUsers = async (searchTerm) => {
  const searchQuery = `
    query searchUsers($searchTerm: String!) {
      searchUsers(username: $searchTerm) {
        username
        profile_Picture
        bio
        rating
        gigCollaboratedCount
        gigHostedCount
      }
    }
  `;

  const result = await query(searchQuery, { searchTerm });
  return result.searchUsers;
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

/**
 * Get user's gigs (both hosted and collaborated)
 * @returns {Promise<Object>} User's gigs data
 */
export const getUserGigs = async (userId) => {
  const userGigsQuery = `
  query {
    userGigs(userId: "${userId}") {
      id
      isActive
      date
      title
      looking_For
      description
      skills
      currency
      amount
      paidTillNow
      status
      remainingPayment
      createdAt
      updatedAt
      activeRequest {
        id
      }
      host {
        id
        first_name
        last_name
        username
        email
        profile_Picture
        bio
        rating
      }
      guest {
        id
        first_name
        last_name
        username
        email
        profile_Picture
        bio
        rating
      }
    }
  }
`;

  const result = await query(userGigsQuery, {}, { requireAuth: true });

  return result.userGigs || [];
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
 * @param {Object} gigData - Gig data for notification context
 * @returns {Promise<Object>} Sent request
 */
export const sendGigRequest = async (requestData, gigData = null) => {
  const sendRequestMutation = `
    mutation SendGigRequest($input: SendGigRequestInput!) {
      sendGigRequest(input: $input) {
        id
        sender {
          id
          username
          first_name
          last_name
          profile_Picture
          rating
          gigHostedCount
          gigCollaboratedCount
          bio
        }
      }
  }
  `;

  console.log("Sending request with data:", requestData);
  const result = await mutate(sendRequestMutation, { input: requestData });

  // Create notification for the gig host about the new request
  if (result.sendGigRequest && gigData) {
    try {
      await createNotification({
        userId: result.sendGigRequest.receiver.id,
        type: "gig_request",
        senderId: result.sendGigRequest.sender.id,
        content: `You have received a new request for your gig "${gigData.title}"`,
        action: "view_requests",
      });
    } catch (error) {
      console.error("Failed to create notification for gig request:", error);
      // Don't fail the request if notification creation fails
    }
  }

  return result.sendGigRequest;
};

/**
 * Respond to gig request
 * @param {string} requestId - Request ID
 * @param {string} status - Response status (accepted/rejected)
 * @param {Object} gigData - Gig data for notification context
 * @returns {Promise<Object>} Updated request
 */
export const respondToGigRequest = async (
  requestId,
  status,
  gigData = null
) => {
  // Note: GraphQL enums are case-sensitive. Check if backend expects uppercase or lowercase
  const validStatuses = {
    accepted: "accepted",
    rejected: "rejected",
    cancelled: "cancelled",
    ACCEPTED: "accepted",
    REJECTED: "rejected",
    CANCELLED: "cancelled",
  };

  const normalizedStatus = validStatuses[status] || status.toLowerCase();

  const respondMutation = `
    mutation RespondToGigRequest($requestId: ID!, $status: RequestStatus!) {
      respondToGigRequest(requestId: $requestId, status: $status) {
        id
        gigId
        sender {
          
          username
          first_name
          last_name
          profile_Picture
          rating
        }
        receiver {
          
          username
          first_name
          last_name
          profile_Picture
          rating
        }
        status
        createdAt
        updatedAt
      }
    }
  `;

  try {
    console.log(
      `Responding to request ${requestId} with status: ${normalizedStatus}`
    );
    console.log("GraphQL variables:", { requestId, status: normalizedStatus });

    const result = await mutate(respondMutation, {
      requestId,
      status: normalizedStatus,
    });

    // Create notification for the request sender about the response
    if (result.respondToGigRequest && gigData) {
      try {
        const notificationType =
          normalizedStatus === "accepted" ? "gig_accepted" : "gig_rejected";
        const notificationContent =
          normalizedStatus === "accepted"
            ? `Your request for the gig "${gigData.title}" has been accepted!`
            : `Your request for the gig "${gigData.title}" has been rejected.`;
        const notificationAction =
          normalizedStatus === "accepted" ? "view_gig" : "view_requests";

        await createNotification({
          userId: result.respondToGigRequest.sender.id,
          type: notificationType,
          senderId: result.respondToGigRequest.receiver.id,
          content: notificationContent,
          action: notificationAction,
        });
      } catch (error) {
        console.error(
          "Failed to create notification for gig request response:",
          error
        );
        // Don't fail the response if notification creation fails
      }
    }

    console.log("Response API result:", result);
    return result.respondToGigRequest;
  } catch (error) {
    console.error("Error in respondToGigRequest:", error);
    console.error("Request details:", {
      requestId,
      originalStatus: status,
      normalizedStatus,
    });
    throw error;
  }
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
 * @returns {Promise<Array} Chat messages
 */
export const getGigChats = async (gigId) => {
  const chatQuery = `
    query GigChats($gigId: ID!) {
      gigChats(gigId: $gigId) {
        id
        gig
        receiver
        content
        timestamp
        messageType
        isRead
        isEdited
        editedAt
        createdAt
        updatedAt
        sender
        attachments {
            description
        }
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
        gig
        content
        timestamp
        messageType
      }
    }
  `;

  const result = await mutate(sendMessageMutation, { input: messageData });
  return result.sendGigMessage;
};

export const getUserNotifications = async (userId) => {
  const queryString = `
    query GetUserNotifications($userId: ID!) {
      userNotifications(userId: $userId) {
        id
        type
        sender {
          id
          username
          first_name
          last_name
          profile_Picture
        }
        content
        action
        read
        createdAt
      }
    }
  `;

  const result = await query(queryString, { userId });
  return result.userNotifications;
};

/**
 * Get unread notifications for a user
 * @param {string} userId - User ID to get unread notifications for
 * @returns {Promise<Array>} Array of unread notifications
 */
export const getUnreadNotifications = async (userId) => {
  const queryString = `
    query GetUnreadNotifications($userId: ID!) {
      unreadNotifications(userId: $userId) {
        id
        type
        sender {
          id
          username
          first_name
          last_name
          profile_Picture
        }
        content
        action
        read
        createdAt
      }
    }
  `;

  const result = await query(queryString, { userId });
  return result.unreadNotifications;
};

/**
 * Create a new notification
 * @param {Object} notificationData - Notification data
 * @param {string} notificationData.userId - User ID to receive notification
 * @param {string} notificationData.type - Notification type
 * @param {string} [notificationData.senderId] - ID of user who triggered notification
 * @param {string} notificationData.content - Notification content
 * @param {string} [notificationData.action] - Action identifier for frontend routing
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async (notificationData) => {
  const mutationString = `
    mutation CreateNotification($input: CreateNotificationInput!) {
      createNotification(input: $input) {
        id
        type
        sender {
          id
          username
          first_name
          last_name
          profile_Picture
        }
        content
        action
        read
        createdAt
      }
    }
  `;

  const result = await mutate(mutationString, { input: notificationData });
  return result.createNotification;
};

/**
 * Mark a notification as read
 * @param {string} userId - User ID who owns the notification
 * @param {string} notificationId - Notification ID to mark as read
 * @returns {Promise<boolean>} Success status
 */
export const markNotificationAsRead = async (userId, notificationId) => {
  const mutationString = `
    mutation MarkNotificationAsRead($userId: ID!, $notificationId: ID!) {
      markNotificationAsRead(userId: $userId, notificationId: $notificationId)
    }
  `;

  const result = await mutate(mutationString, { userId, notificationId });
  return result.markNotificationAsRead;
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID to mark all notifications as read
 * @returns {Promise<boolean>} Success status
 */
export const markAllNotificationsAsRead = async (userId) => {
  const mutationString = `
    mutation MarkAllNotificationsAsRead($userId: ID!) {
      markAllNotificationsAsRead(userId: $userId)
    }
  `;

  const result = await mutate(mutationString, { userId });
  return result.markAllNotificationsAsRead;
};

/**
 * Delete a notification
 * @param {string} userId - User ID who owns the notification
 * @param {string} notificationId - Notification ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteNotification = async (userId, notificationId) => {
  const mutationString = `
    mutation DeleteNotification($userId: ID!, $notificationId: ID!) {
      deleteNotification(userId: $userId, notificationId: $notificationId)
    }
  `;

  const result = await mutate(mutationString, { userId, notificationId });
  return result.deleteNotification;
};

/**
 * Cancel a gig request (sender cancels their own request)
 * @param {string} requestId - Request ID to cancel
 * @param {Object} gigData - Gig data for notification context
 * @returns {Promise<Object>} Cancelled request
 */
export const cancelGigRequest = async (requestId, gigData = null) => {
  const cancelMutation = `
    mutation CancelGigRequest($requestId: ID!) {
      cancelGigRequest(requestId: $requestId)
    }
  `;

  try {
    console.log(`Cancelling gig request ${requestId}`);

    const result = await mutate(cancelMutation, { requestId });

    // Create notification for the gig host about the cancellation
    if (result.cancelGigRequest && gigData) {
      try {
        // Since the mutation only returns a boolean, we need to get user info from elsewhere
        // We'll use the current user context for the notification
        const currentUser =
          typeof window !== "undefined"
            ? JSON.parse(localStorage.getItem("kozeo_user") || "{}")
            : {};

        await createNotification({
          userId: gigData.host?.id, // Use the gig host ID from gigData
          type: "gig_cancelled",
          senderId: currentUser.id, // Use current user as sender
          content: `${
            currentUser.first_name || currentUser.username || "A user"
          } has cancelled their request for your gig "${gigData.title}"`,
          action: "view_requests",
        });
      } catch (error) {
        console.error(
          "Failed to create notification for gig request cancellation:",
          error
        );
        // Don't fail the cancellation if notification creation fails
      }
    }

    console.log("Cancel API result:", result);
    return result.cancelGigRequest;
  } catch (error) {
    console.error("Error in cancelGigRequest:", error);
    console.error("Request details:", { requestId });
    throw error;
  }
};
// ============================================================================

// ============================================================================
// DISCUSSION ROOM APIs
// ============================================================================

/**
 * Get all discussion rooms
 * @returns {Promise<Array>} Array of discussion rooms
 */
export const getDiscussionRooms = async () => {
  const queryString = `
    query GetDiscussionRooms {
      discussionRooms {
        id
        isActive
        moderators {
          id
          first_name
          last_name
          username
          profile_Picture
          rating
        }
        title
        description
        displayPicture
        createdAt
        updatedAt
      }
    }
  `;

  const result = await query(queryString, {}, { requireAuth: false });
  return result.discussionRooms;
};

/**
 * Get a specific discussion room by ID
 * @param {string} roomId - Discussion room ID
 * @returns {Promise<Object>} Discussion room details
 */
export const getDiscussionRoom = async (roomId) => {
  const queryString = `
    query GetDiscussionRoom($id: ID!) {
      discussionRoom(id: $id) {
        id
        isActive
        moderators {
          id
          first_name
          last_name
          username
          profile_Picture
          rating
        }
        title
        description
        displayPicture
        createdAt
        updatedAt
      }
    }
  `;

  const result = await query(
    queryString,
    { id: roomId },
    { requireAuth: false }
  );
  return result.discussionRoom;
};

/**
 * Get messages for a specific discussion room
 * @param {string} roomId - Discussion room ID
 * @returns {Promise<Array>} Array of discussion room messages
 */
export const getDiscussionRoomChats = async (roomId) => {
  const queryString = `
    query GetDiscussionRoomMessages($roomId: ID!) {
      discussionRoomChats(roomId: $roomId) {
        id
        discussionRoom
        sender
        content
        timestamp
        replyTo
        isRead
        isEdited
        editedAt
        createdAt
        updatedAt
      }
    }
  `;

  const result = await query(queryString, { roomId }, { requireAuth: false });
  return result.discussionRoomChats;
};

/**
 * Send a message to a discussion room
 * @param {Object} messageData - Message data
 * @param {string} messageData.discussionRoom - Discussion room ID
 * @param {string} messageData.content - Message content
 * @param {string} [messageData.replyTo] - ID of message being replied to
 * @returns {Promise<Object>} Created message
 */
export const sendDiscussionMessage = async (messageData) => {
  const mutationString = `
    mutation SendDiscussionMessage($input: SendDiscussionMessageInput!) {
      sendDiscussionMessage(input: $input) {
        id
        discussionRoom
        sender
        content
        timestamp
        replyTo
        isRead
        isEdited
        editedAt
        createdAt
        updatedAt
      }
    }
  `;

  const result = await mutate(mutationString, { input: messageData });
  return result.sendDiscussionMessage;
};

/**
 * Create a new discussion room (Admin only)
 * @param {Object} roomData - Room data including title, description, and displayPicture
 * @returns {Promise<Object>} Created discussion room data
 */
export const createDiscussionRoom = async (roomData) => {
  const mutationString = `
    mutation CreateDiscussionRoom($input: CreateDiscussionRoomInput!) {
      createDiscussionRoom(input: $input) {
        id
        title
        description
        displayPicture
        isActive
        moderators {
          id
          first_name
          last_name
          username
          profile_Picture
          rating
        }
        createdAt
        updatedAt
      }
    }
  `;

  const result = await mutate(mutationString, { input: roomData });
  return result.createDiscussionRoom;
};

/**
 * Update a discussion room (Admin only)
 * @param {string} roomId - Room ID to update
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated discussion room data
 */
export const updateDiscussionRoom = async (roomId, updateData) => {
  const mutationString = `
    mutation UpdateDiscussionRoom($id: ID!, $input: UpdateDiscussionRoomInput!) {
      updateDiscussionRoom(id: $id, input: $input) {
        id
        title
        description
        displayPicture
        isActive
        moderators {
          id
          first_name
          last_name
          username
          profile_Picture
          rating
        }
        createdAt
        updatedAt
      }
    }
  `;

  const result = await mutate(mutationString, {
    id: roomId,
    input: updateData,
  });
  return result.updateDiscussionRoom;
};

/**
 * Delete a discussion room (Admin only)
 * @param {string} roomId - Room ID to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteDiscussionRoom = async (roomId) => {
  const mutationString = `
    mutation DeleteDiscussionRoom($id: ID!) {
      deleteDiscussionRoom(id: $id) {
        success
        message
      }
    }
  `;

  const result = await mutate(mutationString, { id: roomId });
  return result.deleteDiscussionRoom;
};

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Get all notifications for a user
 * @param {string} userId - User ID to get notifications for
 * @returns {Promise<Array>} Array of notifications
 */

export const verifyEmail = async (email) => {
  const query = `
    mutation VerifyEmail($email: String!) {
      verifyEmail(email: $email) {
        success
        message
      }
    }
  `;
  const variables = { email };
  const data = await callApi({
    query,
    variables,
  });
  return data.verifyEmail;
};

export const verifyOtp = async (email, otp) => {
  const query = `
    mutation VerifyOtp($email: String!, $otp: String!) {
      verifyOtp(email: $email, otp: $otp)
      {
        success
        message
      }
    }
  `;
  const variables = { email, otp };
  const data = await callApi({
    query,
    variables,
  });
  return data.verifyOtp;
};

// ============================================================================
// PAYMENT APIS
// ============================================================================

/**
 * Create a Cashfree order for payment processing
 * @param {number} amount - Amount in the smallest currency unit (paise for INR)
 * @param {string} currency - Currency code (default: "INR")
 * @param {Object} notes - Additional notes for the order
 * @returns {Promise<Object>} Cashfree order details
 */
export const createCashfreeOrder = async (
  amount,
  currency = "INR",
  notes = {}
) => {
  const query = `
    mutation CreateCashfreeOrder($input: CreateCashfreeOrderInput!) {
      createCashfreeOrder(input: $input) {
        success
        orderId
        paymentSessionId
        amount
        currency
        message
      }
    }
  `;

  const customerDetails = notes

  const variables = {
    input: {
      amount: parseFloat(amount),
      currency,
      customerDetails,
      orderNote: notes.description || "Payment for gig services",
    },
  };

  // Get JWT token from localStorage for authentication
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kozeo_auth_token")
      : null;

  const data = await callApi({
    query,
    variables,
    token,
  });

  return data.createCashfreeOrder;
};

/**
 * Verify Cashfree payment after successful payment
 * @param {string} orderId - Order ID from Cashfree
 * @param {string} signature - Signature from Cashfree (optional)
 * @param {string} timestamp - Timestamp from Cashfree (optional)
 * @returns {Promise<Object>} Payment verification result
 */
export const verifyCashfreePayment = async (
  orderId,
  signature = null,
  timestamp = null
) => {
  // Validate required orderId parameter
  if (!orderId) {
    throw new Error("orderId is required for payment verification");
  }

  const query = `
    mutation VerifyCashfreePayment($input: VerifyCashfreePaymentInput!) {
      verifyCashfreePayment(input: $input) {
        success
        payment_id
        order_id
        amount
        currency
        verified
        payment_status
        message
      }
    }
  `;

  // Build input object, only including non-null values
  const input = {
    orderId: orderId.toString(), // Ensure orderId is a string
  };

  // Only include signature and timestamp if they are provided and not null
  if (signature !== null && signature !== undefined && signature !== "") {
    input.signature = signature.toString();
  }

  if (timestamp !== null && timestamp !== undefined && timestamp !== "") {
    input.timestamp = timestamp.toString();
  }

  const variables = {
    input,
  };

  console.log("Verifying Cashfree payment with:", variables);

  // Get JWT token from localStorage for authentication
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kozeo_auth_token")
      : null;

  const data = await callApi({
    query,
    variables,
    token,
  });

  return data.verifyCashfreePayment;
};

/**
 * Create a Razorpay order for payment processing
 * @param {number} amount - Amount in the smallest currency unit (paise for INR)
 * @param {string} currency - Currency code (default: "INR")
 * @param {Object} notes - Additional notes for the order
 * @returns {Promise<Object>} Razorpay order details
 */
export const createRazorpayOrder = async (
  amount,
  currency = "INR",
  notes = {}
) => {
  const query = `
    mutation CreateRazorpayOrder($input: CreateRazorpayOrderInput!) {
      createRazorpayOrder(input: $input) {
        success
        message
        orderId
        amount
        currency
       
      }
    }
  `;

  const variables = {
    input: {
      amount: parseFloat(amount),
      currency,
      notes,
    },
  };

  // Get JWT token from localStorage for authentication
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kozeo_auth_token")
      : null;

  const data = await callApi({
    query,
    variables,
    token,
  });

  return data.createRazorpayOrder;
};

/**
 * Verify Razorpay payment after successful payment
 * @param {string} razorpay_payment_id - Payment ID from Razorpay
 * @param {string} razorpay_order_id - Order ID from Razorpay
 * @param {string} razorpay_signature - Signature from Razorpay
 * @returns {Promise<Object>} Payment verification result
 */
export const verifyRazorpayPayment = async (
  razorpay_payment_id,
  razorpay_order_id,
  razorpay_signature
) => {
  // Validate required parameters
  if (!razorpay_payment_id) {
    throw new Error("razorpay_payment_id is required for payment verification");
  }
  if (!razorpay_order_id) {
    throw new Error("razorpay_order_id is required for payment verification");
  }
  if (!razorpay_signature) {
    throw new Error("razorpay_signature is required for payment verification");
  }

  const query = `
    mutation VerifyRazorpayPayment($input: VerifyRazorpayPaymentInput!) {
      verifyRazorpayPayment(input: $input) {
        success
        verified
        message
        payment_id
        order_id
      }
    }
  `;

  const variables = {
    input: {
      razorpay_payment_id: razorpay_payment_id.toString(),
      razorpay_order_id: razorpay_order_id.toString(),
      razorpay_signature: razorpay_signature.toString(),
    },
  };

  console.log("Verifying Razorpay payment with:", variables);

  // Get JWT token from localStorage for authentication
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kozeo_auth_token")
      : null;

  const data = await callApi({
    query,
    variables,
    token,
  });

  return data.verifyRazorpayPayment;
};

/**
 * Create a gig transaction after successful payment verification
 * @param {string} gigId - ID of the gig for payment
 * @param {number} baseAmount - Base amount for the transaction
 * @param {string} currency - Currency code (default: "INR")
 * @returns {Promise<Object>} Transaction creation result
 */
export const createGigTransaction = async (
  gigId,
  baseAmount,
  transaction,
  currency = "INR"
) => {
  const query = `
    mutation CreateGigTransaction($input: CreateGigTransactionInput!) {
      createGigTransaction(input: $input) {
        success
        message
        transaction {
          id
          baseAmount
          transactionCharges
          status
          transactionNumber
          createdAt
          updatedAt
        }
        updatedGig {
          id
          paidTillNow
          amount
        }
        receiverWallet {
          id
          updatedAt
        }
      }
    }
  `;

  const variables = {
    input: {
      gigId,
      baseAmount: parseFloat(baseAmount),
      transactionNumber: transaction,
      currency,
    },
  };

  // Get JWT token from localStorage for authentication
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kozeo_auth_token")
      : null;

  try {
    const data = await callApi({
      query,
      variables,
      token,
    });

    return data.createGigTransaction;
  } catch (error) {
    console.error("Error creating gig transaction:", error);
    throw error;
  }
};

/**
 * Update attachment description/status for a message
 * @param {string} messageId - ID of the message containing the attachment
 * @param {string} description - Payment status: "request-made", "accepted", or "rejected"
 * @param {number} attachmentIndex - Index of the attachment to update (default: 0)
 * @returns {Promise<Object>} Updated message result
 */
export const updateAttachmentDescription = async (
  messageId,
  description,
  attachmentIndex = 0
) => {
  const query = `
    mutation UpdateAttachmentDescription($input: UpdateAttachmentDescriptionInput!) {
      updateAttachmentDescription(input: $input) {
        id
        content
        messageType
        timestamp
        sender
        isRead
        attachments {
          description
        }
      }
    }
  `;

  const variables = {
    input: {
      messageId,
      description,
      attachmentIndex,
    },
  };

  // Get JWT token from localStorage for authentication
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kozeo_auth_token")
      : null;

  try {
    const data = await callApi({
      query,
      variables,
      token,
    });

    return data.updateAttachmentDescription;
  } catch (error) {
    console.error("Error updating attachment description:", error);
    throw error;
  }
};

// ============================================================================
// WALLET API FUNCTIONS
// ============================================================================

/**
 * Get user wallet details and transactions
 * @param {string} userId - User ID (optional, uses current user if not provided)
 * @returns {Promise<Object>} Wallet data with transactions
 */
export const getUserWallet = async (userId, currency = "INR") => {
  const query = `
    query GetUserWallet($userId: ID!, $currency: String) {
      userWallet(userId: $userId, currency: $currency) {
        userId
        currency
        amount
        withdrawalTransactions {
          id
          user {
            id
            username
            first_name
            last_name
            profile_Picture
          }
          walletId
          baseAmount
          date
          transactionNumber
          transactionCharges
          commission
          total
          status
          createdAt
          updatedAt
        }
        gigTransactions {
          id
          sender {
            id
            username
            first_name
            last_name
            profile_Picture
          }
          receiver {
            id
            username
            first_name
            last_name
            profile_Picture
          }
          baseAmount
          gigId
          gigTitle
          date
          transactionNumber
          transactionCharges
          commission
          total
          status
          createdAt
          updatedAt
        }
      }
    }
  `;

  const variables = { userId, currency };

  // Get JWT token from localStorage for authentication
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kozeo_auth_token")
      : null;

  try {
    const data = await callApi({
      query,
      variables,
      token,
    });

    return data.userWallet;
  } catch (error) {
    console.error("Error fetching user wallet:", error);
    throw error;
  }
};

// Additional function to get all user wallets
export const getUserWallets = async (userId) => {
  const query = `
    query GetUserWallets($userId: ID!) {
      userWallets(userId: $userId) {
        userId
        currency
        amount
        withdrawalTransactions {
          id
          user {
            id
            username
            first_name
            last_name
            profile_Picture
          }
          walletId
          baseAmount
          date
          transactionNumber
          transactionCharges
          commission
          total
          status
          createdAt
          updatedAt
        }
        gigTransactions {
          id
          sender {
            id
            username
            first_name
            last_name
            profile_Picture
          }
          receiver {
            id
            username
            first_name
            last_name
            profile_Picture
          }
          baseAmount
          gigId
          gigTitle
          date
          transactionNumber
          transactionCharges
          commission
          total
          status
          createdAt
          updatedAt
        }
      }
    }
  `;

  const variables = { userId, currency };

  // Get JWT token from localStorage for authentication
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kozeo_auth_token")
      : null;

  try {
    const data = await callApi({
      query,
      variables,
      token,
    });

    return data.userWallet;
  } catch (error) {
    console.error("Error fetching user wallet:", error);
    throw error;
  }
};

// ============================================================================
// WITHDRAW REQUEST API FUNCTIONS
// ============================================================================

/**
 * Create a new withdraw request
 * @param {Object} withdrawData - Withdrawal request data
 * @param {string} withdrawData.email - User's email for withdrawal
 * @param {string} withdrawData.accountHolderName - Bank account holder name
 * @param {string} withdrawData.bankName - Bank name
 * @param {string} withdrawData.accountNumber - Bank account number
 * @param {string} withdrawData.ifscCode - IFSC code
 * @param {string} withdrawData.upi - Optional UPI ID
 * @param {number} withdrawData.amount - Amount to withdraw
 * @returns {Promise<Object>} Created withdraw request
 */
export const createWithdrawRequest = async (withdrawData) => {
  const mutation = `
    mutation CreateWithdrawRequest($input: CreateWithdrawRequestInput!) {
      createWithdrawRequest(input: $input) {
        id
        userId 
        email
        accountHolderName
        bankName
        accountNumber
        ifscCode
        upi
        amount
        status
        remarks
        createdAt
        updatedAt
      }
    }
  `;

  const variables = {
    input: {
      email: withdrawData.email,
      accountHolderName: withdrawData.accountHolderName,
      bankName: withdrawData.bankName,
      accountNumber: withdrawData.accountNumber,
      ifscCode: withdrawData.ifscCode,
      upi: withdrawData.upi || null,
      amount: parseFloat(withdrawData.amount),
    },
  };

  // Get JWT token from localStorage for authentication
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kozeo_auth_token")
      : null;

  try {
    const data = await callApi({
      query: mutation,
      variables,
      token,
    });

    return data.createWithdrawRequest;
  } catch (error) {
    console.error("Error creating withdraw request:", error);
    throw error;
  }
};

/**
 * Get all withdraw requests for a user
 * @param {string} userId - User ID to get withdraw requests for
 * @returns {Promise<Array>} Array of withdraw requests
 */
export const getUserWithdrawRequests = async (userId) => {
  const query = `
    query GetUserWithdrawRequests($userId: ID!) {
      userWithdrawRequests(userId: $userId) {
        id
        userId
        email
        accountHolderName
        bankName
        accountNumber
        ifscCode
        upi
        amount
        status
        remarks
        processedBy
        processedAt
        transactionId
        createdAt
        updatedAt
      }
    }
  `;

  const variables = { userId };

  // Get JWT token from localStorage for authentication
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kozeo_auth_token")
      : null;

  try {
    const data = await callApi({
      query,
      variables,
      token,
    });

    return data.userWithdrawRequests;
  } catch (error) {
    console.error("Error fetching user withdraw requests:", error);
    throw error;
  }
};

/**
 * Get a single withdraw request by ID
 * @param {string} requestId - Withdraw request ID
 * @returns {Promise<Object>} Withdraw request details
 */
export const getWithdrawRequest = async (requestId) => {
  const query = `
    query GetWithdrawRequest($id: ID!) {
      withdrawRequest(id: $id) {
        id
        userId
        email
        accountHolderName
        bankName
        accountNumber
        ifscCode
        upi
        amount
        status
        remarks
        processedBy
        processedAt
        transactionId
        createdAt
        updatedAt
      }
    }
  `;

  const variables = { id: requestId };

  // Get JWT token from localStorage for authentication
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kozeo_auth_token")
      : null;

  try {
    const data = await callApi({
      query,
      variables,
      token,
    });

    return data.withdrawRequest;
  } catch (error) {
    console.error("Error fetching withdraw request:", error);
    throw error;
  }
};

/**
 * Get all withdraw requests (Admin only)
 * @returns {Promise<Array>} Array of all withdraw requests
 */
export const getAllWithdrawRequests = async () => {
  const query = `
    query GetAllWithdrawRequests {
      withdrawRequests {
        id
        userId
        email
        accountHolderName
        bankName
        accountNumber
        ifscCode
        upi
        amount
        status
        remarks
        processedBy
        processedAt
        transactionId
        createdAt
        updatedAt
      }
    }
  `;

  // Get JWT token from localStorage for authentication
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kozeo_auth_token")
      : null;

  try {
    const data = await callApi({
      query,
      variables: {},
      token,
    });

    return data.withdrawRequests;
  } catch (error) {
    console.error("Error fetching all withdraw requests:", error);
    throw error;
  }
};

/**
 * Update withdraw request status (Admin only)
 * @param {string} requestId - Withdraw request ID
 * @param {string} status - New status (pending, approved, rejected, processed, completed)
 * @param {string} remarks - Optional remarks
 * @returns {Promise<Object>} Updated withdraw request
 */
export const updateWithdrawRequestStatus = async (
  requestId,
  status,
  remarks = null
) => {
  const mutation = `
    mutation UpdateWithdrawRequestStatus(
      $id: ID!
      $status: WithdrawRequestStatus!
      $remarks: String
    ) {
      updateWithdrawRequestStatus(id: $id, status: $status, remarks: $remarks) {
        id
        status
        remarks
        processedBy
        processedAt
        updatedAt
      }
    }
  `;

  const variables = {
    id: requestId,
    status: status,
    remarks: remarks,
  };

  // Get JWT token from localStorage for authentication
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("kozeo_auth_token")
      : null;

  try {
    const data = await callApi({
      query: mutation,
      variables,
      token,
    });

    return data.updateWithdrawRequestStatus;
  } catch (error) {
    console.error("Error updating withdraw request status:", error);
    throw error;
  }
};
