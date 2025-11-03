import { Router } from 'express';
import { validateRequest } from '@/shared/middlewares/validation.middleware';
import { container } from '@/config/inversify';
import { AssetController } from './asset.controller';
import { createAssetSchema } from './asset.validation';
import { TYPES } from '@/shared/types';

const router = Router();
const controller = container.get<AssetController>(TYPES.AssetController);

router.post('/request-upload', controller.requestUpload);
router.post('/', validateRequest(createAssetSchema), controller.createAsset);
router.get('/', controller.getAssets);
router.get('/:id', controller.getAsset);
router.delete('/:id', controller.deleteAsset);

export default router;
