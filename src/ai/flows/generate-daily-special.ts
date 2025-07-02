'use server';
/**
 * @fileOverview AI-powered daily special generator.
 *
 * - generateDailySpecial - A function that suggests a daily special from the menu.
 * - GenerateDailySpecialInput - The input type for the function.
 * - GenerateDailySpecialOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDailySpecialInputSchema = z.object({
  menuJson: z.string().describe('The full menu as a JSON string.'),
  inventoryJson: z.string().describe('The current inventory as a JSON string.'),
});
export type GenerateDailySpecialInput = z.infer<typeof GenerateDailySpecialInputSchema>;

const GenerateDailySpecialOutputSchema = z.object({
  name: z.string().describe('The name of the suggested dish.'),
  reason: z.string().describe('A brief reason why this dish was chosen (e.g., uses fresh ingredients, is a classic).'),
  description: z.string().describe('A creative and enticing description for the daily special to show to customers.'),
});
export type GenerateDailySpecialOutput = z.infer<typeof GenerateDailySpecialOutputSchema>;

export async function generateDailySpecial(input: GenerateDailySpecialInput): Promise<GenerateDailySpecialOutput> {
  return generateDailySpecialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDailySpecialPrompt',
  input: {schema: GenerateDailySpecialInputSchema},
  output: {schema: GenerateDailySpecialOutputSchema},
  prompt: `Eres un chef y gerente de marketing para un restaurante de mariscos. Tu tarea es analizar el menú y el inventario para proponer una "Sugerencia del Día" que sea atractiva y estratégica.

  Aquí están los datos:
  Menú: {{{menuJson}}}
  Inventario: {{{inventoryJson}}}

  Analiza los datos y elige UN SOLO platillo. Considera platillos que sean populares, deliciosos o que usen ingredientes que tengamos en buen stock.

  Responde con el nombre del platillo, una razón breve y estratégica de por qué lo elegiste (para uso interno, ej: "Usa el camarón que tenemos en abundancia"), y una descripción creativa y apetitosa (máximo 40 palabras) para presentarle a los clientes.`,
});

const generateDailySpecialFlow = ai.defineFlow(
  {
    name: 'generateDailySpecialFlow',
    inputSchema: GenerateDailySpecialInputSchema,
    outputSchema: GenerateDailySpecialOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
