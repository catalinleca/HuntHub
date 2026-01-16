import { ValidationMode } from '@hunthub/shared';
import {
  levenshteinDistance,
  calculateSimilarity,
  validateAnswer,
  getValidationConfig,
  QuizInputValidator,
} from '@/features/play/helpers/validators/quiz-input.validator';
import { IStep } from '@/database/types/Step';

describe('QuizInputValidator', () => {
  // ============================================================
  // Levenshtein Distance Algorithm Tests
  // ============================================================
  describe('levenshteinDistance', () => {
    it('should return 0 for identical strings', () => {
      expect(levenshteinDistance('hello', 'hello')).toBe(0);
    });

    it('should return length of non-empty string when other is empty', () => {
      expect(levenshteinDistance('hello', '')).toBe(5);
      expect(levenshteinDistance('', 'world')).toBe(5);
    });

    it('should return 0 for two empty strings', () => {
      expect(levenshteinDistance('', '')).toBe(0);
    });

    it('should calculate correct distance for single character difference', () => {
      expect(levenshteinDistance('cat', 'bat')).toBe(1); // substitution
      expect(levenshteinDistance('cat', 'cats')).toBe(1); // insertion
      expect(levenshteinDistance('cats', 'cat')).toBe(1); // deletion
    });

    it('should calculate correct distance for multiple differences', () => {
      expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
      expect(levenshteinDistance('saturday', 'sunday')).toBe(3);
    });

    it('should handle typos in real words', () => {
      expect(levenshteinDistance('Eiffel Tower', 'Eifel Tower')).toBe(1); // missing 'f'
      expect(levenshteinDistance('Eiffel Tower', 'Eiful Tawer')).toBe(3); // multiple typos
    });
  });

  // ============================================================
  // Calculate Similarity Tests
  // ============================================================
  describe('calculateSimilarity', () => {
    it('should return 1 for identical strings', () => {
      expect(calculateSimilarity('hello', 'hello')).toBe(1);
    });

    it('should return 0 when one string is empty', () => {
      expect(calculateSimilarity('hello', '')).toBe(0);
      expect(calculateSimilarity('', 'world')).toBe(0);
    });

    it('should return 1 for two empty strings', () => {
      expect(calculateSimilarity('', '')).toBe(1);
    });

    it('should return similarity score between 0 and 1', () => {
      const similarity = calculateSimilarity('kitten', 'sitting');
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
    });

    it('should return ~0.92 for Eiffel Tower with one typo', () => {
      const similarity = calculateSimilarity('eiffel tower', 'eifel tower');
      expect(similarity).toBeGreaterThanOrEqual(0.9);
    });

    it('should return lower similarity for more differences', () => {
      const sim1 = calculateSimilarity('eiffel tower', 'eifel tower'); // 1 error
      const sim2 = calculateSimilarity('eiffel tower', 'eiful tawer'); // 3 errors
      expect(sim1).toBeGreaterThan(sim2);
    });
  });

  // ============================================================
  // getValidationConfig Tests
  // ============================================================
  describe('getValidationConfig', () => {
    it('should return defaults when validation is undefined', () => {
      const config = getValidationConfig(undefined);
      expect(config.mode).toBe(ValidationMode.Exact);
      expect(config.caseSensitive).toBe(false);
      expect(config.fuzzyThreshold).toBe(80);
      expect(config.numericTolerance).toBe(0);
      expect(config.acceptableAnswers).toEqual([]);
    });

    it('should use provided values', () => {
      const config = getValidationConfig({
        mode: ValidationMode.Fuzzy,
        caseSensitive: true,
        fuzzyThreshold: 90,
        numericTolerance: 5,
        acceptableAnswers: ['alt1', 'alt2'],
      });
      expect(config.mode).toBe(ValidationMode.Fuzzy);
      expect(config.caseSensitive).toBe(true);
      expect(config.fuzzyThreshold).toBe(90);
      expect(config.numericTolerance).toBe(5);
      expect(config.acceptableAnswers).toEqual(['alt1', 'alt2']);
    });

    it('should use defaults for missing fields', () => {
      const config = getValidationConfig({ mode: ValidationMode.Contains });
      expect(config.mode).toBe(ValidationMode.Contains);
      expect(config.caseSensitive).toBe(false);
      expect(config.fuzzyThreshold).toBe(80);
    });
  });

  // ============================================================
  // validateAnswer - Exact Mode Tests
  // ============================================================
  describe('validateAnswer - exact mode', () => {
    const exactConfig = getValidationConfig({ mode: ValidationMode.Exact });

    it('should pass for exact match', () => {
      const result = validateAnswer('Paris', 'Paris', exactConfig);
      expect(result.isCorrect).toBe(true);
    });

    it('should pass for case-insensitive match (default)', () => {
      const result = validateAnswer('paris', 'Paris', exactConfig);
      expect(result.isCorrect).toBe(true);
    });

    it('should fail for case mismatch when caseSensitive is true', () => {
      const caseSensitiveConfig = getValidationConfig({
        mode: ValidationMode.Exact,
        caseSensitive: true,
      });
      const result = validateAnswer('paris', 'Paris', caseSensitiveConfig);
      expect(result.isCorrect).toBe(false);
    });

    it('should fail for different text', () => {
      const result = validateAnswer('London', 'Paris', exactConfig);
      expect(result.isCorrect).toBe(false);
    });

    it('should fail for partial match', () => {
      const result = validateAnswer('Par', 'Paris', exactConfig);
      expect(result.isCorrect).toBe(false);
    });
  });

  // ============================================================
  // validateAnswer - Contains Mode Tests
  // ============================================================
  describe('validateAnswer - contains mode', () => {
    const containsConfig = getValidationConfig({ mode: ValidationMode.Contains });

    it('should pass when submitted contains expected', () => {
      const result = validateAnswer('The Eiffel Tower', 'Eiffel', containsConfig);
      expect(result.isCorrect).toBe(true);
    });

    it('should pass when expected contains submitted', () => {
      const result = validateAnswer('Eiffel', 'The Eiffel Tower', containsConfig);
      expect(result.isCorrect).toBe(true);
    });

    it('should be case-insensitive by default', () => {
      const result = validateAnswer('the eiffel tower', 'Eiffel', containsConfig);
      expect(result.isCorrect).toBe(true);
    });

    it('should fail when caseSensitive and case differs', () => {
      const caseSensitiveConfig = getValidationConfig({
        mode: ValidationMode.Contains,
        caseSensitive: true,
      });
      const result = validateAnswer('the eiffel tower', 'Eiffel', caseSensitiveConfig);
      expect(result.isCorrect).toBe(false);
    });

    it('should fail when no substring match', () => {
      const result = validateAnswer('London Bridge', 'Eiffel', containsConfig);
      expect(result.isCorrect).toBe(false);
    });
  });

  // ============================================================
  // validateAnswer - Fuzzy Mode Tests
  // ============================================================
  describe('validateAnswer - fuzzy mode', () => {
    const fuzzyConfig = getValidationConfig({
      mode: ValidationMode.Fuzzy,
      fuzzyThreshold: 80,
    });

    it('should pass for exact match', () => {
      const result = validateAnswer('Eiffel Tower', 'Eiffel Tower', fuzzyConfig);
      expect(result.isCorrect).toBe(true);
      expect(result.confidence).toBe(1);
    });

    it('should pass for minor typo (above threshold)', () => {
      // "Eifel Tower" vs "Eiffel Tower" - 1 char difference in 12 chars = ~92% similarity
      const result = validateAnswer('Eifel Tower', 'Eiffel Tower', fuzzyConfig);
      expect(result.isCorrect).toBe(true);
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });

    it('should fail for multiple typos (below threshold)', () => {
      // "Eiful Tawer" vs "Eiffel Tower" - 3+ differences
      const result = validateAnswer('Eiful Tawer', 'Eiffel Tower', fuzzyConfig);
      expect(result.isCorrect).toBe(false);
      expect(result.confidence).toBeLessThan(0.8);
    });

    it('should return confidence score', () => {
      const result = validateAnswer('Eifel Tower', 'Eiffel Tower', fuzzyConfig);
      expect(result.confidence).toBeDefined();
      expect(typeof result.confidence).toBe('number');
    });

    it('should give helpful feedback for close matches', () => {
      // "Eiful Tawer" has ~75% similarity - above 60% (shows similarity) but below 80% (fails)
      const result = validateAnswer('Eiful Tawer', 'Eiffel Tower', fuzzyConfig);
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('similar');
    });

    it('should respect custom threshold', () => {
      const strictConfig = getValidationConfig({
        mode: ValidationMode.Fuzzy,
        fuzzyThreshold: 95,
      });
      // Would pass at 0.8 but fail at 0.95
      const result = validateAnswer('Eifel Tower', 'Eiffel Tower', strictConfig);
      expect(result.isCorrect).toBe(false);
    });

    it('should be case-insensitive by default', () => {
      const result = validateAnswer('eiffel tower', 'Eiffel Tower', fuzzyConfig);
      expect(result.isCorrect).toBe(true);
    });
  });

  // ============================================================
  // validateAnswer - Numeric Range Mode Tests
  // ============================================================
  describe('validateAnswer - numeric-range mode', () => {
    const numericConfig = getValidationConfig({
      mode: ValidationMode.NumericRange,
      numericTolerance: 0,
    });

    it('should pass for exact numeric match', () => {
      const result = validateAnswer('42', '42', numericConfig);
      expect(result.isCorrect).toBe(true);
    });

    it('should pass within tolerance', () => {
      const tolerantConfig = getValidationConfig({
        mode: ValidationMode.NumericRange,
        numericTolerance: 5,
      });
      expect(validateAnswer('40', '42', tolerantConfig).isCorrect).toBe(true);
      expect(validateAnswer('44', '42', tolerantConfig).isCorrect).toBe(true);
      expect(validateAnswer('47', '42', tolerantConfig).isCorrect).toBe(true);
    });

    it('should fail outside tolerance', () => {
      const tolerantConfig = getValidationConfig({
        mode: ValidationMode.NumericRange,
        numericTolerance: 5,
      });
      expect(validateAnswer('48', '42', tolerantConfig).isCorrect).toBe(false);
      expect(validateAnswer('36', '42', tolerantConfig).isCorrect).toBe(false);
    });

    it('should handle decimal numbers', () => {
      const tolerantConfig = getValidationConfig({
        mode: ValidationMode.NumericRange,
        numericTolerance: 0.5,
      });
      expect(validateAnswer('3.14', '3.14159', tolerantConfig).isCorrect).toBe(true);
      expect(validateAnswer('3.5', '3.14159', tolerantConfig).isCorrect).toBe(true);
      expect(validateAnswer('4.0', '3.14159', tolerantConfig).isCorrect).toBe(false);
    });

    it('should handle negative numbers', () => {
      const tolerantConfig = getValidationConfig({
        mode: ValidationMode.NumericRange,
        numericTolerance: 2,
      });
      expect(validateAnswer('-10', '-10', tolerantConfig).isCorrect).toBe(true);
      expect(validateAnswer('-8', '-10', tolerantConfig).isCorrect).toBe(true);
      expect(validateAnswer('-5', '-10', tolerantConfig).isCorrect).toBe(false);
    });

    it('should fail for non-numeric submitted value', () => {
      const result = validateAnswer('not a number', '42', numericConfig);
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('valid number');
    });

    it('should fail for non-numeric expected value', () => {
      const result = validateAnswer('42', 'not a number', numericConfig);
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('configuration');
    });

    it('should give helpful feedback for close misses', () => {
      const tolerantConfig = getValidationConfig({
        mode: ValidationMode.NumericRange,
        numericTolerance: 5,
      });
      const result = validateAnswer('50', '42', tolerantConfig);
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('close');
    });
  });

  // ============================================================
  // Edge Cases
  // ============================================================
  describe('edge cases', () => {
    it('should handle whitespace in answers', () => {
      const exactConfig = getValidationConfig({ mode: ValidationMode.Exact });
      const result = validateAnswer('  Paris  ', 'Paris', exactConfig);
      // Note: trimming happens in QuizInputValidator.validate, not validateAnswer
      // This tests the raw function behavior
      expect(result.isCorrect).toBe(false); // spaces not trimmed in validateAnswer
    });

    it('should fallback to exact mode for unknown mode', () => {
      const config = {
        mode: 'unknown-mode' as ValidationMode,
        caseSensitive: false,
        fuzzyThreshold: 80,
        numericTolerance: 0,
        acceptableAnswers: [],
      };
      const result = validateAnswer('Paris', 'Paris', config);
      expect(result.isCorrect).toBe(true);
    });
  });

  // ============================================================
  // QuizInputValidator Integration Tests
  // ============================================================
  describe('QuizInputValidator.validate', () => {
    const createMockStep = (expectedAnswer: string, validation?: object): IStep => {
      return {
        challenge: {
          quiz: {
            type: 'input',
            expectedAnswer,
            validation,
          },
        },
      } as unknown as IStep;
    };

    it('should return error for missing quiz', async () => {
      const step = { challenge: {} } as unknown as IStep;
      const result = await QuizInputValidator.validate({ quizInput: { answer: 'test' } }, step);
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('Invalid quiz configuration');
    });

    it('should return error for empty answer', async () => {
      const step = createMockStep('Paris');
      const result = await QuizInputValidator.validate({ quizInput: { answer: '' } }, step);
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('provide an answer');
    });

    it('should return error for missing expected answer', async () => {
      const step = { challenge: { quiz: { type: 'input' } } } as unknown as IStep;
      const result = await QuizInputValidator.validate({ quizInput: { answer: 'test' } }, step);
      expect(result.isCorrect).toBe(false);
      expect(result.feedback).toContain('no expected answer');
    });

    it('should trim whitespace from answers', async () => {
      const step = createMockStep('Paris');
      const result = await QuizInputValidator.validate({ quizInput: { answer: '  Paris  ' } }, step);
      expect(result.isCorrect).toBe(true);
    });

    it('should check acceptable answers when primary fails', async () => {
      const step = createMockStep('Paris', {
        mode: ValidationMode.Exact,
        acceptableAnswers: ['City of Light', 'La Ville Lumière'],
      });
      const result = await QuizInputValidator.validate({ quizInput: { answer: 'City of Light' } }, step);
      expect(result.isCorrect).toBe(true);
    });

    it('should fail if neither primary nor acceptable answers match', async () => {
      const step = createMockStep('Paris', {
        mode: ValidationMode.Exact,
        acceptableAnswers: ['City of Light'],
      });
      const result = await QuizInputValidator.validate({ quizInput: { answer: 'London' } }, step);
      expect(result.isCorrect).toBe(false);
    });

    it('should use fuzzy mode for acceptable answers too', async () => {
      const step = createMockStep('Paris', {
        mode: ValidationMode.Fuzzy,
        fuzzyThreshold: 80,
        acceptableAnswers: ['City of Light'],
      });
      // "City of Lght" (missing i) should fuzzy match "City of Light"
      const result = await QuizInputValidator.validate({ quizInput: { answer: 'City of Lght' } }, step);
      expect(result.isCorrect).toBe(true);
    });

    it('should return confidence for fuzzy validation', async () => {
      const step = createMockStep('Eiffel Tower', {
        mode: ValidationMode.Fuzzy,
        fuzzyThreshold: 80,
      });
      const result = await QuizInputValidator.validate({ quizInput: { answer: 'Eifel Tower' } }, step);
      expect(result.isCorrect).toBe(true);
      expect(result.confidence).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });
});
