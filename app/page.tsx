import { PokerTable } from '@/components/PokerTable';
import { Header } from '@/components/Header';
import { TableLobby } from '@/components/TableLobby';

export default function Home() {
  // Default table ID (can be made dynamic later)
  const tableId = process.env.NEXT_PUBLIC_TABLE_ID || 'default-table';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-2 text-primary">DePoker Pro</h1>
          <p className="text-lg text-gray-400">
            Provably Fair No-Limit Hold'em on Binance Smart Chain
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PokerTable tableId={tableId} />
          </div>
          <div>
            <TableLobby />
          </div>
        </div>
      </main>
    </div>
  );
}
