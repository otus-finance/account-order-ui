import { OtusPositions } from "./OtusPositions";
import { LyraPositions } from "./LyraPositions";
import { useLyraContext } from "../../../../context/LyraContext";
import { useAccount } from "wagmi";

export const Positions = () => {
	const { lyra } = useLyraContext();
	const { address } = useAccount();

	return (
		<>
			<OtusPositions lyra={lyra} />
			<LyraPositions lyra={lyra} address={address} />
		</>
	);
};
