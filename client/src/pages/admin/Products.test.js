import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Products from "./Products";
import slugify from "slugify";

// Mock axios & toast (libraries used)
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

describe("products page renders properly", () => {
    let consoleLogSpy;
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    test("page renders with available products", async () => {
        // fake product response
        const mockProducts = {
            data: {
                success: true,
                counTotal: 2,
                message: "ALlProducts ",
                products: [
                    {
                        _id: 1,
                        name: "Calculator",
                        sug: slugify("Calculator"),
                        description: "this is calculator"
                    },
                    {
                        _id: 2,
                        name: "Plush",
                        slug: slugify("Plushie"),
                        description: "this is plushie"
                    }
                ]
            }
        };

        axios.get.mockImplementation((url) => {
            if (url.includes("/api/v1/product/get-product")) {
                return Promise.resolve(mockProducts);
            }
        });

        render(
            <MemoryRouter>
                <Products />
            </MemoryRouter>
        );

        expect(await screen.findByText("Calculator")).toBeInTheDocument();
        expect(await screen.findByText("this is calculator")).toBeInTheDocument();
        expect(await screen.findByText("Plush")).toBeInTheDocument();
        expect(await screen.findByText("this is plushie")).toBeInTheDocument();
    });

    test("page shows toast error if there is error in retrieving products", async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes("/api/v1/product/get-product")) {
                return new Error("Network error");
            }
        });

        render(
            <MemoryRouter>
                <Products />
            </MemoryRouter>
        );
        
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Someething Went Wrong");
        });
    });
});