import { create } from 'zustand'

export type SauceItem = {
  sauce: { id: number; name: string; spice: number }
  quantity: number
}

export type CartItem = {
  notas: boolean;
  product: { id: number; name: string; price: number; description?: string; image?: string }
  quantity: number
  comment?: string
  sauces: SauceItem[]
}

type CartStore = {
  cart: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (index: number) => void
  updateItem: (index: number, item: CartItem) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],

  addItem: (item) => set((state) => ({ cart: [...state.cart, item] })),

  removeItem: (index) =>
    set((state) => ({ cart: state.cart.filter((_, i) => i !== index) })),

  updateItem: (index, item) =>
    set((state) => ({
      cart: state.cart.map((c, i) => (i === index ? item : c)),
    })),

  clearCart: () => set({ cart: [] }),

  total: () =>
    get().cart.reduce(
      (sum, item) =>
        sum +
        item.product.price * item.quantity +
        item.sauces.reduce((s, sauce) => s + sauce.quantity * 0, 0), // ajustar si las salsas tienen costo
      0
    ),
}))
