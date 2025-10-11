import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Product from "../models/Product.js";
import {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  requireAdmin,
  // Users
  listUsers,
  getUser,
  updateUser,
  toggleUserStatus,
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
  // Questions
  listQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  seedDass21Questions,
  // Therapists
  listPendingTherapists,
  approveTherapist,
} from "../controllers/admin.controller.js";

const router = express.Router();

/* ------------------------------- AUTH ------------------------------- */
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);

/* ------------------------------- USERS ------------------------------ */
router.get("/users", requireAdmin, listUsers);
router.get("/users/:id", requireAdmin, getUser);
router.put("/users/:id", requireAdmin, updateUser);
router.patch("/users/:id/toggle-status", requireAdmin, toggleUserStatus);

// ✅ Pending therapists
router.get("/therapists/pending", requireAdmin, listPendingTherapists);

// ✅ Approve therapist
router.patch("/therapists/:id/approve", requireAdmin, approveTherapist);

/* ----------------------------- PRODUCTS ----------------------------- */
router.get("/products", requireAdmin, listProducts);
router.get("/products/:id", requireAdmin, getProduct);
router.post("/products", requireAdmin, createProduct);
router.put("/products/:id", requireAdmin, updateProduct);
router.delete("/products/:id", requireAdmin, deleteProduct);

// ✅ Update product stock directly
router.put("/products/:id/stock", requireAdmin, async (req, res) => {
  try {
    const { stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock },
      { new: true }
    );
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ------------------------------- POSTS ------------------------------ */
router.get("/posts", requireAdmin, listPosts);
router.get("/posts/:id", requireAdmin, getPost);
router.post("/posts", requireAdmin, createPost);
router.put("/posts/:id", requireAdmin, updatePost);
router.delete("/posts/:id", requireAdmin, deletePost);
router.post("/posts/:id/approve", requireAdmin, approvePost);
router.post("/posts/:id/reject", requireAdmin, rejectPost);

/* ------------------------------ MESSAGES ---------------------------- */
router.get("/messages", requireAdmin, listMessages);
router.delete("/messages/:id", requireAdmin, deleteMessage);

/* ----------------------------- QUESTIONS ---------------------------- */
router.get("/questions", requireAdmin, listQuestions);
router.post("/questions", requireAdmin, createQuestion);
router.put("/questions/:id", requireAdmin, updateQuestion);
router.delete("/questions/:id", requireAdmin, deleteQuestion);
router.post("/questions/seed-dass21", requireAdmin, seedDass21Questions);

/* -------------------------- ADD THERAPIST --------------------------- */
router.post("/add-therapist", requireAdmin, async (req, res) => {
  try {
    const { name, email, password, age, license } = req.body;

    if (!name || !email || !password || !age) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if therapist already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Therapist already exists" });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new therapist (pre-approved when added by admin)
    const therapist = new User({
      name,
      email,
      passwordHash,
      age,
      license: license || "", // Add license field
      userType: "therapist",
      isApproved: true, // Pre-approved when added by admin
      isActive: true,
    });

    await therapist.save();
    res.json({ success: true, therapist });
  } catch (err) {
    console.error("Error creating therapist:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;