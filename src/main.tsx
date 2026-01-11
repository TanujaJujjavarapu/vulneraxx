import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import ReduxProvider from "./components/ReduxProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReduxProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </ReduxProvider>
  </StrictMode>
);
