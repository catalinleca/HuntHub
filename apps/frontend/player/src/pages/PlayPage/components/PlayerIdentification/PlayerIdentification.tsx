import React, { useState } from 'react';
import { TextField, Button, Typography, InputLabel, Stack } from '@mui/material';
import hedgehuntLogo from '@/assets/hedgehunt-logo.svg';
import * as S from './PlayerIdentification.styles';

interface PlayerIdentificationProps {
  onSubmit: (playerName: string, email?: string) => void;
  isLoading?: boolean;
}

export const PlayerIdentification = ({ onSubmit }: PlayerIdentificationProps) => {
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
        <S.LogoCircle>
          <S.Logo src={hedgehuntLogo} alt="HedgeHunt" />
        </S.LogoCircle>
        <Stack gap={1}>
          <Typography variant="displayH4" color="primary.main">
            Ready to Play?
          </Typography>
          <Typography variant="displayBody2" color="text.secondary">
            Enter your name to start the adventure
          </Typography>
        </Stack>

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
            />
          </Stack>

          <Stack gap={1}>
            <InputLabel>Email (optional)</InputLabel>
            <TextField
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              fullWidth
              helperText="For saving progress across devices"
            />
          </Stack>

          <Button type="submit" variant="contained" size="large" fullWidth disabled={!playerName.trim()}>
            Start Hunt
          </Button>
        </S.Form>
      </S.Card>
    </S.Container>
  );
};
