import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Product from '../models/Product.js';

// Get all reviews for a product
export async function getProductReviews(req, res) {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    const reviews = await Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const count = await Review.countDocuments({ product: productId });
    
    return res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (err) {
    console.error('getProductReviews error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Add a review for a product
export async function addProductReview(req, res) {
  try {
    const { productId } = req.params;
    const { rating, title, comment } = req.body;
    const userId = req.user?.id; // Assuming user is attached to req by auth middleware
    
    // Validate inputs
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    if (!title || !comment) {
      return res.status(400).json({ message: 'Title and comment are required' });
    }
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }
    
    // Create review
    const review = new Review({
      product: productId,
      user: userId,
      rating,
      title,
      comment,
      verified: true, // In a real app, this would be based on purchase history
    });
    
    const savedReview = await review.save();
    
    // Update product rating
    await updateProductRating(productId);
    
    // Populate user info
    await savedReview.populate('user', 'name');
    
    return res.status(201).json({ review: savedReview });
  } catch (err) {
    console.error('addProductReview error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Update product rating based on reviews
async function updateProductRating(productId) {
  try {
    const reviews = await Review.find({ product: productId });
    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, { rating: 0, reviews: 0 });
      return;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    await Product.findByIdAndUpdate(productId, {
      rating: averageRating,
      reviews: reviews.length,
    });
  } catch (err) {
    console.error('updateProductRating error', err);
  }
}

// Delete a review
export async function deleteProductReview(req, res) {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;
    
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: 'Invalid review ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user owns this review or is admin
    if (review.user.toString() !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }
    
    await Review.findByIdAndDelete(reviewId);
    
    // Update product rating
    await updateProductRating(review.product);
    
    return res.json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('deleteProductReview error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}