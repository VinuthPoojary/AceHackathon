import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeEmailService } from "./lib/emailService";

// Initialize Email Service
initializeEmailService();

createRoot(document.getElementById("root")!).render(<App />);
