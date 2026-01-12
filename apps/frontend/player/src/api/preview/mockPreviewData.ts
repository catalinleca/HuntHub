import type { Hunt, Step, ChallengeType, OptionType, HuntStatus } from '@hunthub/shared';

/**
 * Mock hunt with FULL Step data (including answers)
 * Used for standalone preview mode when no Editor sends data
 */
export const mockPreviewHunt: Hunt = {
  huntId: 1,
  creatorId: 'preview-user',
  version: 1,
  latestVersion: 1,
  name: 'Preview Mode: City Explorer Adventure',
  description: 'Test hunt for preview mode with all step types',
  status: 'draft' as HuntStatus,
  stepOrder: [1, 2, 3, 4],
  isPublished: false,
  steps: [
    {
      stepId: 1,
      huntId: 1,
      type: 'clue' as ChallengeType,
      challenge: {
        clue: {
          title: 'Welcome to the Hunt!',
          description:
            'This is a preview clue step. Click Continue to move to the next step. In preview mode, you can use the toolbar to jump to any step.',
        },
      },
    },
    {
      stepId: 2,
      huntId: 1,
      type: 'quiz' as ChallengeType,
      challenge: {
        quiz: {
          title: 'Multiple Choice Question',
          description: 'What year was this fountain built? (Correct answer: 1920)',
          type: 'choice' as OptionType,
          options: [
            { id: 'a', text: '1850' },
            { id: 'b', text: '1920' },
            { id: 'c', text: '1965' },
            { id: 'd', text: '1990' },
          ],
          targetId: 'b', // Correct answer
          randomizeOrder: false,
        },
      },
    },
    {
      stepId: 3,
      huntId: 1,
      type: 'quiz' as ChallengeType,
      challenge: {
        quiz: {
          title: 'Text Input Question',
          description: 'Enter the secret code: (Correct answer: EXPLORE2024)',
          type: 'input' as OptionType,
          expectedAnswer: 'EXPLORE2024', // Correct answer
        },
      },
    },
    {
      stepId: 4,
      huntId: 1,
      type: 'clue' as ChallengeType,
      challenge: {
        clue: {
          title: 'Congratulations!',
          description:
            'You have completed the preview hunt! This is the final step. In a real hunt, this would show completion celebration.',
        },
      },
    },
  ],
};

/**
 * Load mock hunt for standalone preview mode
 * Returns a Promise to simulate async loading
 */
export const loadMockPreviewHunt = async (): Promise<Hunt> => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return structuredClone(mockPreviewHunt);
};
