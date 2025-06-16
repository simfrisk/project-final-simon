import styled from "styled-components";

export const CommentHeader = () => {
  return (
    <Container>
   <h3>Video Title</h3> 
   <div>
   <button>Description</button>
   <button>Comments</button>
   </div>
    </Container>
  )
};

const Container = styled.div `
display: flex;
flex-direction: column;
align-items: center;


  h3, p, button {
    margin: 6px 5px;
    padding: 0;
  }
  
  button {
    background-color: transparent;
    border: none;
  }

  button:hover {
    transform: scale(.95);
  }

  div {
    display: flex;
    column-gap: 12px;
  }
`