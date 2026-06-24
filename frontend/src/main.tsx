import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'formiojs/dist/formio.full.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
