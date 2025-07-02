"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DeprecatedKitchenPage() {
  const router = useRouter();
  useEffect(() => {
    // Attempt to retrieve restaurantId from localStorage
    const restaurantId = localStorage.getItem('restaurantId');
    if (restaurantId) {
      router.replace(`/${restaurantId}/kitchen`);
    } else {
      router.replace('/'); // If no ID, go to access code page
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg text-foreground">Redirigiendo...</p>
      </div>
    </div>
  );
}
