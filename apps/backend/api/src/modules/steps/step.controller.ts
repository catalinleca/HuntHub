import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/shared/types';
import { IStepService } from './step.service';

export interface IStepController {
  createStep(req: Request, res: Response): Promise<Response>;
  updateStep(req: Request, res: Response): Promise<Response>;
  deleteStep(req: Request, res: Response): Promise<Response>;
}

@injectable()
export class StepController implements IStepController {
  constructor(@inject(TYPES.StepService) private stepService: IStepService) {}

  async createStep(req: Request, res: Response) {
    const huntId = parseInt(req.params.huntId, 10);
    if (isNaN(huntId)) {
      return res.status(400).json({ message: 'Invalid hunt ID' });
    }
    const stepData = req.body;
    const createdStep = await this.stepService.createStep(stepData, huntId, req.user.id);
    return res.status(201).json(createdStep);
  }

  async updateStep(req: Request, res: Response) {
    const huntId = parseInt(req.params.huntId, 10);
    const stepId = parseInt(req.params.stepId, 10);
    if (isNaN(huntId) || isNaN(stepId)) {
      return res.status(400).json({ message: 'Invalid hunt ID or step ID' });
    }
    const stepData = req.body;
    const updatedStep = await this.stepService.updateStep(stepId, huntId, stepData, req.user.id);
    return res.status(200).json(updatedStep);
  }

  async deleteStep(req: Request, res: Response) {
    const huntId = parseInt(req.params.huntId, 10);
    const stepId = parseInt(req.params.stepId, 10);
    if (isNaN(huntId) || isNaN(stepId)) {
      return res.status(400).json({ message: 'Invalid hunt ID or step ID' });
    }
    await this.stepService.deleteStep(stepId, huntId, req.user.id);
    return res.status(204).send();
  }
}