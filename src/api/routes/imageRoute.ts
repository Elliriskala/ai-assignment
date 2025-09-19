import express from 'express';
import {body} from 'express-validator';
import {validate} from '../../middlewares';
import {generateImage} from '../controllers/imageController';

const router = express.Router();

// Route for generating new thumbnails
router
  .route('/generate')
  .post(
    [
      body('prompt').notEmpty().isString().escape(),
      body('size').optional().isString().escape(),
      body('style').optional().isString().escape(),
    ],
    validate,
    generateImage
  );

export default router;
