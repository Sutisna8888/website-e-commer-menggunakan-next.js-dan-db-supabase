export interface Topping {
  id: string;
  foodItemId: string;
  name: string;
  price: number;
}

export interface Variant {
  id: string;
  foodItemId: string;
  name: string;
  options: string;
  defaultValue: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  prepTime: string;
  isAvailable: boolean;
  soldCount?: number;
  toppings?: Topping[];
  variants?: Variant[];
}

export type FoodCategory = 'Semua' | 'Makanan Utama' | 'Cemilan' | 'Minuman' | 'Sehat';

export interface CartItem {
  id: string; // ID unik gabungan item + kustomisasi
  foodItem: FoodItem;
  quantity: number;
  selectedToppings: { name: string; price: number }[];
  spiceLevel: string;
  notes: string;
  customPrice: number; // Harga total dasar + topping
}
