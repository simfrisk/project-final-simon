// styled.d.ts
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    name: string;
    colors: {
      background: string;
      backgroundHover: string;
      backgroundActive: string;

      offBackground: string;
      offBackgroundHover: string;
      offBackgroundActive: string;

      text: string;
      textHover: string;
      textActive: string;

      primary: string;
      primaryHover: string;
      primaryActive: string;

      secondary: string;
      secondaryHover: string;
      secondaryActive: string;

      border: string;
      borderHover: string;
      borderActive: string;
    };
  }
}

export const lightTheme = {
  name: 'light',
  colors: {
    background: '#ffffff',
    backgroundHover: '#f5f5f5',
    backgroundActive: '#eaeaea',

    offBackground: '#f5f5f5',
    offBackgroundHover: 'rgb(210, 210, 210)',
    offBackgroundActive: 'rgb(195, 195, 195)',

    text: '#111111',
    textHover: "rgb(31, 31, 31)",
    textActive: '#333333',

    primary: '#2d7eff',
    primaryHover: "rgb(43, 115, 232)",
    primaryActive: '#1c6bff',

    secondary: "rgb(167, 187, 209);",
    secondaryHover: '#e6e6e6',
    secondaryActive: '#d4d4d4',

    border: '#e0e0e0',
    borderHover: '#cfcfcf',
    borderActive: '#bfbfbf',
  },
};

export const darkTheme = {
  name: 'dark',
  colors: {
    background: 'rgb(18, 20, 25)',
    backgroundHover: 'rgb(22, 27, 34)',
    backgroundActive: 'rgb(33, 38, 45)',

    offBackground: 'rgb(28, 34, 45)',
    offBackgroundHover: 'rgb(100, 100, 100)',
    offBackgroundActive: 'rgb(120, 120, 120)',

    text: '#ffffff',
    textHover: '#e5e5e5',
    textActive: '#cccccc',

    primary: "rgb(28, 62, 129)",
    primaryHover: "rgb(20, 43, 90)",
    primaryActive: '#9a63d3',

    secondary: '#1e1e1e',
    secondaryHover: '#2a2a2a',
    secondaryActive: '#3a3a3a',

    border: '#333333',
    borderHover: '#444444',
    borderActive: '#555555',
  },
};