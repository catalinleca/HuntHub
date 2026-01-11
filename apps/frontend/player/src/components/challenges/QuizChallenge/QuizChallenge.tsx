import { useState } from 'react';
import { Button, Typography, Paper, Stack, Alert, RadioGroup, FormControlLabel, Radio, TextField } from '@mui/material';
import type { QuizPF, AnswerType, AnswerPayload } from '@hunthub/shared';
import { AnswerType as AnswerTypeEnum, OptionType } from '@hunthub/shared';

interface QuizChallengeProps {
  quiz: QuizPF;
  onValidate: (answerType: AnswerType, payload: AnswerPayload) => void;
  isValidating: boolean;
  isLastStep: boolean;
  feedback: string | null;
}

export const QuizChallenge = ({ quiz, onValidate, isValidating, isLastStep, feedback }: QuizChallengeProps) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string>('');
  const [inputAnswer, setInputAnswer] = useState<string>('');

  const isChoiceMode = quiz.type === OptionType.Choice;
  const hasAnswer = isChoiceMode ? selectedOptionId !== '' : inputAnswer.trim() !== '';

  const handleSubmit = () => {
    if (!hasAnswer) return;

    if (isChoiceMode) {
      onValidate(AnswerTypeEnum.QuizChoice, { quizChoice: { optionId: selectedOptionId } });
    } else {
      onValidate(AnswerTypeEnum.QuizInput, { quizInput: { answer: inputAnswer.trim() } });
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack gap={2}>
        {quiz.title && <Typography variant="h5">{quiz.title}</Typography>}
        {quiz.description && (
          <Typography variant="body1" color="text.secondary">
            {quiz.description}
          </Typography>
        )}

        {isChoiceMode ? (
          <RadioGroup value={selectedOptionId} onChange={(e) => setSelectedOptionId(e.target.value)}>
            {quiz.options?.map((option) => (
              <FormControlLabel
                key={option.id}
                value={option.id}
                control={<Radio />}
                label={option.text}
                disabled={isValidating}
              />
            ))}
          </RadioGroup>
        ) : (
          <TextField
            fullWidth
            label="Your answer"
            value={inputAnswer}
            onChange={(e) => setInputAnswer(e.target.value)}
            disabled={isValidating}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && hasAnswer && !isValidating) {
                handleSubmit();
              }
            }}
          />
        )}

        {feedback && <Alert severity="info">{feedback}</Alert>}

        <Button variant="contained" onClick={handleSubmit} disabled={isValidating || !hasAnswer} size="large">
          {isValidating ? 'Checking...' : isLastStep ? 'Finish Hunt' : 'Submit Answer'}
        </Button>
      </Stack>
    </Paper>
  );
};
