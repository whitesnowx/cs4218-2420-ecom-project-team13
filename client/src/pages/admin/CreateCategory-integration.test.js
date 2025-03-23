import React from "react";
import axios from "axios";
import CreateCategory from "./CreateCategory";
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
                            <CreateCategory />
                        </BrowserRouter>
                    </CartProvider>
                </SearchProvider>
            </AuthProvider>
        );

        // check for admin panel
        expect(screen.getByText("Admin Panel")).toBeInTheDocument();
        expect(screen.getByText("Create Category")).toBeInTheDocument();
        expect(screen.getByText("Create Product")).toBeInTheDocument();
        expect(screen.getByText("Products")).toBeInTheDocument();
        expect(screen.getByText("Orders")).toBeInTheDocument();

        // check for category form
        expect(screen.getByPlaceholderText("Enter new category")).toBeInTheDocument();
        expect(screen.getByText("Submit")).toBeInTheDocument();

        // check for category table
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Actions")).toBeInTheDocument();
    });

});