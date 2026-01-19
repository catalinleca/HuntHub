import { Router } from 'express';
import { TYPES } from '@/shared/types';
import { container } from '@/config/inversify';
import { IPlayerInvitationController } from './player-invitation.controller';
import { validateRequest } from '@/shared/middlewares';
import { createInvitationSchema, updateAccessModeSchema } from './player-invitation.validation';

const router = Router();
const controller = container.get<IPlayerInvitationController>(TYPES.PlayerInvitationController);

router.post('/:id/player-invitations', validateRequest(createInvitationSchema), (req, res, next) => {
  controller.invitePlayer(req, res).catch(next);
});

router.get('/:id/player-invitations', (req, res, next) => {
  controller.listInvitations(req, res).catch(next);
});

router.delete('/:id/player-invitations/:email', (req, res, next) => {
  controller.revokeInvitation(req, res).catch(next);
});

router.patch('/:id/access-mode', validateRequest(updateAccessModeSchema), (req, res, next) => {
  controller.updateAccessMode(req, res).catch(next);
});

export default router;
