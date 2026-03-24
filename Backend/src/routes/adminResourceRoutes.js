import express from 'express';
import {
  getPendingResources,
  approveResource,
  rejectResource,
  getAllResourcesAdmin,
  getResourceStats,
} from '../controllers/adminResourceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All admin resource routes are protected by protect + adminOnly
router.use(protect, adminOnly);

router.get('/stats',   getResourceStats);      // GET /api/admin/resources/stats
router.get('/pending', getPendingResources);   // GET /api/admin/resources/pending
router.get('/',        getAllResourcesAdmin);   // GET /api/admin/resources

router.put('/:id/approve', approveResource);   // PUT /api/admin/resources/:id/approve
router.put('/:id/reject',  rejectResource);    // PUT /api/admin/resources/:id/reject

export default router;
