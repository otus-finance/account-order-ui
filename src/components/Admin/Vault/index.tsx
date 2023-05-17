import { useAdminContext } from "../../../context/Admin/AdminContext";
import { NotAdmin } from "../NotAdmin";
import { BuilderContextProvider } from "../../../context/BuilderContext";
import { AdminBuilder } from "./Builder";

export const AdminVault = () => {
	const { isAdmin } = useAdminContext();

	return isAdmin ? (
		<BuilderContextProvider>
			<AdminBuilder />
		</BuilderContextProvider>
	) : (
		<NotAdmin />
	);
};
