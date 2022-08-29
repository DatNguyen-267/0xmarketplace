import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import App2 from './App2';

const getLibrary = (provider: any) => {
  const library = new ethers.providers.Web3Provider(provider);
  // library.pollingInterval = 8000;
  return library;
};

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  </React.StrictMode>
);