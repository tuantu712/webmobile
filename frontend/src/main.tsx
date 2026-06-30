import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register Service Worker for PWA
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered with scope: ', registration.scope);
      })
      .catch((err) => {
        console.error('Service Worker registration failed: ', err);
      });
  });
} else if ('serviceWorker' in navigator && import.meta.env.DEV) {
  // Can register in DEV as well if you want to test PWA features locally
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered in DEV: ', registration.scope);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
