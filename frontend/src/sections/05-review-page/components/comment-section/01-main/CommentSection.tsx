import styled from 'styled-components';

export const CommentSection = () => {
  return (
    <>
    <CommentListContainer>

      <Card>
        <ImageContainer>
         <img src="/SImon1.jpg" alt="Profile img" />
        </ImageContainer>
        <div>

          <CardHeader>
          <p>Simon Frisk</p>
          <p>&middot;</p>
          <p>5 min ago</p>
          </CardHeader>

          <CardMain>
           <p>I don’t really understand why all the components needs to be capitalised? Why is this?</p>
          </CardMain>

          <CardFooter>
            <button>Replay</button>
            <button>Like</button>
          </CardFooter>

        </div>
      </Card>


      <Card>
        <ImageContainer>
         <img src="/SImon1.jpg" alt="Profile img" />
        </ImageContainer>
        <div>

          <CardHeader>
          <p>Simon Frisk</p>
          <p>&middot;</p>
          <p>5 min ago</p>
          </CardHeader>

          <CardMain>
           <p>I don’t really understand why all the components needs to be capitalised? Why is this?</p>
          </CardMain>

          <CardFooter>
            <button>Replay</button>
            <button>Like</button>
          </CardFooter>

        </div>
      </Card>
      
      <Card>
        <ImageContainer>
         <img src="/SImon1.jpg" alt="Profile img" />
        </ImageContainer>
        <div>

          <CardHeader>
          <p>Simon Frisk</p>
          <p>&middot;</p>
          <p>5 min ago</p>
          </CardHeader>

          <CardMain>
           <p>I don’t really understand why all the components needs to be capitalised? Why is this?</p>
          </CardMain>

          <CardFooter>
            <button>Replay</button>
            <button>Like</button>
          </CardFooter>

        </div>
      </Card>


    </CommentListContainer>
    </>
  )
};

const CommentListContainer = styled.div `
display: flex;
flex-direction: column;
height: 600px;
width: 100%;
background-color: #d2d2d2;
`

const Card = styled.div `
display: flex;
flex-direction: row;
height: 180px;
width: 100%;
background-color: gray;
border-bottom: solid black 1px;
align-items: center;
cursor: pointer;

button {
  background-color: transparent;
  border: none;
}
`

const ImageContainer = styled.div `
height: 50px;
width: 50px;
border-radius: 50px;

img {
  object-fit: cover;
  height: 100%;
  border-radius: 50px;
}
`

const CardHeader = styled.div `
display: flex;
column-gap: 10px;
`

const CardMain = styled.div `
display: flex;
`

const CardFooter = styled.div `
display: flex;
justify-content: space-between;
`