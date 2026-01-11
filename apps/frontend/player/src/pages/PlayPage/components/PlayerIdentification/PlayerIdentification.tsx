import React, { useState } from 'react';
import { TextField, Button, Typography } from '@mui/material';
import * as S from './PlayerIdentification.styles';

interface PlayerIdentificationProps {
  onSubmit: (playerName: string, email?: string) => void;
  isLoading?: boolean;
}

export const PlayerIdentification = ({ onSubmit, isLoading = false }: PlayerIdentificationProps) => {
  const [playerName, setPlayerName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      return;
    }

    onSubmit(playerName.trim(), email.trim() || undefined);
  };

  return (
    <S.Container>
      <S.Card>
        <Typography variant="h5" gutterBottom>
          Ready to Play?
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Enter your name to start the adventure
        </Typography>

        <S.Form onSubmit={handleSubmit}>
          <TextField
            label="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
            fullWidth
            autoFocus
            disabled={isLoading}
          />

          <TextField
            label="Email (optional)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            disabled={isLoading}
            helperText="For saving progress across devices"
          />

          <Button type="submit" variant="contained" size="large" fullWidth disabled={!playerName.trim() || isLoading}>
            {isLoading ? 'Starting...' : 'Start Hunt'}
          </Button>
        </S.Form>
      </S.Card>
    </S.Container>
  );
};
