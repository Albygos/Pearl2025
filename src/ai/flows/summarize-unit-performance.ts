// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Summarizes a unit's performance based on scores and photo access activity.
 *
 * @exports summarizeUnitPerformance - An async function to summarize unit performance.
 * @exports SummarizeUnitPerformanceInput - The input type for the summarizeUnitPerformance function.
 * @exports SummarizeUnitPerformanceOutput - The output type for the summarizeUnitPerformance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeUnitPerformanceInputSchema = z.object({
  unitName: z.string().describe('The name of the unit to summarize.'),
  score: z.number().describe('The unit\'s score.'),
  photoAccessCount: z
    .number()
    .describe('The number of times the unit accessed the photo gallery.'),
});
export type SummarizeUnitPerformanceInput = z.infer<
  typeof SummarizeUnitPerformanceInputSchema
>;

const SummarizeUnitPerformanceOutputSchema = z.object({
  summary: z.string().describe('A summary of the unit\'s performance.'),
});
export type SummarizeUnitPerformanceOutput = z.infer<
  typeof SummarizeUnitPerformanceOutputSchema
>;

export async function summarizeUnitPerformance(
  input: SummarizeUnitPerformanceInput
): Promise<SummarizeUnitPerformanceOutput> {
  return summarizeUnitPerformanceFlow(input);
}

const summarizeUnitPerformancePrompt = ai.definePrompt({
  name: 'summarizeUnitPerformancePrompt',
  input: {schema: SummarizeUnitPerformanceInputSchema},
  output: {schema: SummarizeUnitPerformanceOutputSchema},
  prompt: `You are an event performance summarizer.

  Based on the unit's name, score, and photo access count, generate a concise summary of their performance and engagement.

  Unit Name: {{{unitName}}}
  Score: {{{score}}}
  Photo Access Count: {{{photoAccessCount}}}

  Summary:`,
});

const summarizeUnitPerformanceFlow = ai.defineFlow(
  {
    name: 'summarizeUnitPerformanceFlow',
    inputSchema: SummarizeUnitPerformanceInputSchema,
    outputSchema: SummarizeUnitPerformanceOutputSchema,
  },
  async input => {
    const {output} = await summarizeUnitPerformancePrompt(input);
    return output!;
  }
);
