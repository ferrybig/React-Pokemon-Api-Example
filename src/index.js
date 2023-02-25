import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import PageLoader from "./PageLoader";
import { QueryClient } from "./QueryClient";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <QueryClient>
      <Suspense fallback={<PageLoader />}>
        <App />
      </Suspense>
    </QueryClient>
  </StrictMode>
);
