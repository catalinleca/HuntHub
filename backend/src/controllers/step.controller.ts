import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '@/types';
import { StepService } from '@/services/step.service';
import { CompactUser } from '@/types/CompactUser';

export interface IStepController {
  createStep(req: Request, res: Response): Promise<Response>;
  getAllSteps(req: Request, res: Response): Promise<Response>;
  getStepById(req: Request, res: Response): Promise<Response>;
}

@injectable()
export class StepController implements IStepController {
  constructor(@inject(TYPES.StepService) private stepService: StepService) {}

  async createStep(req: Request, res: Response) {
    const step = req.body;
    const huntId = req.params.huntId;

    const createdStep = await this.stepService.createStep({
      ...step,
      huntId,
    });

    return res.status(201).json(createdStep);
  }

  async getAllSteps(req: Request, res: Response) {
    const currentUser: CompactUser = req.user;
    const steps = await this.stepService.getUserSteps(currentUser.id);

    return res.status(200).json(steps);
  }

  async getStepById(req: Request, res: Response) {
    const id = req.params.id;
    const step = await this.stepService.getStepById(id);

    return res.status(200).json(step);
  }
}
