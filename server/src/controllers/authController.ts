import { FastifyReply, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { ROLES } from '../constants/roles.js';
import { User } from '../models/UserModel.js';

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  if (!secret || secret.trim() === '') {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
};

export const register = async (req: FastifyRequest, reply: FastifyReply) => {
  const { email, password, role } = req.body as { email: string; password: string; role?: string };

  if (!email || !password) {
    return reply.status(400).send({ error: 'Email and password are required' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return reply.status(409).send({ error: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const assignedRole = role === ROLES.THERAPIST ? ROLES.THERAPIST : ROLES.PATIENT;

  const newUser = await User.create({
    email,
    passwordHash,
    role: assignedRole,
  });

  return reply.status(201).send({
    message: 'User registered successfully',
    user: {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
    },
  });
};

export const login = async (req: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email || !password) {
    return reply.status(400).send({ error: 'Email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return reply.status(401).send({ error: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return reply.status(401).send({ error: 'Invalid credentials' });
  }

  try {
    const token = jwt.sign(
      { id: user._id, role: user.role },
      getJwtSecret(),
      { expiresIn: '1h' }
    );

    return reply.send({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error: any) {
    return reply.status(500).send({ error: error.message || 'Failed to generate token' });
  }
};