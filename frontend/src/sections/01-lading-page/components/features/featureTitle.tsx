import styled from "styled-components";

export const FeatureTitle = () => {
  return (
    <Container>
      <h2>Classync 101</h2>
      <p>Take control of your coments with timestamps to keep everything organized and easy to find and remember. Whether you’re reviewing lessons or giving feedback, it’s all clear, trackable, and right where you need it.</p>
    </Container>
  )
}; 

const Container = styled.div `

  h2 {
    margin: 15px 0; 
  }
`