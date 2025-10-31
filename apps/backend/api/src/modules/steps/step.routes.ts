import express from 'express';
import { TYPES } from '@/shared/types';
import { container } from '@/config/inversify';
import { IStepController } from './step.controller';
import { validateRequest } from '@/shared/middlewares';
import { createStepSchema, updateStepSchema } from './step.validation';

const stepRouter = express.Router({ mergeParams: true });
const controller = container.get<IStepController>(TYPES.StepController);

stepRouter.post('/:huntId/steps', validateRequest(createStepSchema), (req, res, next) => {
  controller.createStep(req, res).catch(next);
});

stepRouter.put('/:huntId/steps/:stepId', validateRequest(updateStepSchema), (req, res, next) => {
  controller.updateStep(req, res).catch(next);
});

stepRouter.delete('/:huntId/steps/:stepId', (req, res, next) => {
  controller.deleteStep(req, res).catch(next);
});

export default stepRouter;
