import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/shared/types';
import { IHuntService } from './hunt.service';

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
    const hunts = await this.huntService.getUserHunts(req.user.id);
    return res.status(200).json(hunts);
  }

  async getUserHuntById(req: Request, res: Response) {
    const huntId = parseInt(req.params.id, 10);
    if (isNaN(huntId)) {
      return res.status(400).json({ message: 'Invalid hunt ID' });
    }
    const hunt = await this.huntService.getUserHuntById(huntId, req.user.id);
    return res.status(200).json(hunt);
  }

  async updateHunt(req: Request, res: Response) {
    const huntId = parseInt(req.params.id, 10);
    if (isNaN(huntId)) {
      return res.status(400).json({ message: 'Invalid hunt ID' });
    }
    const huntData = req.body;
    const updatedHunt = await this.huntService.updateHunt(huntId, huntData, req.user.id);
    return res.status(200).json(updatedHunt);
  }

  async deleteHunt(req: Request, res: Response) {
    const huntId = parseInt(req.params.id, 10);
    if (isNaN(huntId)) {
      return res.status(400).json({ message: 'Invalid hunt ID' });
    }
    await this.huntService.deleteHunt(huntId, req.user.id);
    return res.status(204).send();
  }

  async reorderSteps(req: Request, res: Response) {
    const huntId = parseInt(req.params.id, 10);
    if (isNaN(huntId)) {
      return res.status(400).json({ message: 'Invalid hunt ID' });
    }
    const { stepOrder } = req.body;
    const updatedHunt = await this.huntService.reorderSteps(huntId, stepOrder, req.user.id);
    return res.status(200).json(updatedHunt);
  }
}
