const { prisma } = require("../config/prisma");

const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    if (!postId) {
      return res.status(400).json({
        error: "Post ID is required",
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

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike) {
      return res.status(409).json({
        error: "You already liked this post",
      });
    }

    const like = await prisma.like.create({
      data: {
        userId,
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Post liked successfully",
      like,
    });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({
      error: "Failed to like post",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const unlikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    if (!postId) {
      return res.status(400).json({
        error: "Post ID is required",
      });
    }

    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (!like) {
      return res.status(404).json({
        error: "You have not liked this post",
      });
    }

    await prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    res.json({
      message: "Post unliked successfully",
    });
  } catch (error) {
    console.error("Unlike post error:", error);
    res.status(500).json({
      error: "Failed to unlike post",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getPostLikes = async (req, res) => {
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

    const likes = await prisma.like.findMany({
      where: { postId },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    const total = await prisma.like.count({
      where: { postId },
    });

    res.json({
      likes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get post likes error:", error);
    res.status(500).json({
      error: "Failed to fetch likes",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const checkIfLiked = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const like = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    res.json({
      postId,
      liked: !!like,
    });
  } catch (error) {
    console.error("Check like error:", error);
    res.status(500).json({
      error: "Failed to check like status",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  likePost,
  unlikePost,
  getPostLikes,
  checkIfLiked,
};
