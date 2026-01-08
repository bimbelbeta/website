"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import type React from "react";
import { useEffect, useState } from "react";
import { Container } from "./ui/container";

export interface CarouselItem {
	id: string | number;
	desc: string;
	name: string;
	title: string;
	[key: string]: unknown; // Replace 'any' with 'unknown'
}

interface CarouselProps {
	items: CarouselItem[];
	cardWidth?: number;
	cardHeight?: number;
	gap?: number;
	responsiveGap?: boolean; // New prop for responsive gap
	className?: string;
	showNavigation?: boolean;
	showDots?: boolean;
	autoPlay?: boolean;
	autoPlayInterval?: number;
	onItemClick?: (item: CarouselItem, index: number) => void;
	renderCard?: (item: CarouselItem, index?: number, isActive?: boolean) => React.ReactNode;
}

const Carousel: React.FC<CarouselProps> = ({
	items,
	cardWidth = 360, // 72 * 4 = 288px
	cardHeight = 211, // 96 * 4 = 384px
	gap = 32,
	responsiveGap = false, // New prop
	className = "",
	showNavigation = true,
	showDots = true,
	autoPlay = false,
	autoPlayInterval = 3000,
	onItemClick,
	renderCard,
}) => {
	const [currentIndex, setCurrentIndex] = useState(1);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [currentGap, setCurrentGap] = useState(gap);

	// Responsive gap calculation
	useEffect(() => {
		if (!responsiveGap) {
			setCurrentGap(gap);
			return;
		}

		const updateGap = () => {
			const width = window.innerWidth;
			let newGap: number;

			if (width < 640) {
				// sm
				newGap = Math.min(16, gap * 0.5);
			} else if (width < 768) {
				// md
				newGap = Math.max(24, gap * 0.75);
			} else if (width < 1024) {
				// lg
				newGap = gap;
			} else if (width < 1280) {
				// xl
				newGap = gap * 1.25;
			} else {
				// 2xl+
				newGap = gap * 1.5;
			}

			setCurrentGap(newGap);
		};

		updateGap();
		window.addEventListener("resize", updateGap);

		return () => window.removeEventListener("resize", updateGap);
	}, [gap, responsiveGap]);

	// Create extended array for infinite scroll effect
	const extendedItems =
		items.length > 0
			? [
					items[items.length - 1], // Last item at beginning
					...items,
					items[0], // First item at end
				]
			: [];

	const nextSlide = () => {
		if (isTransitioning) return;
		setIsTransitioning(true);
		setCurrentIndex((prev) => prev + 1);
	};

	const prevSlide = () => {
		if (isTransitioning) return;
		setIsTransitioning(true);
		setCurrentIndex((prev) => prev - 1);
	};

	const goToSlide = (index: number) => {
		if (isTransitioning) return;
		setIsTransitioning(true);
		setCurrentIndex(index + 1); // +1 because of the extended array
	};

	// Handle infinite scroll reset
	useEffect(() => {
		const timer = setTimeout(
			() => {
				if (currentIndex === 0) {
					// Jumped to fake last item, now go to real last item
					setCurrentIndex(items.length);
				} else if (currentIndex === extendedItems.length - 1) {
					// Jumped to fake first item, now go to real first item
					setCurrentIndex(1);
				}
				setIsTransitioning(false);
			},
			isTransitioning ? 500 : 0,
		);

		return () => clearTimeout(timer);
	}, [currentIndex, items.length, extendedItems.length, isTransitioning]);

	// Auto-play functionality
	useEffect(() => {
		if (!autoPlay) return;

		const interval = setInterval(() => {
			if (!isTransitioning) {
				setCurrentIndex((prev) => prev + 1);
			}
		}, autoPlayInterval);

		return () => clearInterval(interval);
	}, [autoPlay, autoPlayInterval, isTransitioning]);

	const getCardStyle = (index: number) => {
		const position = index - currentIndex;
		const translateX = position * (cardWidth + currentGap);

		// Only show cards within position -1, 0, 1 (3 cards total)
		const isVisible = Math.abs(position) <= 1;

		let scale = 1;
		let blur = 0;
		let opacity = isVisible ? 1 : 0;
		let translateY = 0;
		let zIndex = 1;

		if (position === 0) {
			scale = 1;
			blur = 0;
			opacity = 1;
			translateY = 0;
			zIndex = 10;
		} else if (Math.abs(position) === 1) {
			scale = 1;
			blur = 0;
			opacity = 1;
			translateY = 36;
			zIndex = 5;
		}

		return {
			transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
			filter: `blur(${blur}px)`,
			opacity,
			zIndex,
			visibility: isVisible ? ("visible" as const) : ("hidden" as const),
			transition:
				isTransitioning &&
				!((currentIndex === 0 && index === items.length) || (currentIndex === extendedItems.length - 1 && index === 1))
					? "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
					: "none",
		};
	};

	const defaultRenderCard = (item: CarouselItem) => {
		// Alternate between 2 colors based on item id
		const itemId = typeof item.id === "number" ? item.id : Number.parseInt(item.id as string, 10) || 0;
		const bgColor = itemId % 2 === 0 ? "bg-tertiary-100 *:text-black" : "bg-primary-300 *:text-white";

		return (
			<div
				className={`flex aspect-video w-full flex-col overflow-hidden rounded-[20px] border border-neutral-200 shadow-sm transition ${bgColor}`}
			>
				<div className="flex flex-1 flex-col justify-between text-pretty p-4 text-left">
					<p className="font-light text-sm">{item.desc}</p>
					<div>
						<h3 className="font-medium text-lg">{item.name}</h3>
						<p className="font-light text-sm">{item.title}</p>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className={`flex flex-col items-center justify-center ${className}`}>
			{/* Main carousel container */}
			<div className="relative z-30 flex h-54 w-full max-w-280 items-center justify-center overflow-visible">
				{/* Navigasi kiri-kanan untuk xl ke atas */}
				{showNavigation && (
					<>
						{/* XL ke atas: tombol di kiri-kanan card aktif */}
						<button
							type="button"
							onClick={prevSlide}
							disabled={isTransitioning}
							className="absolute top-1/2 z-30 hidden -translate-x-49.5 -translate-y-1/2 rounded-[10px] bg-primary-200 p-2.5 text-neutral-100 shadow transition-all duration-300 ease-out hover:scale-105 hover:bg-primary-200/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 lg:flex xl:-translate-x-53.75"
						>
							<ArrowLeftIcon size={24} />
						</button>
						<button
							type="button"
							onClick={nextSlide}
							disabled={isTransitioning}
							className="absolute top-1/2 z-30 hidden translate-x-49.5 -translate-y-1/2 rounded-[10px] bg-primary-200 p-2.5 text-neutral-100 shadow transition-all duration-300 ease-out hover:scale-105 hover:bg-primary-200/80 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 lg:flex xl:translate-x-53.75"
						>
							<ArrowRightIcon size={24} />
						</button>
					</>
				)}

				{/* Cards */}
				<div className="relative flex items-center justify-center">
					{extendedItems.map((item, index) => {
						if (!item) return null;
						return (
							<button
								key={`${item.id}-${index}`}
								type="button"
								className="absolute cursor-pointer"
								style={{
									width: cardWidth,
									height: cardHeight,
									...getCardStyle(index),
								}}
								onClick={() => {
									const actualIndex = index - 1; // Account for extended array
									if (actualIndex >= 0 && actualIndex < items.length && actualIndex !== currentIndex - 1) {
										goToSlide(actualIndex);
									}
									onItemClick?.(item, actualIndex);
								}}
							>
								{renderCard ? renderCard(item, index, index === currentIndex) : defaultRenderCard(item)}
							</button>
						);
					})}
				</div>
			</div>

			{/* Navigation buttons */}
			{showNavigation && (
				<Container className="pt-5 pb-0">
					<div className="mb-6 flex w-full items-center justify-between gap-8 lg:hidden">
						<button
							type="button"
							onClick={prevSlide}
							disabled={isTransitioning}
							className="z-30 rounded-[10px] bg-primary-200 p-2.5 text-neutral-100 transition-all duration-300 hover:scale-110 hover:bg-neutral-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<ArrowLeftIcon size={24} />
						</button>

						<button
							type="button"
							onClick={nextSlide}
							disabled={isTransitioning}
							className="z-30 rounded-[10px] bg-primary-200 p-2.5 text-neutral-100 transition-all duration-300 hover:scale-110 hover:bg-neutral-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<ArrowRightIcon size={24} />
						</button>
					</div>
				</Container>
			)}

			{/* Dots indicator */}
			{showDots && (
				<div className="-mt-13 flex gap-2 lg:mt-8">
					{items.map((item, index) => {
						// Calculate the actual active item index (accounting for extended array and wrapping)
						let activeIndex = currentIndex - 1;
						if (activeIndex < 0) activeIndex = items.length - 1;
						if (activeIndex >= items.length) activeIndex = 0;

						return (
							<button
								key={item.id}
								type="button"
								onClick={() => goToSlide(index)}
								disabled={isTransitioning}
								className={`size-2 rounded-full transition-all duration-200 disabled:cursor-not-allowed ${
									index === activeIndex ? "scale-125 bg-dot-active" : "scale-125 bg-dot-inactive"
								}`}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default Carousel;
