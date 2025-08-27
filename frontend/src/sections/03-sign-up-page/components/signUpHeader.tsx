import styled from "styled-components"

export const SignUpHeader = () => {
  return (
    <>
      <LogoContainer>
        <Logo
          src="/logo2.webp"
          alt="Classync Logo"
        />
      </LogoContainer>

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

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
`

const Logo = styled.img`
  height: 150px;
  width: 150px;
  border-radius: 20px;
  margin-left: 15px;
`
