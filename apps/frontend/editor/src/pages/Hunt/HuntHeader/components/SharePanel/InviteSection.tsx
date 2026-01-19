import { useState } from 'react';
import { Stack, Typography, TextField, IconButton, InputAdornment, List, ListItem, ListItemText } from '@mui/material';
import { PaperPlaneRightIcon, TrashIcon } from '@phosphor-icons/react';
import { useGetPlayerInvitations, useInvitePlayer, useRevokeInvitation } from '@/api/Hunt';
import { InputLabel } from '@/components/form/core';
import { useSnackbarStore } from '@/stores';

interface InviteSectionProps {
  huntId: number;
}

export const InviteSection = ({ huntId }: InviteSectionProps) => {
  const [email, setEmail] = useState('');
  const { error } = useSnackbarStore();

  const { data: invitations = [] } = useGetPlayerInvitations(huntId);
  const { invitePlayer, isInviting } = useInvitePlayer();
  const { revokeInvitation, isRevoking } = useRevokeInvitation();

  const trimmedEmail = email.trim().toLowerCase();
  const isAlreadyInvited = invitations.some((inv) => inv.email === trimmedEmail);
  const canInvite = Boolean(trimmedEmail) && !isInviting && !isAlreadyInvited;

  const handleInvite = () => {
    if (!trimmedEmail) {
      return;
    }

    if (isAlreadyInvited) {
      error('This email is already invited');

      return;
    }

    invitePlayer(
      { huntId, email: trimmedEmail },
      {
        onSuccess: () => setEmail(''),
        onError: () => error('Failed to invite player'),
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInvite();
    }
  };

  return (
    <Stack p={2} gap={1}>
      <InputLabel>Invite players</InputLabel>
      <TextField
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter email address"
        size="small"
        fullWidth
        disabled={isInviting}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleInvite} disabled={!canInvite}>
                  <PaperPlaneRightIcon size={18} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      {invitations.length === 0 ? (
        <Typography variant="caption" color="text.secondary">
          No players invited yet
        </Typography>
      ) : (
        <List dense disablePadding>
          {invitations.map((invitation) => (
            <ListItem
              key={invitation.email}
              disablePadding
              secondaryAction={
                <IconButton
                  size="small"
                  onClick={() => revokeInvitation({ huntId, email: invitation.email })}
                  disabled={isRevoking}
                >
                  <TrashIcon size={16} />
                </IconButton>
              }
            >
              <ListItemText primary={invitation.email} slotProps={{ primary: { variant: 'body2' } }} />
            </ListItem>
          ))}
        </List>
      )}
    </Stack>
  );
};
