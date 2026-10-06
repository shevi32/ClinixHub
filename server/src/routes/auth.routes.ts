import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ROLES } from "../constants/roles.js";
import { User } from "../models/UserModel.js";
import { Patient } from "../models/patient.model.js";
import { getJwtSecret } from "../config/jwt.js";

const router = express.Router();

const mapRoleToClientRole = (role: string) => {
  if (role === ROLES.THERAPIST || role === 'Admin') return "Admin";
  return "User";
};

router.post("/register", async (req, res) => {
  let createdUserId: string | undefined;
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const normalizedEmail = email.trim().toLowerCase();
    const existingPatient = await Patient.findOne({ email: normalizedEmail });
    if (existingPatient?.userId) {
      return res.status(409).json({ message: "Patient email is already linked to an account" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      ...(existingPatient ? { _id: existingPatient._id } : {}),
      email: normalizedEmail,
      passwordHash,
      role: ROLES.PATIENT,
    });
    createdUserId = String(newUser._id);

    if (existingPatient) {
      existingPatient.userId = createdUserId;
      await existingPatient.save();
    } else {
      await Patient.create({
        _id: newUser._id,
        userId: createdUserId,
        name: normalizedEmail.split("@")[0] || normalizedEmail,
        email: normalizedEmail,
      });
    }

    const clientRole = mapRoleToClientRole(newUser.role);

    const token = jwt.sign(
      { id: String(newUser._id), role: clientRole },
      getJwtSecret(),
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: String(newUser._id), email: newUser.email, role: clientRole },
    });
  } catch (err: any) {
    if (createdUserId) {
      await User.deleteOne({ _id: createdUserId }).catch(() => undefined);
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: "User already exists" });
    }
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const clientRole = mapRoleToClientRole(user.role);
    const token = jwt.sign(
      { id: String(user._id), role: clientRole },
      getJwtSecret(),
      { expiresIn: "1h" }
    );

    return res.json({
      token,
      user: { id: String(user._id), email: user.email, role: clientRole },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
});

export default router;
