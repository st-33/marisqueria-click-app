
import type { Table, Menu, CompletedOrder, InventoryItem } from '@/lib/types';

export const initialTables: Table[] = [
    { id: 1, status: 'libre', order: [] },
    { id: 2, status: 'libre', order: [] },
    { id: 3, status: 'libre', order: [] },
    { id: 4, status: 'libre', order: [] },
    { id: 5, status: 'libre', order: [] },
    { id: 6, status: 'libre', order: [] },
    { id: 7, status: 'libre', order: [] },
    { id: 8, status: 'libre', order: [] },
];

export const initialMenu: Menu = {
    platillos: [
        {
            id: 'coctel-de-mariscos-1', name: 'Cóctel', price: 90,
            description: "Refrescante cóctel con ingredientes frescos y un toque de la casa.",
            variantPrices: { "Mediano": 30, "Grande": 65 },
            variants: [
                { type: 'Tamaño', options: ['Chico', 'Mediano', 'Grande'], isRequired: true },
                { type: 'Tipo', options: ['Camarón', 'Pulpo', 'Ostión', 'C/P', 'P/O', 'C/O', 'Campechano'], isRequired: true },
                { type: 'S/N', options: ['Cilantro', 'Cebolla', 'Aguacate', 'Picante'], allowMultiple: true }
            ],
            ingredients: "camaron,pulpo,ostion,cebolla,aguacate,cilantro,picante",
            recipe: [
              { "inventoryItemId": "camaron-1", "amount": 0.08 },
              { "inventoryItemId": "tomate-4", "amount": 0.05 },
              { "inventoryItemId": "cebolla-5", "amount": 0.03 }
            ]
        },
        {
            id: 'tostada-2', name: 'Tostada', price: 40,
            description: "Tostada crujiente con una cama de mariscos frescos.",
            variantPrices: { "Pulpo": 10, "Mixta": 15 },
            variants: [
                { type: 'Relleno', options: ['Ceviche', 'Camarón', 'Pulpo', 'Jaiba', 'Mixta'], isRequired: true }
            ],
            recipe: [
                { inventoryItemId: 'pescado-3', amount: 0.08 },
                { inventoryItemId: 'tomate-4', amount: 0.05 },
                { inventoryItemId: 'cebolla-5', amount: 0.03 }
            ]
        },
        {
            id: 'empanada-3', name: 'Empanada', price: 35,
            description: "Empanada doradita y caliente, rellena de un guiso de mariscos. Orden de 3.",
            variants: [
                { type: 'Relleno', options: ['Camarón', 'Pescado', 'Jaiba', 'Queso'], isRequired: true }
            ],
             "recipe": [
              { "inventoryItemId": "pescado-3", "amount": 0.1 },
              { "inventoryItemId": "cebolla-5", "amount": 0.05 }
            ]
        },
        {
            id: 'filetes-4', name: 'Filetes', price: 160,
            description: "Suave filete de pescado, preparado a tu elección.",
            variants: [
                { type: 'Estilo', options: ['Empanizado', 'Al Mojo', 'A la Diabla', 'Plancha', 'Empapelado', 'Relleno'], isRequired: true },
                { type: 'Guarnición', options: ['Arroz y Ensalada', 'Papas Fritas'], isRequired: true },
                { type: 'Extras', options: ['Queso Gratinado', 'Camarones Extra'], allowMultiple: true }
            ],
            variantPrices: {
              "Empapelado": 15, "Relleno": 25, "Queso Gratinado": 25, "Camarones Extra": 40
            },
            showRules: [
              { "when": "Relleno", "show": ["Extras"] }
            ],
             "recipe": [
              { "inventoryItemId": "pescado-3", "amount": 0.25 }
            ]
        },
        {
            id: 'mojarra-5', name: 'Mojarra', price: 170,
            description: "Mojarra frita entera, servida con arroz y ensalada fresca.",
            variants: [
                { type: 'Estilo', options: ['Frita', 'Al Mojo', 'A la Diabla', 'Enchipoclada'], isRequired: true },
                { type: 'Guarnición', options: ['Arroz y Ensalada', 'Papas Fritas'], isRequired: true },
                { type: 'S/N', options: ['Cebolla', 'Ajo'], allowMultiple: true }
            ],
            disableRules: [
                { when: 'Frita', disable: ['Cebolla', 'Ajo'] }
            ],
            recipe: []
        },
        {
            id: 'camarones-mixtos-6', name: 'Camarones Mixtos', price: 185,
            isMixto: true,
            description: "Elige dos de nuestras preparaciones especiales. ¡Combina a tu antojo!",
            variants: [
                { type: 'Preparación', options: ['Al Mojo', 'A la Diabla', 'Enchipotlado', 'Empanizados', 'Plancha'], isRequired: true },
                { type: 'Proteína', options: ['Camarón Pelado', 'Camarón con Cáscara', 'Pulpo'], isRequired: true },
                { type: 'Guarnición', options: ['Arroz y Ensalada', 'Papas Fritas'], isRequired: true },
            ],
            recipe: []
        },
        {
            id: 'caldo-sopa-7', name: 'Caldo / Sopa', price: 130, 
            description: "Elige entre nuestro reconfortante caldo de pescado o nuestra rica sopa de mariscos.",
            variants: [
                { type: 'Tipo', options: ['Caldo de Pescado', 'Sopa de Mariscos'], isRequired: true },
                { type: 'Porción', options: ['Completa', 'Media Orden'], isRequired: true },
                { type: 'Extras', options: ['Queso', 'Crema', 'Aguacate'], allowMultiple: true },
                { type: 'S/N', options: ['Sin Jaiba', 'Sin Pulpo'], allowMultiple: true }
            ],
            variantPrices: {
              "Sopa de Mariscos": 20, "Media Orden": -40, "Queso": 15, "Crema": 10, "Aguacate": 20
            },
            showRules: [
                { when: 'Sopa de Mariscos', show: ['Extras'] }
            ],
            disableRules: [
                { when: 'Caldo de Pescado', disable: ['Sin Jaiba', 'Sin Pulpo', 'Queso', 'Crema'] }
            ],
            recipe: []
        },
        {
            id: 'pulpo-al-gusto-8', name: 'Pulpo al Gusto', price: 180,
            description: "Pulpo tierno y sabroso, cocinado en la preparación que más te guste.",
            variants: [
                { type: 'Estilo', options: ['Al Mojo', 'A la Diabla', 'Encebollado', 'A la Mexicana', 'Al Ajillo'], isRequired: true },
                { type: 'Guarnición', options: ['Arroz y Ensalada', 'Papas Fritas'], isRequired: true },
            ],
            "recipe": [
                { "inventoryItemId": "pulpo-2", "amount": 0.25 }
            ]
        },
        {
            id: 'aguachile-9', name: 'Aguachile', price: 0,
            description: "Aguachile fresco y picante, tú eliges el precio según el tamaño.",
            variants: [
                { type: 'Estilo', options: ['Rojo', 'Verde', 'Negro'], isRequired: true },
                { type: 'Picante', options: ['Poco', 'Medio', 'Mucho'], isRequired: true },
            ],
            recipe: []
        },
    ],
    bebidas_postres: [
        { 
            id: 'refrescos-1', name: 'Refresco', price: 25, description: "Refrescos de lata de 355ml.", 
            variants: [{ type: 'Sabor', options: ['Coca-Cola', 'Sprite', 'Fanta', 'Manzanita', 'Agua Mineral'], isRequired: true }],
            recipe: []
        },
        { id: 'coca-cola-vidrio-2', name: 'Coca-Cola Vidrio', price: 30, description: "Coca-Cola de vidrio 355ml.", variants: [], recipe: [] },
        { 
            id: 'cerveza-nacional-3', name: 'Cerveza Nacional', price: 40, description: "Cerveza nacional 355ml.",
            variants: [{ type: 'Marca', options: ['Corona', 'Victoria', 'Modelo Especial', 'Tecate Light', 'Pacífico'], isRequired: true }],
            recipe: []
        },
        { 
            id: 'cerveza-media-4', name: 'Cerveza Media', price: 50, description: "Cerveza de media 473ml.",
            variants: [{ type: 'Marca', options: ['Corona', 'Victoria'], isRequired: true }],
            recipe: []
        },
        { id: 'michelada-5', name: 'Michelada', price: 55, description: "Tu cerveza preparada con sal, limón y salsas.", variants: [], recipe: [] },
        { id: 'michelada-camaron-6', name: 'Michelada con Camarón', price: 110, description: "La michelada de la casa con camarones frescos.", variants: [], recipe: [] },
        { id: 'limonada-rusa-7', name: 'Limonada / Rusa', price: 40, description: "Agua mineral preparada o limonada fresca.", variants: [], recipe: [] },
        { 
            id: 'jarra-agua-8', name: 'Jarra de Agua', price: 80,
            description: "Jarra de agua fresca de 1.5 litros para compartir.",
            variantPrices: { "Limón": 10, "Naranja": 10 },
            variants: [
                { type: 'Sabor', options: ['Horchata', 'Jamaica', 'Limón', 'Naranja'], isRequired: true }
            ],
            recipe: []
        },
        { id: 'cafe-olla-9', name: 'Café de Olla', price: 25, description: "Café de olla caliente.", variants: [], recipe: [] },
        { id: 'flan-napolitano-10', name: 'Flan Napolitano', price: 45, description: "El flan cremoso de la casa.", variants: [], recipe: [] },
        { 
            id: 'duraznos-crema-11', name: 'Duraznos con Crema', price: 40, 
            description: "Duraznos en almíbar servidos con crema.",
            variants: [],
            recipe: []
        },
    ]
};

