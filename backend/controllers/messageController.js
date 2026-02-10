const { prisma } = require("../config/prisma");

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user.id;

    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId,
        conversationId,
      },
      include: {
        sender: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      include: {
        sender: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.senderId !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this message" });
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { content },
      include: {
        sender: { select: { id: true, username: true, avatarUrl: true } },
      },
    });

    res.json(updatedMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const message = await prisma.message.findUnique({
      where: { id },
    });

    if (!message) return res.status(404).json({ message: "Message not found" });

    if (message.senderId !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this message" });
    }

    await prisma.message.delete({
      where: { id },
    });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
