import { Router } from 'express';
import { validateRequest } from '@/shared/middlewares/validation.middleware';
import { container } from '@/config/inversify';
import { AssetController } from './asset.controller';
import { createAssetSchema } from './asset.validation';
import { TYPES } from '@/shared/types';

const router = Router();
const controller = container.get<AssetController>(TYPES.AssetController);

router.post('/request-upload', (req, res, next) => {
  controller.requestUpload(req, res).catch(next);
});

router.post('/', validateRequest(createAssetSchema), (req, res, next) => {
  controller.createAsset(req, res).catch(next);
});

router.get('/', (req, res, next) => {
  controller.getAssets(req, res).catch(next);
});

router.get('/:id', (req, res, next) => {
  controller.getAsset(req, res).catch(next);
});

router.delete('/:id', (req, res, next) => {
  controller.deleteAsset(req, res).catch(next);
});

export default router;
