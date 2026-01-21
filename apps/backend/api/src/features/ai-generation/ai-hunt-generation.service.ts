import { Hunt, Step, GenerateHuntRequest, GenerateHuntResponse, ChallengeType, Challenge } from '@hunthub/shared';
import { inject, injectable } from 'inversify';
import { TYPES } from '@/shared/types';
import { IHuntService } from '@/modules/hunts/hunt.service';
import { IHuntSaveService } from '@/modules/hunts/hunt-save.service';
import { IAIHuntGenerator } from './ai-hunt-generator.provider';
import { AIGeneratedHunt, AIGeneratedStep } from './helpers/ai-hunt-output.schema';
import { logger } from '@/utils/logger';

export interface GenerateHuntParams extends GenerateHuntRequest {
  userId: string;
}

export interface IAIHuntGenerationService {
  generateHunt(params: GenerateHuntParams): Promise<GenerateHuntResponse>;
}

@injectable()
export class AIHuntGenerationService implements IAIHuntGenerationService {
  constructor(
    @inject(TYPES.AIHuntGenerator) private aiHuntGenerator: IAIHuntGenerator,
    @inject(TYPES.HuntService) private huntService: IHuntService,
    @inject(TYPES.HuntSaveService) private huntSaveService: IHuntSaveService,
  ) {}

  async generateHunt(params: GenerateHuntParams): Promise<GenerateHuntResponse> {
    const { prompt, style, userId } = params;

    const generationResult = await this.aiHuntGenerator.generateHunt({ prompt, style: style ?? undefined });

    const createdHunt = await this.huntService.createHunt(
      {
        name: generationResult.hunt.name,
        description: generationResult.hunt.description,
      },
      userId,
    );

    try {
      const huntWithSteps = this.buildHuntWithSteps(createdHunt, generationResult.hunt);
      const savedHunt = await this.huntSaveService.saveHunt(createdHunt.huntId, huntWithSteps, userId);

      logger.info(
        {
          huntId: savedHunt.huntId,
          stepCount: savedHunt.steps?.length ?? 0,
          processingTimeMs: generationResult.processingTimeMs,
          retryCount: generationResult.retryCount,
        },
        'AI-generated hunt saved',
      );

      return {
        hunt: savedHunt,
        generationMetadata: {
          model: generationResult.model,
          processingTimeMs: generationResult.processingTimeMs,
          prompt,
        },
      };
    } catch (error) {
      await this.huntService.deleteHunt(createdHunt.huntId, userId).catch((deleteError) => {
        logger.error({ huntId: createdHunt.huntId, deleteError }, 'Failed to clean up hunt after save failure');
      });
      throw error;
    }
  }

  private buildHuntWithSteps(createdHunt: Hunt, aiHunt: AIGeneratedHunt): Hunt {
    const steps: Step[] = aiHunt.steps.map((aiStep) => this.transformAIStep(aiStep, createdHunt.huntId));

    return {
      ...createdHunt,
      steps,
    };
  }

  private transformAIStep(aiStep: AIGeneratedStep, huntId: number): Step {
    return {
      stepId: undefined as unknown as number,
      huntId,
      type: aiStep.type as ChallengeType,
      challenge: aiStep.challenge as Challenge,
      hint: aiStep.hint ?? null,
      media: null,
      requiredLocation: null,
      timeLimit: null,
      maxAttempts: null,
    };
  }
}
