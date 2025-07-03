import { config } from 'dotenv';
config();

import '@/ai/flows/generate-dish-description.ts';
import '@/ai/flows/generate-daily-special.ts';
import '@/ai/flows/parse-voice-order.ts';
