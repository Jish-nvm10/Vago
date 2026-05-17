const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const usersFile = path.join(__dirname, "../data/users.json");

// Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  let users = JSON.parse(fs.readFileSync(usersFile));

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashedPassword
  };

  users.push(newUser);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  res.json({ message: "User registered successfully" });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  let users = JSON.parse(fs.readFileSync(usersFile));
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
});

module.exports = router;