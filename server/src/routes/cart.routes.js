import { Router } from 'express';
import { getCart, saveCart, updateCart, clearCart } from '../controllers/cart.controller.js';

const router = Router();

// GET current cart
router.get('/cart/:userId', getCart);

// PUT replace/save entire cart
router.put('/cart/:userId', saveCart);

// PATCH update quantities/items (merge)
router.patch('/cart/:userId', updateCart);

// DELETE clear cart
router.delete('/cart/:userId', clearCart);

export default router;