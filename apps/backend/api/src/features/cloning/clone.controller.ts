import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/shared/types';
import { ICloneService } from './clone.service';
import { parseNumericId } from '@/shared/utils/parseId';

export interface ICloneController {
  cloneHunt(req: Request, res: Response): Promise<Response>;
}

@injectable()
export class CloneController implements ICloneController {
  constructor(@inject(TYPES.CloneService) private cloneService: ICloneService) {}

  async cloneHunt(req: Request, res: Response): Promise<Response> {
    const huntId = parseNumericId(req.params.id);
    const { version } = req.body;
    const result = await this.cloneService.cloneHunt(huntId, req.user.id, version);

    return res.status(201).json(result);
  }
}
