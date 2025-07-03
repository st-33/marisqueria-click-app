"use client";

import { useState, useRef, useCallback } from 'react';
import type { Menu } from '@/lib/types';
import { parseVoiceOrderAction } from '@/app/actions';
import type { ParseVoiceOrderOutput } from '@/ai/flows/parse-voice-order';

type VoiceRecognitionHookProps = {
  menu: Menu | null;
  onParseComplete: (items: ParseVoiceOrderOutput['items']) => void;
  onError: (title: string, description: string) => void;
};

export function useVoiceRecognition({ menu, onParseComplete, onError }: VoiceRecognitionHookProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError("Navegador no compatible", "La toma de pedidos por voz no está disponible en tu navegador.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'es-MX';
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
        onParseComplete([]); // Clear previous results
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          finalTranscript += event.results[i][0].transcript;
        }
        setTranscript(finalTranscript);
      };
      
      recognition.onend = async () => {
        setIsListening(false);
        // We use a local copy of the transcript for the async operation
        const finalTranscript = await new Promise<string>(resolve => {
            setTranscript(current => {
                resolve(current);
                return current;
            });
        });

        if (finalTranscript.trim()) {
          setIsProcessing(true);
          try {
            if (!menu) {
                throw new Error("El menú no está disponible para procesar la orden.");
            }
            const parsedItems = await parseVoiceOrderAction(finalTranscript.trim(), menu);
            onParseComplete(parsedItems);
            if (parsedItems.length === 0) {
              onError("No se detectaron platillos", "No se pudo reconocer ningún platillo del menú en tu orden. Intenta de nuevo.");
            }
          } catch (error) {
            onError("Error de IA", "No se pudo procesar la orden. Inténtalo de nuevo.");
          } finally {
            setIsProcessing(false);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        onError("Error de micrófono", "No se pudo acceder al micrófono o se detuvo la grabación.");
      };
      
      recognitionRef.current = recognition;
    }
    
    recognitionRef.current.start();
  }, [menu, onParseComplete, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  return {
    isListening,
    isProcessing,
    transcript,
    startListening,
    stopListening,
  };
}
