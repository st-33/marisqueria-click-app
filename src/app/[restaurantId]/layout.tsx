
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const [isVerified, setIsVerified] = useState(false);
  
  const restaurantId = params.restaurantId as string;

  useEffect(() => {
    const savedRestaurantId = localStorage.getItem('restaurantId');
    if (savedRestaurantId && savedRestaurantId === restaurantId) {
      setIsVerified(true);
    } else {
      // If the URL doesn't match localStorage or localStorage is empty,
      // clear it and go back to the access code page.
      localStorage.removeItem('restaurantId');
      router.replace('/');
    }
  }, [restaurantId, router]);

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-16 w-16 text-primary mx-auto" />
          <p className="mt-4 text-lg text-foreground">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
