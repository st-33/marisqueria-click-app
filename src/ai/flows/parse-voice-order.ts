'use server';
/**
 * @fileOverview AI-powered voice order parser.
 *
 * - parseVoiceOrder - A function that parses a transcribed order.
 * - ParseVoiceOrderInput - The input type for the function.
 * - ParseVoiceOrderOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseVoiceOrderInputSchema = z.object({
  transcript: z.string().describe('The transcribed text from the waiter a voice order.'),
  menuJson: z.string().describe('The full menu as a JSON string to validate against.'),
});
export type ParseVoiceOrderInput = z.infer<typeof ParseVoiceOrderInputSchema>;


const ParsedItemSchema = z.object({
    qty: z.number().describe('The quantity of the dish.'),
    name: z.string().describe('The name of the dish, must match a name in the provided menu.'),
    variants: z.array(z.string()).describe('A list of variants for the dish, must match variants in the menu for that dish.'),
});

const ParseVoiceOrderOutputSchema = z.object({
  items: z.array(ParsedItemSchema).describe('A list of parsed order items.'),
});
export type ParseVoiceOrderOutput = z.infer<typeof ParseVoiceOrderOutputSchema>;


export async function parseVoiceOrder(input: ParseVoiceOrderInput): Promise<ParseVoiceOrderOutput> {
  return parseVoiceOrderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseVoiceOrderPrompt',
  input: {schema: ParseVoiceOrderInputSchema},
  output: {schema: ParseVoiceOrderOutputSchema},
  prompt: `Eres un sistema experto de punto de venta para un restaurante de mariscos mexicano. Tu tarea es analizar la transcripción de una orden hablada por un mesero y convertirla en un formato JSON estructurado.

**Reglas Críticas:**
1.  **Exactitud Absoluta:** DEBES usar los nombres de platillos y variantes EXACTAMENTE como aparecen en el menú JSON proporcionado. Si un platillo o variante no existe, no lo inventes.
2.  **Validación Estricta:** Las variantes que identifiques DEBEN pertenecer al platillo con el que las asocias. Por ejemplo, si la orden dice "Tostada de Res" pero "Res" no es una variante de "Tostada", no debes procesar ese ítem.
3.  **Cantidades:** Interpreta cantidades numéricas ('dos', 'una', 'un', 'tres', etc.) y asócialas con los platillos correctos. Si no se menciona cantidad, asume que es 1.
4.  **Manejo de Ambigüedad:** Si la orden es ambigua o no puedes identificar con certeza un platillo del menú, es MEJOR NO INCLUIRLO en la respuesta a incluir algo incorrecto. Devuelve un arreglo de 'items' vacío si no estás seguro.
5.  **Variantes Obligatorias:** Si un platillo requiere una variante obligatoria (ej. 'Tamaño' para un 'Cóctel') y no se especifica en la orden, no incluyas el platillo. No asumas ni infieras variantes obligatorias.

**Ejemplo de la lógica a seguir:**
- Orden: "mándame dos tostadas de ceviche y una coca"
- Menú tiene: \`Platillo: "Tostada", Variantes: ["Ceviche", ...]\` y \`Bebida: "Refresco", Variantes: ["Coca-Cola", ...]\`
- Tu Salida Correcta: \`items: [{ qty: 2, name: "Tostada", variants: ["Ceviche"] }, { qty: 1, name: "Refresco", variants: ["Coca-Cola"] }]\`

**Datos para procesar:**
La transcripción de la orden del mesero es: {{{transcript}}}
El menú del restaurante es: {{{menuJson}}}

Responde ÚNICAMENTE con el objeto JSON estructurado que se te especificó en el esquema de salida. No incluyas texto adicional, explicaciones o disculpas. Si no encuentras ningún platillo válido, responde con \`{"items": []}\`.`,
});

const parseVoiceOrderFlow = ai.defineFlow(
  {
    name: 'parseVoiceOrderFlow',
    inputSchema: ParseVoiceOrderInputSchema,
    outputSchema: ParseVoiceOrderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
