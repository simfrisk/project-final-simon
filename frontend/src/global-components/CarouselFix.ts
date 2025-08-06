import { createGlobalStyle } from 'styled-components';

export const CarouselFix = createGlobalStyle`
  /* Target the individual slide elements */
  .carousel .slide {
    border-radius: 10px;
    overflow: hidden;
  }

  /* Optionally remove outline if focused */
  .carousel .slide:focus {
    outline: none;
  }
`;