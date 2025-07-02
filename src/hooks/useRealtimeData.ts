
"use client";

import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, runTransaction, getDatabase, get } from 'firebase/database';
import { database } from '@/lib/firebase';

type Updater<T> = (mutator: (currentData: T) => T) => Promise<void>;
type ErrorCallback = (error: Error) => void;

export default function useRealtimeData<T>(
  restaurantId: string,
  path: string, 
  initialData: T | null, 
  onError?: ErrorCallback
) {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);

  const finalPath = `restaurantes/${restaurantId}/${path}`;

  const transactionalUpdate: Updater<T> = useCallback(async (mutator) => {
    if (!database || !restaurantId) {
      const errorMessage = 'Modo Offline: No se pudo conectar a la base de datos o el restaurante no está especificado.';
      console.error(`Firebase not initialized or no restaurantId. Skipping remote update for '${finalPath}'.`);
      if (onError) onError(new Error(errorMessage));
      setData(prevData => (prevData === null ? null : mutator(prevData))); // Optimistic update locally
      throw new Error(errorMessage);
    }

    const dataRef = ref(database, finalPath);
    try {
      await runTransaction(dataRef, (currentData: T | null) => {
        // If the node doesn't exist, we can't create it from scratch here with a mutator.
        // We'll fetch the parent and recreate if needed.
        if (currentData === null) {
            console.warn(`Data at ${finalPath} is null. Transaction may not behave as expected.`);
            // In a real-world scenario, you might want to fetch the parent and reconstruct.
            // For now, we will attempt to apply the mutation to initialData if available.
             if (initialData !== null) {
                return mutator(JSON.parse(JSON.stringify(initialData)));
            }
            return null; // or handle as an error
        }
        return mutator(currentData);
      });
    } catch (error) {
      console.error(`Firebase transaction failed at ${finalPath}: `, error);
      const errorMessage = 'Error al guardar: La operación con la base de datos falló.';
      if (onError) onError(new Error(errorMessage));
      throw new Error(errorMessage);
    }
  }, [finalPath, initialData, onError, restaurantId]);

  useEffect(() => {
    if (!database || !restaurantId) {
      console.warn(`Firebase no está inicializado o no hay ID de restaurante. Usando datos locales para '${finalPath}'.`);
      setData(initialData);
      setLoading(false);
      setIsConnected(false);
      if (onError && !restaurantId) onError(new Error('Modo Offline: No se ha seleccionado un restaurante.'));
      else if (onError) onError(new Error('Modo Offline: No se pudo conectar a la base de datos.'));
      return;
    }

    const connectedRef = ref(getDatabase(), '.info/connected');
    const connectionUnsubscribe = onValue(connectedRef, (snap) => {
      const connected = snap.val() === true;
      setIsConnected(connected);
      if (!connected && onError) {
        onError(new Error('Sin conexión. Intentando reconectar...'));
      }
    });

    const dataRef = ref(database, finalPath);
    
    const dataUnsubscribe = onValue(dataRef, 
      (snapshot) => {
        const value = snapshot.val();
        setData(value !== null ? value : initialData);
        setLoading(false);
      }, 
      (error) => {
        const errorMessage = `Error de Permisos: No se pudo leer la base de datos en '${finalPath}'.`;
        console.error(errorMessage, error);
        if (onError) onError(new Error(errorMessage));
        setData(initialData); // Fallback to initial data on error
        setLoading(false);
      }
    );

    return () => {
        connectionUnsubscribe();
        dataUnsubscribe();
    };
  }, [finalPath, initialData, onError, restaurantId]);

  return [data, transactionalUpdate, loading, isConnected] as const;
}
