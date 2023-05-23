import { Spinner } from "../Spinner";

export type ButtonFontSize = "xs" | "sm" | "md" | "lg";

export type ButtonSize = "xs" | "sm" | "md" | "full-sm" | "full";

export type ButtonRadius = "lg" | "xl" | "full";

export type ButtonVariant =
	| "default" // dark:bg-zinc-800 bg-zinc-100 dark:text-zinc-100 text-zinc-900
	| "primary" // dark:bg-black bg-zinc-200 dark:text-zinc-100 text-zinc-900
	| "action" // dark:bg-emerald-400 bg-emerald-400 text-zinc-100
	| "error" //  bg-rose-400 text-zinc-900
	| "warning"; //  bg-yellow-400 text-zinc-900

export type BaseButtonProps = {
	size?: ButtonSize;
	target?: string;
	href?: string;
	onClick: any;
	isOutline?: boolean;
	isDisabled?: boolean;
	isTransparent?: boolean;
	type?: string;
	textVariant?: "uppercase" | "lowercase";
};

export type ButtonProps = {
	label: string | number;
	variant: ButtonVariant;
	radius: ButtonRadius;
	size: ButtonSize;
	isLoading?: boolean;
	isActive?: boolean;
	textColor?: string;
} & BaseButtonProps;

export const getButtonFontSize = (fontSize: ButtonFontSize): string => {
	switch (fontSize) {
		case "xs":
			return "text-xs font-normal";
		case "sm":
			return "text-sm";
		case "md":
			return "text-md";
		case "lg":
			return "text-lg";
	}
};

export const getButtonSize = (size: ButtonSize): string => {
	switch (size) {
		case "xs":
			return "text-xs font-normal px-4 py-2";
		case "sm":
			return "text-xs font-normal px-8 py-2 w-full";
		case "md":
			return "text-sm font-normal px-8 py-3";
		case "full-sm":
			return "text-xs font-normal w-full px-12 py-2";
		case "full":
			return "text-sm font-normal w-full px-12 py-3";
	}
};

export const getButtonVariant = (variant: ButtonVariant): string => {
	switch (variant) {
		case "default":
			return "dark:bg-zinc-800 bg-zinc-100 dark:text-zinc-100 text-zinc-900 font-semibold";
		case "primary":
			return "dark:bg-black bg-zinc-200 dark:text-zinc-100 text-zinc-900 font-semibold";
		case "action":
			return "dark:bg-emerald-400 bg-emerald-400 text-zinc-100 font-semibold";
		case "error":
			return "bg-rose-400 text-zinc-900 font-semibold";
		case "warning":
			return "bg-yellow-400 text-zinc-900 font-semibold";
	}
};

export const getButtonRadius = (radius: ButtonRadius): string => {
	switch (radius) {
		case "lg":
			return "rounded-lg";
		case "xl":
			return "rounded-xl";
		case "full":
			return "rounded-full";
	}
};

export const Button = ({
	label,
	isLoading = false,
	variant,
	radius,
	size,
	onClick,
	isDisabled,
	isActive = false,
}: ButtonProps) => {
	const buttonSize = getButtonSize(size);
	const buttonVariant = getButtonVariant(variant);
	const buttonRadius = getButtonRadius(radius);
	const activeButton = isActive ? "ring-1 ring-emerald-600" : "";
	const isDisabledStyle = isDisabled ? "bg-zinc-700 dark:bg-zinc-400 cursor-not-allowed" : "";

	return (
		<button
			disabled={isDisabled}
			className={`items-center ${buttonSize} ${buttonVariant} ${buttonRadius} ${activeButton} ${isDisabledStyle}`}
			onClick={onClick}
		>
			{isLoading ? <Spinner /> : label}
		</button>
	);
};
