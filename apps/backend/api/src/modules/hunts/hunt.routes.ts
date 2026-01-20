import express from 'express';
import { TYPES } from '@/shared/types';
import { container } from '@/config/inversify';
import { IHuntController } from './hunt.controller';
import { IPreviewController } from '@/features/preview/preview.controller';
import { validateRequest, validateQuery } from '@/shared/middlewares';
import { createHuntSchema, updateHuntSchema, saveHuntSchema, reorderStepsSchema } from './hunt.validation';
import { HuntQueryParamsValidation } from '@/shared/validation/query-params.validation';

const huntRouter = express.Router();
const controller = container.get<IHuntController>(TYPES.HuntController);
const previewController = container.get<IPreviewController>(TYPES.PreviewController);

huntRouter.post('/', validateRequest(createHuntSchema), (req, res, next) => {
  controller.createHunt(req, res).catch(next);
});

huntRouter.get('/', validateQuery(HuntQueryParamsValidation), (req, res, next) => {
  controller.getAllUserHunts(req, res).catch(next);
});

huntRouter.get('/:id', (req, res, next) => {
  controller.getUserHuntById(req, res).catch(next);
});

huntRouter.put('/:id', validateRequest(updateHuntSchema), (req, res, next) => {
  controller.updateHunt(req, res).catch(next);
});

huntRouter.put('/:id/save', validateRequest(saveHuntSchema), (req, res, next) => {
  controller.saveHunt(req, res).catch(next);
});

huntRouter.delete('/:id', (req, res, next) => {
  controller.deleteHunt(req, res).catch(next);
});

huntRouter.put('/:id/step-order', validateRequest(reorderStepsSchema), (req, res, next) => {
  controller.reorderSteps(req, res).catch(next);
});

huntRouter.post('/:id/reset-play-link', (req, res, next) => {
  controller.resetPlayLink(req, res).catch(next);
});

huntRouter.get('/:id/preview-link', (req, res, next) => {
  previewController.generatePreviewLink(req, res).catch(next);
});

export default huntRouter;
