import styled from "styled-components"
import { Link } from "react-router-dom"

//#region ----- STYLED FORM COMPONENTS -----

// Form wrapper - use this to wrap your entire form
export const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`

// Form group - wraps each field (label + input)
export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
  width: 100%;

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

  input,
  textarea {
    height: 40px;
    width: 100%;
    background-color: #f6f6f6;
    border: none;
    border-radius: 5px;
    padding: 10px;
    box-sizing: border-box;
    font-family: inherit;
  }

  textarea {
    height: auto;
    resize: vertical;
    min-height: 80px;
  }
`

// Styled label
export const StyledLabel = styled.label`
  margin-bottom: 5px;
  font-weight: 500;
`

// Styled input
export const StyledInput = styled.input`
  height: 40px;
  width: 100%;
  background-color: #f6f6f6;
  border: none;
  border-radius: 5px;
  padding: 10px;
  box-sizing: border-box;
  font-family: inherit;
`

// Styled textarea
export const StyledTextarea = styled.textarea`
  height: auto;
  width: 100%;
  background-color: #f6f6f6;
  border: none;
  border-radius: 5px;
  padding: 10px;
  box-sizing: border-box;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
`

// Password wrapper for password fields with toggle
export const PasswordWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  input {
    flex: 1;
    width: 100%;
  }
`

// Password toggle button
export const PasswordToggleButton = styled.button`
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 3px;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
  }
`

// Radio button group
export const RadioGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-start;
`

// Radio button label
export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  input[type="radio"] {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #999;
    border-radius: 50%;
    position: relative;
    flex-shrink: 0;
  }

  input[type="radio"]:checked + span::before {
    content: "";
    display: block;
    width: 8px;
    height: 8px;
    background-color: ${({ theme }) => theme.colors.primary};
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  input[type="radio"]:focus + span {
    box-shadow: 0 0 0 3px rgba(100, 150, 250, 0.6);
  }
`

// Button wrapper
export const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`

// Styled button
export const StyledButton = styled.button`
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
  font-family: inherit;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.primaryHover};
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

// Error message
export const ErrorMessage = styled.div`
  color: red;
  margin-bottom: 10px;
  text-align: center;
  font-weight: 500;
  width: 100%;
`

// Styled link
export const StyledLink = styled(Link)`
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

// Link container for multiple links
export const LinkContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  width: 100%;
`

// Image preview
export const PreviewImage = styled.img`
  margin-top: 10px;
  border-radius: 10px;
  height: 80px;
`

//#endregion
