import React from "react";
import axios from "axios";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import UpdateProduct from "./UpdateProduct";

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

describe("update product page renders properly", () => {
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

    test("renders correctly with fetched product data", async () => {
        // fake product response
        const mockProduct = {
            data: {
                product: {
                    _id: 1,
                    name: "Calculator",
                    description: "this is a calculator",
                    price: 19,
                    quantity: 1,
                    shipping: true,
                    category: { _id: "1", name: "Electronics" },
                }
            }
        };

        // fake category response
        const mockCategories = {
            data: {
                category: [
                    { _id: 1, name: "Electronics" },
                    { _id: 2, name: "Books" }
                ]
            }
        };

        // mock axios responses
        axios.get.mockImplementation((url) => {
            if (url.includes("/api/v1/product/get-product")) {
                return Promise.resolve(mockProduct);
            }
            if (url.includes("/api/v1/category/get-category")) {
                return Promise.resolve(mockCategories);
            }
        });

        render(
            <MemoryRouter initialEntries={["/dashboard/admin/product/calculator"]}>
                <Routes>
                    <Route path="/dashboard/admin/product/calculator" element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByDisplayValue("Calculator")).toBeInTheDocument();
        expect(screen.getByDisplayValue("this is a calculator")).toBeInTheDocument();
        expect(screen.getByDisplayValue("19")).toBeInTheDocument();
        expect(screen.getByDisplayValue("1")).toBeInTheDocument();
        expect(screen.getByText("Electronics")).toBeInTheDocument();
    });
});

describe("update product form functionality", () => {
    let consoleLogSpy;
    let consoleErrorSpy;
    let consoleWarnSpy;

    beforeEach(async () => {
        consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
        consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

        // fake product response
        const mockProduct = {
            data: {
                product: {
                    _id: 1,
                    name: "Calculator",
                    description: "this is a calculator",
                    price: 19,
                    quantity: 1,
                    shipping: true,
                    category: { _id: "1", name: "Electronics" },
                }
            }
        };

        // fake category response
        const mockCategories = {
            data: {
                category: [
                    { _id: 1, name: "Electronics" },
                    { _id: 2, name: "Books" }
                ]
            }
        };

        // mock axios responses
        axios.get.mockImplementation((url) => {
            if (url.includes("/api/v1/product/get-product")) {
                return Promise.resolve(mockProduct);
            }
            if (url.includes("/api/v1/category/get-category")) {
                return Promise.resolve(mockCategories);
            }
        });

        render(
            <MemoryRouter initialEntries={["/dashboard/admin/product/calculator"]}>
                <Routes>
                    <Route path="/dashboard/admin/product/calculator" element={<UpdateProduct />} />
                </Routes>
            </MemoryRouter>
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
        consoleLogSpy.mockRestore();
        consoleErrorSpy.mockRestore();
        consoleWarnSpy.mockRestore();
    });

    test("should allow typing in name field", async () => {
        // extract input field
        const nameField = screen.getByPlaceholderText("write a name");
        // simulate entry in input field
        fireEvent.change(nameField, { target: { value: "some updated name" } });
        // expect entry to be in input field
        expect(nameField.value).toBe("some updated name");
    });

    test("should allow typing in description field", async () => {
        // extract input field
        const descriptionField = screen.getByPlaceholderText("write a description");
        // simulate entry in input field
        fireEvent.change(descriptionField, { target: { value: "some updated description" } });
        // expect entry to be in input field
        expect(descriptionField.value).toBe("some updated description");
    });

    test("should allow typing in price field", async () => {
        // extract input field
        const priceField = screen.getByPlaceholderText("write a Price");
        // simulate entry in input field
        fireEvent.change(priceField, { target: { value: 19.99 } });
        // expect entry to be in input field
        expect(priceField.value).toBe("19.99");
    });

    test("should allow typing in quantity field", async () => {
        // extract input field
        const quantityField = screen.getByPlaceholderText("write a quantity");
        // simulate entry in input field
        fireEvent.change(quantityField, { target: { value: 5 } });
        // expect entry to be in input field
        expect(quantityField.value).toBe("5");
    });

    test("should call handleUpdate() when update button is clicked", async () => {
        axios.put.mockResolvedValueOnce({
            data: {
                success: true,
                message: "Product Updated Successfully"
            }
        });

        fireEvent.click(screen.getByText("UPDATE PRODUCT"));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                `/api/v1/product/update-product/`,
                expect.any(FormData)
            );
        });
        expect(toast.success).toHaveBeenCalledWith("Product Updated Successfully");
    });

    test("should call handleDelete() when delete button is clicked", async () => {
        // simulate window prompt to confirm deletion of product
        window.prompt = jest.fn(() => "yes");

        axios.delete.mockResolvedValueOnce({
            data: {
                success: true,
                message: "Product Deleted Successfully"
            }
        });

        fireEvent.click(screen.getByText("DELETE PRODUCT"));

        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(
                `/api/v1/product/delete-product/`
            );
        });

        expect(toast.success).toHaveBeenCalledWith("Product DEleted Succfully");
    });
});