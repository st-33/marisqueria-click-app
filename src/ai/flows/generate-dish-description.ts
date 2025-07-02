'use server';

/**
 * @fileOverview AI-powered dish description generator.
 *
 * - generateDishDescription - A function that generates a description for a dish.
 * - GenerateDishDescriptionInput - The input type for the generateDishDescription function.
 * - GenerateDishDescriptionOutput - The return type for the generateDishDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDishDescriptionInputSchema = z.object({
  dishName: z.string().describe('The name of the dish to generate a description for.'),
});
export type GenerateDishDescriptionInput = z.infer<typeof GenerateDishDescriptionInputSchema>;

const GenerateDishDescriptionOutputSchema = z.object({
  description: z.string().describe('The generated description of the dish.'),
});
export type GenerateDishDescriptionOutput = z.infer<typeof GenerateDishDescriptionOutputSchema>;

export async function generateDishDescription(input: GenerateDishDescriptionInput): Promise<GenerateDishDescriptionOutput> {
  return generateDishDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDishDescriptionPrompt',
  input: {schema: GenerateDishDescriptionInputSchema},
  output: {schema: GenerateDishDescriptionOutputSchema},
  prompt: `Actúa como un experto en marketing gastronómico. Genera una descripción para un menú que sea irresistible, apetitosa y evocadora (máximo 50 palabras) para el platillo: "{{dishName}}". Enfócate en la frescura de los ingredientes, las sensaciones y la experiencia de sabor única que ofrece. Haz que el cliente no pueda resistirse a pedirlo.`,
});

const generateDishDescriptionFlow = ai.defineFlow(
  {
    name: 'generateDishDescriptionFlow',
    inputSchema: GenerateDishDescriptionInputSchema,
    outputSchema: GenerateDishDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
