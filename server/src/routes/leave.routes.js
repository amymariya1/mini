import express from "express";
import { createLeave, getLeaves, getLeaveById, updateLeave, deleteLeave } from "../controllers/leave.controller.js";

const router = express.Router();

// Create a new leave
router.post("/", createLeave);

// Get leaves for a therapist
router.get("/", getLeaves);

// Get leave by ID
router.get("/:id", getLeaveById);

// Update leave
router.put("/:id", updateLeave);

// Delete leave
router.delete("/:id", deleteLeave);

export default router;