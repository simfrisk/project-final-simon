import styled from "styled-components";
import { MediaQueries } from "../../../../themes/mediaQueries";

export const SideMenu = () => {
  return (
    <>
    <Container>
      <h3>Classes</h3>
      <p>HTML, CSS & JavaScript</p>
      <p>JavaScript & TypeScript</p>
      <p>Accessibility</p>
      <p>React</p>
      <p>Backend with Node.js</p>
    </Container>
    </>
  )
};

const Container = styled.section `
display: flex;
flex-direction: column;
text-align: left;
background-color: ${({ theme }) => theme.colors.background};
display: none;

h3 {
  margin-bottom: 24px;
}

p {
  transition: ease .3s;
}

p:hover {
  transform: scale(.97);
}

@media ${MediaQueries.biggerSizes} {
display: flex;
margin-left: 40px;
}
`