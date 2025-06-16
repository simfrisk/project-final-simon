import styled from "styled-components";

export const CommentForm = () => {
  return (
    <Container>
      <p>This is a comment. And here is some more text to act as a placeholder. </p>
      <CardFooter>
        <div>
          <p>01:12:24</p>
          <input type="checkbox" />
        </div>
        <select name="Teacher" id="">
          <option value="">Question</option>
          <option value="">Comment</option>
        </select>
        <button>Send</button>
      </CardFooter>
    </Container>
  )
};

const Container = styled.div `
position: sticky;
display: flex;
flex-direction: column;
justify-content: center;
height: 150px;
width: 95%;
border-radius: 10px;
margin: 0 auto;
background-color: #979797;
bottom: 2%;
padding: 10px;
box-shadow: 3px 4px 5px 0px rgba(0, 0, 0, 0.21);
`

const CardFooter = styled.div `
display: flex;
justify-content: space-between;

div {
  display: flex;
}

select {
  background-color: transparent;
  border: none;
  cursor: pointer;
}

button {
  background-color: lightgray;
  border: none;
  padding: 2px 15px;
  border-radius: 5px;
}
`