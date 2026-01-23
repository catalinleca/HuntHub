import { Stack, Typography } from '@mui/material';
import { MapPinIcon } from '@phosphor-icons/react';
import { getColor } from '@hunthub/compass';
import * as S from '../LoginPage.styles';

export const LoginHeader = () => (
  <Stack alignItems="center" gap={3}>
    <S.IconCircle alignItems="center" justifyContent="center">
      <MapPinIcon size={32} weight="fill" color={getColor('common.white')} />
    </S.IconCircle>
    <Stack alignItems="center" gap={1}>
      <Typography variant="h4" fontWeight={700}>
        Almost there!
      </Typography>
      <Typography variant="smRegular" color="text.secondary">
        Sign in to start creating your adventure
      </Typography>
    </Stack>
  </Stack>
);
