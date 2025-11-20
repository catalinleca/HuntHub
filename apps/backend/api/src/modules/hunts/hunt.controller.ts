import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/shared/types';
import { IHuntService } from './hunt.service';
import { parseNumericId } from '@/shared/utils/parseId';
import { ValidatedHuntQuery } from '@/shared/validation/query-params.validation';

export interface IHuntController {
  createHunt(req: Request, res: Response): Promise<Response>;
  getAllUserHunts(req: Request, res: Response): Promise<Response>;
  getUserHuntById(req: Request, res: Response): Promise<Response>;
  updateHunt(req: Request, res: Response): Promise<Response>;
  deleteHunt(req: Request, res: Response): Promise<Response>;
  reorderSteps(req: Request, res: Response): Promise<Response>;
}

@injectable()
export class HuntController implements IHuntController {
  constructor(@inject(TYPES.HuntService) private huntService: IHuntService) {}

  async createHunt(req: Request, res: Response) {
    const hunt = req.body;
    const createdHunt = await this.huntService.createHunt(hunt, req.user.id);
    return res.status(201).json(createdHunt);
  }

  async getAllUserHunts(req: Request, res: Response) {
    const { page, limit, sortBy, sortOrder } = req.query as unknown as ValidatedHuntQuery;

    const result = await this.huntService.getUserHunts(req.user.id, {
      page,
      limit,
      sortBy,
      sortOrder,
    });
    return res.status(200).json(result);
  }

  async getUserHuntById(req: Request, res: Response) {
    const huntId = parseNumericId(req.params.id);
    const hunt = await this.huntService.getUserHuntById(huntId, req.user.id);
    return res.status(200).json(hunt);
  }

  async updateHunt(req: Request, res: Response) {
    const huntId = parseNumericId(req.params.id);
    const huntData = req.body;
    const updatedHunt = await this.huntService.updateHunt(huntId, huntData, req.user.id);
    return res.status(200).json(updatedHunt);
  }

  async deleteHunt(req: Request, res: Response) {
    const huntId = parseNumericId(req.params.id);
    await this.huntService.deleteHunt(huntId, req.user.id);
    return res.status(204).send();
  }

  async reorderSteps(req: Request, res: Response) {
    const huntId = parseNumericId(req.params.id);
    const { stepOrder } = req.body;
    const updatedHunt = await this.huntService.reorderSteps(huntId, stepOrder, req.user.id);
    return res.status(200).json(updatedHunt);
  }
}
