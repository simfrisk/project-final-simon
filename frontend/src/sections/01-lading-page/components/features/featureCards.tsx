import { AFeatureCard } from "./aFeatureCard";
import { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import styled from 'styled-components';

export const FeatureCards = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    <AFeatureCard title="Time Stamps" />,
    <AFeatureCard title="Teachers Page" />,
    <AFeatureCard title="Personal Comments" />,
  ];

  const next = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <Container>

      <Carousel
        selectedItem={currentSlide}
        onChange={setCurrentSlide}
        showThumbs={false}
        infiniteLoop
        showArrows={false}
        showStatus={false}
        showIndicators={true}
        swipeable={true}
        emulateTouch={true}
        dynamicHeight={false}
        renderIndicator={(
          onClickHandler: React.MouseEventHandler<HTMLLIElement>, 
          isSelected: boolean,
          index: number) => (
          <Dot
            key={index}
            onClick={onClickHandler}
            $active={isSelected}
            aria-label={`Slide ${index + 1}`}
            title={`Slide ${index + 1}`}
          />
        )}
      >
        {slides.map((slide, index) => (
          <CardContainer key={index}>
            {slide}
          </CardContainer>
        ))}
      </Carousel>

      <Controls>
        <button onClick={prev}>Prev</button>
        <button onClick={next}>Next</button>
      </Controls>
    </Container>
  );
};

const Container = styled.div `
margin: 20px 0;
display: flex;
flex-direction: column;
`

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 15px;
  margin: 15px 0 30px 0;

`;

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;

  button {
    padding: 6px 12px;
    border-radius: 10px;
    background-color: ${({theme}) => theme.colors.primary};
    color: ${({theme}) => theme.colors.offBackground};
    border: none;
    cursor: pointer;
  }
`;

const Dot = styled.li<{ $active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 0 6px;
  transform: translateY(5px);
  background-color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : '#ccc'};
  display: inline-block;
  cursor: pointer;
`;