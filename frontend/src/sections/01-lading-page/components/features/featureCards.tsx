import { AFeatureCard } from "./aFeatureCard"
import { useState } from "react"
import { Carousel } from "react-responsive-carousel"
import "react-responsive-carousel/lib/styles/carousel.min.css"
import styled from "styled-components"
import { spacing } from "../../../../themes/spacing"
import { MediaQueries } from "../../../../themes/mediaQueries"

export const FeatureCards = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Calculate which card should be active based on current image
  const activeCardIndex = currentImageIndex % 3

  const slides = [
    <AFeatureCard
      title="Time Stamps"
      isActive={0 === activeCardIndex}
    />,
    <AFeatureCard
      title="Teachers Page"
      isActive={1 === activeCardIndex}
    />,
    <AFeatureCard
      title="Personal Comments"
      isActive={2 === activeCardIndex}
    />,
  ]

  // Images for desktop carousel
  const images = ["/commentTag.webp", "/teachersTag.webp", "/personalCommentsTag.webp"]

  const next = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  const handleCardClick = (cardIndex: number) => {
    setCurrentImageIndex(cardIndex)
  }

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length)
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)

  return (
    <>
      <Container>
        {/* Desktop: Images that carousel when clicking on cards */}
        <DesktopContainer>
          <CardsContainer aria-label="Feature selection cards">
            {slides.map((slide, index) => (
              <ClickableCardContainer
                key={index}
                onClick={() => handleCardClick(index)}
                aria-label={`Select ${["Time Stamps", "Teachers Page", "Personal Comments"][index]} feature`}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleCardClick(index)
                  }
                }}
              >
                {slide}
              </ClickableCardContainer>
            ))}
          </CardsContainer>

          <ImageCarousel
            role="region"
            aria-label="Feature demonstration images"
            aria-describedby="image-description"
          >
            <img
              src={images[currentImageIndex]}
              alt={`${["Time Stamps", "Teachers Page", "Personal Comments"][currentImageIndex]} feature demonstration`}
            />
            <ImageControls>
              <button
                onClick={prevImage}
                aria-label="Previous feature image"
                aria-describedby="image-description"
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                aria-label="Next feature image"
                aria-describedby="image-description"
              >
                ›
              </button>
            </ImageControls>
            <div
              id="image-description"
              aria-hidden="true"
            >
              {`Showing ${["Time Stamps", "Teachers Page", "Personal Comments"][currentImageIndex]} feature demonstration`}
            </div>
          </ImageCarousel>
        </DesktopContainer>

        {/* Mobile: Only card carousel */}
        <MobileContainer>
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
            aria-label="Feature cards carousel"
            renderIndicator={(
              onClickHandler: React.MouseEventHandler<HTMLLIElement>,
              isSelected: boolean,
              index: number
            ) => (
              <Dot
                key={index}
                onClick={onClickHandler}
                $active={isSelected}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={isSelected ? "true" : "false"}
                title={`Slide ${index + 1}`}
              />
            )}
          >
            {slides.map((slide, index) => (
              <CardContainer key={index}>{slide}</CardContainer>
            ))}
          </Carousel>

          <Controls>
            <button
              onClick={prev}
              aria-label="Previous feature card"
            >
              Prev
            </button>
            <button
              onClick={next}
              aria-label="Next feature card"
            >
              Next
            </button>
          </Controls>
        </MobileContainer>
      </Container>
    </>
  )
}

const Container = styled.div`
  margin: ${spacing.lg} 0;
  display: flex;
  flex-direction: column;
`

const DesktopContainer = styled.div`
  display: none;

  @media ${MediaQueries.biggerSizes} {
    display: flex;
    align-items: center;
    gap: ${spacing.xl};
  }
`

const MobileContainer = styled.div`
  display: block;

  @media ${MediaQueries.biggerSizes} {
    display: none;
  }
`

const ImageCarousel = styled.div`
  position: relative;
  width: 50%;
  height: 485px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
`

const ImageControls = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 ${spacing.md};

  button {
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 20px;
    cursor: pointer;
    transition: background 0.3s ease;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
    }
  }
`

const CardsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${spacing.md};
`

const ClickableCardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 15px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0px 6px 20px rgba(0, 0, 0, 0.15);
  }
`

const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 15px;
  margin: 15px 0 30px 0;
`

const Controls = styled.div`
  display: flex;
  justify-content: center;
  gap: ${spacing.sm};
  margin-top: ${spacing.sm};

  button {
    padding: ${spacing.sm} ${spacing.lg};
    border-radius: 10px;
    font-size: 14px;
    background-color: #1f2a36;
    color: #f5f5f5;
    border: none;
    cursor: pointer;
  }
`

const Dot = styled.li<{ $active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin: 0 6px;
  transform: translateY(5px);
  background-color: ${({ $active, theme }) => ($active ? theme.colors.primary : "#ccc")};
  display: inline-block;
  cursor: pointer;
`
