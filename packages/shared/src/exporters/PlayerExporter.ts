import {
  Step,
  StepPF,
  Challenge,
  ChallengePF,
  CluePF,
  QuizPF,
  MissionPF,
  TaskPF,
  HuntMetaPF,
  ChallengeType,
} from '../types';

/**
 * HuntVersion type for export (subset of backend HuntVersion)
 * Frontend doesn't need full HuntVersion, just these fields
 */
interface HuntVersionLike {
  name: string;
  description?: string;
  stepOrder: number[];
  coverImage?: Step['media'] | null;
}

/**
 * PlayerExporter - Transforms internal data to player-safe format
 *
 * Used by:
 * - Backend: API responses for player endpoints
 * - Frontend: Editor preview mode (strips answers in DevTools)
 *
 * Security: Removes all answer data, AI instructions, and internal metadata
 */
export class PlayerExporter {
  /**
   * Transform Step to player-safe format (no answers)
   */
  static step(step: Step): StepPF {
    return {
      stepId: step.stepId,
      type: step.type,
      challenge: this.challenge(step.type, step.challenge),
      media: step.media,
      timeLimit: step.timeLimit ?? null,
      maxAttempts: step.maxAttempts ?? null,
      hasHint: !!step.hint,
    };
  }

  /**
   * Transform HuntVersion to player-safe hunt metadata
   */
  static hunt(huntId: number, version: HuntVersionLike): HuntMetaPF {
    return {
      huntId,
      name: version.name,
      description: version.description,
      totalSteps: version.stepOrder.length,
      coverImage: version.coverImage ?? null,
    };
  }

  /**
   * Transform multiple steps to player format
   */
  static steps(steps: Step[]): StepPF[] {
    return steps.map((step) => this.step(step));
  }

  /**
   * Randomize quiz options if enabled
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
          options: this.shuffle([...quiz.options]),
        },
      },
    };
  }

  // ============================================
  // Private helpers
  // ============================================

  private static challenge(type: ChallengeType, challenge: Challenge): ChallengePF {
    switch (type) {
      case ChallengeType.Clue:
        return { clue: this.clue(challenge) };
      case ChallengeType.Quiz:
        return { quiz: this.quiz(challenge) };
      case ChallengeType.Mission:
        return { mission: this.mission(challenge) };
      case ChallengeType.Task:
        return { task: this.task(challenge) };
      default:
        throw new Error(`Unknown challenge type: ${type}`);
    }
  }

  /**
   * Clue - No sensitive data to strip
   * Validation is Editor's responsibility - we just transform
   */
  private static clue(challenge: Challenge): CluePF {
    const clue = challenge.clue;
    if (!clue) {
      throw new Error('Clue challenge missing clue data');
    }

    return {
      title: clue.title ?? '',
      description: clue.description ?? '',
    };
  }

  /**
   * Quiz - Strip targetId, expectedAnswer, validation
   * Validation is Editor's responsibility - we just transform
   */
  private static quiz(challenge: Challenge): QuizPF {
    const quiz = challenge.quiz;
    if (!quiz) {
      throw new Error('Quiz challenge missing quiz data');
    }

    return {
      title: quiz.title ?? '',
      description: quiz.description ?? '',
      type: quiz.type!,
      options: quiz.options,
      randomizeOrder: quiz.randomizeOrder,
      // STRIPPED: targetId, expectedAnswer, validation
    };
  }

  /**
   * Mission - Strip targetLocation, aiInstructions, aiModel
   * Validation is Editor's responsibility - we just transform
   */
  private static mission(challenge: Challenge): MissionPF {
    const mission = challenge.mission;
    if (!mission) {
      throw new Error('Mission challenge missing mission data');
    }

    return {
      title: mission.title ?? '',
      description: mission.description ?? '',
      type: mission.type!,
      referenceAssetIds: mission.referenceAssetIds,
      // STRIPPED: targetLocation, aiInstructions, aiModel
    };
  }

  /**
   * Task - Strip aiInstructions, aiModel
   * Validation is Editor's responsibility - we just transform
   */
  private static task(challenge: Challenge): TaskPF {
    const task = challenge.task;
    if (!task) {
      throw new Error('Task challenge missing task data');
    }

    return {
      title: task.title ?? '',
      instructions: task.instructions ?? '',
      // STRIPPED: aiInstructions, aiModel
    };
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private static shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
