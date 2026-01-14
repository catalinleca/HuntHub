import { HydratedDocument } from 'mongoose';
import { StepLinks, ValidateAnswerLinks, HateoasLink } from '@hunthub/shared';
import StepModel from '@/database/models/Step';
import { IStep } from '@/database/types/Step';
import { IHuntVersion } from '@/database/types/HuntVersion';
import { IProgress } from '@/database/types/Progress';

/**
 * StepNavigator - Handles step traversal and HATEOAS link generation
 *
 * Responsibilities:
 * - Get steps by ID or index
 * - Generate HATEOAS navigation links
 * - Determine step position in hunt
 */
export class StepNavigator {
  /**
   * Get step by stepId for a specific hunt version
   */
  static async getStepById(
    huntId: number,
    huntVersion: number,
    stepId: number,
  ): Promise<HydratedDocument<IStep> | null> {
    return StepModel.findOne({
      huntId,
      huntVersion,
      stepId,
    });
  }

  /**
   * Get step by index from stepOrder array
   */
  static async getStepByIndex(
    huntId: number,
    huntVersion: number,
    stepOrder: number[],
    index: number,
  ): Promise<HydratedDocument<IStep> | null> {
    if (index < 0 || index >= stepOrder.length) {
      return null;
    }

    const stepId = stepOrder[index];
    return this.getStepById(huntId, huntVersion, stepId);
  }

  /**
   * Get current step for session based on Progress.currentStepId
   */
  static async getCurrentStepForSession(
    progress: IProgress,
    huntVersion: IHuntVersion,
  ): Promise<HydratedDocument<IStep> | null> {
    return this.getStepById(progress.huntId, progress.version, progress.currentStepId);
  }

  /**
   * Get next step ID from stepOrder, or null if at end
   */
  static getNextStepId(stepOrder: number[], currentStepId: number): number | null {
    const currentIndex = stepOrder.indexOf(currentStepId);

    if (currentIndex === -1 || currentIndex >= stepOrder.length - 1) {
      return null;
    }

    return stepOrder[currentIndex + 1];
  }

  /**
   * Get step index in stepOrder
   */
  static getStepIndex(stepOrder: number[], stepId: number): number {
    return stepOrder.indexOf(stepId);
  }

  /**
   * Check if step is the last step in hunt
   */
  static isLastStep(stepOrder: number[], stepId: number): boolean {
    const index = stepOrder.indexOf(stepId);
    return index === stepOrder.length - 1;
  }

  /**
   * Generate HATEOAS links for step response
   */
  static generateStepLinks(sessionId: string, stepOrder: number[], currentStepId: number): StepLinks {
    const currentIndex = stepOrder.indexOf(currentStepId);
    const hasNext = currentIndex < stepOrder.length - 1;

    const links: StepLinks = {
      self: this.makeLink(`/api/play/sessions/${sessionId}/step/current`),
      validate: this.makeLink(`/api/play/sessions/${sessionId}/validate`),
    };

    if (hasNext) {
      links.next = this.makeLink(`/api/play/sessions/${sessionId}/step/next`);
    }

    return links;
  }

  /**
   * Generate HATEOAS links for validate response
   */
  static generateValidateLinks(
    sessionId: string,
    isCorrect: boolean,
    isLastStep: boolean,
    isComplete: boolean,
  ): ValidateAnswerLinks {
    const links: ValidateAnswerLinks = {
      currentStep: this.makeLink(`/api/play/sessions/${sessionId}/step/current`),
    };

    // Only include nextStep link if:
    // - Answer was correct (player is advancing)
    // - Not the last step
    // - Hunt is not complete
    if (isCorrect && !isLastStep && !isComplete) {
      links.nextStep = this.makeLink(`/api/play/sessions/${sessionId}/step/next`);
    }

    return links;
  }

  /**
   * Helper to create HateoasLink object
   */
  private static makeLink(href: string): HateoasLink {
    return { href };
  }

  /**
   * Fetch multiple steps by IDs (for batching)
   */
  static async getStepsByIds(
    huntId: number,
    huntVersion: number,
    stepIds: number[],
  ): Promise<HydratedDocument<IStep>[]> {
    return StepModel.find({
      huntId,
      huntVersion,
      stepId: { $in: stepIds },
    });
  }

  /**
   * Get first N steps from stepOrder (for session start)
   */
  static async getFirstNSteps(
    huntId: number,
    huntVersion: number,
    stepOrder: number[],
    count: number,
  ): Promise<HydratedDocument<IStep>[]> {
    const stepIds = stepOrder.slice(0, count);
    const steps = await this.getStepsByIds(huntId, huntVersion, stepIds);

    // Sort by stepOrder position
    return steps.sort((a, b) => stepOrder.indexOf(a.stepId) - stepOrder.indexOf(b.stepId));
  }
}
