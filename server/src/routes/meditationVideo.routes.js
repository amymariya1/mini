import express from 'express';
import {
  getAllVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleLike,
  getCategories
} from '../controllers/meditationVideo.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllVideos);
router.get('/categories', getCategories);
router.get('/:id', getVideoById);
router.post('/:id/like', protect, toggleLike);

// Admin only routes
router.use(protect, restrictTo('admin'));
router.post('/', createVideo);
router.put('/:id', updateVideo);
router.delete('/:id', deleteVideo);

export default router;

