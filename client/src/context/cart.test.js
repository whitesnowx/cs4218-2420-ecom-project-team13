import { render, screen } from "@testing-library/react";
import { CartProvider, useCart } from "./cart";
import { useEffect } from "react";

// Mock localStorage
beforeEach(() => {
  Storage.prototype.getItem = jest.fn(() => JSON.stringify([{ id: 1, name: "Test Product" }]));
  Storage.prototype.setItem = jest.fn();
});

// Test Component to consume `useCart`
const TestComponent = () => {
  const [cart] = useCart();
  
  return (
    <div>
      {cart.length > 0 ? <p data-testid="cart-item">{cart[0].name}</p> : <p data-testid="empty-cart">Cart is empty</p>}
    </div>
  );
};

describe("Cart Context", () => {
  test("loads cart from localStorage on mount", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    // Expect the item from localStorage to appear
    expect(screen.getByTestId("cart-item")).toHaveTextContent("Test Product");
  });

  test("provides default empty cart if localStorage is empty", () => {
    // Mock empty localStorage
    Storage.prototype.getItem = jest.fn(() => null);

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId("empty-cart")).toHaveTextContent("Cart is empty");
  });
});
