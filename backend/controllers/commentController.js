const { prisma } = require("../config/prisma");

const createComment = async (req, res) => {
  try {
    const { content, postId } = req.body;
    const authorId = req.user.id;

    if (!content || !postId) {
      return res.status(400).json({
        error: "Content and post ID are required",
      });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId,
        postId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({
      error: "Failed to create comment",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    const total = await prisma.comment.count({
      where: { postId },
    });

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      error: "Failed to fetch comments",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!comment) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    res.json(comment);
  } catch (error) {
    console.error("Get comment error:", error);
    res.status(500).json({
      error: "Failed to fetch comment",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content) {
      return res.status(400).json({
        error: "Content is required",
      });
    }

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    if (comment.authorId !== userId) {
      return res.status(403).json({
        error: "You are not authorized to update this comment",
      });
    }

    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { content },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json({
      message: "Comment updated successfully",
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Update comment error:", error);
    res.status(500).json({
      error: "Failed to update comment",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      return res.status(404).json({
        error: "Comment not found",
      });
    }

    if (comment.authorId !== userId) {
      return res.status(403).json({
        error: "You are not authorized to delete this comment",
      });
    }

    await prisma.comment.delete({
      where: { id },
    });

    res.json({
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      error: "Failed to delete comment",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createComment,
  getPostComments,
  getCommentById,
  updateComment,
  deleteComment,
};
