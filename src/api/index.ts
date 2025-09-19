import express from 'express';
import path from 'path';

import commentRoute from './routes/commentRoute';
import imageRoute from './routes/imageRoute';

import {MessageResponse} from '../types/MessageTypes';

const router = express.Router();

router.get<{}, MessageResponse>('/', (_req, res) => {
  res.json({
    message: 'routes: comments, images',
  });
});

router.use('/comments', commentRoute);
router.use('/images', imageRoute);

// Serve static files from uploads directory
router.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

export default router;
