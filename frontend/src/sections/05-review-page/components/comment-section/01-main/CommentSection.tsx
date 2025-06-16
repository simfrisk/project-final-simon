import styled from 'styled-components';

export const CommentSection = () => {
  return (
    <>
    <CommentListContainer>
      <Card>
        <div>
         <img src="./SImon1.jpg" alt="Profile img" />
        </div>
        <div>

          <div>
          <p>Simon Frisk</p>
          <p>.</p>
          <p>5 min ago</p>
          </div>

          <div>
           <p>I don’t really understand why all the components needs to be capitalised? Why is this?</p>
          </div>

          <div>
            <button>Replay</button>
            <button>Like</button>
          </div>

        </div>
      </Card>
    </CommentListContainer>
    </>
  )
};

const CommentListContainer = styled.div `
display: flex;
height: 600px;
width: 100%;
background-color: #d2d2d2;
`

const Card = styled.div `
display: flex;
flex-direction: row;
height: 100px;
width: 100%;
background-color: gray;
border-bottom: solid black 1px;
`