export type Question = {
	id: number;
	order: number;
	content: string;
	discussion: string;
	selectedAnswerId: number | null;
	answers: Answer[];
};

export type Answer = {
	id: number;
	content: string;
	isCorrect?: boolean;
};
