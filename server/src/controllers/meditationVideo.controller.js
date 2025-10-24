import MeditationVideo from '../models/MeditationVideo.js';

// Get all active meditation videos
export async function getAllVideos(req, res) {
  try {
    const { category, difficulty, featured, limit = 20, page = 1 } = req.query;
    
    const filter = { isActive: true };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }
    
    if (featured === 'true') {
      filter.featured = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const videos = await MeditationVideo.find(filter)
      .populate('uploadedBy', 'name email')
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalVideos = await MeditationVideo.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalVideos / parseInt(limit)),
        totalVideos,
        hasNext: skip + videos.length < totalVideos,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error fetching meditation videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meditation videos'
    });
  }
}

// Get single meditation video by ID
export async function getVideoById(req, res) {
  try {
    const { id } = req.params;
    
    const video = await MeditationVideo.findById(id)
      .populate('uploadedBy', 'name email')
      .populate('likes', 'name');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Meditation video not found'
      });
    }

    // Increment view count
    video.viewCount += 1;
    await video.save();

    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error fetching meditation video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch meditation video'
    });
  }
}

// Create new meditation video (Admin only)
export async function createVideo(req, res) {
  try {
    const {
      title,
      description,
      videoUrl,
      thumbnailUrl,
      duration,
      category,
      difficulty,
      tags,
      featured
    } = req.body;

    const video = new MeditationVideo({
      title,
      description,
      videoUrl,
      thumbnailUrl: thumbnailUrl || '',
      duration: parseInt(duration),
      category: category || 'meditation',
      difficulty: difficulty || 'beginner',
      tags: tags || [],
      uploadedBy: req.user._id,
      featured: featured === 'true' || featured === true
    });

    await video.save();
    await video.populate('uploadedBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Meditation video uploaded successfully',
      data: video
    });
  } catch (error) {
    console.error('Error creating meditation video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload meditation video'
    });
  }
}

// Update meditation video (Admin only)
export async function updateVideo(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const video = await MeditationVideo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'name email');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Meditation video not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Meditation video updated successfully',
      data: video
    });
  } catch (error) {
    console.error('Error updating meditation video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update meditation video'
    });
  }
}

// Delete meditation video (Admin only)
export async function deleteVideo(req, res) {
  try {
    const { id } = req.params;

    const video = await MeditationVideo.findByIdAndDelete(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Meditation video not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Meditation video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meditation video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete meditation video'
    });
  }
}

// Like/unlike meditation video
export async function toggleLike(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const video = await MeditationVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Meditation video not found'
      });
    }

    const isLiked = video.likes.includes(userId);

    if (isLiked) {
      video.likes.pull(userId);
    } else {
      video.likes.push(userId);
    }

    await video.save();

    res.status(200).json({
      success: true,
      message: isLiked ? 'Video unliked' : 'Video liked',
      data: {
        isLiked: !isLiked,
        likeCount: video.likes.length
      }
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    });
  }
}

// Get video categories
export async function getCategories(req, res) {
  try {
    const categories = await MeditationVideo.distinct('category', { isActive: true });
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
}

