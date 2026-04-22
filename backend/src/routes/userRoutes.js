import express from "express";
const router = express.Router();

import {
  getUserProfile,
  updateUserProfile,
  deleteUser,
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";

// GET profile
router.get("/profile", protect, getUserProfile);

// UPDATE profile
router.put("/profile", protect, updateUserProfile);

// DELETE account
router.delete("/:id", protect, deleteUser);

export default router;