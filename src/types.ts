export interface InventoryItem {
  chest: string;
  count: number;
  name: string;
}

export interface ComputerInventory {
  computer: string;
  lastUpdated: string;
  items: InventoryItem[];
}

export type PossibleMessage =
  | {
      type: "opening";
      name: string;
      isTurtle: boolean;
    }
  | {
      type: "eval";
      function: string;
    };
