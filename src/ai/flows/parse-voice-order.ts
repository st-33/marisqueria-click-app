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
  prompt: `Eres un sistema experto en tomar órdenes para un restaurante de mariscos mexicano. Tu tarea es analizar la transcripción de una orden hablada por un mesero y convertirla en un formato JSON estructurado.

Se te proporcionará el menú completo del restaurante en formato JSON. DEBES usar los nombres y variantes EXACTAMENTE como aparecen en el menú para que el sistema los reconozca.

La orden del mesero está en español. Interpreta cantidades numéricas ('dos', 'una', 'un', 'tres', 'cuatro', etc.) y asócialas con los platillos correctos.

Ejemplo: si la orden es "mándame dos tostadas de ceviche y una coca", y el menú tiene un platillo "Tostada" con una variante de "Relleno" que incluye "Ceviche", y una bebida "Refresco" con una variante de "Sabor" que incluye "Coca-Cola", tu salida debería identificar correctamente:
- 1 item: { qty: 2, name: "Tostada", variants: ["Ceviche"] }
- 2 item: { qty: 1, name: "Refresco", variants: ["Coca-Cola"] }

Si no se especifican variantes obligatorias, intenta inferir la más común o la única disponible. Si la orden es ambigua, haz tu mejor esfuerzo para interpretarla basándote en el menú.

Aquí están los datos:
La transcripción de la orden del mesero es: {{{transcript}}}
El menú del restaurante es: {{{menuJson}}}

Responde ÚNICAMENTE con el objeto JSON estructurado que se te especificó en el esquema de salida. No incluyas texto adicional, explicaciones o disculpas.`,
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
