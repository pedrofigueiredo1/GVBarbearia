import { Sidebar } from '@/components/Sidebar';
import { AuthGate } from '@/components/AuthGate';

export default function PainelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGate>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </AuthGate>
  );
}
