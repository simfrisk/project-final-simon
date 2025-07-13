import styled from "styled-components";
import { MediaQueries } from "../../../../themes/mediaQueries";

export const SideMenu = () => {
  return (
    <>
    <Container>
      <h3>Classes</h3>
      <p>Project</p>
      <p>Project</p>
      <p>Project</p>
      <p>Project</p>
      <p>Project</p>
    </Container>
    </>
  )
};

const Container = styled.section `
display: flex;
flex-direction: column;
align-items: center;
min-width: 12%;
background-color: ${({ theme }) => theme.colors.background};
display: none;

@media ${MediaQueries.biggerSizes} {
display: flex;
}
`