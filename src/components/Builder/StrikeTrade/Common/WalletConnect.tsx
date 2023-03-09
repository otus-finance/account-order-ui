
import {
  useConnectModal
} from '@rainbow-me/rainbowkit'

export const WalletConnect = () => {
  const { openConnectModal } = useConnectModal();

  return <div onClick={openConnectModal} className="cursor-pointer border-2 border-zinc-700 hover:border-emerald-600 p-2 py-3 col-span-3 font-normal text-sm text-white text-center rounded-full">
    Connect Wallet
  </div>
}
