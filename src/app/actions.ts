"use server";

import { generateDishDescription } from "@/ai/flows/generate-dish-description";
import { generateDailySpecial, type GenerateDailySpecialOutput } from "@/ai/flows/generate-daily-special";
import { parseVoiceOrder, type ParseVoiceOrderOutput } from "@/ai/flows/parse-voice-order";
import type { Menu, InventoryItem } from "@/lib/types";

export async function getDishDescriptionAction(dishName: string): Promise<string> {
    try {
        const result = await generateDishDescription({ dishName });
        return result.description;
    } catch (error) {
        console.error("Error generating dish description:", error);
        return "No se pudo generar una descripción en este momento. Inténtalo de nuevo más tarde.";
    }
}

export async function getDailySpecialAction(menu: Menu, inventory: InventoryItem[]): Promise<GenerateDailySpecialOutput> {
    try {
        const result = await generateDailySpecial({
            menuJson: JSON.stringify(menu),
            inventoryJson: JSON.stringify(inventory)
        });
        return result;
    } catch (error) {
        console.error("Error generating daily special:", error);
        return {
            name: "Error",
            reason: "Fallo en la IA",
            description: "No se pudo generar una sugerencia. Por favor, inténtalo de nuevo más tarde."
        };
    }
}

export async function parseVoiceOrderAction(transcript: string, menu: Menu): Promise<ParseVoiceOrderOutput['items']> {
    if (!transcript) return [];
    try {
        const result = await parseVoiceOrder({
            transcript,
            menuJson: JSON.stringify(menu)
        });
        return result.items || [];
    } catch (error) {
        console.error("Error parsing voice order:", error);
        // Return an empty array or a specific error structure
        return [];
    }
}
