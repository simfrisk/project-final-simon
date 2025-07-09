import { ReviewPage } from "./sections/05-review-page/01-main/ReviewPage";
import { VideoLibraryPage } from "./sections/04-video-library-page/VideoLibraryPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LogInPage } from "./sections/02-log-in-page/LogInPage";

export const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LogInPage />} />
        <Route path="/library" element={<VideoLibraryPage />}/>
        <Route path="/review/:projectId" element={<ReviewPage />}/>
      </Routes>
    </BrowserRouter>
  );
};