import { Position } from "../../../../../queries/otus/positions";

export const OtusPositionClose = ({ position }: { position: Position | null }) => {
	if (!position) {
		return <div>Error</div>;
	}

	return (
		<div className=" ">
			<div className="py-8 px-4">
				{/* <p className="text-black dark:text-zinc-200 text-xs leading-6 ">
        Otus provide the tools to successfully and easily manage an options vault built on Otus Pools, Lyra and Synthetix Futures.
      </p> */}
				<h2 className="uppercase font-semibold text-sm text-rose-500 text-center">Coming Soon!</h2>
				<p className="text-center text-sm pt-4">
					While in Alpha, Otus Spread Positions cannot be closed before Settlement.{" "}
				</p>
			</div>
		</div>
	);
};
