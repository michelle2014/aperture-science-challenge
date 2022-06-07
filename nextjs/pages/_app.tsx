import React, { useState } from 'react';
import type { AppProps } from 'next/app';
import { CookiesProvider } from "react-cookie";
import AppContext from '../components/appContext';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  const [session, setSession] = useState();

  return (
    <AppContext.Provider value={{ session, setSession }}>
      <CookiesProvider>
        <Component {...pageProps} />
      </CookiesProvider>
    </AppContext.Provider>
  )
}
export default MyApp
