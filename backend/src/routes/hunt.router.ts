import express from 'express';
import { TYPES } from '@/types';
import { container } from '@/config/inversify';
import { IHuntController } from '@/controllers/hunt.controller';

const huntRouter = express.Router();
const controller = container.get<IHuntController>(TYPES.HuntController);

huntRouter.post('/', (req, res) => {
  controller.createHunt(req, res);
});

export default huntRouter;
