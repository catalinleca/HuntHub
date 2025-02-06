import express from 'express';
import { TYPES } from '@/types';
import { container } from '@/config/inversify';
import { IHuntController } from '@/controllers/hunt.controller';

const huntRouter = express.Router({ mergeParams: true });
const controller = container.get<IHuntController>(TYPES.HuntController);

huntRouter.post('/', (req, res, next) => {
  controller.createHunt(req, res).catch(next);
});

huntRouter.get('/', (req, res, next) => {
  controller.getAllUserHunts(req, res).catch(next);
});

huntRouter.get('/:id', (req, res, next) => {
  controller.getUserHuntById(req, res).catch(next);
});

export default huntRouter;
