
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

**Reglas Críticas e Inquebrantables:**
1.  **Exactitud Absoluta del Menú:** DEBES usar los nombres de platillos y variantes EXACTAMENTE como aparecen en el menú JSON proporcionado. Si un platillo o variante no existe, NO LO INVENTES. No asumas ni corrijas errores. Por ejemplo, si el menú dice "Al mojo de ajo" y la orden dice "al mojo", debes usar "Al mojo de ajo".
2.  **Validación Estricta de Variantes:** Las variantes que identifiques DEBEN pertenecer al platillo con el que las asocias, según se define en el menú.
3.  **Interpretación de Palabras Clave:**
    *   "media orden", "media", "chica", "mediana", "grande" son variantes de "Porción" o "Tamaño".
    *   "Sin..." o "que no lleve..." (ej: "sin cebolla") debe mapearse a la variante correspondiente en la categoría "S/N" si existe en el menú para ese platillo.
    *   Presta atención a las preparaciones (ej: "a la diabla", "empanizados", "mixtos").
4.  **Cantidades:** Interpreta cantidades numéricas ('dos', 'una', 'un', 'tres', etc.) y asócialas con los platillos correctos. Si no se menciona cantidad, asume que es 1.
5.  **Manejo de Ambigüedad (Regla de Oro):** Si la orden es ambigua, incompleta o no puedes identificar con certeza un platillo y sus variantes OBLIGATORIAS del menú, es MEJOR NO INCLUIRLO en la respuesta a incluir algo incorrecto.
6.  **Variantes Obligatorias:** Si un platillo del menú tiene variantes marcadas como "isRequired: true", LA ORDEN DEBE ESPECIFICAR UNA OPCIÓN para esa variante. Si no se especifica, NO incluyas el platillo en la respuesta. No asumas ni infieras variantes obligatorias.
7.  **Pedidos Mixtos:** Para platillos 'mixtos', la orden debe especificar las dos preparaciones. Identifícalas y anótalas.

**Ejemplos de la lógica a seguir con el menú actual:**
*   **Orden de voz:** "mándame dos tostadas de camarón y una coca de vidrio"
*   **Salida JSON Correcta (lo que debes generar):**
    {"items": [{"qty": 2, "name": "Tostada de Camarón", "variants": []}, {"qty": 1, "name": "Coca-Cola Vidrio", "variants": []}]}

*   **Orden de voz:** "un cóctel grande de pulpo sin cilantro y una michelada con camarones"
*   **Salida JSON Correcta (lo que debes generar):**
    {"items": [{"qty": 1, "name": "Cóctel", "variants": ["Grande", "Pulpo", "Sin cilantro"]}, {"qty": 1, "name": "Michelada con Camarones", "variants": []}]}

*   **Orden de voz:** "quiero un caldo"
*   **Análisis:** La palabra "caldo" es ambigua porque hay varios en el menú y no se especifica la porción obligatoria.
*   **Salida JSON Correcta (lo que debes generar):**
    {"items": []}

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
