// index.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins (for dev)
  },
});

// Middleware for parsing JSON
app.use(express.json());

const PORT = process.env.PORT || 3001;

// In-memory storage for notifications (in production, use a database)
const notifications = {
  // userId: [notifications...]
  default: [
    {
      id: "1",
      type: "success",
      title: "Gig Completed",
      message:
        "Your WebRTC Voice+Video Chat gig has been successfully completed!",
      timestamp: "2 hours ago",
      read: false,
    },
    {
      id: "2",
      type: "info",
      title: "New Collaboration Request",
      message:
        "John Doe wants to collaborate on your Tldraw Whiteboard project.",
      timestamp: "5 hours ago",
      read: false,
    },
  ],
};

// In-memory storage for typing status
const userTypingStatus = new Map(); // Map<roomId, Map<userId, {username, timestamp}>>

// Helper function to clean up old typing statuses
const cleanupTypingStatus = () => {
  const now = Date.now();
  const TYPING_TIMEOUT = 10000; // 10 seconds

  userTypingStatus.forEach((roomUsers, roomId) => {
    roomUsers.forEach((typingInfo, userId) => {
      if (now - typingInfo.timestamp > TYPING_TIMEOUT) {
        roomUsers.delete(userId);
      }
    });

    // Remove empty rooms
    if (roomUsers.size === 0) {
      userTypingStatus.delete(roomId);
    }
  });
};

// Run cleanup every 5 seconds
setInterval(cleanupTypingStatus, 5000);

