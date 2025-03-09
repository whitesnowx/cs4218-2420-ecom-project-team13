import { MemoryRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import React from "react";
import { act } from "react-dom/test-utils";
import axios from "axios";
import ProductDetails from "./ProductDetails";

jest.mock("axios");
jest.mock("react-hot-toast");
  
jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]), 
}));
  
jest.mock("../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), 
}));
  
jest.mock("../hooks/useCategory", () => jest.fn(() => []));
  
jest.mock("../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]), 
}));
  
jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn(),
    useNavigate: jest.fn(),
}));
  
describe("Product Details Page", () => {
    const mockSlug = "mock-product";
    const mockProduct = {
      _id: "1",
      name: "Calculator",
      slug: "calculator",
      description:
        " A powerful device",
      price: 69.99,
      category: {
        _id: "1",
        name: "Electronics",
      },
    };
  
    const mockRelatedProducts = [
      {
        _id: "2",
        name: "Ipad",
        slug: "ipad",
        description:
          "A studying device",
        price: 899.90,
        category: {
            _id: "1",
            name: "Electronics",
          },
      },
    ];
  
    beforeAll(() => {
      Object.defineProperty(window, "localStorage", {
        value: {
          setItem: jest.fn(),
          getItem: jest.fn(),
        },
        writable: true,
      });
  
      
    });
  
    let navigate;
    beforeEach(() => {
      navigate = jest.fn();
      jest.clearAllMocks();
      jest.spyOn(console, "log").mockImplementation(() => {});
      useParams.mockReturnValue({ slug: mockSlug });
      useNavigate.mockReturnValue(navigate);
    });
  
 
  
    test("should display product details correctly", async () => {
      axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
      axios.get.mockResolvedValueOnce({ data: { products: mockRelatedProducts } }); 
  
      await act(async () => {
        render(
          <MemoryRouter initialEntries={["/product/mock-product"]}>
            <Routes>
              <Route path="/product/:slug" element={<ProductDetails />} />
            </Routes>
          </MemoryRouter>
        );
      });
  
      await waitFor(() =>
        expect(axios.get).toHaveBeenCalledWith(
          `/api/v1/product/get-product/${mockSlug}`
        )
      );
  
      expect(await screen.findByText(/Product Details/i)).toBeInTheDocument();
      expect(await screen.findByText(/calculator/i)).toBeInTheDocument();
      expect(await screen.findByText(/A powerful device/i)).toBeInTheDocument();
      expect(await screen.findByText(/Similar Products/)).toBeInTheDocument();
    });


    test("should display similar products correctly", async () => {
        axios.get.mockResolvedValueOnce({ data: { product: mockProduct } });
        axios.get.mockResolvedValueOnce({ data: { products: mockRelatedProducts } });
      
        await act(async () => {
          render(
            <MemoryRouter initialEntries={["/product/mock-product"]}>
              <Routes>
                <Route path="/product/:slug" element={<ProductDetails />} />
              </Routes>
            </MemoryRouter>
          );
        });
      
        await waitFor(() =>
          expect(axios.get).toHaveBeenCalledWith(
            `/api/v1/product/related-product/${mockProduct._id}/${mockProduct.category._id}`
          )
        );
    
        expect(await screen.findByText(/Similar Products/i)).toBeInTheDocument();
      
        expect(await screen.findByText(/Ipad/i)).toBeInTheDocument();
        expect(await screen.findByText(/A studying device/i)).toBeInTheDocument();
        expect(await screen.findByText(/\$899.90/)).toBeInTheDocument(); // Check formatted price
    });


    test("should handle API error when fetching product details", async () => {
        axios.get.mockRejectedValueOnce(new Error("Database Error"));
      
        await act(async () => {
          render(
            <MemoryRouter initialEntries={["/product/mock-product"]}>
              <Routes>
                <Route path="/product/:slug" element={<ProductDetails />} />
              </Routes>
            </MemoryRouter>
          );
        });
      
        await waitFor(() => expect(axios.get).toHaveBeenCalledWith(`/api/v1/product/get-product/${mockSlug}`));
      
        expect(console.log).toHaveBeenCalledWith(expect.any(Error));
      });
      
      

});