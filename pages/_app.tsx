import { NextPage } from 'next';
import Error from 'next/error';
import { AppProps } from 'next/app';
import React, { ReactElement, ReactNode, useEffect } from 'react';
import { SWRConfig } from 'swr';
import Layout from '@/components/Layout';
import { fetcher } from '@/lib/fetcher';
import '../styles/globals.css';
import { useRouter } from 'next/dist/client/router';
import NProgress from 'nprogress';
import '../public/nprogress.css';

type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || Layout;
  const router = useRouter();

  useEffect(() => {
    const handleStart = url => {
      console.log(`Loading: ${url}`);
      NProgress.start();
    };

    const handleStop = () => {
      NProgress.done();
    };

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleStop);
    router.events.on('routeChangeError', handleStop);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleStop);
      router.events.off('routeChangeError', handleStop);
    };
  }, [router]);

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
