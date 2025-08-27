//#region ----- IMPORTS -----
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ThemeProvider } from "styled-components"
import { useThemeStore } from "./store/themeStore"
import { lightTheme, darkTheme } from "./themes/colorThemes"
import { LogInPage } from "./sections/02-log-in-page/LogInPage"
import { ReviewPage } from "./sections/05-review-page/01-main/ReviewPage"
import styled from "styled-components"
import { LandingPage } from "./sections/01-lading-page/01-main/LandingPage"
import { SignUpPage } from "./sections/03-sign-up-page/SignUpPage"
import { RequireAuthentication } from "./utils/RequireAuthentication"
import { PageNotFound } from "./global-components/PageNotFound"
import { TeachersPage } from "./sections/06-teachers-page/TeachersPage"
import { VideoLibraryPage } from "./sections/04-video-library-page/VideoLibraryPage"
import { ChooseClassMessage } from "./sections/04-video-library-page/components/ChooseClassMessage" // You’ll create this
import { ProjectsList } from "./sections/04-video-library-page/components/ProjectsList" // And this
import "./utils/moment-config"

//#endregion ----- UPDATE REPLY -----

export const App = () => {
  const themeMode = useThemeStore((state) => state.themeMode)

  return (
    <ThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
      <AppContainer>
        <BrowserRouter>
          <main role="main">
            <Routes>
              {/* Public routes */}
              <Route
                path="/"
                element={<LandingPage />}
              />
              <Route
                path="/login"
                element={<LogInPage />}
              />
              <Route
                path="/signUp"
                element={<SignUpPage />}
              />
              <Route
                path="/teachersPage"
                element={<TeachersPage />}
              />

              {/* Protected routes with nested routing */}
              <Route
                path="/library"
                element={
                  <RequireAuthentication>
                    <VideoLibraryPage />
                  </RequireAuthentication>
                }
              >
                {/* If no class selected */}
                <Route
                  index
                  element={<ChooseClassMessage />}
                />
                {/* When classId is selected */}
                <Route
                  path="classes/:classId/projects"
                  element={<ProjectsList />}
                />
              </Route>

              <Route
                path="/review/:projectId"
                element={
                  <RequireAuthentication>
                    <ReviewPage />
                  </RequireAuthentication>
                }
              />

              {/* Fallback 404 */}
              <Route
                path="*"
                element={<PageNotFound />}
              />
            </Routes>
          </main>
        </BrowserRouter>
      </AppContainer>
    </ThemeProvider>
  )
}

const AppContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100vh;
`
