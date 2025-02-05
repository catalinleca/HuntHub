import express from 'express';
import { TYPES } from '@/types';
import { container } from '@/config/inversify';
import { IStepController } from '@/controllers/step.controller';
import { validationMiddleware } from '@/middlewares/validation.middleware';
import { strictStepCreateSchema } from '@/utils/validation/schemas/step.schema';

const stepRouter = express.Router();
const controller = container.get<IStepController>(TYPES.StepController);

stepRouter.post('/', validationMiddleware(strictStepCreateSchema), (req, res, next) => {
  controller.createStep(req, res).catch(next);
});

// stepRouter.get('/', (req, res, next) => {
//   controller.getAllSteps(req, res).catch(next);
// });
//
// stepRouter.get('/:id', (req, res, next) => {
//   controller.getStepById(req, res).catch(next);
// });

export default stepRouter;
