const { prisma } = require("../config/prisma");
const {
  hashPassword,
  verifyPassword,
  generateToken,
} = require("../config/auth");

const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    const avatarUrl = req.file ? req.file.path : null;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Username, email, and password are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        error: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "User with this email or username already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        avatarUrl: avatarUrl || null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        avatarUrl: true,
      },
    });
    const token = generateToken(user);

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      error: "Registration failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      error: "Failed to fetch user",
    });
  }
};

const logout = (req, res) => {
  res.json({
    message: "Logout successful. Please delete the token on the client side.",
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  logout,
};
