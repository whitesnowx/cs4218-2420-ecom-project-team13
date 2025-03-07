import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom"; 
import { CartProvider, useCart } from "./cart";

const TestComponent = () => {
  const [cart] = useCart();
  return (
    <div>
      {cart.length > 0 ? (
        cart.map((item, index) => (
          <div key={index} data-testid="cart-item">
            {item.name} - ${item.price}
          </div>
        ))
      ) : (
        <div data-testid="empty-cart">Cart is empty</div>
      )}
    </div>
  );
};

describe("Cart Context", () => {
  beforeEach(() => {
    localStorage.clear(); 

    jest.spyOn(Storage.prototype, "setItem");
    jest.spyOn(Storage.prototype, "removeItem");
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("provides default empty cart if localStorage is empty", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId("empty-cart")).toBeInTheDocument();
    expect(screen.getByTestId("empty-cart")).toHaveTextContent("Cart is empty");
    expect(screen.queryByTestId("cart-item")).not.toBeInTheDocument();

  });

  test("loads an empty cart if no cart being set in localStorage", () => {
    localStorage.removeItem("cart");
  
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
  
    expect(screen.getByTestId("empty-cart")).toBeInTheDocument();
    expect(screen.getByTestId("empty-cart")).toHaveTextContent("Cart is empty");
    expect(screen.queryByTestId("cart-item")).not.toBeInTheDocument();

  });

  test("loads cart from localStorage on mount - 1 item", async () => {
    const mockCart = [
      { name: "Test Product 1", price: 1111},
    ];
    localStorage.setItem("cart", JSON.stringify(mockCart));

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const cartItems = screen.getAllByTestId("cart-item");
    
    expect(cartItems).toHaveLength(1);
    expect(cartItems[0]).toHaveTextContent("Test Product 1");
    expect(cartItems[0]).toHaveTextContent("1111");

    cartItems.forEach((cartItem) => {
      expect(cartItem).not.toHaveTextContent("Test Product 9");
      expect(cartItem).not.toHaveTextContent("Something Else");
      expect(cartItem).not.toHaveTextContent("Cart is empty");
      expect(cartItem).not.toHaveTextContent("2222");
    });

    expect(screen.queryByTestId("empty-cart")).not.toBeInTheDocument();
  });

  test("loads cart from localStorage on mount - 2 item", async () => {
    const mockCart = [
      { name: "Test Product 1", price: 1111},
      { name: "Test Product 2", price: 9876}
    ];
    localStorage.setItem("cart", JSON.stringify(mockCart));

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const cartItems = screen.getAllByTestId("cart-item");
    
    expect(cartItems).toHaveLength(2);
    expect(cartItems[0]).toHaveTextContent("Test Product 1");
    expect(cartItems[0]).toHaveTextContent("1111");
    expect(cartItems[1]).toHaveTextContent("Test Product 2");
    expect(cartItems[1]).toHaveTextContent("9876");

    cartItems.forEach((cartItem) => {
      expect(cartItem).not.toHaveTextContent("Test Product 9");
      expect(cartItem).not.toHaveTextContent("Something Else");
      expect(cartItem).not.toHaveTextContent("Cart is empty");
      expect(cartItem).not.toHaveTextContent("2222");
    });

    expect(screen.queryByTestId("empty-cart")).not.toBeInTheDocument();
  });

  test("loads cart from localStorage on mount - many (20) item", async () => {
    const mockCart = [
      { name: "Test Product 1", price: 1111},
      { name: "Test Product 2", price: 9876},
      { name: "Test Product 3", price: 7777},
      { name: "Test Product 4", price: 7777},
      { name: "Test Product 5", price: 7777},
      { name: "Test Product 6", price: 7777},
      { name: "Test Product 7", price: 7777},
      { name: "Test Product 8", price: 7777},
      { name: "Test Product 9", price: 7777},
      { name: "Test Product 10", price: 7777},
      { name: "Test Product 11", price: 7777},
      { name: "Test Product 12", price: 7777},
      { name: "Test Product 13", price: 7777},
      { name: "Test Product 14", price: 7777},
      { name: "Test Product 15", price: 7777},
      { name: "Test Product 16", price: 7777},
      { name: "Test Product 17", price: 7777},
      { name: "Test Product 18", price: 7777},
      { name: "Test Product 19", price: 7777},
      { name: "Test Product 20", price: 8888}
    ];
    localStorage.setItem("cart", JSON.stringify(mockCart));

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    const cartItems = screen.getAllByTestId("cart-item");
    
    expect(cartItems).toHaveLength(20);
    expect(cartItems[0]).toHaveTextContent("Test Product 1");
    expect(cartItems[0]).toHaveTextContent("1111");
    expect(cartItems[19]).toHaveTextContent("Test Product 20");
    expect(cartItems[19]).toHaveTextContent("8888");

    cartItems.forEach((cartItem) => {
      expect(cartItem).not.toHaveTextContent("Test Product 21");
      expect(cartItem).not.toHaveTextContent("Something Else");
      expect(cartItem).not.toHaveTextContent("Cart is empty");
      expect(cartItem).not.toHaveTextContent("2222");
    });

    expect(screen.queryByTestId("empty-cart")).not.toBeInTheDocument();
  });
 

  // test("cart contents updates added item", () => {
  //   const mockCart = [{ name: "Test Product 1", price: 1111 }];
  //   localStorage.setItem("cart", JSON.stringify(mockCart));
  
  //   render(
  //     <CartProvider>
  //       <TestComponent />
  //     </CartProvider>
  //   );
  
  //   const cartItems = screen.getAllByTestId("cart-item");
  //   expect(cartItems).toHaveLength(1);
  //   expect(cartItems[0]).toHaveTextContent("Test Product 1");
  
  //   const addedItem = [{ name: "Test Product 2", price: 9876 }];
  //   localStorage.setItem("cart", JSON.stringify(addedItem));
  
  //   render(
  //     <CartProvider>
  //       <TestComponent />
  //     </CartProvider>
  //   );
  
  //   const updatedCartItems = screen.getAllByTestId("cart-item");
  //   expect(updatedCartItems).toHaveLength(2);
  //   expect(updatedCartItems[1]).toHaveTextContent("Test Product 2");
  // });

  // test("cart contents updates removed item", () => {
  //   const mockCart = [{ name: "Test Product 1", price: 1111 }];
  //   localStorage.setItem("cart", JSON.stringify(mockCart));
  
  //   render(
  //     <CartProvider>
  //       <TestComponent />
  //     </CartProvider>
  //   );
  
  //   const cartItems = screen.getAllByTestId("cart-item");
  //   expect(cartItems).toHaveLength(1);
  //   expect(cartItems[0]).toHaveTextContent("Test Product 1");
  
  //   // const addedItem = [{ name: "Test Product 2", price: 9876 }];


  //   localStorage.removeItem("cart");

  //   render(
  //     <CartProvider>
  //       <TestComponent />
  //     </CartProvider>
  //   );
  
  //   expect(screen.getByTestId("empty-cart")).toBeInTheDocument();
  //   expect(screen.getByTestId("empty-cart")).toHaveTextContent("Cart is empty");
  // });
});
