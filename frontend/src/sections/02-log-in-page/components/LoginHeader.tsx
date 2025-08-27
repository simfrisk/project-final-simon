import styled from "styled-components"

export const LoginHeader = () => {
  return (
    <Header>
      <Logo
        src="/logo2.webp"
        alt="Classync logo"
      />

      <WelcomeMessage id="login-heading">
        <Title>Welcome</Title>
        <p>Nice to have you back.</p>
      </WelcomeMessage>
    </Header>
  )
}

/* Header / Logo */
const Header = styled.header`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`

const Logo = styled.img`
  height: 150px;
  width: 150px;
  border-radius: 20px;
  margin-left: 15px;
`

/* Welcome message */
const WelcomeMessage = styled.div`
  text-align: center;
  margin: 10px 0 30px 0;
`

const Title = styled.h1`
  font-size: 32px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 20px;
  color: ${({ theme }) => theme.colors.text};
`
