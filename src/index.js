import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import userRouter from "./routes/users.js";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: ["http://127.0.0.1:5500", "https://conitodhelado.github.io"] // your frontend URLs
}));
app.use(express.json());

app.use("/users", userRouter); // mount the users router

// --- USERS ---

// Register
app.post("/users/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    res.json({ message: "User registered successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post("/users/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { gifts: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- GIFTS ---

// Get gifts for a user
app.get("/gifts/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const gifts = await prisma.gift.findMany({ where: { userId } });
    res.json(gifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a gift
app.post("/gifts", async (req, res) => {
  const { name, price, desc, url, userId } = req.body;
  try {
    const gift = await prisma.gift.create({
      data: { name, price, desc, url, userId },
    });
    res.json(gift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a gift
app.put("/gifts/:id", async (req, res) => {
  const giftId = parseInt(req.params.id);
  const { name, price, desc, url, bought } = req.body;

  try {
    const gift = await prisma.gift.update({
      where: { id: giftId },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price }),
        ...(desc !== undefined && { desc }),
        ...(url !== undefined && { url }),
        ...(bought !== undefined && { bought }),
      },
    });
    res.json(gift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a gift
app.delete("/gifts/:id", async (req, res) => {
  const giftId = parseInt(req.params.id);

  try {
    const gift = await prisma.gift.delete({ where: { id: giftId } });
    res.json({ message: "Gift deleted", gift });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