export const initialCompletedOrders: CompletedOrder[] = [
    {
      "id": "order-yesterday-1", "tableId": 2, "total": 350.50,
      "date": "2024-07-28T14:30:00Z",
      "order": [
        { "id": "tostada-2-1", "name": "Tostada", "price": 55, "qty": 2, "status": "entregado", "variants": ["Mixta"], "category": "platillos", "menuItemId": "tostada-2" },
        { "id": "filete-4-1", "name": "Filetes", "price": 200, "qty": 1, "status": "entregado", "variants": ["Empapelado", "Papas Fritas"], "category": "platillos", "menuItemId": "filetes-4" },
        { "id": "refresco-1-1", "name": "Refresco", "price": 25, "qty": 2, "status": "entregado", "variants": ["Coca-Cola"], "category": "bebidas_postres", "menuItemId": "refrescos-1" }
      ]
    },
     {
      "id": "order-yesterday-2", "tableId": 5, "total": 185.00,
      "date": "2024-07-28T19:00:00Z",
      "order": [
        { "id": "coctel-1-2", "name": "Cóctel", "price": 155, "qty": 1, "status": "entregado", "variants": ["Grande", "Campechano"], "category": "platillos", "menuItemId": "coctel-de-mariscos-1" },
        { "id": "cerveza-3-2", "name": "Cerveza Nacional", "price": 30, "qty": 1, "status": "entregado", "variants": ["Corona"], "category": "bebidas_postres", "menuItemId": "cerveza-nacional-3" }
      ]
    }
];

export const initialInventory: InventoryItem[] = [
    { id: 'camaron-1', name: 'Camarón', stock: 10, unit: 'kg', lowStockThreshold: 2 },
    { id: 'pulpo-2', name: 'Pulpo', stock: 8, unit: 'kg', lowStockThreshold: 1.5 },
    { id: 'pescado-3', name: 'Filete de Pescado', stock: 15, unit: 'kg', lowStockThreshold: 3 },
    { id: 'tomate-4', name: 'Tomate', stock: 5, unit: 'kg', lowStockThreshold: 1 },
    { id: 'cebolla-5', name: 'Cebolla', stock: 5, unit: 'kg', lowStockThreshold: 1 },
    { id: 'limon-6', name: 'Limón', stock: 8, unit: 'kg', lowStockThreshold: 2 },
    { id: 'aguacate-7', name: 'Aguacate', stock: 20, unit: 'pz', lowStockThreshold: 5 },
    { id: 'cerveza-8', name: 'Cerveza Corona', stock: 48, unit: 'pz', lowStockThreshold: 12 },
    { id: 'refresco-9', name: 'Coca-Cola', stock: 50, unit: 'pz', lowStockThreshold: 12 },
];
