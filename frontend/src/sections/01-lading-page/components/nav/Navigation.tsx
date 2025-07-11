import styled from "styled-components";

export const Navigation = () => {
  return (
    <>
    <Container>
      <p>Classync</p>
      <div>
        <p>Burger</p>
      </div>
    </Container>
    </>
  )
};

const Container = styled.nav `
background-color: #3e75d3;
height: 60px;
width: 100%;
display: flex;
justify-content: space-between;
padding: 20px;
align-items: center;
`