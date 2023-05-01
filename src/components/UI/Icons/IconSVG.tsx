import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/20/solid";

export enum IconType {
	ExclamationTriangleIcon = "ExclamationTriangleIcon",
	CheckIcon = "CheckIcon",
}

export const HeroIcon = (icon: IconType) => {
	switch (icon) {
		case IconType.ExclamationTriangleIcon:
			return <ExclamationTriangleIcon className="h-5 w-5 dark:text-gray-400" aria-hidden="true" />;
			break;
		case IconType.CheckIcon:
			return <CheckIcon className="h-5 w-5 dark:text-gray-400" aria-hidden="true" />;
			break;
		default:
			break;
	}
};
