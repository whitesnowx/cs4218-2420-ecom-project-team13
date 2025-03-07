import "@testing-library/jest-dom";
import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { CartProvider, useCart } from "../context/cart";
import { AuthProvider, useAuth } from "../context/auth";
import CartPage from "../pages/CartPage";
import axios from "axios";
import { useEffect } from "react"; 

jest.mock("axios");

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("braintree-web-drop-in-react", () => {
    return jest.fn(() => <div data-testid="braintree-drop-in-mock">DropIn Mock</div>);
  });

describe("CartPage", () => {
  const renderCartPage = () =>
    render(
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <CartPage />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    );

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("message for empty cart", () => {
    renderCartPage();
    expect(screen.getByText(/Your Cart Is Empty/i)).toBeInTheDocument();
  });

  test("displaying an item in cart", () => {
    localStorage.setItem(
      "cart",
      JSON.stringify([{ _id: "1", name: "Test Product 1", price: 1111, description: "my test product 1"
       }])
    );

    renderCartPage();

    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText(/price : 1111/i)).toBeInTheDocument();
  });
  test("displaying multiple items in cart", () => {
    localStorage.setItem(
      "cart",
      JSON.stringify([
        { _id: "1", name: "Test Product 1", price: 1111, description: "details about product 1"}, 
        { _id: "2", name: "Test Product 2", price: 2222, description: "details about product 2"}, 
        { _id: "3", name: "Test Product 3", price: 3333, description: "details about product 3"}, 
        { _id: "4", name: "Test Product 4", price: 4444, description: "details about product 4"}, 
        { _id: "5", name: "Test Product 5", price: 5555, description: "details about product 5"}
      ])
    );

    renderCartPage();

    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText(/price : 1111/i)).toBeInTheDocument();
    expect(screen.getByText("details about product 1")).toBeInTheDocument();
    expect(screen.getByText("Test Product 5")).toBeInTheDocument();
    expect(screen.getByText(/price : 5555/i)).toBeInTheDocument();
    expect(screen.getByText("details about product 5")).toBeInTheDocument();


    expect(screen.queryByText("Test Product 9")).not.toBeInTheDocument();
    expect(screen.queryByText(/price : 9999/i)).not.toBeInTheDocument();
    expect(screen.queryByText("details about product 9")).not.toBeInTheDocument();
    expect(screen.queryByText("Test Product 0")).not.toBeInTheDocument();
    expect(screen.queryByText(/price : 0/i)).not.toBeInTheDocument();
    expect(screen.queryByText("details about product 0")).not.toBeInTheDocument();
});

  test("message for removing only item", async () => {
    localStorage.setItem(
      "cart",
      JSON.stringify([{ _id: "1", name: "Test Product 1", price: 1111, description: "details about product 1"
      }])
    );

    renderCartPage();
    
    // Check before removing
    expect(screen.queryByText(/your cart is empty/i)).not.toBeInTheDocument();

    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText(/price : 1111/i)).toBeInTheDocument();
    expect(screen.getByText("details about product 1")).toBeInTheDocument();

    const removeButton = screen.getByText(/remove/i);
    fireEvent.click(removeButton);

    // After removing
    await waitFor(() => {
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
    });

    expect(screen.queryByText("Test Product 1")).not.toBeInTheDocument();
    expect(screen.queryByText(/price : 1111/i)).not.toBeInTheDocument();
    expect(screen.queryByText("details about product 1")).not.toBeInTheDocument();
    
    expect(localStorage.getItem("cart")).toBe("[]");
  });

  test("message for removing an item with remaining items in cart", async () => {
    localStorage.setItem(
        "cart",
        JSON.stringify([
          { _id: "1", name: "Test Product 1", price: 1111, description: "details about product 1"}, 
          { _id: "2", name: "Test Product 2", price: 2222, description: "details about product 2"}, 
          { _id: "3", name: "Test Product 3", price: 3333, description: "details about product 3"}, 
          { _id: "4", name: "Test Product 4", price: 4444, description: "details about product 4"}, 
          { _id: "5", name: "Test Product 5", price: 5555, description: "details about product 5"}
        ])
      );
      
    renderCartPage();

    
    // Check before removing
    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText("Test Product 5")).toBeInTheDocument();

    expect(screen.queryByText(/your cart is empty/i)).not.toBeInTheDocument();
    
    expect(screen.getByText("Test Product 2")).toBeInTheDocument();

    const removeButtons = screen.getAllByText(/remove/i);
    expect(removeButtons).toHaveLength(5);
    fireEvent.click(removeButtons[1]);

    expect(screen.queryByText(/your cart is empty/i)).not.toBeInTheDocument();

    expect(screen.queryByText("Test Product 2")).not.toBeInTheDocument();
    expect(screen.queryByText(/price : 2222/i)).not.toBeInTheDocument();

    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText(/price : 1111/i)).toBeInTheDocument();
    expect(screen.getByText("Test Product 5")).toBeInTheDocument();
    expect(screen.getByText(/price : 5555/i)).toBeInTheDocument();

    const removeButtons2 = screen.getAllByText(/remove/i);
    expect(removeButtons2).toHaveLength(4);
    fireEvent.click(removeButtons2[3]);

    expect(screen.queryByText("Test Product 2")).not.toBeInTheDocument();
    expect(screen.queryByText(/price : 2222/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Test Product 5")).not.toBeInTheDocument();
    expect(screen.queryByText(/price : 5555/i)).not.toBeInTheDocument();
    

    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText(/price : 1111/i)).toBeInTheDocument();

    const removeButtons3 = screen.getAllByText(/remove/i);
    expect(removeButtons3).toHaveLength(3);
  });
  
  test("total price calculation with same total digit", () => {
    localStorage.setItem(
      "cart",
      JSON.stringify([
        { _id: "1", name: "Test Product 1", price: 1111, description: "details about product 1"}, 
        { _id: "5", name: "Test Product 5", price: 5555, description: "details about product 5"}
      ])
    );

    renderCartPage();

    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText(/price : 1111/i)).toBeInTheDocument();
    expect(screen.getByText("Test Product 5")).toBeInTheDocument();
    expect(screen.getByText(/price : 5555/i)).toBeInTheDocument();

    const cartSummary = screen.getByTestId("cart-summary");
    expect(within(cartSummary).getByText(/\$6,666.00/)).toBeInTheDocument();
  });

  test("total price calculation with more total digits", () => {
    localStorage.setItem(
      "cart",
      JSON.stringify([
        { _id: "1", name: "Test Product 1", price: 1111, description: "details about product 1"}, 
        { _id: "5", name: "Test Product 5", price: 55555, description: "details about product 5"}
      ])
    );

    renderCartPage();

    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText(/price : 1111/i)).toBeInTheDocument();
    expect(screen.getByText("Test Product 5")).toBeInTheDocument();
    expect(screen.getByText(/price : 55555/i)).toBeInTheDocument();

    const cartSummary = screen.getByTestId("cart-summary");
    expect(within(cartSummary).getByText(/\$56,666.00/)).toBeInTheDocument();
  });


  test("total price calculation with decimal price", () => {
    localStorage.setItem(
      "cart",
      JSON.stringify([
        { _id: "1", name: "Test Product 1", price: 1111.11, description: "details about product 1"}, 
        { _id: "5", name: "Test Product 5", price: 5555, description: "details about product 5"}
      ])
    );

    renderCartPage();

    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText(/price : 1111.11/i)).toBeInTheDocument();
    expect(screen.getByText("Test Product 5")).toBeInTheDocument();
    expect(screen.getByText(/price : 5555/i)).toBeInTheDocument();

    const cartSummary = screen.getByTestId("cart-summary");
    expect(within(cartSummary).getByText(/\$6,666.11/)).toBeInTheDocument();
  });

  test("total price calculation after removing item", () => {
    localStorage.setItem(
      "cart",
      JSON.stringify([
        { _id: "1", name: "Test Product 1", price: 1111, description: "details about product 1"}, 
        { _id: "2", name: "Test Product 2", price: 2222, description: "details about product 2"}, 
        { _id: "5", name: "Test Product 5", price: 5555, description: "details about product 5"}
      ])
    );

    renderCartPage();

    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText(/price : 1111/i)).toBeInTheDocument();
    expect(screen.getByText("Test Product 2")).toBeInTheDocument();
    expect(screen.getByText(/price : 2222/i)).toBeInTheDocument();
    expect(screen.getByText("Test Product 5")).toBeInTheDocument();
    expect(screen.getByText(/price : 5555/i)).toBeInTheDocument();

    const cartSummary = screen.getByTestId("cart-summary");
    expect(within(cartSummary).getByText(/\$8,888.00/)).toBeInTheDocument();

    const removeButtons = screen.getAllByText(/remove/i);
    expect(removeButtons).toHaveLength(3);
    fireEvent.click(removeButtons[1]);

    const cartSummaryAfterRemoving = screen.getByTestId("cart-summary");
    expect(within(cartSummaryAfterRemoving).getByText(/\$6,666.00/)).toBeInTheDocument();

  });

  // // WORK IN PROGRESS
