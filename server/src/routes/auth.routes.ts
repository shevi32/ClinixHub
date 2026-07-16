import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

// In-memory users store for local development only
const users: any[] = [];

// Seed a test user for local development
const seedHash = bcrypt.hashSync("P@ssw0rd123", 10);
users.push({ id: "seed-1", email: "test.user@example.com", passwordHash: seedHash, role: ROLES.PATIENT });

const mapRoleToClientRole = (role: string) => {
  if (role === ROLES.THERAPIST || role === 'Admin') return "Admin";
  return "User";
};

const mapClientRoleToServerRole = (clientRole: string) => {
  return clientRole === 'Admin' || clientRole === ROLES.THERAPIST
    ? ROLES.THERAPIST
    : ROLES.PATIENT;
};

router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body as { email: string; password: string; role?: string };
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const existing = users.find((u) => u.email === email);
    if (existing) return res.status(409).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = mapClientRoleToServerRole(role || 'User');
    const clientRole = mapRoleToClientRole(assignedRole);

    const newUser = { id: Date.now().toString(), email, passwordHash, role: assignedRole };
    users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, role: clientRole }, 
      process.env.JWT_SECRET || "dev-secret", 
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: newUser.id, email: newUser.email, role: clientRole },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const user = users.find((u) => u.email === email);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const clientRole = mapRoleToClientRole(user.role);
    const token = jwt.sign(
      { id: user.id, role: clientRole }, 
      process.env.JWT_SECRET || "dev-secret", 
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, role: clientRole },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;
