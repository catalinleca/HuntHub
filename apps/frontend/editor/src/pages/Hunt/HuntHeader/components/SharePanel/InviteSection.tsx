import { useState } from 'react';
import { Stack, Typography, TextField, IconButton, InputAdornment, List, ListItem, ListItemText } from '@mui/material';
import { PaperPlaneRightIcon, TrashIcon } from '@phosphor-icons/react';
import { useGetPlayerInvitations, useInvitePlayer, useRevokeInvitation } from '@/api/Hunt';
import { InputLabel } from '@/components/form/core';

interface InviteSectionProps {
  huntId: number;
}

export const InviteSection = ({ huntId }: InviteSectionProps) => {
  const [email, setEmail] = useState('');

  const { data: invitations = [] } = useGetPlayerInvitations(huntId);
  const { mutate: invitePlayer, isPending: isInviting } = useInvitePlayer();
  const { mutate: revokeInvitation } = useRevokeInvitation();

  const handleInvite = () => {
    if (!email.trim()) {
      return;
    }
    invitePlayer({ huntId, email: email.trim() }, { onSuccess: () => setEmail('') });
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
                <IconButton size="small" onClick={handleInvite} disabled={!email.trim() || isInviting}>
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
                <IconButton size="small" onClick={() => revokeInvitation({ huntId, email: invitation.email })}>
                  <TrashIcon size={16} />
                </IconButton>
              }
            >
              <ListItemText primary={invitation.email} primaryTypographyProps={{ variant: 'body2' }} />
            </ListItem>
          ))}
        </List>
      )}
    </Stack>
  );
};
