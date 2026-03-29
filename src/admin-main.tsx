import React from 'react';
import { createRoot } from 'react-dom/client';
import Admin from './Admin';
import './index.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <Admin />
    </React.StrictMode>
  );
}
