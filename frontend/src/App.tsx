import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { useThemeStore } from './store/themeStore';
import { lightTheme, darkTheme } from './themes/colorThemes';
import { LogInPage } from './sections/02-log-in-page/LogInPage';
import { VideoLibraryPage } from './sections/04-video-library-page/VideoLibraryPage';
import { ReviewPage } from './sections/05-review-page/01-main/ReviewPage';
import styled from 'styled-components';
import { MediaQueries } from './themes/mediaQueries';

export const App = () => {
  const themeMode = useThemeStore((state) => state.themeMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <ThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
      <AppContainer>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LogInPage />} />
            <Route path="/library" element={<VideoLibraryPage />} />
            <Route path="/review/:projectId" element={<ReviewPage />} />
          </Routes>
        </BrowserRouter>
          <ToggleThemeButton onClick={toggleTheme}>
          Toggle Theme
        </ToggleThemeButton>
      </AppContainer>
    </ThemeProvider>
  );
};

const AppContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100vh;
`;

const ToggleThemeButton = styled.button`
  display: none;
  position: fixed;
  right: 10px;
  bottom: 10px;
  margin: 20px;
  padding: 10px 16px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.background};
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;

@media ${MediaQueries.biggerSizes} {
    display: block;
  }
`;