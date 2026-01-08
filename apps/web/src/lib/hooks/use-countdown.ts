import { useEffect, useState } from "react";

const useCountdown = (targetDate: Date | string | number) => {
	const countDownDate = new Date(targetDate).getTime();

	const [countDown, setCountDown] = useState(Math.max(countDownDate - Date.now(), 0));

	useEffect(() => {
		const interval = setInterval(() => {
			setCountDown(Math.max(countDownDate - Date.now(), 0));
		}, 1000);

		return () => clearInterval(interval); // Clean up interval on component unmount
	}, [countDownDate]);

	return getReturnValues(countDown);
};

const getReturnValues = (countDown: number) => {
	// calculate time left in days, hours, minutes, and seconds
	const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
	const hours = Math.floor((countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
		.toString()
		.padStart(2, "0");
	const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60))
		.toString()
		.padStart(2, "0");
	const seconds = Math.floor((countDown % (1000 * 60)) / 1000)
		.toString()
		.padStart(2, "0");

	return [days, hours, minutes, seconds];
};

export default useCountdown;
