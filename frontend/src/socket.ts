import { io } from "socket.io-client";

export const socket = io("https://splitbill-backend-804441447131.asia-southeast2.run.app", {
  autoConnect: true,
});
