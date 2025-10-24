import express from "express";
import { register, login, forgotPassword, resetPassword, forgotPasswordAuto } from "../controllers/auth.controller.js"; // Import controller functions

const router = express.Router();

// 🔹 REGISTER USER
router.post("/register", register);

// 🔹 REGISTER THERAPIST (force userType)
router.post("/register-therapist", (req, res) => {
  try {
    req.body = { ...(req.body || {}), userType: 'therapist' };
  } catch (_) {}
  return register(req, res);
});

// 🔹 LOGIN (supports userType)
router.post("/login", login);

// 🔹 FORGOT PASSWORD - Use controller function
router.post("/forgot-password", forgotPassword);

// 🔹 FORGOT PASSWORD AUTO - Use controller function (new endpoint)
router.post("/forgot-password-auto", forgotPasswordAuto);

// 🔹 RESET PASSWORD - Use controller function
router.post("/reset-password", resetPassword);

export default router;