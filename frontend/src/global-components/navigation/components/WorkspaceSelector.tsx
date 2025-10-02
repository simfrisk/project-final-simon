import React, { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import styled from "styled-components"
import { useWorkspaceStore } from "../../../store/workspaceStore"
import { useUserStore } from "../../../store/userStore"
import { spacing } from "../../../themes/spacing"
import { MediaQueries } from "../../../themes/mediaQueries"

interface WorkspaceSelectorProps {
  onClose: () => void
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { workspaces, fetchUserWorkspaces } = useWorkspaceStore()
  const { user, setUserWorkspace } = useUserStore()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadUserWorkspaces = async () => {
      setIsLoading(true)
      try {
        await fetchUserWorkspaces()
      } catch (error) {
        console.error("Failed to load user workspaces:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserWorkspaces()
  }, [fetchUserWorkspaces])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [onClose])

  const handleWorkspaceSelect = (workspaceId: string) => {
    setUserWorkspace(workspaceId)
    onClose()
  }

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownHeader>
        <DropdownTitle>Select Workspace</DropdownTitle>
        <CloseButton
          onClick={onClose}
          aria-label="Close workspace selector"
        >
          ×
        </CloseButton>
      </DropdownHeader>

      <DropdownContent>
        {isLoading ? (
          <LoadingText>Loading workspaces...</LoadingText>
        ) : (
          <>
            {workspaces.length === 0 ? (
              <EmptyText>No workspaces found</EmptyText>
            ) : (
              <WorkspaceList>
                {workspaces.map((workspace) => (
                  <WorkspaceItem
                    key={workspace._id}
                    $isActive={workspace._id === user?.workspaceId}
                    onClick={() => handleWorkspaceSelect(workspace._id)}
                  >
                    <WorkspaceName>{workspace.name}</WorkspaceName>
                    {workspace._id === user?.workspaceId && <CurrentIndicator>✓</CurrentIndicator>}
                  </WorkspaceItem>
                ))}
              </WorkspaceList>
            )}
          </>
        )}
      </DropdownContent>

      <DropdownFooter>
        <DropdownLink to="/admin/users">
          <ProfileIcon>👤</ProfileIcon>
          User Profile
        </DropdownLink>
      </DropdownFooter>
    </DropdownContainer>
  )
}

const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  box-shadow: 0 4px 20px ${({ theme }) => theme.colors.boxShadow};
  min-width: 280px;
  z-index: 1000;
  margin-top: ${spacing.sm};
  overflow: hidden;

  @media ${MediaQueries.mobile} {
    min-width: 260px;
    right: -10px;
  }
`

const DropdownHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`

const DropdownTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};

  @media ${MediaQueries.mobile} {
    font-size: 15px;
  }
`

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.textAlternative};
  cursor: pointer;
  padding: ${spacing.xs};
  line-height: 1;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.backgroundHover};
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`

const DropdownContent = styled.div`
  padding: ${spacing.sm} 0;
  max-height: 300px;
  overflow-y: auto;
`

const LoadingText = styled.div`
  padding: ${spacing.md};
  text-align: center;
  color: ${({ theme }) => theme.colors.textAlternative};
  font-size: 14px;
`

const EmptyText = styled.div`
  padding: ${spacing.md};
  text-align: center;
  color: ${({ theme }) => theme.colors.textAlternative};
  font-size: 14px;
`

const WorkspaceList = styled.div`
  display: flex;
  flex-direction: column;
`

const WorkspaceItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.sm} ${spacing.md};
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.lightGray : "transparent"};
  border-radius: 6px;
  margin: 0 ${spacing.sm};

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGrayHover};
    transform: scale(0.99);
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.lightGrayActive};
    transform: scale(0.97);
  }
`

const WorkspaceName = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`

const CurrentIndicator = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  font-size: 16px;
`

const DropdownFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: ${spacing.sm} ${spacing.md};
`

const DropdownLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${spacing.sm};
  padding: ${spacing.sm};
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGrayHover};
    color: ${({ theme }) => theme.colors.textHover};
    text-decoration: none;
    transform: scale(0.99);
  }

  &:focus {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.lightGrayActive};
    transform: scale(0.97);
  }
`

const ProfileIcon = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.primary};
`
