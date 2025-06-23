import { ReviewPage } from "./sections/05-review-page/01-main/ReviewPage";
import { VideoLibraryPage } from "./sections/04-video-library-page/VideoLibraryPage";
import { BrowserRouter, Routes, Route } from "react-router";

export const App = () => {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VideoLibraryPage />}/>
        <Route path="/review" element={<ReviewPage />}/>
      </Routes>
    </BrowserRouter>
  );
};