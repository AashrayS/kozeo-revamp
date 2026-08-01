import { gql } from '@apollo/client';

export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications($userId: ID!) {
    userNotifications(userId: $userId) {
      id
      type
      content
      action
      read
      createdAt
      sender {
        id
        username
        first_name
        last_name
        profile_Picture
      }
    }
  }
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($userId: ID!, $notificationId: ID!) {
    markNotificationAsRead(userId: $userId, notificationId: $notificationId)
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead($userId: ID!) {
    markAllNotificationsAsRead(userId: $userId)
  }
`;
