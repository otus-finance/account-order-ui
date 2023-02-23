import { ArrowDownCircleIcon, ArrowDownIcon, ArrowDownTrayIcon } from '@heroicons/react/20/solid';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Web3Button = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');
        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button onClick={openConnectModal} type="button" className="flex items-center bg-zinc-800 p-3 rounded-xl text-white text-sm font-semibold">
                    Connect Wallet
                  </button>
                );
              }
              if (chain.unsupported) {
                return (
                  <button onClick={openChainModal} type="button" className="flex items-center bg-zinc-800 p-3 rounded-xl text-white text-sm font-semibold">
                    Wrong network
                  </button>
                );
              }
              return (
                <div className="flex gap-4">
                  <button
                    onClick={openChainModal}
                    className="flex items-center bg-zinc-800 p-3 rounded-xl text-white text-sm font-semibold"
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div
                        className={`bg-[${chain.iconBackground}] h-5 w-5 rounded-full overflow-hidden mr-2`}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            className="w-5 h-5"
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                    <div className='ml-2'><ChevronDownIcon className='h-4 w-4 text-white font-bold' /></div>

                  </button>
                  <button
                    className="flex items-center bg-zinc-800 p-3 rounded-xl text-white text-sm font-semibold"
                    onClick={openAccountModal} type="button">
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}

                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};