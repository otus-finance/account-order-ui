import { useMarketOrderContext } from "../../../../../context/MarketOrderContext";
import { Spinner } from "../../../../UI/Components/Spinner";
import { OpenLyraPosition } from "./OpenLyraPosition";
import { OpenSpreadPosition } from "./OpenSpreadPosition";

export const MarketTransaction = () => {
	const { networkNotSupported } = useMarketOrderContext();

	return networkNotSupported ? (
		<div className="cursor-pointer bg-gradient-to-t from-black to-zinc-900 rounded-full p-4 w-full font-semibold hover:text-zinc-200 py-3 text-center text-white">
			Network not supported
		</div>
	) : (
		<MarketOrderAction />
	);
};

const MarketOrderAction = () => {
	const { spreadSelected, validMaxPNL } = useMarketOrderContext();

	const { validMaxLoss } = validMaxPNL;

	return validMaxLoss && spreadSelected ? <OpenSpreadPosition /> : <OpenLyraPosition />;
};
