import styled from 'styled-components';
import type { VideoMedia } from '@hunthub/shared';

const Container = styled.div`
  width: 100%;
`;

const Video = styled.video`
  width: 100%;
  height: auto;
  display: block;
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
