import express from 'express';
import { createHunt } from '../controllers/huntController';

const router = express.Router();

// Hunt routes
router.post('/hunts', createHunt);
router.get('/hunts', getHunts);
router.get('/hunts/:id', getHuntById);
router.put('/hunts/:id', updateHunt);
router.delete('/hunts/:id', deleteHunt);

export default router;
