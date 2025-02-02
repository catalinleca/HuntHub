import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '@/types';
import { HuntService } from '@/services/hunt.service';

@injectable()
export class HuntController {
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
}
