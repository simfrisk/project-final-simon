//#region ----- IMPORTS -----
import React, { useState } from "react"
import styled from "styled-components"
import { Link, useNavigate } from "react-router-dom"
import { useUserStore } from "../../../store/userStore"
import { handleSignUpSubmit } from "./utils/signUpHandleSubmit"
//#endregion

//#region ----- COMPONENT LOGIC -----
export const SignUpForm: React.FC = () => {
  const navigate = useNavigate()
  const { createUser } = useUserStore()

  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePreview = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) =>
    handleSignUpSubmit(e, createUser, setError, navigate)

  //#endregion

  //#region ----- RENDERED UI -----
  return (
    <>
      <form
        onSubmit={handleSubmit}
        noValidate
        aria-describedby="form-error"
      >
        <FormGroup>
          <label htmlFor="fullName">Full name</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="Enter full name"
            minLength={2}
            maxLength={100}
            required
            aria-required="true"
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter Email"
            minLength={4}
            maxLength={100}
            required
            aria-required="true"
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter Password"
            minLength={5}
            required
            aria-required="true"
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="profileImage">Upload profile picture</label>
          <input
            type="file"
            id="profileImage"
            name="profileImage"
            accept="image/*"
            onChange={handlePreview}
            aria-describedby={preview ? "image-preview" : undefined}
          />
        </FormGroup>

        {/* <FormGroup>
          <label htmlFor="role-teacher">Role</label>
          <RoleGroup>
            <RoleLabel htmlFor="role-teacher">
              <input
                id="role-teacher"
                type="radio"
                name="role"
                value="teacher"
                required
              />
              <span></span>
              Teacher
            </RoleLabel>

            <RoleLabel htmlFor="role-student">
              <input
                id="role-student"
                type="radio"
                name="role"
                value="student"
                required
              />
              <span></span>
              Student
            </RoleLabel>
          </RoleGroup>
        </FormGroup> */}

        {error && <ErrorMessage id="form-error">{error}</ErrorMessage>}
        {preview && (
          <PreviewImage
            src={preview}
            alt="Profile preview"
            id="image-preview"
          />
        )}

        <ButtonWrapper>
          <StyledButton type="submit">Sign up</StyledButton>
        </ButtonWrapper>

        <LinkContainer>
          <p>Already have an account?</p>
          <StyledLink to="/login">Log in</StyledLink>
        </LinkContainer>
      </form>
    </>
  )
}
//#endregion

//#region ----- STYLED COMPONENTS -----
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;

  label {
    margin-bottom: 5px;
    font-weight: 500;
  }

  /* Dynamic required/optional labels using CSS */
  label:has(+ input:required)::after {
    content: " *";
    color: red;
  }

  label:has(+ input:optional)::after {
    content: " (optional)";
    color: gray;
    font-size: 0.9em;
  }

  label:has(+ div input[type="radio"]:required)::after {
    content: " *";
    color: red;
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
  margin: 20px 0;
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

const ErrorMessage = styled.div`
  color: red;
  margin-bottom: 10px;
  text-align: center;
  font-weight: 500;
`

const PreviewImage = styled.img`
  margin-top: 10px;
  border-radius: 10px;
  height: 80px;
`
//#endregion
