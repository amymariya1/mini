import express from "express";
import { requireAdmin, listPendingTherapists, approveTherapist } from "../controllers/admin.controller.js";

const router = express.Router();

// 🔐 Admin-only routes for therapist management
router.get("/pending", requireAdmin, listPendingTherapists);
router.post("/:id/approve", requireAdmin, approveTherapist);

export default router;