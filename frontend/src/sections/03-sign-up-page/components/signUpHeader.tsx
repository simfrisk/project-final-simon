import styled from "styled-components"

export const SignUpHeader = () => {
  return (
    <>
      <header>
        <Title id="signup-heading">Sign up to get started</Title>
      </header>
    </>
  )
}

const Title = styled.h1`
  font-size: 28px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.text};
`
