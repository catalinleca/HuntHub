import React, { useState } from 'react';
import { TextField, Button, Typography, InputLabel, Stack, Alert } from '@mui/material';
import * as S from './PlayerIdentification.styles';

interface PlayerIdentificationProps {
  onSubmit: (playerName: string, email?: string) => void;
  isLoading?: boolean;
  requireEmail?: boolean;
  error?: string | null;
}

export const PlayerIdentification = ({
  onSubmit,
  isLoading = false,
  requireEmail = false,
  error = null,
}: PlayerIdentificationProps) => {
  const [playerName, setPlayerName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      return;
    }
    if (requireEmail && !email.trim()) {
      return;
    }

    onSubmit(playerName.trim(), email.trim() || undefined);
  };

  const isSubmitDisabled = !playerName.trim() || (requireEmail && !email.trim()) || isLoading;

  return (
    <S.Container>
      <S.Card>
        <Typography variant="h5" gutterBottom>
          Ready to Play?
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {requireEmail
            ? 'This hunt is invite-only. Enter your details to continue.'
            : 'Enter your name to start the adventure'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <S.Form onSubmit={handleSubmit}>
          <Stack gap={1}>
            <InputLabel>Your Name</InputLabel>
            <TextField
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              required
              fullWidth
              autoFocus
              disabled={isLoading}
            />
          </Stack>

          <Stack gap={1}>
            <InputLabel>{requireEmail ? 'Email' : 'Email (optional)'}</InputLabel>
            <TextField
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              fullWidth
              required={requireEmail}
              disabled={isLoading}
              helperText={requireEmail ? 'Required to verify your invitation' : 'For saving progress across devices'}
            />
          </Stack>

          <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitDisabled}>
            {isLoading ? 'Starting...' : 'Start Hunt'}
          </Button>
        </S.Form>
      </S.Card>
    </S.Container>
  );
};
