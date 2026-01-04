import { config } from 'dotenv';
import path from 'path';

// Load env BEFORE other imports
config({ path: path.resolve(__dirname, '../.env.local') });

import mongoose from 'mongoose';
import { databaseUrl } from '../src/config/env.config';
import { StepModel } from '../src/database/models';

// Combined type that covers both old and new formats
interface QuizData {
  title?: string;
  description?: string;
  type?: 'choice' | 'input';
  // Old format fields
  target?: { id: string; text: string };
  distractors?: Array<{ id: string; text: string }>;
  displayOrder?: string[];
  // New format fields
  options?: Array<{ id: string; text: string }>;
  targetId?: string;
  // Common fields
  randomizeOrder?: boolean;
  validation?: unknown;
}

interface ChallengeData {
  quiz?: QuizData;
  clue?: unknown;
  mission?: unknown;
  task?: unknown;
}

async function migrateQuizSchema() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(databaseUrl);
    console.log('Connected to MongoDB');

    // Find all quiz steps
    const quizSteps = await StepModel.find({ type: 'quiz' });
    console.log(`Found ${quizSteps.length} quiz steps to check`);

    let migratedCount = 0;
    let skippedCount = 0;
    let inputTypeCount = 0;

    for (const step of quizSteps) {
      const challenge = step.challenge as ChallengeData | undefined;
      const quiz = challenge?.quiz;

      if (!quiz) {
        console.log(`  Step ${step.stepId}: No quiz data, skipping`);
        skippedCount++;
        continue;
      }

      // Already migrated - has options array
      if (quiz.options && Array.isArray(quiz.options) && quiz.options.length > 0) {
        console.log(`  Step ${step.stepId}: Already migrated (has options), skipping`);
        skippedCount++;
        continue;
      }

      // Input type - keep target, no migration needed
      if (quiz.type === 'input') {
        console.log(`  Step ${step.stepId}: Input type (uses target.text), no changes needed`);
        inputTypeCount++;
        continue;
      }

      // Choice type with old format - needs migration
      if (quiz.type === 'choice' && (quiz.target || quiz.distractors)) {
        const allOptions = [
          quiz.target,
          ...(quiz.distractors || []),
        ].filter((o): o is { id: string; text: string } => Boolean(o));

        // Respect displayOrder if present
        let orderedOptions = allOptions;
        if (quiz.displayOrder && quiz.displayOrder.length > 0) {
          orderedOptions = quiz.displayOrder
            .map((id) => allOptions.find((o) => o.id === id))
            .filter((o): o is { id: string; text: string } => Boolean(o));
        }

        const newQuiz: QuizData = {
          title: quiz.title,
          description: quiz.description,
          type: quiz.type,
          options: orderedOptions,
          targetId: quiz.target?.id,
          randomizeOrder: quiz.randomizeOrder,
          validation: quiz.validation,
        };

        // Remove undefined fields
        Object.keys(newQuiz).forEach((key) => {
          if (newQuiz[key as keyof QuizData] === undefined) {
            delete newQuiz[key as keyof QuizData];
          }
        });

        step.challenge = { quiz: newQuiz };
        await step.save();

        console.log(
          `  Step ${step.stepId}: Migrated (${orderedOptions.length} options, targetId: ${quiz.target?.id})`,
        );
        migratedCount++;
      } else {
        console.log(`  Step ${step.stepId}: Unknown format, skipping`);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('Migration Complete');
    console.log('='.repeat(50));
    console.log(`  Total quiz steps:  ${quizSteps.length}`);
    console.log(`  Migrated:          ${migratedCount}`);
    console.log(`  Input type (ok):   ${inputTypeCount}`);
    console.log(`  Skipped:           ${skippedCount}`);
    console.log('='.repeat(50));

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
}

migrateQuizSchema();
