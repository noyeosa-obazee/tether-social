const { prisma } = require("../config/prisma");
const { hashPassword } = require("../config/auth");

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

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
            content: true,
            imageUrl: true,
            createdAt: true,
            authorId: true,
            author: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
            comments: {
              select: {
                id: true,
                content: true,
                createdAt: true,
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
                id: true,
                userId: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const followersCount = await prisma.follow.count({
      where: { followingId: id },
    });

    const followingCount = await prisma.follow.count({
      where: { followerId: id },
    });

    let isFollowing = false;
    if (currentUserId && currentUserId !== id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: id,
          },
        },
      });
      isFollowing = !!follow;
    }

    res.json({
      ...user,
      stats: {
        postsCount: user.posts.length,
        followersCount,
        followingCount,
      },
      isFollowing,
      posts: user.posts,
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

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        let followersCount = 0;
        try {
          followersCount = await prisma.follow.count({
            where: { followingId: user.id },
          });
        } catch (err) {
          console.error(
            `Failed to fetch followers for user ${user.id}:`,
            err.message || err,
          );
          // fallback to 0 followers on DB/auth errors so search still returns results
          followersCount = 0;
        }

        return {
          ...user,
          postsCount: user.posts.length,
          followersCount,
          posts: undefined,
        };
      }),
    );

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

const followUser = async (req, res) => {
  try {
    const { id } = req.params;
    const followerId = req.user.id;

    if (id === followerId) {
      return res.status(400).json({
        error: "You cannot follow yourself",
      });
    }

    const userExists = await prisma.user.findUnique({
      where: { id },
    });

    if (!userExists) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: id,
        },
      },
    });

    if (existingFollow) {
      return res.status(400).json({
        error: "You are already following this user",
      });
    }

    await prisma.follow.create({
      data: {
        followerId,
        followingId: id,
      },
    });

    res.status(201).json({
      message: "Successfully followed user",
    });
  } catch (error) {
    console.error("Follow user error:", error);
    res.status(500).json({
      error: "Failed to follow user",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const followerId = req.user.id;

    if (id === followerId) {
      return res.status(400).json({
        error: "You cannot unfollow yourself",
      });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: id,
        },
      },
    });

    if (!existingFollow) {
      return res.status(400).json({
        error: "You are not following this user",
      });
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId: id,
        },
      },
    });

    res.json({
      message: "Successfully unfollowed user",
    });
  } catch (error) {
    console.error("Unfollow user error:", error);
    res.status(500).json({
      error: "Failed to unfollow user",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const followers = await prisma.follow.findMany({
      where: { followingId: id },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.follow.count({
      where: { followingId: id },
    });

    res.json({
      followers: followers.map((f) => f.follower),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get followers error:", error);
    res.status(500).json({
      error: "Failed to fetch followers",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const following = await prisma.follow.findMany({
      where: { followerId: id },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.follow.count({
      where: { followerId: id },
    });

    res.json({
      following: following.map((f) => f.following),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get following error:", error);
    res.status(500).json({
      error: "Failed to fetch following",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const isFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const followerId = req.user.id;

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: id,
        },
      },
    });

    res.json({
      isFollowing: !!follow,
    });
  } catch (error) {
    console.error("Check is following error:", error);
    res.status(500).json({
      error: "Failed to check follow status",
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
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  isFollowing,
};
