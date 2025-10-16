import { Router } from 'express';
import { getProductReviews, addProductReview, deleteProductReview } from '../controllers/reviews.controller.js';

const router = Router();

// GET /api/reviews/product/:productId - Get all reviews for a product
router.get('/product/:productId', getProductReviews);

// POST /api/reviews/product/:productId - Add a review for a product
router.post('/product/:productId', addProductReview);

// DELETE /api/reviews/:reviewId - Delete a review
router.delete('/:reviewId', deleteProductReview);

export default router;