// import "@testing-library/jest-dom";
// import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
// import { BrowserRouter } from "react-router-dom";
// import { CartProvider, useCart } from "../context/cart";
// import { AuthProvider, useAuth } from "../context/auth";
// import CartPage from "../pages/CartPage";
// import axios from "axios";

// jest.mock("axios");

// jest.mock("react-router-dom", () => ({
//   ...jest.requireActual("react-router-dom"),
//   useNavigate: jest.fn(),
// }));

// jest.mock("../context/search", () => ({
//   useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
// }));

// describe("CartPage", () => {
//   const renderCartPage = () =>
//     render(
//       <AuthProvider>
//         <CartProvider>
//           <BrowserRouter>
//             <CartPage />
//           </BrowserRouter>
//         </CartProvider>
//       </AuthProvider>
//     );

//   beforeEach(() => {
//     localStorage.clear();
//     jest.clearAllMocks();
//   });

//   test("message for empty cart", () => {
//     renderCartPage();
//     expect(screen.getByText(/Your Cart Is Empty/i)).toBeInTheDocument();
//   });

//   test("displaying items in cart", () => {
//     localStorage.setItem(
//       "cart",
//       JSON.stringify([{ _id: "1", name: "Test Product 1", price: 1111, description: "my test product 1"
//        }])
//     );

//     renderCartPage();

//     expect(screen.getByText("Test Product 1")).toBeInTheDocument();
//     expect(screen.getByText(/price : 1111/i)).toBeInTheDocument();
//   });

//   test("message for removing only item", async () => {
//     localStorage.setItem(
//       "cart",
//       JSON.stringify([{ _id: "1", name: "Test Product 1", price: 1111, description: "my test product 1"
//       }])
//     );

//     renderCartPage();

//     const removeButton = screen.getByText(/remove/i);
//     fireEvent.click(removeButton);

//     await waitFor(() => {
//       expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
//     });

//     expect(localStorage.getItem("cart")).toBe("[]");
//   });

//   test("message for removing one item with other item", async () => {
//     localStorage.setItem(
//       "cart",
//       JSON.stringify([
//         { _id: "1", name: "Test Product 1", price: 1111, description: "my test product 1"},
//         { _id: "2", name: "Test Product 2", price: 2222, description: "my test product 2" },
//       ])
//     );

//     renderCartPage();

//     const removeButtons = screen.getAllByText(/remove/i);
//     fireEvent.click(removeButtons[0]);
    
//     expect(screen.queryByText("Test Product 1")).not.toBeInTheDocument();
//     expect(screen.queryByText(/price : 1111/i)).not.toBeInTheDocument();
//     expect(screen.getByText("Test Product 2")).toBeInTheDocument();
//     expect(screen.getByText(/price : 2222/i)).toBeInTheDocument();

//     expect(localStorage.getItem("cart")).toBe(
//       JSON.stringify([{ _id: "2", name: "Test Product 2", price: 2222, description: "my test product 2" }])
//     );
//   });


//   // mightneedanother
//   test("total price calculation", () => {
//     localStorage.setItem(
//       "cart",
//       JSON.stringify([
//         { _id: "1", name: "Test Product 1", price: 1111, description: "my test product 1" },
//         { _id: "2", name: "Test Product 2", price: 2222, description: "my test product 2" },
//       ])
//     );

//     renderCartPage();

//     const cartSummary = screen.getByTestId("cart-summary");
//     expect(within(cartSummary).getByText(/\$3,333.00/)).toBeInTheDocument();
//     // expect(screen.getByText(/total : \$3333.00/i)).toBeInTheDocument();
//   });


//   // // WORK IN PROGRESS
//   // test("disable payment button", async () => {
//   //   renderCartPage();
  
//   //   expect(screen.queryByTestId("payment-button")).not.toBeInTheDocument();
//   //   // const paymentButton = await screen.findByTestId("payment-button");
//   //   // expect(paymentButton).toBeDisabled();
//   // });

//   // // WORK IN PROGRESS
//   // test("enable payment button", async () => {

//   //   jest.spyOn(require("../context/auth"), "useAuth").mockImplementationOnce(() => ({
//   //     token: "myAuthToken",
//   //     user: { address: "123 Test Street" },
//   //   }));
//   //   axios.get.mockResolvedValueOnce({ data: { clientToken: "myClientToken" } });

//   //   localStorage.setItem(
//   //     "cart",
//   //     JSON.stringify([{ _id: "1", name: "Test Product 1", price: 1111, description: "my test product 1"
//   //      }])
//   //   );
//   //   renderCartPage();
    
//   //   expect(screen.queryByTestId("payment-button")).not.toBeInTheDocument();
//   //   const paymentButton = await screen.findByTestId("payment-button");
  
//   //   expect(paymentButton).toBeInTheDocument();
    
//   // });
  
//   // // WORK IN PROGRESS
//   // test("client token load braintree-drop-in", async () => {
//   //   axios.get.mockResolvedValue({ data: { clientToken: "myClientToken" } });

//   //   renderCartPage();

//   //   expect(await screen.findByTestId("braintree-drop-in")).toBeInTheDocument();
//   // });
// });
