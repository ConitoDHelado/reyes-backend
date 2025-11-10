import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Example in-memory data (temporary)
let users = [];
let gifts = [];

// Routes
app.get("/users", (req, res) => {
  res.json(users);
});

app.post("/users/register", (req, res) => {
  const { username, password } = req.body;
  const id = users.length + 1;
  const user = { id, username, password };
  users.push(user);
  res.json(user);
});

app.get("/gifts/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const userGifts = gifts.filter(g => g.userId === userId);
  res.json(userGifts);
});

app.post("/gifts", (req, res) => {
  const { name, userId } = req.body;
  const id = gifts.length + 1;
  const gift = { id, name, userId };
  gifts.push(gift);
  res.json(gift);
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
