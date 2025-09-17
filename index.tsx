// Fix: Replaced placeholder text with a standard React application entry point.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import { AudioProvider } from './contexts/AudioContext';

/**
 * This is the main entry point for the React application.
 * It sets up the root component and wraps it with context providers for theme and language management.
 */

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("Could not find the root element with ID 'root' in the document. Please ensure your index.html has `<div id=\"root\"></div>`.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <AudioProvider>
        <App />
      </AudioProvider>
    </ThemeProvider>
  </React.StrictMode>
);