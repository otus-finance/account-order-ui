import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import React, { ReactNode } from "react";

import { Id, toast } from "react-toastify";

export type ToastVariant = "info" | "success" | "error" | "warning";

export const createToast = (variant: ToastVariant, message: string, href?: string): Id => {
	const toastId = toast(
		<div className="bg-black text-zinc-200 text-sm">
			{message}
			{href ? (
				<a target="_blank" rel="noreferrer" href={href}>
					View
				</a>
			) : null}
		</div>,
		{
			progressClassName: variant == "error" ? "bg-rose-600" : "bg-emerald-600",
			icon:
				variant == "error" ? (
					<XMarkIcon className="text-rose-600" />
				) : (
					<CheckCircleIcon className="text-emerald-600" />
				),
			className: "bg-black",
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
				<div className="bg-black text-zinc-200 text-sm">
					<p>{message}</p>
					{href ? (
						<a className="text-emerald-500 text-sm" target="_blank" rel="noreferrer" href={href}>
							View Transaction
						</a>
					) : null}
				</div>
			),
			type: variant,
		});
	} else {
		toast(
			<div className="bg-black text-zinc-200">
				{message}
				{href ? (
					<a className="text-emerald-500 text-sm" target="_blank" rel="noreferrer" href={href}>
						View Transaction
					</a>
				) : null}
			</div>,
			{
				className: "bg-black",
				autoClose: 5000,
				type: variant,
			}
		);
	}
};

export function closeToast(toastId: Id): void {
	toast.dismiss(toastId);
}