//   describe("totalPrice error handling", () => {
//     it("should log an error when totalPrice encounters an exception", () => {
//       jest.spyOn(console, "log").mockImplementation(() => {});
//     //   const MockComponent = () => {
//     //     const [, setCart] = useCart();
      
//     //     useEffect(() => {
//     //         setCart(undefined); // Trigger an error
//     //       }, []);
//     //     return null;
//     //   };
  
//       localStorage.setItem(
//         "cart",
//         JSON.stringify([
//           { _id: "1", name: "Test Product 1", price: -NaN, description: "details about product 1"}, 
//         //   { _id: "2", name: "Test Product 2", price: 2222, description: "details about product 2"}, 
//           { _id: "5", name: "Test Product 5", price: NaN, description: "details about product 5"}
//         ])
//       );

//     // render(
//     //     <CartProvider>
//     //       <MockComponent />
//     //     </CartProvider>
//     //   );
//       renderCartPage();

//       const cartSummaryAfterRemoving = screen.getByTestId("cart-summary");
//       expect(cartSummaryAfterRemoving).toBeInTheDocument();
//     //   expect(within(cartSummaryAfterRemoving).getByText(/\$6,666.00/)).toBeInTheDocument();

  
//       expect(console.log).toHaveBeenCalled();
  
//       console.log.mockRestore();
//     });
//   });

    test("log when request to axios fails", async () => {
      jest.spyOn(console, "log").mockImplementation(() => {});
  
      axios.get.mockRejectedValueOnce(new Error("Network Error"));
  
      renderCartPage();
  
      await waitFor(() => expect(axios.get).toHaveBeenCalled());
  
      expect(console.log).toHaveBeenCalledWith(expect.any(Error));
      console.log.mockRestore();
    });

    // test("should set the clientToken on successful API request", async () => {
