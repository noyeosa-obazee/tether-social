const { prisma } = require("../config/prisma");

exports.createConversation = async (req, res) => {
  const { participantId } = req.body;
  const myId = req.user.id;

  if (!participantId)
    return res.status(400).json({ message: "Participant required" });

  try {
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: myId } } },
          { participants: { some: { id: participantId } } },
        ],
      },
      include: {
        participants: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    if (existingConversation) {
      return res.json(existingConversation);
    }

    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: myId }, { id: participantId }],
        },
      },
      include: {
        participants: {
          select: { id: true, username: true, avatarUrl: true },
        },
      },
    });

    res.status(201).json(newConversation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyConversations = async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: req.user.id },
        },
      },
      include: {
        participants: {
          select: { id: true, username: true, avatarUrl: true },
        },

        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
