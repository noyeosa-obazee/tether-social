const { prisma } = require("../config/prisma");

const createPost = async (req, res) => {
  try {
    const { content, imageUrl } = req.body;
    const authorId = req.user.id;

    if (!content && !imageUrl) {
      return res.status(400).json({
        error: "Post must have either content or an image",
      });
    }

    const post = await prisma.post.create({
      data: {
        content: content || null,
        imageUrl: imageUrl || null,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        comments: true,
        likes: true,
      },
    });

    res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      error: "Failed to create post",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
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
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    });

    const total = await prisma.post.count();

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all posts error:", error);
    res.status(500).json({
      error: "Failed to fetch posts",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    res.json(post);
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({
      error: "Failed to fetch post",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
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
        comments: true,
        likes: true,
      },
    });

    const total = await prisma.post.count({
      where: { authorId: userId },
    });

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({
      error: "Failed to fetch user posts",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, imageUrl } = req.body;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({
        error: "You are not authorized to update this post",
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        content: content !== undefined ? content : post.content,
        imageUrl: imageUrl !== undefined ? imageUrl : post.imageUrl,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        comments: true,
        likes: true,
      },
    });

    res.json({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({
      error: "Failed to update post",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return res.status(404).json({
        error: "Post not found",
      });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({
        error: "You are not authorized to delete this post",
      });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.json({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({
      error: "Failed to delete post",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getUserPosts,
  updatePost,
  deletePost,
};
