import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/shared/types';
import { IHuntService } from './hunt.service';

export interface IHuntController {
  createHunt(req: Request, res: Response): Promise<Response>;
  getAllUserHunts(req: Request, res: Response): Promise<Response>;
  getUserHuntById(req: Request, res: Response): Promise<Response>;
  updateHunt(req: Request, res: Response): Promise<Response>;
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
    const id = req.params.id;
    const hunt = await this.huntService.getUserHuntById(id, req.user.id);
    return res.status(200).json(hunt);
  }

  async updateHunt(req: Request, res: Response) {
    const id = req.params.id;
    const huntData = req.body;
    const updatedHunt = await this.huntService.updateHunt(id, huntData, req.user.id);
    return res.status(200).json(updatedHunt);
  }
}
