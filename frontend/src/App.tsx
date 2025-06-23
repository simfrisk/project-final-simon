import { ReviewPage } from "./sections/05-review-page/01-main/ReviewPage";
import { VideoLibraryPage } from "./sections/04-video-library-page/VideoLibraryPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

export const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VideoLibraryPage />}/>
        <Route path="/review/:projectId" element={<ReviewPage />}/>
      </Routes>
    </BrowserRouter>
  );
};