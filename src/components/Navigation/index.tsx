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

const linkStyle = (path: string, activePath: string) => {
	if (path == activePath) {
		return "sm:p-3 sm:px-3 px-2 text-sm font-bold dark:text-white";
	} else {
		return "sm:p-3 sm:px-3 px-2 text-sm font-normal dark:text-white hover:dark:text-zinc-500";
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

	const { theme } = useTheme();

	return (
		<Disclosure as="nav" className="border-b dark:border-zinc-800 ">
			{({ open }) => (
				<>
					<div className="mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
						<div className="flex h-20 items-center justify-between">
							<div className="flex items-center">
								<div className="flex-shrink-0">
									<Link href="/">
										<span className="mt-1 block w-auto cursor-pointer">
											{theme == "dark" ? (
												<LogoIcon />
											) : (
												<img src="./OTUSICONLOGO.png" className="rounded-md h-12" />
											)}
										</span>
									</Link>
								</div>

								<div className="hidden sm:ml-2 lg:ml-16 sm:block">
									<div className="flex space-x-4">
										<Link href="/">
											<a className={linkStyle("/", router.pathname)}>Trade</a>
										</Link>
										<Link href="/spread-pool">
											<a className={linkStyle("/spread-pool", router.pathname)}>Spread Pool</a>
										</Link>
										<Link href="/vaults">
											<a className={linkStyle("/vaults", router.pathname)}>Vaults</a>
										</Link>
										{/* <Link href="/markets">
											<a className={linkStyle("/markets", router.pathname)}>Ranged Markets</a>
										</Link> */}
									</div>
								</div>
							</div>
							<div className="hidden sm:ml-6 sm:flex">
								<div className="flex items-center">
									<Web3Button />
								</div>
								<div className="flex items-center dark:text-white ml-4">
									<DarkModeSwitch />
								</div>
							</div>

							<div className="-mr-2 flex sm:hidden">
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

					<Disclosure.Panel className="sm:hidden">
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
							{/* <Link href="/markets">
								<Disclosure.Button className={linkStyleMobile("/markets", router.pathname)}>
									Ranged Markets
								</Disclosure.Button>
							</Link> */}
						</div>
						<div className="dark:border-zinc-800 border-t pt-4 pb-3 flex">
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
