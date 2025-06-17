import styled from 'styled-components';

export const VideoSection = () => {
  return (
    <Container>
      <StyledVideo controls>
        <source src="path-to-video.mp4" type="video/mp4" />
      </StyledVideo>
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
`;

const StyledVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;