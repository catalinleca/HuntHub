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
    const huntId = req.params.huntId;
    const stepData = req.body;
    const createdStep = await this.stepService.createStep(stepData, huntId, req.user.id);
    return res.status(201).json(createdStep);
  }

  async updateStep(req: Request, res: Response) {
    const huntId = req.params.huntId;
    const stepId = req.params.stepId;
    const stepData = req.body;
    const updatedStep = await this.stepService.updateStep(stepId, huntId, stepData, req.user.id);
    return res.status(200).json(updatedStep);
  }

  async deleteStep(req: Request, res: Response) {
    const huntId = req.params.huntId;
    const stepId = req.params.stepId;
    await this.stepService.deleteStep(stepId, huntId, req.user.id);
    return res.status(204).send();
  }
}