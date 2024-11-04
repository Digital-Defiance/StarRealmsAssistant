import React from 'react';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import App from '@/app/app';
import '@/styles.scss';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
