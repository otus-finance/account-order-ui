import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import React, { ReactNode } from "react";

import { Id, toast } from "react-toastify";

export type ToastVariant = "info" | "success" | "error" | "warning";

export const createToast = (variant: ToastVariant, message: string, href?: string): Id => {
	const toastId = toast(
		<div className="dark:bg-black dark:text-zinc-200 text-sm">
			{message}
			{href ? (
				<a target="_blank" rel="noreferrer" href={href}>
					View
				</a>
			) : null}
		</div>,
		{
			progressClassName: variant == "error" ? "dark:bg-rose-600" : "dark:bg-emerald-600",
			icon:
				variant == "error" ? (
					<XMarkIcon className="dark:text-rose-600" />
				) : (
					<CheckCircleIcon className="dark:text-emerald-600" />
				),
			className: "dark:bg-black",
			autoClose: 5000,
			type: variant,
		}
	);
	return toastId;
};

export const updateToast = (variant: ToastVariant, id: Id, message: string, href?: string) => {
	if (toast.isActive(id)) {
		toast.update(id, {
			render: (
				<div className="dark:bg-black dark:text-zinc-200 text-sm">
					<p>{message}</p>
					{href ? (
						<a
							className="dark:text-emerald-500 text-sm"
							target="_blank"
							rel="noreferrer"
							href={href}
						>
							View Transaction
						</a>
					) : null}
				</div>
			),
			type: variant,
		});
	} else {
		toast(
			<div className="dark:bg-black dark:text-zinc-200">
				{message}
				{href ? (
					<a className="dark:text-emerald-500 text-sm" target="_blank" rel="noreferrer" href={href}>
						View Transaction
					</a>
				) : null}
			</div>,
			{
				className: "dark:bg-black",
				autoClose: 5000,
				type: variant,
			}
		);
	}
};

export function closeToast(toastId: Id): void {
	toast.dismiss(toastId);
}
