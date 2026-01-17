import { AnswerPayload, Challenge, ValidationMode, QuizValidation } from '@hunthub/shared';
import { IStep } from '@/database/types/Step';
import { IAnswerValidator, ValidationResult } from '../answer-validator.helper';

const validateExact = (
  submitted: string,
  expected: string,
  caseSensitive: boolean,
): { isCorrect: boolean; feedback: string } => {
  const normalizedSubmitted = caseSensitive ? submitted : submitted.toLowerCase();
  const normalizedExpected = caseSensitive ? expected : expected.toLowerCase();

  const isCorrect = normalizedSubmitted === normalizedExpected;
  return {
    isCorrect,
    feedback: isCorrect ? 'Correct!' : "That's not quite right. Try again!",
  };
};

const validateContains = (
  submitted: string,
  expected: string,
  caseSensitive: boolean,
): { isCorrect: boolean; feedback: string } => {
  const normalizedSubmitted = caseSensitive ? submitted : submitted.toLowerCase();
  const normalizedExpected = caseSensitive ? expected : expected.toLowerCase();

  // Bidirectional: user might type "Eiffel" when answer is "The Eiffel Tower"
  const isCorrect =
    normalizedSubmitted.includes(normalizedExpected) || normalizedExpected.includes(normalizedSubmitted);

  return {
    isCorrect,
    feedback: isCorrect ? 'Correct!' : "That's not quite right. Try again!",
  };
};

const validateFuzzy = (
  submitted: string,
  expected: string,
  caseSensitive: boolean,
  threshold: number,
): { isCorrect: boolean; feedback: string; confidence: number } => {
  const normalizedSubmitted = caseSensitive ? submitted : submitted.toLowerCase();
  const normalizedExpected = caseSensitive ? expected : expected.toLowerCase();

  const similarity = calculateSimilarity(normalizedSubmitted, normalizedExpected);
  const normalizedThreshold = threshold / 100;
  const isCorrect = similarity >= normalizedThreshold;
  const percentSimilar = Math.round(similarity * 100);

  let feedback: string;
  if (isCorrect) {
    feedback = 'Correct!';
  } else if (similarity >= 0.6) {
    feedback = `Close! Your answer was ${percentSimilar}% similar. Try again!`;
  } else {
    feedback = "That's not quite right. Try again!";
  }

  return { isCorrect, feedback, confidence: similarity };
};

const validateNumericRange = (
  submitted: string,
  expected: string,
  tolerance: number,
): { isCorrect: boolean; feedback: string } => {
  const submittedNum = Number(submitted);
  const expectedNum = Number(expected);

  if (!Number.isFinite(submittedNum)) {
    return { isCorrect: false, feedback: 'Please enter a valid number' };
  }

  if (!Number.isFinite(expectedNum)) {
    return { isCorrect: false, feedback: 'Invalid quiz configuration - expected answer is not a number' };
  }

  const diff = Math.abs(submittedNum - expectedNum);
  const isCorrect = diff <= tolerance;

  let feedback: string;
  if (isCorrect) {
    feedback = 'Correct!';
  } else if (diff <= tolerance * 2) {
    feedback = "You're close! Try again.";
  } else {
    feedback = "That's not quite right. Try again!";
  }

  return { isCorrect, feedback };
};

const levenshteinDistance = (a: string, b: string): number => {
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length > b.length ? a : b;

  const m = shorter.length;
  const n = longer.length;

  let prev = Array.from({ length: m + 1 }, (_, i) => i);
  let curr = new Array(m + 1);

  for (let j = 1; j <= n; j++) {
    curr[0] = j;
    for (let i = 1; i <= m; i++) {
      const cost = shorter[i - 1] === longer[j - 1] ? 0 : 1;
      curr[i] = Math.min(prev[i] + 1, curr[i - 1] + 1, prev[i - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }

  return prev[m];
};

const calculateSimilarity = (a: string, b: string): number => {
  if (a === b) {
    return 1;
  }

  if (a.length === 0 || b.length === 0) {
    return 0;
  }

  const distance = levenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);

  return 1 - distance / maxLength;
};

interface ValidationConfig {
  mode: ValidationMode;
  caseSensitive: boolean;
  fuzzyThreshold: number;
  numericTolerance: number;
  acceptableAnswers: string[];
}

const getValidationConfig = (validation: QuizValidation | undefined): ValidationConfig => ({
  mode: validation?.mode ?? ValidationMode.Exact,
  caseSensitive: validation?.caseSensitive ?? false,
  fuzzyThreshold: validation?.fuzzyThreshold ?? 80,
  numericTolerance: validation?.numericTolerance ?? 0,
  acceptableAnswers: validation?.acceptableAnswers ?? [],
});

const validateAnswer = (
  submitted: string,
  expected: string,
  config: ValidationConfig,
): { isCorrect: boolean; feedback: string; confidence?: number } => {
  switch (config.mode) {
    case ValidationMode.Exact:
      return validateExact(submitted, expected, config.caseSensitive);

    case ValidationMode.Contains:
      return validateContains(submitted, expected, config.caseSensitive);

    case ValidationMode.Fuzzy:
      return validateFuzzy(submitted, expected, config.caseSensitive, config.fuzzyThreshold);

    case ValidationMode.NumericRange:
      return validateNumericRange(submitted, expected, config.numericTolerance);

    default:
      return validateExact(submitted, expected, config.caseSensitive);
  }
};

export const QuizInputValidator: IAnswerValidator = {
  validate: async (payload: AnswerPayload, step: IStep): Promise<ValidationResult> => {
    const challenge = step.challenge as Challenge;
    const quiz = challenge.quiz;

    if (!quiz) {
      return { isCorrect: false, feedback: 'Invalid quiz configuration' };
    }

    const submittedAnswer = payload.quizInput?.answer?.trim();
    const expectedAnswer = quiz.expectedAnswer?.trim();

    if (!submittedAnswer) {
      return { isCorrect: false, feedback: 'Please provide an answer' };
    }

    if (!expectedAnswer) {
      return { isCorrect: false, feedback: 'Invalid quiz configuration - no expected answer' };
    }

    const config = getValidationConfig(quiz.validation);
    const primaryResult = validateAnswer(submittedAnswer, expectedAnswer, config);

    if (primaryResult.isCorrect) {
      return {
        isCorrect: true,
        feedback: primaryResult.feedback,
        confidence: primaryResult.confidence,
      };
    }

    const acceptableAnswers = config.acceptableAnswers
      .map((answer) => answer.trim())
      .filter((answer) => answer.length > 0);

    for (const acceptable of acceptableAnswers) {
      const result = validateAnswer(submittedAnswer, acceptable, config);
      if (result.isCorrect) {
        return { isCorrect: true, feedback: 'Correct!', confidence: result.confidence };
      }
    }

    return {
      isCorrect: false,
      feedback: primaryResult.feedback,
      confidence: primaryResult.confidence,
    };
  },
};

export { levenshteinDistance, calculateSimilarity, validateAnswer, getValidationConfig };
