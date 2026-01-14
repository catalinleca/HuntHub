import { HydratedDocument } from 'mongoose';
import StepModel from '@/database/models/Step';
import { IStep } from '@/database/types/Step';
import { IProgress } from '@/database/types/Progress';

export class StepNavigator {
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

  static async getCurrentStepForSession(progress: IProgress): Promise<HydratedDocument<IStep> | null> {
    return this.getStepById(progress.huntId, progress.version, progress.currentStepId);
  }

  static getNextStepId(stepOrder: number[], currentStepId: number): number | null {
    const currentIndex = stepOrder.indexOf(currentStepId);

    if (currentIndex === -1 || currentIndex >= stepOrder.length - 1) {
      return null;
    }

    return stepOrder[currentIndex + 1];
  }

  static getStepIndex(stepOrder: number[], stepId: number): number {
    return stepOrder.indexOf(stepId);
  }

  static isLastStep(stepOrder: number[], stepId: number): boolean {
    const index = stepOrder.indexOf(stepId);
    if (index === -1) {
      return false;
    }
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

    return steps.sort((a, b) => stepOrder.indexOf(a.stepId) - stepOrder.indexOf(b.stepId));
  }
}
