import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '@/types';
import { HuntService } from '@/services/hunt.service';
import { CompactUser } from '@/types/CompactUser';

export interface IHuntController {
  createHunt(req: Request, res: Response): Promise<Response>;
  getAllHunts(req: Request, res: Response): Promise<Response>;
  getHuntById(req: Request, res: Response): Promise<Response>;
  getAllUserHunts(req: Request, res: Response): Promise<Response>;
  getUserHuntById(req: Request, res: Response): Promise<Response>;
}

@injectable()
export class HuntController implements IHuntController {
  constructor(@inject(TYPES.HuntService) private huntService: HuntService) {}

  async createHunt(req: Request, res: Response) {
    const hunt = req.body;

    const createdHunt = await this.huntService.createHunt(hunt, req.user.id);

    return res.status(201).json(createdHunt);
  }

  async getAllHunts(req: Request, res: Response) {
    const currentUser: CompactUser = req.user;
    const hunts = await this.huntService.getUserHunts(currentUser.id);

    return res.status(200).json(hunts);
  }

  async getAllUserHunts(req: Request, res: Response) {
    const hunts = await this.huntService.getUserHunts(req.user.id);

    return res.status(200).json(hunts);
  }

  async getHuntById(req: Request, res: Response) {
    const id = req.params.id;
    const hunt = await this.huntService.getHuntById(id);

    return res.status(200).json(hunt);
  }

  async getUserHuntById(req: Request, res: Response) {
    const id = req.params.id;
    const hunt = await this.huntService.getUserHuntById(id, req.user.id);

    return res.status(200).json(hunt);
  }
}
