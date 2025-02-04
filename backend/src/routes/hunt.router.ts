import express from 'express';
import { TYPES } from '@/types';
import { container } from '@/config/inversify';
import { IHuntController } from '@/controllers/hunt.controller';

const huntRouter = express.Router();
const controller = container.get<IHuntController>(TYPES.HuntController);

huntRouter.post('/', (req, res) => {
  controller.createHunt(req, res);
});

huntRouter.get('/', (req, res) => {
  controller.getAllHunts(req, res);
});

huntRouter.get('/:id', (req, res) => {
  controller.getHuntById(req, res);
});

export default huntRouter;
