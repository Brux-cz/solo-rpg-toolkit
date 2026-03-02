import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App } from "./App";
import { HomePage } from "./pages/HomePage";
import { WikiPage } from "./pages/WikiPage";
import { DiaryPage } from "./pages/DiaryPage";
import { ToolsPage } from "./pages/ToolsPage";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<HomePage />} />
          <Route path="wiki/*" element={<WikiPage />} />
          <Route path="diary" element={<DiaryPage />} />
          <Route path="tools" element={<ToolsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
