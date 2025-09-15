import { Router } from 'express';
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  requireAdmin,
  listUsers,
  getUser,
  updateUser,
  deleteUser
} from '../controllers/admin.controller.js';

const router = Router();

// Auth
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);

// Protected routes
router.get('/users', requireAdmin, listUsers);
router.get('/users/:id', requireAdmin, getUser);
router.put('/users/:id', requireAdmin, updateUser);
router.delete('/users/:id', requireAdmin, deleteUser);

export default router;