import styled from 'styled-components';

type PlayPauseButtonProps = {
  isPlaying: boolean;
  onClick: () => void;
};

export const PlayPauseButton = ({ isPlaying, onClick }: PlayPauseButtonProps) => {
  return (
    <Button onClick={onClick} className={isPlaying ? 'button--active' : ''}>
      <div className="button__shape button__shape--one" />
      <div className="button__shape button__shape--two" />
    </Button>
  );
};


// Styled Components
const Button = styled.div`
  width: 40px;   /* was 80px */
  height: 40px;  /* was 80px */
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  transition: border-color 0.3s ease;

  .button__shape {
    width: 9px;    /* was 18px */
    height: 25px;  /* was 50px */
    background: white;
    transition: 0.3s ease-in-out;

    &--one {
      clip-path: polygon(0 0, 100% 25%, 100% 75%, 0% 100%);
      transform: translateX(2px); /* was 4px */
    }

    &--two {
      clip-path: polygon(0 25%, 100% 50%, 100% 50%, 0 75%);
      transform: translateX(1.95px); /* was 3.9px */
    }
  }

  &.button--active {
    .button__shape {
      &--one {
        clip-path: polygon(0 15%, 50% 15%, 50% 85%, 0% 85%);
        transform: translateX(0px);
      }

      &--two {
        clip-path: polygon(50% 15%, 100% 15%, 100% 85%, 50% 85%);
        transform: translateX(0px);
      }
    }
  }
`;