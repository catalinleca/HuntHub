import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/shared/types';
import { parseNumericId } from '@/shared/utils/parseId';
import { IHuntShareService } from '@/features/sharing/hunt-share.service';

export interface IHuntShareController {
  shareHunt(req: Request, res: Response): Promise<Response>;
  updatePermission(req: Request, res: Response): Promise<Response>;
  revokeAccess(req: Request, res: Response): Promise<Response>;
  listCollaborators(req: Request, res: Response): Promise<Response>;
}

@injectable()
export class HuntShareController implements IHuntShareController {
  constructor(@inject(TYPES.HuntShareService) private huntShareService: IHuntShareService) {}

  async shareHunt(req: Request, res: Response) {
    const huntId = parseNumericId(req.params.id);
    const { email, permission } = req.body;

    const result = await this.huntShareService.shareHunt(huntId, email, permission, req.user.id);

    return res.status(200).json(result);
  }

  async updatePermission(req: Request, res: Response) {
    const huntId = parseNumericId(req.params.id);
    const sharedWithId = req.params.userId;
    const { permission } = req.body;

    const result = await this.huntShareService.updatePermission(huntId, sharedWithId, permission, req.user.id);

    return res.status(200).json(result);
  }

  async revokeAccess(req: Request, res: Response) {
    const huntId = parseNumericId(req.params.id);
    const sharedWithId = req.params.userId;

    await this.huntShareService.revokeAccess(huntId, sharedWithId, req.user.id);

    return res.status(204).send();
  }

  async listCollaborators(req: Request, res: Response) {
    const huntId = parseNumericId(req.params.id);

    const collaborators = await this.huntShareService.listCollaborators(huntId, req.user.id);

    return res.status(200).json(collaborators);
  }
}
