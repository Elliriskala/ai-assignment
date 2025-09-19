import express from 'express';
import {body} from 'express-validator';
import {validate} from '../../middlewares';
import {generateImage, createImageVariation, editImage} from '../controllers/imageController';

const router = express.Router();

// Route for generating new thumbnails
router.route('/generate').post(
  [
    body('prompt').notEmpty().isString().escape(),
    body('size').optional().isString().escape(),
    body('style').optional().isString().escape()
  ],
  validate,
  generateImage
);

// Routes for image variations and edits can be implemented later
router.route('/variations').post(
  // Validation would go here when implemented
  createImageVariation
);

router.route('/edits').post(
  // Validation would go here when implemented
  editImage
);

export default router;