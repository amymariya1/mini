import bcrypt from 'bcryptjs';
import { findByEmail, createUser } from '../utils/userStore.js';

export async function register(req, res) {
  try {
    const { name, email, password, age } = req.body;
    if (!name || !email || !password || age === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const ageNum = Number(age);
    if (Number.isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      return res.status(400).json({ message: 'Invalid age' });
    }

    const existing = await findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await createUser({ name, email, passwordHash, age: ageNum });
    return res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, age: user.age },
      message: 'Registered successfully'
    });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Include age in response
    return res.json({ user: { id: user._id, name: user.name, email: user.email, age: user.age } });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}