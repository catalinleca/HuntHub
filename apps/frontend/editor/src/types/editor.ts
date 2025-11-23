import { Step, Hunt, Location } from '@hunthub/shared';

export type StepFormData = Omit<Step, 'stepId' | 'huntId' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  stepId?: number;
};

export interface EditorFormData {
  name: string;
  description: string;
  startLocation?: Location;
  steps: StepFormData[];
}

export type { Hunt, Step, Location };