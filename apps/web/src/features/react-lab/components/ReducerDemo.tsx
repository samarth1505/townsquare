import { useReducer } from "react";

type CartItem = { id: string; name: string; price: number; qty: number };

// EVERY way the cart can change, written down once as a plain object ("an action").
// A union type means a typo in the action name, or a missing field, is a compile error.
type CartAction =
  | { type: "added"; id: string; name: string; price: number }
  | { type: "quantityChanged"; id: string; delta: 1 | -1 }
  | { type: "removed"; id: string }
  | { type: "cleared" };

// A REDUCER: a PURE function (oldState, action) -> newState. No fetching, no timers, no mutation.
// All the rules about how the cart changes live here, in one place, instead of being spread over many handlers.
function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case "added": {
      const existing = state.find((item) => item.id === action.id);
      if (existing) {
        return state.map((item) => (item.id === action.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...state, { id: action.id, name: action.name, price: action.price, qty: 1 }];
    }
    case "quantityChanged":
      // a quantity that reaches 0 removes the line: one rule, written once
      return state
        .map((item) => (item.id === action.id ? { ...item, qty: item.qty + action.delta } : item))
        .filter((item) => item.qty > 0);
    case "removed":
      return state.filter((item) => item.id !== action.id);
    case "cleared":
      return [];
  }
}

const PRODUCTS = [
  { id: "pen", name: "Pen", price: 20 },
  { id: "notebook", name: "Notebook", price: 90 },
  { id: "bag", name: "Bag", price: 650 },
];

export default function ReducerDemo() {
  // useReducer returns the current state and a `dispatch` function. dispatch(action) asks React to run the reducer.
  const [cart, dispatch] = useReducer(cartReducer, []);
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0); // derived: never stored separately

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {PRODUCTS.map((product) => (
          <button
            key={product.id}
            type="button"
            className="rounded-lg border border-app-control-border px-3 py-1.5"
            onClick={() => dispatch({ type: "added", ...product })}
          >
            Add {product.name} (₹{product.price})
          </button>
        ))}
      </div>

      {cart.length === 0 ? (
        <p className="text-sm text-app-muted">The cart is empty.</p>
      ) : (
        <ul className="m-0 mt-3 list-none p-0">
          {cart.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 py-1"
            >
              <span className="flex-1">{item.name}</span>
              <button
                type="button"
                aria-label={`Fewer ${item.name}`}
                className="rounded border border-app-control-border px-2"
                onClick={() => dispatch({ type: "quantityChanged", id: item.id, delta: -1 })}
              >
                −
              </button>
              <span aria-label={`${item.qty} ${item.name}`}>{item.qty}</span>
              <button
                type="button"
                aria-label={`More ${item.name}`}
                className="rounded border border-app-control-border px-2"
                onClick={() => dispatch({ type: "quantityChanged", id: item.id, delta: 1 })}
              >
                +
              </button>
              <button
                type="button"
                className="text-app-danger underline"
                onClick={() => dispatch({ type: "removed", id: item.id })}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 mb-0 font-semibold">
        Total: ₹<span data-testid="cart-total">{total}</span>
        {cart.length > 0 && (
          <button
            type="button"
            className="ml-3 text-sm font-normal underline"
            onClick={() => dispatch({ type: "cleared" })}
          >
            Clear cart
          </button>
        )}
      </p>
    </div>
  );
}
