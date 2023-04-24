import { useMarketOrderContext } from "../../../../../context/MarketOrderContext";
import { Spinner } from "../../../../UI/Components/Spinner";
import { OpenLyraPosition } from "./OpenLyraPosition";
import { OpenPosition } from "./OpenSpreadPosition";

export const MarketTransaction = () => {
	const {
		isApproveQuoteLoading,
		otusOptionMarketAllowance, // currently allowed for otus option market
		spreadMarketAllowance, // currently allowed for otus spread market
		approveQuote,
		approveOtusQuote,
		networkNotSupported,
		validMaxPNL,
		spreadSelected,
	} = useMarketOrderContext();

	const { validMaxLoss } = validMaxPNL;

	return networkNotSupported ? (
		<div className="cursor-pointer bg-gradient-to-t from-black to-zinc-900 rounded-full p-4 w-full font-semibold hover:text-zinc-200 py-3 text-center text-white">
			Network not supported
		</div>
	) : validMaxLoss && spreadSelected ? (
		spreadMarketAllowance.isZero() ? (
			<div
				onClick={() => approveQuote?.()}
				className="cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-3 text-center text-white"
			>
				{isApproveQuoteLoading ? (
					<Spinner size={"medium"} color={"secondary"} />
				) : (
					"Allow Otus Spread to use your Quote"
				)}
			</div>
		) : (
			<OpenPosition />
		)
	) : otusOptionMarketAllowance.isZero() ? (
		<div
			onClick={() => approveOtusQuote?.()}
			className="cursor-pointer bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full p-4 w-full font-semibold hover:text-emerald-100 py-3 text-center text-white"
		>
			{isApproveQuoteLoading ? (
				<Spinner size={"medium"} color={"secondary"} />
			) : (
				"Allow Otus to use your Quote"
			)}
		</div>
	) : (
		<OpenLyraPosition />
	);
};
