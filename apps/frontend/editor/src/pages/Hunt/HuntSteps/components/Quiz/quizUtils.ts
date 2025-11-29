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
      { id: targetId, text: '', _id: targetId },
      { id: option2Id, text: '', _id: option2Id },
    ],
    targetId,
  };
};