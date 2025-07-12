import styled from "styled-components";

export const ExplainSection = () => {
  return (
    <Container>
      <h3>Explainer</h3>
      <ExplainerVideo controls width="600" poster="/Explainer2.png">
        <source src="/video2.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </ExplainerVideo>
    </Container>
  );
};

const Container = styled.div `
margin: 50px 40px;
text-align: center;
`

const ExplainerVideo = styled.video `
  margin: 30px 0;
  width: 100%;
  border-radius: 10px;
`