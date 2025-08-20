import styled from "styled-components"

export const SignUpHeader = () => {
  return (
    <>
      <LogoContainer>
        <Logo
          src="/logo2.png"
          alt="Classync Logo"
        />
      </LogoContainer>

      <header>
        <h2 id="signup-heading">Sign up to get started</h2>
      </header>
    </>
  )
}

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