io.on("connection", (socket) => {
  const gigID = socket.handshake.query.gigID;
  if (gigID) {
    socket.join(gigID);
    socket.to(gigID).emit("user-joined", socket.id);
  }

  socket.on("chat-message", (msg) => {
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    rooms.forEach((roomID) => socket.to(roomID).emit("chat-message", msg));
    console.log(`Message from ${socket.id} in room ${rooms.join(", ")}:`, msg);
  });

  // Typing status handlers
  socket.on("typing-start", (data) => {
    const { gigId, username } = data;
    if (!gigId || !username) return;

    // Initialize room typing status if it doesn't exist
    if (!userTypingStatus.has(gigId)) {
      userTypingStatus.set(gigId, new Map());
    }

    const roomTyping = userTypingStatus.get(gigId);
    roomTyping.set(socket.id, {
      username: username,
      timestamp: Date.now(),
    });

    // Broadcast to all other users in the room
    socket.to(gigId).emit("typing-start", {
      gigId,
      username,
      socketId: socket.id,
    });

    console.log(
      `User ${username} (${socket.id}) started typing in room ${gigId}`
    );
  });

  socket.on("typing-stop", (data) => {
    const { gigId, username } = data;
    if (!gigId || !username) return;

    // Remove from typing status
    if (userTypingStatus.has(gigId)) {
      const roomTyping = userTypingStatus.get(gigId);
      roomTyping.delete(socket.id);

      // Clean up empty room
      if (roomTyping.size === 0) {
        userTypingStatus.delete(gigId);
      }
    }

    // Broadcast to all other users in the room
    socket.to(gigId).emit("typing-stop", {
      gigId,
      username,
      socketId: socket.id,
    });

    console.log(
      `User ${username} (${socket.id}) stopped typing in room ${gigId}`
    );
  });

  socket.on("join-room", (roomID) => {
    socket.join(roomID);
    console.log(`User ${socket.id} joined room ${roomID}`);
    socket.to(roomID).emit("user-joined", socket.id);
  });
  socket.on("call-start", (gigId) => {
    // Broadcast to everyone else in the room except sender
    socket.to(gigId).emit("incoming-call", { gigId });
  });

  socket.on("offer", (offer) => {
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    rooms.forEach((roomID) => socket.to(roomID).emit("offer", offer));
  });

  socket.on("answer", (answer) => {
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    rooms.forEach((roomID) => socket.to(roomID).emit("answer", answer));
  });

  socket.on("end-call", () => {
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    rooms.forEach((roomID) => {
      socket.to(roomID).emit("call-ended");
    });

    console.log(`Call ended by user ${socket.id}`);
  });

  socket.on("screen-offer", (offer) => {
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    rooms.forEach((roomID) => socket.to(roomID).emit("screen-offer", offer));
  });

  socket.on("screen-answer", (answer) => {
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    rooms.forEach((roomID) => socket.to(roomID).emit("screen-answer", answer));
  });

  socket.on("screen-ice-candidate", (candidate) => {
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    rooms.forEach((roomID) =>
      socket.to(roomID).emit("screen-ice-candidate", candidate)
    );
  });

  socket.on("screen-share-started", () => {
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    rooms.forEach((roomID) => socket.to(roomID).emit("screen-share-started"));
  });

  socket.on("screen-share-stopped", () => {
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    rooms.forEach((roomID) => socket.to(roomID).emit("screen-share-stopped"));
  });

  socket.on("ice-candidate", (candidate) => {
    const rooms = [...socket.rooms].filter((r) => r !== socket.id);
    rooms.forEach((roomID) =>
      socket.to(roomID).emit("ice-candidate", candidate)
    );
  });

  // Notification handlers
  socket.on("get-notifications", () => {
    console.log(`User ${socket.id} requested notifications`);
    // In production, get userId from authentication
    const userId = "default"; // For demo purposes
    const userNotifications = notifications[userId] || [];
    socket.emit("notifications-response", userNotifications);
  });

  socket.on("mark-notification-read", (data) => {
    const { notificationId } = data;
    const userId = "default"; // In production, get from auth

    if (notifications[userId]) {
      const notification = notifications[userId].find(
        (n) => n.id === notificationId
      );
      if (notification) {
        notification.read = true;
        console.log(
          `Notification ${notificationId} marked as read by ${socket.id}`
        );

        // Broadcast to all connected clients for this user
        io.to(`user_${userId}`).emit("notification-update", notification);
      }
    }
  });

  socket.on("mark-all-notifications-read", () => {
    const userId = "default"; // In production, get from auth

    if (notifications[userId]) {
      notifications[userId].forEach((notification) => {
        notification.read = true;
      });

      console.log(`All notifications marked as read by ${socket.id}`);

      // Broadcast updated notifications to all connected clients for this user
      io.to(`user_${userId}`).emit(
        "notifications-bulk-update",
        notifications[userId]
      );
    }
  });

  // Join user-specific notification room
  socket.on("join-notification-room", (userId) => {
    socket.join(`user_${userId}`);
    console.log(
      `User ${socket.id} joined notification room for user ${userId}`
    );
  });

  // --- ADD: Handle incoming gig requests ---
  // When a user sends a request to join a gig, broadcast to the gig room
  socket.on("gig-request", (data) => {
    // data: { gigId, request: { requesterName, message }, hostUsername, requestId }
    const { gigId, request, hostUsername, requestId } = data;
    if (gigId && request) {
      // Add requestId to the request object for the broadcast
      const requestWithId = {
        ...request,
        requestId: requestId,
      };

      // Broadcast to all in the gig room except sender
      socket.to(gigId.toString()).emit("gig-request", requestWithId);
      console.log(`Gig request sent to gigId ${gigId}:`, requestWithId);

      // If hostUsername is provided, send a notification to the host
      if (hostUsername && request.requesterName) {
        try {
          const notification = createNotificationFromTemplate(
            "requestUpdate",
            "collaboration_request",
            request.requesterName,
            "view_request",
            {
              gigId: gigId,
              requestId: requestId,
              message: request.message,
            }
          );

          // Add notification to host's notifications
          if (!notifications[hostUsername]) {
            notifications[hostUsername] = [];
          }
          notifications[hostUsername].unshift(notification);

          // Send notification to host via WebSocket
          io.to(`user_${hostUsername}`).emit("new-notification", notification);

          console.log(
            `Notification sent to host ${hostUsername}:`,
            notification
          );
        } catch (error) {
          console.error("Error creating notification:", error);
        }
      }
    }
  });

  // Handle gig request cancellation
  socket.on("gig-request-cancel", (data) => {
    const { gigId, requesterName, hostUsername, requestId } = data;
    if (gigId && requesterName) {
      // Broadcast cancellation to all in the gig room except sender
      socket.to(gigId.toString()).emit("gig-request-cancel", {
        requesterName: requesterName,
        requestId: requestId, // Include requestId for proper removal
        timestamp: new Date().toISOString(),
      });
      console.log(
        `Gig request cancelled for gigId ${gigId} by ${requesterName}${requestId ? ` (ID: ${requestId})` : ""}`
      );

      // If hostUsername is provided, send a notification to the host
      if (hostUsername) {
        try {
          const notification = createNotificationFromTemplate(
            "requestUpdate",
            "collaboration_declined",
            requesterName,
            "view_gig",
            {
              gigId: gigId,
              requestId: requestId,
              message: `${requesterName} cancelled their request to join your gig.`,
            }
          );

          // Add notification to host's notifications
          if (!notifications[hostUsername]) {
            notifications[hostUsername] = [];
          }
          notifications[hostUsername].unshift(notification);

          // Send notification to host via WebSocket
          io.to(`user_${hostUsername}`).emit("new-notification", notification);

          console.log(
            `Cancellation notification sent to host ${hostUsername}:`,
            notification
          );
        } catch (error) {
          console.error("Error creating cancellation notification:", error);
        }
      }
    }
  });

  // Handle gig ended event
  socket.on("gig-ended", (data) => {
    const { gigId } = data;
    if (gigId) {
      // Broadcast to all in the gig room except sender
      socket.to(gigId.toString()).emit("gig-ended");
      console.log(`Gig ended for gigId ${gigId} by ${socket.id}`);
    }
  });

  // Handle payment requests
  socket.on("payment-request", (data) => {
    const { gigId } = data;
    if (gigId) {
      // Broadcast to all in the gig room except sender
      socket.to(gigId.toString()).emit("payment-request", data);
      console.log(`Payment request sent in gigId ${gigId}:`, data);
    }
  });

  // Handle payment responses (accept/decline)
  socket.on("payment-response", (data) => {
    const { gigId } = data;
    if (gigId) {
      // Broadcast to all in the gig room except sender
      socket.to(gigId.toString()).emit("payment-response", data);
      console.log(`Payment response sent in gigId ${gigId}:`, data);
    }
  });

  // Discussion room handlers
  socket.on("join-discussion-room", (data) => {
    const { roomId, username } = data;
    if (roomId && username) {
      const roomKey = `discussion_${roomId}`;
      socket.join(roomKey);
      socket.username = username;
      socket.discussionRoom = roomKey;

      console.log(
        `User ${username} (${socket.id}) joined discussion room ${roomId}`
      );

      // Get current users in room
      const socketsInRoom = io.sockets.adapter.rooms.get(roomKey);
      const usersInRoom = [];
      if (socketsInRoom) {
        for (const socketId of socketsInRoom) {
          const sock = io.sockets.sockets.get(socketId);
          if (sock && sock.username) {
            usersInRoom.push(sock.username);
          }
        }
      }

      // Send current users to the joining user
      socket.emit("users-in-room", usersInRoom);

      // Notify others about the new user
      socket.to(roomKey).emit("user-joined-discussion", { username });
    }
  });

  socket.on("leave-discussion-room", (data) => {
    const { roomId, username } = data;
    if (roomId && username) {
      const roomKey = `discussion_${roomId}`;
      socket.leave(roomKey);

      console.log(
        `User ${username} (${socket.id}) left discussion room ${roomId}`
      );

      // Notify others about the user leaving
      socket.to(roomKey).emit("user-left-discussion", { username });
    }
  });

  socket.on("discussion-message", (msg) => {
    const { roomId } = msg;
    if (roomId) {
      const roomKey = `discussion_${roomId}`;
      // Broadcast to all in the discussion room except sender
      socket.to(roomKey).emit("chat-message", msg);
      console.log(`Discussion message in room ${roomId}:`, msg);
    }
  });

  // Handle sending targeted notifications

  socket.on("gig-request-response", (data) => {
    // data should include: gigId, requestId, requesterName, response, hostUsername, timestamp
    console.log("Received gig-request-response:", data);

    const { gigId, requestId, requesterName, response, hostUsername } = data;

    if (!gigId || !requestId || !requesterName || !response) {
      console.error("Missing required fields for gig-request-response");
      return;
    }

    // Broadcast to the gig room so all participants are updated
    if (gigId) {
      io.to(gigId.toString()).emit("gig-request-response", data);
      console.log(`Gig request response broadcasted to room ${gigId}:`, data);
    }

    // Send targeted notification to the requester about the response
    if (requesterName && hostUsername) {
      try {
        let templateType = "gigUpdate";
        let notificationType, actionType;

        if (response === "accepted") {
          notificationType = "gig_request_accepted";
          actionType = "view_gig";
        } else if (response === "rejected") {
          notificationType = "gig_request_rejected";
          actionType = "view_atrium";
        } else {
          // Default fallback
          notificationType = "gig_request_rejected";
          actionType = "view_atrium";
        }

        const notification = createNotificationFromTemplate(
          templateType,
          notificationType,
          hostUsername,
          actionType,
          {
            gigId: gigId,
            requestId: requestId,
            response: response,
          }
        );

        // Add notification to requester's notifications
        if (!notifications[requesterName]) {
          notifications[requesterName] = [];
        }
        notifications[requesterName].unshift(notification);

        // Send notification to requester via WebSocket
        io.to(`user_${requesterName}`).emit("new-notification", notification);

        console.log(
          `Response notification sent to requester ${requesterName}:`,
          notification
        );
      } catch (error) {
        console.error("Error creating response notification:", error);
      }
    }

    // Optionally, send to user-specific room (if you're using username-based rooms)
    if (requesterName) {
      io.to(`user_${requesterName}`).emit("gig-request-response", data);
    }

    console.log("Handled gig-request-response successfully:", data);
  });

  // Handle disconnect for discussion rooms and typing cleanup
  socket.on("disconnect", () => {
    // Clean up discussion room
    if (socket.discussionRoom && socket.username) {
      socket.to(socket.discussionRoom).emit("user-left-discussion", {
        username: socket.username,
      });
      console.log(
        `User ${socket.username} disconnected from ${socket.discussionRoom}`
      );
    }

    // Clean up typing status for all rooms
    userTypingStatus.forEach((roomUsers, roomId) => {
      if (roomUsers.has(socket.id)) {
        const typingInfo = roomUsers.get(socket.id);
        roomUsers.delete(socket.id);

        // Notify other users that this user stopped typing
        socket.to(roomId).emit("typing-stop", {
          gigId: roomId,
          username: typingInfo.username,
          socketId: socket.id,
        });

        console.log(
          `Cleaned up typing status for ${typingInfo.username} (${socket.id}) in room ${roomId}`
        );

        // Clean up empty room
        if (roomUsers.size === 0) {
          userTypingStatus.delete(roomId);
        }
      }
    });
  });
});

