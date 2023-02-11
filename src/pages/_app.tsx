// src/pages/_app.tsx
import type { AppType } from "next/dist/shared/lib/utils";
import "../styles/globals.css";
import Layout from "../components/UI/Layout";
import { QueryClient, QueryClientProvider } from 'react-query'

const queryClient = new QueryClient()

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Layout>
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  </Layout>;
};

export default MyApp; 