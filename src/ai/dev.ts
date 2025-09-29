import { config } from 'dotenv';
config();

import '@/ai/flows/generate-event-description.ts';
import '@/ai/flows/suggest-unit-name.ts';
import '@/ai/flows/summarize-unit-performance.ts';