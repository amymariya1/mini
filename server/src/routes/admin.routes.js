import { Router } from 'express';
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  requireAdmin,
  // Users
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  // Products
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  // Posts
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  approvePost,
  rejectPost,
  // Messages
  listMessages,
  deleteMessage,
  // Questions (Mind Check)
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../controllers/admin.controller.js';

const router = Router();

// Auth
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);

// Users
router.get('/users', requireAdmin, listUsers);
router.get('/users/:id', requireAdmin, getUser);
router.put('/users/:id', requireAdmin, updateUser);
router.delete('/users/:id', requireAdmin, deleteUser);

// Products
router.get('/products', requireAdmin, listProducts);
router.get('/products/:id', requireAdmin, getProduct);
router.post('/products', requireAdmin, createProduct);
router.put('/products/:id', requireAdmin, updateProduct);
router.delete('/products/:id', requireAdmin, deleteProduct);

// Posts
router.get('/posts', requireAdmin, listPosts);
router.get('/posts/:id', requireAdmin, getPost);
router.post('/posts', requireAdmin, createPost);
router.put('/posts/:id', requireAdmin, updatePost);
router.delete('/posts/:id', requireAdmin, deletePost);
router.post('/posts/:id/approve', requireAdmin, approvePost);
router.post('/posts/:id/reject', requireAdmin, rejectPost);

// Messages
router.get('/messages', requireAdmin, listMessages);
router.delete('/messages/:id', requireAdmin, deleteMessage);

// Questions (Mind Check)
router.get('/questions', requireAdmin, listQuestions);
router.post('/questions', requireAdmin, createQuestion);
router.put('/questions/:id', requireAdmin, updateQuestion);
router.delete('/questions/:id', requireAdmin, deleteQuestion);

export default router;
