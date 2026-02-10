const { prisma } = require("../config/prisma");
const { hashPassword } = require("../config/auth");

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        posts: {
          select: {
            id: true,
          },
        },
        comments: {
          select: {
            id: true,
          },
        },
        likes: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      ...user,
      stats: {
        postsCount: user.posts.length,
        commentsCount: user.comments.length,
        likesCount: user.likes.length,
      },
      posts: undefined,
      comments: undefined,
      likes: undefined,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      error: "Failed to fetch user",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: search,
          mode: "insensitive",
        },
      },
      skip,
      take: limit,
      select: {
        id: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
        posts: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.user.count({
      where: {
        username: {
          contains: search,
          mode: "insensitive",
        },
      },
    });

    const usersWithStats = users.map((user) => ({
      ...user,
      postsCount: user.posts.length,
      posts: undefined,
    }));

    res.json({
      users: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      error: "Failed to fetch users",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, bio, avatarUrl, email } = req.body;
    const userId = req.user.id;

    if (id !== userId) {
      return res.status(403).json({
        error: "You are not authorized to update this user",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const updateData = {};

    if (username) {
      const existingUsername = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id },
        },
      });

      if (existingUsername) {
        return res.status(409).json({
          error: "Username already taken",
        });
      }

      updateData.username = username;
    }

    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id },
        },
      });

      if (existingEmail) {
        return res.status(409).json({
          error: "Email already in use",
        });
      }

      updateData.email = email;
    }

    if (bio !== undefined) {
      updateData.bio = bio;
    }

    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      error: "Failed to update user",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (id !== userId) {
      return res.status(403).json({
        error: "You are not authorized to delete this user",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    await prisma.user.delete({
      where: { id },
    });

    res.json({
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      error: "Failed to delete user",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const postsCount = await prisma.post.count({
      where: { authorId: id },
    });

    const commentsCount = await prisma.comment.count({
      where: { authorId: id },
    });

    const likesCount = await prisma.like.count({
      where: { userId: id },
    });

    res.json({
      userId: id,
      username: user.username,
      stats: {
        posts: postsCount,
        comments: commentsCount,
        likes: likesCount,
      },
    });
  } catch (error) {
    console.error("Get user stats error:", error);
    res.status(500).json({
      error: "Failed to fetch user stats",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (id !== userId) {
      return res.status(403).json({
        error: "You are not authorized to change this password",
      });
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        error: "Current password, new password, and confirmation are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const { verifyPassword } = require("../config/auth");
    const isPasswordValid = await verifyPassword(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Current password is incorrect",
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      error: "Failed to change password",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  getUserById,
  getAllUsers,
  updateUserProfile,
  deleteUser,
  getUserStats,
  changePassword,
};
