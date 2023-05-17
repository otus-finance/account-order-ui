import React from "react";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import LogoIcon from "../UI/Icons/Logo/OTUS";
// import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Web3Button } from "../UI/Web3Button";
import { DarkModeSwitch } from "./darkMode";
import { useTheme } from "next-themes";
import { AdminContextProvider, useAdminContext } from "../../context/Admin/AdminContext";

const linkStyle = (path: string, activePath: string) => {
	if (path == activePath) {
		return "sm:p-3 sm:px-3 px-2 text-md font-semibold text-zinc-900 dark:text-emerald-500";
	} else {
		return "sm:p-3 sm:px-3 px-2 text-md font-normal text-zinc-700 dark:text-white hover:dark:text-zinc-500";
	}
};

const linkStyleMobile = (path: string, activePath: string) => {
	if (path == activePath) {
		return "block p-3 dark:text-base font-bold dark:text-white";
	} else {
		return "block p-3 dark:text-base font-normal dark:text-white hover:dark:text-zinc-500";
	}
};

export const Navigation = () => {
	const router = useRouter();

	return (
		<Disclosure as="nav" className="">
			{({ open }) => (
				<>
					<div className="mx-auto px-2 md:px-6 lg:px-8 border-b border-zinc-200 dark:border-zinc-700">
						<div className="flex h-20 items-center justify-between">
							<div className="flex items-center">
								<div className="flex-shrink-0 ">
									<div className="flex-shrink-0">
										<Link href="/">
											<span className="mt-1 block w-auto cursor-pointer">
												<LogoIcon />
											</span>
										</Link>
									</div>
								</div>

								<div className="hidden lg:block lg:ml-12">
									<div className="flex justify-center space-x-4">
										<Link href="/">
											<a className={linkStyle("/", router.pathname)}>Trade</a>
										</Link>
										<Link href="/spread-pool">
											<a className={linkStyle("/spread-pool", router.pathname)}>Spread Pool</a>
										</Link>
										<Link href="/vaults">
											<a className={linkStyle("/vaults", router.pathname)}>Vaults</a>
										</Link>
									</div>
								</div>
							</div>

							<div className="hidden lg:flex lg:ml-6 justify-end">
								<div className="flex items-center">
									<Web3Button />
								</div>
								<div className="flex items-center dark:text-white ml-4">
									<DarkModeSwitch />
								</div>
								<AdminContextProvider>
									<AdminButton />
								</AdminContextProvider>
							</div>

							<div className="-mr-2 flex lg:hidden">
								{/* Mobile menu button */}
								<Disclosure.Button className="dark:text-white inline-flex items-center justify-center rounded-md p-2 hover:dark:bg-zinc-800 hover:dark:text-white focus:outline-none focus:ring-1 focus:ring-inset focus:ring-zinc-200">
									<span className="sr-only">Open main menu</span>
									{open ? (
										<XMarkIcon className="block h-6 w-6 dark:text-zinc-200" aria-hidden="true" />
									) : (
										<Bars3Icon className="block h-6 w-6 dark:text-zinc-200" aria-hidden="true" />
									)}
								</Disclosure.Button>
							</div>
						</div>
					</div>

					<Disclosure.Panel className="lg:hidden">
						<div className="space-y-1 px-2 pt-2 pb-3">
							<Link href="/">
								<Disclosure.Button className={linkStyleMobile("/", router.pathname)}>
									Trade
								</Disclosure.Button>
							</Link>
							<Link href="/spread-pool">
								<Disclosure.Button className={linkStyleMobile("/spread-pool", router.pathname)}>
									Spread Pool
								</Disclosure.Button>
							</Link>
							<Link href="/vaults">
								<Disclosure.Button className={linkStyleMobile("/vaults", router.pathname)}>
									Vaults
								</Disclosure.Button>
							</Link>
						</div>
						<div className="dark:border-zinc-800 border-zinc-100 border-t pt-4 pb-3 flex">
							<div className="flex items-center px-5">
								<Web3Button />
							</div>
							<div className="flex items-center dark:text-white">
								<DarkModeSwitch />
							</div>
						</div>
					</Disclosure.Panel>
				</>
			)}
		</Disclosure>
	);
};

const AdminButton = () => {
	const router = useRouter();

	const handleNavigate = () => {
		router.push("/admin/");
	};

	const { isAdmin } = useAdminContext();

	const { query } = router;

	const style = router.pathname.includes("/admin")
		? "text-zinc-100 bg-emerald-500"
		: "dark:text-zinc-100 bg-zinc-300 dark:bg-zinc-900";

	return isAdmin ? (
		<div className="flex items-center ml-4">
			<button
				onClick={() => handleNavigate()}
				className={` transition-all duration-100 text-zinc-900 px-8 py-3 font-semibold text-sm md:text-sm rounded-full ${style}`}
			>
				Admin
			</button>
		</div>
	) : null;
};
