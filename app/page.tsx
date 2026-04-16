import Header from '@/components/layout/Header';
import CommandCenterClient from '@/components/command-center/CommandCenterClient';

export default function CommandCenterPage() {
  return (
    <div className="flex flex-col h-screen bg-ta-bg">
      <Header showScanButton={false} />
      <CommandCenterClient />
    </div>
  );
}
