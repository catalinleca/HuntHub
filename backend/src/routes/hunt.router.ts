import express from 'express';
import { TYPES } from '@/types';
import { container } from '@/config/inversify';
import { HuntController } from '@/controllers/hunt.controller';

const huntRouter = express.Router();
const controller = container.get<HuntController>(TYPES.HuntController);

huntRouter.post('/', (req, res) => {
  controller.createHunt(req, res);
});

export default huntRouter;
