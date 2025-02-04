import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '@/types';
import { HuntService } from '@/services/hunt.service';

export interface IHuntController {
  createHunt(req: Request, res: Response): Promise<Response>;
  getAllHunts(req: Request, res: Response): Promise<Response>;
  getHuntById(req: Request, res: Response): Promise<Response>;
}

@injectable()
export class HuntController implements IHuntController {
  constructor(@inject(TYPES.HuntService) private huntService: HuntService) {}

  async createHunt(req: Request, res: Response) {
    try {
      const huntData = req.body;

      console.log('===huntData: ', huntData);
      const hunt = await this.huntService.createHunt({
        ...huntData,
      });

      return res.status(201).json(hunt);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create hunt' });
    }
  }

  async getAllHunts(req: Request, res: Response) {
    try {
      const hunts = await this.huntService.getAllHunts();

      return res.status(200).json(hunts);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to get hunts' });
    }
  }

  async getHuntById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const hunt = await this.huntService.getHuntById(id);

      return res.status(200).json(hunt);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to get hunt' });
    }
  }
}
