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

      textAlternative: string;
      textAlternativeHover: string;
      textAlternativeActive: string;

      primary: string;
      primaryHover: string;
      primaryActive: string;

      secondary: string;
      secondaryHover: string;
      secondaryActive: string;

      border: string;
      borderHover: string;
      borderActive: string;

      lightBlue: string;
      lightBlueHover: string;
      lightBlueActive: string;

      specialblue: string

      boxShadow: string
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
    offBackgroundHover: '#eeeeee',
    offBackgroundActive: 'rgb(195, 195, 195)',

    text: '#111111',
    textHover: "rgb(31, 31, 31)",
    textActive: '#333333',

    textAlternative: '#656565',
    textAlternativeHover: '#575757ff',
    textAlternativeActive: '#525252ff',

    primary: "rgb(45, 126, 255)",
    primaryHover: "rgb(43, 115, 232)",
    primaryActive: '#1c6bff',

    secondary: "rgb(29, 19, 139)",
    secondaryHover: 'rgb(24, 16, 113)',
    secondaryActive: 'rgb(38, 25, 186)',

    border: '#e0e0e0',
    borderHover: '#cfcfcf',
    borderActive: '#bfbfbf',

    lightBlue: '#deeafb',
    lightBlueHover: '#d7e7fdff',
    lightBlueActive: '#bcd6f9ff',

    specialblue: 'rgb(167, 187, 209)',

    boxShadow: 'rgba(0, 0, 0, 0.14)',
  },
};

export const darkTheme = {
  name: 'dark',
  colors: {
    background: 'rgb(18, 20, 25)',
    backgroundHover: 'rgb(22, 27, 34)',
    backgroundActive: 'rgb(33, 38, 45)',

    offBackground: 'rgb(28, 34, 45)',
    offBackgroundHover: 'rgba(53, 53, 53, 1)',
    offBackgroundActive: 'rgb(120, 120, 120)',

    text: '#ffffff',
    textHover: '#e5e5e5',
    textActive: '#cccccc',

    textAlternative: '#a3a1a1ff',
    textAlternativeHover: '#969595ff',
    textAlternativeActive: '#807e7eff',

    primary: "rgb(28, 62, 129)",
    primaryHover: "rgb(20, 43, 90)",
    primaryActive: '#9a63d3',

    secondary: '#1e1e1e',
    secondaryHover: '#2a2a2a',
    secondaryActive: '#3a3a3a',

    border: '#333333',
    borderHover: '#444444',
    borderActive: '#555555',

    lightBlue: '#113364ff',
    lightBlueHover: '#133a71ff',
    lightBlueActive: '#16427fff',

    specialblue: 'rgba(53, 65, 79, 1)',

    boxShadow: 'rgba(78, 78, 78, 0.51)',
  },
};