import { io } from "socket.io-client";

export const socket = io(
  "https://skribbl-clone-backend-ufhr.vercel.app/",
    {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  }
);
