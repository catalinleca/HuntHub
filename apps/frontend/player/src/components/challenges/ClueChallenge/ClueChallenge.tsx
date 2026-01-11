import { Button, Typography, Paper, Stack, Alert } from '@mui/material';
import type { CluePF, AnswerType, AnswerPayload } from '@hunthub/shared';
import { AnswerType as AnswerTypeEnum } from '@hunthub/shared';

interface ClueChallengeProps {
  clue: CluePF;
  onValidate: (answerType: AnswerType, payload: AnswerPayload) => void;
  isValidating: boolean;
  isLastStep: boolean;
  feedback: string | null;
}

export const ClueChallenge = ({ clue, onValidate, isValidating, isLastStep, feedback }: ClueChallengeProps) => {
  const handleContinue = () => {
    onValidate(AnswerTypeEnum.Clue, { clue: {} });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack gap={2}>
        <Typography variant="h5">{clue.title}</Typography>
        <Typography variant="body1" color="text.secondary">
          {clue.description}
        </Typography>
        {feedback && <Alert severity="info">{feedback}</Alert>}
        <Button variant="contained" onClick={handleContinue} disabled={isValidating} size="large">
          {isValidating ? 'Loading...' : isLastStep ? 'Finish Hunt' : 'Continue'}
        </Button>
      </Stack>
    </Paper>
  );
};
