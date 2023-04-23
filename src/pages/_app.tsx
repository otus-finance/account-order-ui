// src/pages/_app.tsx
import type { AppType } from "next/dist/shared/lib/utils";
import * as Sentry from "@sentry/nextjs";
import PlausibleProvider from "next-plausible";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";
import { QueryClient, QueryClientProvider } from "react-query";
import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, midnightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { optimism, arbitrum, hardhat, optimismGoerli, arbitrumGoerli } from "wagmi/chains";
import { infuraProvider } from "wagmi/providers/infura";
import { publicProvider } from "wagmi/providers/public";

const INFURA_ID = process.env.NEXT_PUBLIC_INFURA_ID;
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
	dsn: SENTRY_DSN,
	tracesSampleRate: 1.0,
});

const { chains, provider } = configureChains(
	[hardhat, arbitrumGoerli, optimism, arbitrum],
	// [hardhat, optimism, arbitrum, optimismGoerli, arbitrumGoerli],
	[
		infuraProvider({
			// @ts-ignore
			apiKey: INFURA_ID,
		}),
		publicProvider(),
	]
);

const { connectors } = getDefaultWallets({
	appName: "Otus: Options Calculator",
	chains,
});

const wagmiClient = createClient({
	autoConnect: true,
	connectors,
	provider,
});

const queryClient = new QueryClient();

const MyApp: AppType = ({ Component, pageProps }) => {
	return (
		<PlausibleProvider domain="trade.otus.finance">
			<WagmiConfig client={wagmiClient}>
				<RainbowKitProvider chains={chains}>
					<QueryClientProvider client={queryClient}>
						<Component {...pageProps} />
						<ToastContainer />
					</QueryClientProvider>
				</RainbowKitProvider>
			</WagmiConfig>
		</PlausibleProvider>
	);
};

export default MyApp;
