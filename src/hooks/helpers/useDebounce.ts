import { useEffect, useState } from "react";
import { LyraStrike } from "../../queries/lyra/useLyra";
import _ from "lodash";

export function useDebounce(value: LyraStrike[], delay: number) {
	// State and setters for debounced value
	const [debouncedValue, setDebouncedValue] = useState(value);
	useEffect(
		() => {
			// Update debounced value after delay
			const handler = setTimeout(() => {
				// check debouncedValue different than value
				if (!_.isEqual(debouncedValue, value)) {
					setDebouncedValue(value);
				}
			}, delay);
			// Cancel the timeout if value changes (also on delay change or unmount)
			// This is how we prevent debounced value from updating if value is changed ...
			// .. within the delay period. Timeout gets cleared and restarted.
			return () => {
				clearTimeout(handler);
			};
		},
		[value, delay] // Only re-call effect if value or delay changes
	);
	return debouncedValue;
}
