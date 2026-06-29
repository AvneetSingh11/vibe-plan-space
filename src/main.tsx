import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.tsx';
import './index.css';

// Boneyard registry
try {
  // @ts-ignore
  import('./bones/registry').catch(() => {});
} catch (e) {}
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "1058245382875-ekq3dt4c4k35u612mn7eqarot4530ff7.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