// API Routes for testing notificationsa

// GET endpoint to view all notifications
app.get("/api/notifications", (req, res) => {
  const userId = req.query.userId || "default";
  const userNotifications = notifications[userId] || [];
  res.json({
    success: true,
    userId,
    notifications: userNotifications,
    unreadCount: userNotifications.filter((n) => !n.read).length,
  });
});

// POST endpoint to send a test notification (with template support)
app.post("/api/notifications/send", (req, res) => {
  const {
    userId = "default",
    templateType,
    notificationType,
    username,
    action,
    customData = {},
    // Fallback to manual notification
    type = "info",
    title,
    message,
  } = req.body;

  let newNotification;

  try {
    if (templateType && notificationType && username) {
      // Use template system
      newNotification = createNotificationFromTemplate(
        templateType,
        notificationType,
        username,
        action,
        customData
      );
    } else if (title && message) {
      // Fallback to manual notification
      newNotification = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        type,
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        username: username || "System",
      };
    } else {
      return res.status(400).json({
        success: false,
        error:
          "Either provide (templateType, notificationType, username) or (title, message)",
      });
    }

    // Initialize user notifications if doesn't exist
    if (!notifications[userId]) {
      notifications[userId] = [];
    }

    // Add to beginning of array (newest first)
    notifications[userId].unshift(newNotification);

    console.log(
      `New notification created for user ${userId}:`,
      newNotification
    );

    // Broadcast to all connected clients for this user
    io.to(`user_${userId}`).emit("new-notification", newNotification);

    res.json({
      success: true,
      message: "Notification sent successfully",
      notification: newNotification,
      connectedClients:
        io.sockets.adapter.rooms.get(`user_${userId}`)?.size || 0,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// POST endpoint to mark notification as read
app.post("/api/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId || "default";

  if (notifications[userId]) {
    const notification = notifications[userId].find((n) => n.id === id);
    if (notification) {
      notification.read = true;

      // Broadcast to all connected clients
      io.to(`user_${userId}`).emit("notification-update", notification);

      res.json({
        success: true,
        message: "Notification marked as read",
        notification,
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }
  } else {
    res.status(404).json({
      success: false,
      error: "User not found",
    });
  }
});

// POST endpoint to send gig request
app.post("/api/gig/request", (req, res) => {
  const { gigId, requesterName, message, userId = "default" } = req.body;

  if (!gigId || !requesterName) {
    return res.status(400).json({
      success: false,
      error: "gigId and requesterName are required",
    });
  }

  const request = {
    id: Date.now().toString(),
    gigId,
    requesterName,
    message: message || `${requesterName} wants to join your gig`,
    timestamp: new Date().toISOString(),
    status: "pending",
  };

  console.log(`Gig request sent to gigId ${gigId}:`, request);

  // Broadcast to all users in the gig room
  io.to(gigId.toString()).emit("gig-request", request);

  // Create notification for gig owner
  const notification = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    type: "info",
    title: "New Gig Request",
    message: `${requesterName} wants to join your gig`,
    timestamp: new Date().toISOString(),
    read: false,
    username: requesterName,
    gigId: gigId,
  };

  // Add notification to gig owner (assuming userId is gig owner)
  if (!notifications[userId]) {
    notifications[userId] = [];
  }
  notifications[userId].unshift(notification);

  // Broadcast notification
  io.to(`user_${userId}`).emit("new-notification", notification);

  res.json({
    success: true,
    message: "Gig request sent successfully",
    request,
    notification,
    connectedClients: io.sockets.adapter.rooms.get(gigId.toString())?.size || 0,
  });
});

// GET endpoint to test server status
app.get("/api/status", (req, res) => {
  const connectedSockets = io.sockets.sockets.size;
  const rooms = Array.from(io.sockets.adapter.rooms.keys());

  // Convert typing status to a readable format
  const typingStatusSnapshot = {};
  userTypingStatus.forEach((roomUsers, roomId) => {
    typingStatusSnapshot[roomId] = {};
    roomUsers.forEach((typingInfo, socketId) => {
      typingStatusSnapshot[roomId][socketId] = {
        username: typingInfo.username,
        typingFor: `${Math.round((Date.now() - typingInfo.timestamp) / 1000)}s`,
      };
    });
  });

  res.json({
    success: true,
    server: "Kozeo WebSocket Server",
    connectedSockets,
    rooms,
    typingStatus: typingStatusSnapshot,
    timestamp: new Date().toISOString(),
  });
});

// GET endpoint to check typing status for a specific room
app.get("/api/typing/:roomId", (req, res) => {
  const { roomId } = req.params;

  const roomTyping = userTypingStatus.get(roomId);
  const typingUsers = [];

  if (roomTyping) {
    roomTyping.forEach((typingInfo, socketId) => {
      typingUsers.push({
        socketId,
        username: typingInfo.username,
        typingFor: `${Math.round((Date.now() - typingInfo.timestamp) / 1000)}s`,
        timestamp: typingInfo.timestamp,
      });
    });
  }

  res.json({
    success: true,
    roomId,
    typingUsers,
    typingCount: typingUsers.length,
    timestamp: new Date().toISOString(),
  });
});

//notification templates, TODO: move to separate file

const notificationTemplates = {
  requestUpdate: {
    collaboration_request: (username, action) => ({
      type: "info",
      title: "New Collaboration Request",
      message: `${username} wants to collaborate on your project.`,
      action: action || "view_request",
      actionLabel: "View Request",
    }),
    collaboration_accepted: (username, action) => ({
      type: "success",
      title: "Collaboration Accepted",
      message: `${username} accepted your collaboration request.`,
      action: action || "view_project",
      actionLabel: "View Project",
    }),
    collaboration_declined: (username, action) => ({
      type: "warning",
      title: "Collaboration Declined",
      message: `${username} declined your collaboration request.`,
      action: action || "browse_others",
      actionLabel: "Browse Others",
    }),
    profile_view: (username, action) => ({
      type: "info",
      title: "Profile Viewed",
      message: `${username} viewed your profile.`,
      action: action || "view_profile",
      actionLabel: "View Their Profile",
    }),
  },

  gigUpdate: {
    gig_started: (username, action) => ({
      type: "success",
      title: "Gig Started",
      message: `Your gig with ${username} has started successfully.`,
      action: action || "join_gig",
      actionLabel: "Join Gig",
    }),
    gig_completed: (username, action) => ({
      type: "success",
      title: "Gig Completed",
      message: `Your gig with ${username} has been completed successfully.`,
      action: action || "view_results",
      actionLabel: "View Results",
    }),
    gig_cancelled: (username, action) => ({
      type: "warning",
      title: "Gig Cancelled",
      message: `Your gig with ${username} has been cancelled.`,
      action: action || "reschedule",
      actionLabel: "Reschedule",
    }),
    gig_reminder: (username, action) => ({
      type: "info",
      title: "Gig Reminder",
      message: `Your gig with ${username} starts in 15 minutes.`,
      action: action || "join_now",
      actionLabel: "Join Now",
    }),
    milestone_reached: (username, action) => ({
      type: "success",
      title: "Milestone Reached",
      message: `${username} marked a milestone as complete in your project.`,
      action: action || "review_milestone",
      actionLabel: "Review Milestone",
    }),
    // ADD THESE MISSING TEMPLATES:
    gig_request_accepted: (username, action) => ({
      type: "success",
      title: "Gig Request Accepted! 🎉",
      message: `Great news! ${username} has accepted your request to join their gig. You can now access the gig workspace.`,
      action: action || "view_gig",
      actionLabel: "Go to Gig",
    }),
    gig_request_rejected: (username, action) => ({
      type: "warning",
      title: "Gig Request Declined",
      message: `${username} has declined your request to join their gig. Don't worry, there are plenty of other opportunities in the Atrium!`,
      action: action || "view_atrium",
      actionLabel: "Browse More Gigs",
    }),
  },

  paymentStatus: {
    payment_received: (username, action) => ({
      type: "success",
      title: "Payment Received",
      message: `You received payment from ${username} for your completed gig.`,
      action: action || "view_transaction",
      actionLabel: "View Transaction",
    }),
    payment_pending: (username, action) => ({
      type: "warning",
      title: "Payment Pending",
      message: `Payment from ${username} is pending verification.`,
      action: action || "check_status",
      actionLabel: "Check Status",
    }),
    payment_failed: (username, action) => ({
      type: "error",
      title: "Payment Failed",
      message: `Payment from ${username} has failed. Please check your payment method.`,
      action: action || "retry_payment",
      actionLabel: "Retry Payment",
    }),
    payment_refunded: (username, action) => ({
      type: "info",
      title: "Payment Refunded",
      message: `Payment to ${username} has been refunded to your account.`,
      action: action || "view_refund",
      actionLabel: "View Details",
    }),
    payout_processed: (username, action) => ({
      type: "success",
      title: "Payout Processed",
      message: `Your earnings have been processed and sent to your account.`,
      action: action || "view_earnings",
      actionLabel: "View Earnings",
    }),
  },
};

// Helper function to create notification from template
function createNotificationFromTemplate(
  templateType,
  notificationType,
  username,
  action = null,
  customData = {}
) {
  if (
    !notificationTemplates[templateType] ||
    !notificationTemplates[templateType][notificationType]
  ) {
    throw new Error(`Invalid template: ${templateType}.${notificationType}`);
  }

  const template = notificationTemplates[templateType][notificationType](
    username,
    action
  );

  return {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    ...template,
    timestamp: new Date().toISOString(),
    read: false,
    username: username,
    ...customData, // Allow custom overrides
  };
}

// POST endpoint to mark notification as read
app.post("/api/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  const userId = req.query.userId || "default";

  if (notifications[userId]) {
    const notification = notifications[userId].find((n) => n.id === id);
    if (notification) {
      notification.read = true;

      // Broadcast to all connected clients
      io.to(`user_${userId}`).emit("notification-update", notification);

      res.json({
        success: true,
        message: "Notification marked as read",
        notification,
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Notification not found",
      });
    }
  } else {
    res.status(404).json({
      success: false,
      error: "User not found",
    });
  }
});

app.get("/api/notifications/templates", (req, res) => {
  const templateStructure = {};

  Object.keys(notificationTemplates).forEach((templateType) => {
    templateStructure[templateType] = Object.keys(
      notificationTemplates[templateType]
    );
  });

  res.json({
    success: true,
    templates: templateStructure,
    example: {
      templateType: "requestUpdate",
      notificationType: "collaboration_request",
      username: "john_doe",
      action: "view_request",
    },
  });
});

// GET endpoint to test server status
app.get("/api/status", (req, res) => {
  const connectedSockets = io.sockets.sockets.size;
  const rooms = Array.from(io.sockets.adapter.rooms.keys());

  res.json({
    success: true,
    server: "Kozeo WebSocket Server",
    connectedSockets,
    rooms,
    timestamp: new Date().toISOString(),
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server: ws://localhost:${PORT}`);
  console.log(
    `Test notifications: POST http://localhost:${PORT}/api/notifications/send`
  );
  console.log(
    `View notifications: GET http://localhost:${PORT}/api/notifications`
  );
  console.log(`Server status: GET http://localhost:${PORT}/api/status`);
});
