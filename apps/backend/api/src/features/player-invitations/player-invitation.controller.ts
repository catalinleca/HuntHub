import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/shared/types';
import { parseNumericId } from '@/shared/utils/parseId';
import { safeDecodeURIComponent } from '@/shared/utils/parsing';
import { ValidationError } from '@/shared/errors';
import { IPlayerInvitationService } from './player-invitation.service';

export interface IPlayerInvitationController {
  invitePlayer(req: Request, res: Response): Promise<Response>;
  listInvitations(req: Request, res: Response): Promise<Response>;
  revokeInvitation(req: Request, res: Response): Promise<Response>;
  updateAccessMode(req: Request, res: Response): Promise<Response>;
}

@injectable()
export class PlayerInvitationController implements IPlayerInvitationController {
  constructor(@inject(TYPES.PlayerInvitationService) private service: IPlayerInvitationService) {}

  async invitePlayer(req: Request, res: Response) {
    const huntId = parseNumericId(req.params.id);
    const { email } = req.body;

    const result = await this.service.invitePlayer(huntId, email, req.user.id);

    return res.status(201).json(result);
  }

  async listInvitations(req: Request, res: Response) {
    const huntId = parseNumericId(req.params.id);

    const invitations = await this.service.listInvitations(huntId, req.user.id);

    return res.status(200).json(invitations);
  }

  async revokeInvitation(req: Request, res: Response) {
    const huntId = parseNumericId(req.params.id);
    const email = safeDecodeURIComponent(req.params.email);

    if (!email) {
      throw new ValidationError('Invalid email parameter', []);
    }

    await this.service.revokeInvitation(huntId, email, req.user.id);

    return res.status(204).send();
  }

  async updateAccessMode(req: Request, res: Response) {
    const huntId = parseNumericId(req.params.id);
    const { accessMode } = req.body;

    await this.service.updateAccessMode(huntId, accessMode, req.user.id);

    return res.status(204).send();
  }
}
