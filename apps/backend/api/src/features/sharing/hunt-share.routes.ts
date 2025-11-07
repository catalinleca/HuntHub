import { Router } from 'express';
import { TYPES } from '@/shared/types';
import { container } from '@/config/inversify';
import { IHuntShareController } from './hunt-share.controller';

const router = Router();
const controller = container.get<IHuntShareController>(TYPES.HuntShareController);

// TODO: zod schemas

router.post('/:id/share', (req, res, next) => {
  controller.shareHunt(req, res).catch(next);
});

router.get('/:id/collaborators', (req, res, next) => {
  controller.listCollaborators(req, res).catch(next);
});

router.put('/:id/collaborators/:userId', (req, res, next) => {
  controller.updatePermission(req, res).catch(next);
});

router.delete('/:id/collaborators/:userId', (req, res, next) => {
  controller.revokeAccess(req, res).catch(next);
});

export default router;