//         const mockResponse = { data: { clientToken: "mockClientToken" } };
//         axios.get.mockResolvedValueOnce(mockResponse);

//         const mockSetClientToken = jest.fn();

//         render(
//             <AuthProvider>
//             <CartProvider>
//                 <BrowserRouter>
//                 <CartPage setClientToken={mockSetClientToken}/>
//                 </BrowserRouter>
//             </CartProvider>
//             </AuthProvider>
//         );
//         // Render the component
//         // renderCartPage();
        

//         // Wait for the useEffect to complete and the state to be updated
//         await waitFor(() => expect(axios.get).toHaveBeenCalled());

        
//         // Check if the clientToken has been set in the component's state (or check DOM element)
//         // expect(screen.getByText("mockClientToken")).toBeInTheDocument();  // Adjust this based on your actual component behavior

//         await waitFor(() => {
//             // Check if the mocked DropIn component is present in the DOM
//             const dropInMock = screen.queryByTestId("braintree-drop-in-mock");
//             expect(dropInMock).toBeInTheDocument();
//           });
// //         const paymentButton = screen.getByTestId("payment-button");
// //   expect(paymentButton).toBeInTheDocument();
// //   expect(paymentButton).not.toBeDisabled();
//         // Cleanup
//         axios.get.mockReset();
        // });


  // // WORK IN PROGRESS
  // test("disable payment button", async () => {
  //   renderCartPage();
  
  //   expect(screen.queryByTestId("payment-button")).not.toBeInTheDocument();
  //   // const paymentButton = await screen.findByTestId("payment-button");
  //   // expect(paymentButton).toBeDisabled();
  // });

  // // WORK IN PROGRESS
  // test("enable payment button", async () => {

  //   jest.spyOn(require("../context/auth"), "useAuth").mockImplementationOnce(() => ({
  //     token: "myAuthToken",
  //     user: { address: "123 Test Street" },
  //   }));
  //   axios.get.mockResolvedValueOnce({ data: { clientToken: "myClientToken" } });

  //   localStorage.setItem(
  //     "cart",
  //     JSON.stringify([{ _id: "1", name: "Test Product 1", price: 1111, description: "my test product 1"
  //      }])
  //   );
  //   renderCartPage();
    
  //   expect(screen.queryByTestId("payment-button")).not.toBeInTheDocument();
  //   const paymentButton = await screen.findByTestId("payment-button");
  
  //   expect(paymentButton).toBeInTheDocument();
    
  // });
  
  // // WORK IN PROGRESS
  // test("client token load braintree-drop-in", async () => {
  //   axios.get.mockResolvedValue({ data: { clientToken: "myClientToken" } });

  //   renderCartPage();

  //   expect(await screen.findByTestId("braintree-drop-in")).toBeInTheDocument();
  // });
});
