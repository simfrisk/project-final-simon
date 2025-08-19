import styled from "styled-components"

export const ChooseClassMessage = () => {
  return (
    <Container>
      <h2>Please choose a class from the sidebar.</h2>
    </Container>
  )
}

const Container = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`
