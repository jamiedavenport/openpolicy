import { GlobalRegistrator } from "@happy-dom/global-registrator";

GlobalRegistrator.register({ url: "http://localhost/" });

// Required for React's act() to work in test environments
(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
