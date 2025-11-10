import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: { gifts: true } // optional: include their gifts
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register new user
app.post("/users/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.create({
      data: { username, password }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get gifts for user
app.get("/gifts/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  try {
    const gifts = await prisma.gift.findMany({
      where: { userId }
    });
    res.json(gifts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add gift
app.post("/gifts", async (req, res) => {
  const { name, price, desc, url, userId } = req.body;
  try {
    const gift = await prisma.gift.create({
      data: { name, price, desc, url, userId }
    });
    res.json(gift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark gift as bought
app.put("/gifts/:id", async (req, res) => {
  const giftId = parseInt(req.params.id);
  const { bought } = req.body;
  try {
    const gift = await prisma.gift.update({
      where: { id: giftId },
      data: { bought }
    });
    res.json(gift);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
