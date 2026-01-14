import { HydratedDocument } from 'mongoose';
import {
  ChallengeType,
  StepPF,
  ChallengePF,
  CluePF,
  QuizPF,
  MissionPF,
  TaskPF,
  HuntMetaPF,
  Challenge,
  Option,
} from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { IHuntVersion } from '@/database/types/HuntVersion';

/**
 * PlayMapper - Transforms data for Player API
 *
 * Critical security function: Strips sensitive data from challenges
 * so players cannot see answers, target locations, or AI instructions.
 */
export class PlayMapper {
  /**
   * Transform Step to StepPF (Player Format)
   * Strips all answer data from challenges
   */
  static toStepPF(doc: HydratedDocument<IStep>): StepPF {
    return {
      stepId: doc.stepId,
      type: doc.type as ChallengeType,
      challenge: this.toChallengePF(doc.type as ChallengeType, doc.challenge as Challenge),
      media: doc.media,
      timeLimit: doc.timeLimit ?? null,
      maxAttempts: doc.maxAttempts ?? null,
    };
  }

  /**
   * Transform HuntVersion to HuntMetaPF (Player Format)
   */
  static toHuntMetaPF(huntId: number, version: HydratedDocument<IHuntVersion>): HuntMetaPF {
    return {
      huntId,
      name: version.name,
      description: version.description,
      totalSteps: version.stepOrder.length,
      coverImage: version.coverImage ?? null,
    };
  }

  /**
   * Strip sensitive data from challenge based on type
   */
  private static toChallengePF(type: ChallengeType, challenge: Challenge): ChallengePF {
    switch (type) {
      case ChallengeType.Clue:
        return { clue: this.toCluePF(challenge) };

      case ChallengeType.Quiz:
        return { quiz: this.toQuizPF(challenge) };

      case ChallengeType.Mission:
        return { mission: this.toMissionPF(challenge) };

      case ChallengeType.Task:
        return { task: this.toTaskPF(challenge) };

      default:
        throw new Error(`Unknown challenge type: ${type}`);
    }
  }

  /**
   * Clue - No sensitive data to strip
   */
  private static toCluePF(challenge: Challenge): CluePF {
    const clue = challenge.clue;
    if (!clue) {
      throw new Error('Clue challenge missing clue data');
    }

    if (!clue.title || !clue.description) {
      throw new Error('Clue challenge missing required fields');
    }

    return {
      title: clue.title,
      description: clue.description,
    };
  }

  /**
   * Quiz - Strip targetId, expectedAnswer, validation
   */
  private static toQuizPF(challenge: Challenge): QuizPF {
    const quiz = challenge.quiz;
    if (!quiz) {
      throw new Error('Quiz challenge missing quiz data');
    }

    if (!quiz.title || !quiz.description || !quiz.type) {
      throw new Error('Quiz challenge missing required fields');
    }

    return {
      title: quiz.title,
      description: quiz.description,
      type: quiz.type,
      options: quiz.options,
      randomizeOrder: quiz.randomizeOrder,
      // STRIPPED: targetId, expectedAnswer, validation
    };
  }

  /**
   * Mission - Strip targetLocation, aiInstructions, aiModel
   */
  private static toMissionPF(challenge: Challenge): MissionPF {
    const mission = challenge.mission;
    if (!mission) {
      throw new Error('Mission challenge missing mission data');
    }

    if (!mission.title || !mission.description || !mission.type) {
      throw new Error('Mission challenge missing required fields');
    }

    return {
      title: mission.title,
      description: mission.description,
      type: mission.type,
      referenceAssetIds: mission.referenceAssetIds,
      // STRIPPED: targetLocation, aiInstructions, aiModel
    };
  }

  /**
   * Task - Strip aiInstructions, aiModel
   */
  private static toTaskPF(challenge: Challenge): TaskPF {
    const task = challenge.task;
    if (!task) {
      throw new Error('Task challenge missing task data');
    }

    if (!task.title || !task.instructions) {
      throw new Error('Task challenge missing required fields');
    }

    return {
      title: task.title,
      instructions: task.instructions,
      // STRIPPED: aiInstructions, aiModel
    };
  }

  /**
   * Randomize quiz options if randomizeOrder is true
   * Uses Fisher-Yates shuffle for unbiased randomization
   */
  static maybeRandomizeOptions(step: StepPF): StepPF {
    if (step.type !== ChallengeType.Quiz) {
      return step;
    }

    const quiz = step.challenge.quiz;
    if (!quiz?.randomizeOrder || !quiz.options) {
      return step;
    }

    return {
      ...step,
      challenge: {
        quiz: {
          ...quiz,
          options: this.shuffleArray([...quiz.options]),
        },
      },
    };
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private static shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Transform multiple steps to StepPF array
   */
  static toStepsPF(docs: HydratedDocument<IStep>[]): StepPF[] {
    return docs.map((doc) => this.toStepPF(doc));
  }
}
