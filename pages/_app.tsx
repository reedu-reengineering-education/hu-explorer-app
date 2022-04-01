import { NextPage } from 'next';
import Error from 'next/error';
import { AppProps } from 'next/app';
import React, { ReactElement, ReactNode } from 'react';
import { SWRConfig } from 'swr';
import Layout from '@/components/Layout';
import { fetcher } from '@/lib/fetcher';
import '../styles/globals.css';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || Layout;

  if (pageProps.errorCode) {
    return <Error statusCode={pageProps.errorCode} title={pageProps.message} />;
  }

  return (
    <SWRConfig
      value={{
        refreshInterval: 0,
        revalidateOnFocus: false,
        fetcher,
      }}
    >
      {getLayout(<Component {...pageProps} />)}
    </SWRConfig>
  );
}

export default MyApp;
