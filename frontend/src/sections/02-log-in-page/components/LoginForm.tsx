//#region ----- IMPORTS -----
import React, { useState, useEffect } from "react"
import styled from "styled-components"
import { useNavigate, Link } from "react-router-dom"
import { useUserStore } from "../../../store/userStore"
import { handleLoginSubmit } from "./utils/loginHandleSubmit"

//#endregion

//#region ----- COMPONENT LOGIC -----
export const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoggedIn } = useUserStore()

  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if user is already logged in
  useEffect(() => {
    if (isLoggedIn) navigate("/library")
  }, [isLoggedIn, navigate])

  // Toggle between showing and hiding the password
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev)

  // Handle input field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle form submission using the utility function
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) =>
    handleLoginSubmit(e, formData, login, setError, navigate)

  //#endregion

  //#region ----- RENDERED UI -----
  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
      >
        <FormGroup>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
            aria-required="true"
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="password">Password</label>
          <PasswordWrapper>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              placeholder="Enter Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={1}
              aria-required="true"
            />
            <PasswordToggleButton
              type="button"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              <img
                src={showPassword ? "/icons/visibility_off.svg" : "/icons/visibility_on.svg"}
                alt=""
                width={20}
                height={20}
                aria-hidden="true"
              />
            </PasswordToggleButton>
          </PasswordWrapper>
        </FormGroup>

        {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

        <ButtonWrapper>
          <StyledButton type="submit">Login</StyledButton>
        </ButtonWrapper>

        <StyledLink to="/signUp">Create Account</StyledLink>
      </form>
    </>
  )
}

//#endregion*

//#region ----- STYLED COMPONENTS -----
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;

  label {
    margin-bottom: 5px;
    font-weight: 500;
  }

  input {
    height: 40px;
    width: 100%;
    background-color: #f6f6f6;
    border: none;
    border-radius: 5px;
    padding: 10px;
    box-sizing: border-box;
  }
`

const PasswordWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  input {
    flex: 1;
    width: 100%;
  }
`

const PasswordToggleButton = styled.button`
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
`

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
`

const StyledButton = styled.button`
  padding: 10px 20px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  height: 50px;
  margin: 40px auto;
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
  display: block;
  margin-top: 10px;

  &:hover {
    color: ${({ theme }) => theme.colors.textHover};
    transform: scale(0.95);
  }
`

const ErrorMessage = styled.div`
  color: red;
  text-align: center;
  font-weight: 500;
  margin-bottom: 10px;
`
//#endregion
