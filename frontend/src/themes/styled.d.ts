import "styled-components"

declare module "styled-components" {
  export interface DefaultTheme {
    name: string
    colors: {
      background: string
      backgroundHover: string
      backgroundActive: string

      offBackground: string
      offBackgroundHover: string
      offBackgroundActive: string

      text: string
      textHover: string
      textActive: string

      textAlternative: string
      textAlternativeHover: string
      textAlternativeActive: string

      primary: string
      primaryHover: string
      primaryActive: string

      secondary: string
      secondaryHover: string
      secondaryActive: string

      border: string
      borderHover: string
      borderActive: string

      lightBlue: string
      lightBlueHover: string
      lightBlueActive: string

      specialblue: string
      boxShadow: string
    }
    filter: {
      inverted: string
    }
    spacing: {
      xs: string
      sm: string
      md: string
      lg: string
      xl: string
      xxl: string
    }
    media: {
      mobile: string
      tablet: string
      desktop: string
      smallerSizes: string
      biggerSizes: string
      widescreen: string
    }
  }
}
