import { useAdminContext } from "../../../context/Admin/AdminContext";

export const AdminMessage = () => {
	const { isAdmin } = useAdminContext();

	return isAdmin ? (
		<div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-zinc-900 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
			<p className="text-sm uppercase font-normal leading-6 text-zinc-200">
				Using Dapp as an Admin
			</p>
			<div className="flex flex-1 justify-end"></div>
		</div>
	) : null;
};
