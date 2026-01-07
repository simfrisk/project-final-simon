import { useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { useBackendStatusStore } from '../store/backendStatusStore'
import { Loader } from '../global-components/loader'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const StatusContainer = styled.div<{ $isError?: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  background: ${props => props.$isError ? '#fee' : '#fff'};
  border: 2px solid ${props => props.$isError ? '#f44' : '#ddd'};
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 350px;
  animation: ${fadeIn} 0.3s ease-out;
`

const StatusText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const StatusTitle = styled.div<{ $isError?: boolean }>`
  font-weight: 600;
  font-size: 14px;
  color: ${props => props.$isError ? '#c00' : '#333'};
`

const StatusMessage = styled.div`
  font-size: 12px;
  color: #666;
`

const LoaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;

  /* Scale down the loader to fit */
  > div {
    transform: scale(0.3);
  }
`

const ErrorIcon = styled.div`
  font-size: 24px;
  color: #f44;
`

interface BackendStatusIndicatorProps {
  autoCheck?: boolean
}

export const BackendStatusIndicator = ({ autoCheck = true }: BackendStatusIndicatorProps) => {
  const { status, isSpinningUp, error, checkBackendHealth } = useBackendStatusStore()

  useEffect(() => {
    if (autoCheck) {
      checkBackendHealth()
    }
  }, [autoCheck, checkBackendHealth])

  // Don't show anything if backend is ready or idle
  if (status === 'ready' || status === 'idle') {
    return null
  }

  const isError = status === 'error'

  return (
    <StatusContainer $isError={isError}>
      {isError ? (
        <ErrorIcon>⚠️</ErrorIcon>
      ) : (
        <LoaderWrapper>
          <Loader />
        </LoaderWrapper>
      )}
      <StatusText>
        <StatusTitle $isError={isError}>
          {isError ? 'Connection Error' : isSpinningUp ? 'Backend Waking Up' : 'Connecting...'}
        </StatusTitle>
        <StatusMessage>
          {isError
            ? error || 'Unable to connect to backend'
            : isSpinningUp
              ? 'This may take up to 60 seconds...'
              : 'Checking server status...'}
        </StatusMessage>
      </StatusText>
    </StatusContainer>
  )
}
