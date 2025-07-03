
export type OrderItemStatus = 'nueva' | 'enviada_cocina' | 'en_preparacion' | 'listo_servir' | 'entregado';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  status: OrderItemStatus;
  variants: string[];
  category: 'platillos' | 'bebidas_postres';
  menuItemId: string;
  sentToKitchenAt?: string;
}

export type TableStatus = 'libre' | 'ocupada' | 'esperando_cuenta';

export interface Table {
  id: number;
  status: TableStatus;
  order: OrderItem[];
  name?: string;
  occupiedAt?: string;
}

export interface VariantOption {
  type: string;
  options: string[];
  allowMultiple?: boolean;
  isRequired?: boolean;
  isDobleSeleccion?: boolean;
}

export interface DisableRule {
  when: string;
  disable: string[];
}

export interface ShowRule {
  when: string;
  show: string[];
}

export interface RecipeIngredient {
  inventoryItemId: string;
  amount: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  variants: VariantOption[];
  variantPrices?: { [key: string]: number };
  ingredients?: string;
  recipe?: RecipeIngredient[];
  isMixto?: boolean;
  disableRules?: DisableRule[];
  showRules?: ShowRule[];
  prepTimeLimit?: number;
}

export interface Menu {
  platillos: MenuItem[];
  bebidas_postres: MenuItem[];
}

export interface CompletedOrder {
  id: string;
  tableId: number;
  order: OrderItem[];
  total: number;
  date: string;
}

export interface InventoryItem {
    id: string;
    name: string;
    stock: number;
    unit: 'kg' | 'g' | 'lt' | 'ml' | 'pz';
    lowStockThreshold: number;
}

export interface FeatureSet {
  analytics_dashboard: boolean;
  inventory_management: boolean;
  pin_security: boolean;
}

// Representa la estructura completa de un solo restaurante en la BD
export interface Restaurant {
    tables: Table[];
    menu: Menu;
    completed_orders: CompletedOrder[];
    inventory: InventoryItem[];
    features: FeatureSet;
    pin?: string;
}
