import { Sidebar } from '@/components/Sidebar';
import { AuthGate } from '@/components/AuthGate';
import { AvisosProvider } from '@/components/ui/Avisos';

export default function PainelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGate>
      <AvisosProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="min-w-0 flex-1 p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8">{children}</main>
        </div>
      </AvisosProvider>
    </AuthGate>
  );
}
