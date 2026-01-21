import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/shared/types';
import { IAIHuntGenerationService } from './ai-hunt-generation.service';

export interface IAIHuntGenerationController {
  generateHunt(req: Request, res: Response): Promise<Response>;
}

@injectable()
export class AIHuntGenerationController implements IAIHuntGenerationController {
  constructor(@inject(TYPES.AIHuntGenerationService) private aiHuntGenerationService: IAIHuntGenerationService) {}

  async generateHunt(req: Request, res: Response) {
    const { prompt, style } = req.body;

    const result = await this.aiHuntGenerationService.generateHunt({
      prompt,
      style,
      userId: req.user.id,
    });

    return res.status(201).json(result);
  }
}
