import React from "react";
import axios from "axios";
import CreateProduct from "./CreateProduct";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";

axios.defaults.baseURL = 'http://localhost:6060';
console.error = () => {};

describe("Admin create category integration with other components", () => {
    beforeEach(async () => {
        jest.clearAllMocks();
    });

    test("page renders successfully with other components", async () => {
        render(
            <AuthProvider>
                <SearchProvider>
                    <CartProvider>
                        <BrowserRouter>
                            <CreateProduct />
                        </BrowserRouter>
                    </CartProvider>
                </SearchProvider>
            </AuthProvider>
        );

        // check for admin panel
        expect(screen.getByText("Admin Panel")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Create Product" })).toBeInTheDocument();
        expect(screen.getByText("Products")).toBeInTheDocument();
        expect(screen.getByText("Orders")).toBeInTheDocument();

        // check for product form
        expect(screen.getByRole("heading", { name: "Create Product" })).toBeInTheDocument();
        expect(screen.getByLabelText("Upload Photo")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("write a name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("write a description")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("write a Price")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("write a quantity")).toBeInTheDocument();
    });

});