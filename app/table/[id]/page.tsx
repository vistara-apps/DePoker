import { PokerTable } from '@/components/PokerTable';

export default async function TablePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-bg">
      <PokerTable tableId={id} />
    </div>
  );
}
