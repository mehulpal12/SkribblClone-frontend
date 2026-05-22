import { io } from "socket.io-client";

export const socket = io(
  "https://skribblclone-backend-4lfh.onrender.com/",
    {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  }
);