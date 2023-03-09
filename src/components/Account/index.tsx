
import { useAccount } from 'wagmi'
import { Spinner } from '../UI/Components/Spinner'
import { Dispatch, useState } from 'react'
import { AccountOrderContextProvider } from '../../context/AccountOrderContext'

enum AccountTab {
  Positions,
  Orders,
  Trades
}

export const AccountPosition = () => {

  const [selectedAccountTab, setSelectedAccountTab] = useState(AccountTab.Positions);

  const { address } = useAccount();

  return <AccountOrderContextProvider owner={address || ''}>
    <>
      <AccountInfoSelect selectedAccountTab={selectedAccountTab} setSelectedAccountTab={setSelectedAccountTab} />
      <div className='border border-zinc-800 rounded-sm p-6'>
        <AccountInfo selectedAccountTab={selectedAccountTab} />
      </div>
    </>
  </AccountOrderContextProvider>

  return <div>test</div>

}

const AccountInfoSelect = ({ selectedAccountTab, setSelectedAccountTab }: { selectedAccountTab: AccountTab, setSelectedAccountTab: Dispatch<AccountTab> }) => {

  return <div className='flex items-center gap-8 text-sm px-6 pt-6 pb-2'>

    <div onClick={() => setSelectedAccountTab(AccountTab.Positions)} className={`cursor-pointer hover:text-white ${selectedAccountTab === AccountTab.Positions ? 'text-white underline' : 'text-zinc-300'}`}>
      Positions
    </div>

    <div onClick={() => setSelectedAccountTab(AccountTab.Orders)} className={`cursor-pointer hover:text-white ${selectedAccountTab === AccountTab.Orders ? 'text-white underline' : 'text-zinc-300'}`}>
      Orders
    </div>

    <div onClick={() => setSelectedAccountTab(AccountTab.Trades)} className={`cursor-pointer hover:text-white ${selectedAccountTab === AccountTab.Trades ? 'text-white underline' : 'text-zinc-300'}`}>
      Trades
    </div>

  </div>

}

const AccountInfo = ({ selectedAccountTab }: { selectedAccountTab: AccountTab }) => {
  return <AccountOrders />
}

const AccountOrders = () => {
  return <table className="min-w-full divide-y divide-zinc-700 rounded-sm">
    <thead className="bg-zinc-800">
      <tr>
        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
          Order Id
        </th>
        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
          Order Type
        </th>
        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
          Status
        </th>
        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
          Option Type
        </th>
        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
          Strike Id
        </th>
        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light ">
          Size
        </th>
        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
          Direction
        </th>
        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
          Target Price
        </th>
        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-xs font-light">
          Target Volatility
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-zinc-700 bg-zinc-800">

    </tbody>
  </table>
}

const AccountPositions = () => { }

const AccountTrades = () => { }