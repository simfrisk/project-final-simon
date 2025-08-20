import styled from "styled-components"
import { Link, useNavigate } from "react-router-dom"
import { MediaQueries } from "../../themes/mediaQueries"
import { Navigation } from "../../global-components/navigation/Navigation"
import { useUserStore } from "../../store/userStore"
import { useState } from "react"

// Define the expected form fields
type SignUpFormElements = HTMLFormElement & {
  email: HTMLInputElement
  name: HTMLInputElement
  password: HTMLInputElement
  role: RadioNodeList
  image: HTMLInputElement
}

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate()
  const { createUser } = useUserStore()

  const [preview, setPreview] = useState<string | null>(null)

  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.target as SignUpFormElements

    if (!form.checkValidity()) {
      form.reportValidity()
      return
    }

    const formData = new FormData()
    formData.append("name", form.name.value)
    formData.append("email", form.email.value)
    formData.append("password", form.password.value)
    formData.append("role", form.role.value)
    if (form.image.files?.[0]) {
      formData.append("image", form.image.files[0])
    }

    const result = await createUser(formData)

    if (result.success) {
      setError(null) // clear any previous errors
      navigate("/library/")
    } else {
      setError(result.message)
    }
  }

  const handlePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
    }
  }

  return (
    <>
      <Navigation />
      <Container>
        <SideContainer />
        <CardContainer>
          <Card>
            <LogoContainer>
              <Logo
                src="/logo2.png"
                alt="Classync logo"
              />
            </LogoContainer>
            <WelcomeMessage>
              <h3>Sign up to get started</h3>
            </WelcomeMessage>

            <form
              onSubmit={handleSubmit}
              noValidate
            >
              <label>
                <span>Full name</span>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  minLength={2}
                  required
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter Email"
                  minLength={4}
                  required
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter Password"
                  minLength={5}
                  required
                />
              </label>

              <RoleGroup>
                <RoleLabel
                  htmlFor="role-teacher"
                  selected={false}
                >
                  <input
                    id="role-teacher"
                    type="radio"
                    name="role"
                    value="teacher"
                    required
                  />
                  Teacher
                </RoleLabel>

                <RoleLabel
                  htmlFor="role-student"
                  selected={false}
                >
                  <input
                    id="role-student"
                    type="radio"
                    name="role"
                    value="student"
                    required
                  />
                  Student
                </RoleLabel>
              </RoleGroup>

              <label>
                <span>Upload profile picture</span>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handlePreview}
                />
              </label>

              {error && <ErrorMessage>{error}</ErrorMessage>}

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  height={80}
                  style={{ marginTop: "10px", borderRadius: "10px" }}
                />
              )}

              <ButtonWrapper>
                <StyledButton type="submit">Sign up</StyledButton>
              </ButtonWrapper>
            </form>

            <LinkContainer>
              <p>Already have an account?</p>
              <StyledLink to="/login">Log in.</StyledLink>
            </LinkContainer>
          </Card>
        </CardContainer>
      </Container>
    </>
  )
}

// STYLED COMPONENTS

const Container = styled.div`
  display: flex;
  justify-content: center;
  height: 94dvh;
  margin-bottom: 40px;
`

const SideContainer = styled.section`
  display: none;
  width: 80%;
  background-image: url("/sideImage2.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: ${({ theme }) => theme.colors.secondary};

  @media ${MediaQueries.biggerSizes} {
    display: block;
  }
`

const CardContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;

  @media ${MediaQueries.biggerSizes} {
    max-width: 2000px;
  }
`

const Card = styled.section`
  display: flex;
  flex-direction: column;
  padding: 20px;
  width: 100%;
  max-width: 600px;
  margin: 64px auto;

  @media ${MediaQueries.biggerSizes} {
    justify-content: center;
    width: 95%;
  }

  input {
    height: 40px;
    background-color: #f6f6f6;
    border: none;
    border-radius: 5px;
    margin: 10px 0;
    width: 100%;
    padding: 10px 10px;
  }
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

const WelcomeMessage = styled.div`
  text-align: center;
  margin: 10px 0 30px 0;
`

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`

const StyledButton = styled.button`
  display: inline-block;
  padding: 10px 20px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  text-decoration: none;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  height: 50px;
  margin: 40px 0;
  text-align: center;
  transition: ease 0.3s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: scale(0.98);
  }
`

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  text-align: center;
  transition: ease 0.3s;

  &:hover {
    color: ${({ theme }) => theme.colors.textHover};
    transform: scale(0.95);
  }

  &:active {
    color: ${({ theme }) => theme.colors.textActive};
  }
`

const LinkContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
`

const RoleGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
`

const RoleLabel = styled.label<{ selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  input[type="radio"] {
    appearance: none;
    width: 16px;
    height: 16px;
    border: 2px solid #999;
    border-radius: 50%;
    outline: none;
    cursor: pointer;
    position: relative;
  }

  input[type="radio"]:checked::before {
    content: "";
    display: block;
    width: 90%;
    height: 90%;
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
    position: absolute;
    top: 1px;
    left: 1px;
  }
`

const ErrorMessage = styled.div`
  color: red;
  margin-bottom: 10px;
  text-align: center;
  font-weight: 500;
`
