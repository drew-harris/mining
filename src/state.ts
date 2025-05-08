import { Computer } from "../computer";
import type { ComputerInventory } from "./types";

export const computers: Computer[] = [];
export const inventoryData: Map<string, ComputerInventory> = new Map();
