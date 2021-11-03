import { AppProps } from 'next/app';
import React from 'react';
import { SWRConfig } from 'swr';
import Layout from '../components/Layout';
import { fetcher } from '../lib/fetcher';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        fetcher,
      }}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SWRConfig>
  );
}

export default MyApp;
