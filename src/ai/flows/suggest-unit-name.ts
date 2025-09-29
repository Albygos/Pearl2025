'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting a unit name based on the event theme.
 *
 * @exports suggestUnitName - An async function to generate a unit name.
 * @exports SuggestUnitNameInput - The input type for the suggestUnitName function.
 * @exports SuggestUnitNameOutput - The output type for the suggestUnitName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestUnitNameInputSchema = z.object({
  eventTheme: z
    .string()
    .describe('The theme of the event, used to inspire the unit name.'),
});
export type SuggestUnitNameInput = z.infer<typeof SuggestUnitNameInputSchema>;

const SuggestUnitNameOutputSchema = z.object({
  unitName: z
    .string()
    .describe('A creative and relevant name for the participating unit.'),
});
export type SuggestUnitNameOutput = z.infer<typeof SuggestUnitNameOutputSchema>;

export async function suggestUnitName(input: SuggestUnitNameInput): Promise<SuggestUnitNameOutput> {
  return suggestUnitNameFlow(input);
}

const suggestUnitNamePrompt = ai.definePrompt({
  name: 'suggestUnitNamePrompt',
  input: {schema: SuggestUnitNameInputSchema},
  output: {schema: SuggestUnitNameOutputSchema},
  prompt: `You are a creative name generator for event units.

  Based on the event theme, generate a unique and catchy name for a participating unit.

  Event Theme: {{{eventTheme}}}

  Unit Name:`,
});

const suggestUnitNameFlow = ai.defineFlow(
  {
    name: 'suggestUnitNameFlow',
    inputSchema: SuggestUnitNameInputSchema,
    outputSchema: SuggestUnitNameOutputSchema,
  },
  async input => {
    const {output} = await suggestUnitNamePrompt(input);
    return output!;
  }
);
