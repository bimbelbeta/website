import { useEffect, useRef } from "react";

/**
 * Hook that executes a callback when the component unmounts.
 *
 * @param callback Function to be called on component unmount
 */

// biome-ignore lint/suspicious/noExplicitAny: any is used to allow any function to be called on unmount
export const useUnmount = (callback: (...args: Array<any>) => any) => {
	const ref = useRef(callback);
	ref.current = callback;

	useEffect(
		() => () => {
			ref.current();
		},
		[],
	);
};

export default useUnmount;
