import { QuizOptionFormData } from '@/types/editor';

interface InitialQuizOptions {
  options: QuizOptionFormData[];
  targetId: string;
}

export const createInitialQuizOptions = (): InitialQuizOptions => {
  const targetId = crypto.randomUUID();
  const option2Id = crypto.randomUUID();

  return {
    options: [
      { id: targetId, text: '', formKey: targetId },
      { id: option2Id, text: '', formKey: option2Id },
    ],
    targetId,
  };
};
