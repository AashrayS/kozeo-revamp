// app/not-found.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NotFoundRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/Atrium'); // Redirect to /Atrium
  }, [router]);

  return null; // Optionally show a loading spinner here
}
