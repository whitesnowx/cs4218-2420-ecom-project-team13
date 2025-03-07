import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom"; 
import { CartProvider, useCart } from "./cart";

const TestComponent = () => {
  const [cart] = useCart();
  return (
    <div>
      {cart.length > 0 ? (
        <div data-testid="cart-item">{cart[0].name}</div>
      ) : (
        <div data-testid="empty-cart">Cart is empty</div>
      )}
    </div>
  );
};

describe("Cart Context", () => {
  beforeEach(() => {
    jest.spyOn(Storage.prototype, "getItem");
    localStorage.clear(); 
  });

  test("loads cart from localStorage on mount", async () => {
    const mockCart = [{ name: "Test Product 1", price: 1111}];
    localStorage.setItem("cart", JSON.stringify(mockCart));

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    
    await waitFor(() => {
      expect(screen.getByTestId("cart-item")).toHaveTextContent("Test Product 1");
    });

  });

  test("provides default empty cart if localStorage is empty", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId("empty-cart")).toHaveTextContent("Cart is empty");
  });
});
