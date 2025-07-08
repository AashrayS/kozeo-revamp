// config.js

// Use NEXT_PUBLIC_WEBSOCKET_URL for client-side config
export const WEBSOCKET_URL =
  process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
  "wss://kozeo-ws-production.up.railway.app";
//dev endpoint
// export const WEBSOCKET_URL =  "ws://localhost:3001";

// GraphQL API endpoint
export const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_GRAPHQL_URL || "http://localhost:4001/graphql";

// Export other config variables as needed
