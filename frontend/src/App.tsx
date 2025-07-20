import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { useThemeStore } from './store/themeStore';
import { lightTheme, darkTheme } from './themes/colorThemes';
import { LogInPage } from './sections/02-log-in-page/LogInPage';
import { VideoLibraryPage } from './sections/04-video-library-page/VideoLibraryPage';
import { ReviewPage } from './sections/05-review-page/01-main/ReviewPage';
import styled from 'styled-components';
import { LandingPage } from './sections/01-lading-page/01-main/LandingPage';
import { SignUpPage } from './sections/03-sign-up-page/SignUpPage';
import { RequireAuthentication } from './utils/RequireAuthentication';
import { PageNotFound } from './global-components/PageNotFound';

export const App = () => {
  const themeMode = useThemeStore((state) => state.themeMode);

  return (
    <ThemeProvider theme={themeMode === 'light' ? lightTheme : darkTheme}>
      <AppContainer>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LogInPage />} />
            <Route path="/signUp" element={<SignUpPage />} />

            {/* Protected routes */}
            <Route
              path="/library"
              element={
                <RequireAuthentication>
                  <VideoLibraryPage />
                </RequireAuthentication>
              }
            />
            <Route
              path="/review/:projectId"
              element={
                <RequireAuthentication>
                  <ReviewPage />
                </RequireAuthentication>
              }
            />

             {/* Fallback 404 route */}
           <Route path="*" element={<PageNotFound />} />
          </Routes>
        </BrowserRouter>

   
      </AppContainer>
    </ThemeProvider>
  );
};

const AppContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100vh;
`;

