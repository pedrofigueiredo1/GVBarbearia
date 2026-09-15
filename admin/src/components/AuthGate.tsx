'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

// Protege todas as páginas dentro do grupo (painel): sem token válido
// armazenado, redireciona pro login antes de renderizar qualquer conteúdo
// administrativo. A validade real do token quem garante é o backend — se
// tiver expirado, a primeira chamada à API já redireciona via apiFetch.
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [autorizado, setAutorizado] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setAutorizado(true);
  }, [router]);

  if (!autorizado) {
    return null;
  }

  return <>{children}</>;
}
