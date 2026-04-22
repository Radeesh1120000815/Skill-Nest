import express from 'express';
import {
  getResources,
  getResourceById,
  createResource,
  uploadNewVersion,
  updateResource,
  deleteResource,
  downloadResource,
  getMyUploads,
} from '../controllers/resourceController.js';
import { upsertRating, deleteRating, getResourceRatings } from '../controllers/ratingController.js';
import { addBookmark, removeBookmark } from '../controllers/bookmarkController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { authenticatedUser } from '../middleware/roleMiddleware.js';
import { upload } from '../config/cloudinaryConfig.js';

const router = express.Router();

//  Public routes (optionalAuth adds personalized data when logged in) 
router.get('/',    optionalAuth, getResources);
router.get('/:id', optionalAuth, getResourceById);
router.get('/:id/ratings', getResourceRatings);

//Auth-required: must fetch own uploads before /:id to avoid route conflict
router.get('/my/uploads', protect, authenticatedUser, getMyUploads);

//Authenticated: upload new resource
router.post(
  '/',
  protect,
  authenticatedUser,
  upload.single('file'),   // 'file' = form-data field name
  createResource
);

//Owner or Admin: upload new version
router.post(
  '/:id/versions',
  protect,
  authenticatedUser,
  upload.single('file'),
  uploadNewVersion
);

//Owner or Admin: update metadata
router.put('/:id', protect, authenticatedUser, updateResource);

//Owner or Admin: delete resource
router.delete('/:id', protect, authenticatedUser, deleteResource);


//Authenticated: download (increments count)
router.post('/:id/download', protect, authenticatedUser, downloadResource);

//Authenticated: rate / update rating
router.post('/:id/ratings', protect, authenticatedUser, upsertRating);

//Rating owner or Admin: delete rating
router.delete('/ratings/:id', protect, authenticatedUser, deleteRating);

//Authenticated: bookmark with intent
router.post('/:id/bookmark',   protect, authenticatedUser, addBookmark);
router.delete('/:id/bookmark', protect, authenticatedUser, removeBookmark);

export default router;


