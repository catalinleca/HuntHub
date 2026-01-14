import styled from 'styled-components';
import { Box } from '@mui/material';
import type { AudioMedia } from '@hunthub/shared';

const Container = styled(Box)`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(1)};
  background-color: ${({ theme }) => theme.palette.grey[50]};
  border-radius: ${({ theme }) => theme.shape.md}px;
`;

const Audio = styled.audio`
  width: 100%;
  height: 40px;
`;

interface AudioPlayerProps {
  audio: AudioMedia;
}

export const AudioPlayer = ({ audio }: AudioPlayerProps) => {
  return (
    <Container>
      <Audio src={audio.asset.url} controls preload="metadata" />
    </Container>
  );
};
