import { HydratedDocument } from 'mongoose';
import StepModel from '@/database/models/Step';
import { IStep } from '@/database/types/Step';
import { IProgress } from '@/database/types/Progress';

/**
 * StepNavigator - Handles step traversal
 *
 * Responsibilities:
 * - Get steps by ID or index
 * - Determine step position in hunt
 *
 * Note: Link generation is done in PlayService (links include step IDs)
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
   * Uses progress.version as source of truth (version player started with)
   */
  static async getCurrentStepForSession(progress: IProgress): Promise<HydratedDocument<IStep> | null> {
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
