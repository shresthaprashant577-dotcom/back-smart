let ioInstance = null;

export const initSocket = (io) => {
  ioInstance = io;
  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      if (userId) socket.join(`user:${userId}`);
    });
  });
};

export const emitNotification = (userId, notification) => {
  if (!ioInstance || !userId) return;
  ioInstance.to(`user:${userId}`).emit("notification", notification);
};
