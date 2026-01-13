import styled from 'styled-components';
import { Box } from '@mui/material';
import type { VideoMedia } from '@hunthub/shared';

const Container = styled(Box)`
  width: 100%;
  border-radius: ${({ theme }) => theme.shape.md}px;
  overflow: hidden;
`;

const Video = styled.video`
  width: 100%;
  height: auto;
  display: block;
  max-height: 280px;
`;

interface VideoPlayerProps {
  video: VideoMedia;
}

export const VideoPlayer = ({ video }: VideoPlayerProps) => {
  return (
    <Container>
      <Video src={video.asset.url} controls preload="metadata" />
    </Container>
  );
};
