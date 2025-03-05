import React from "react";
import axios from "axios";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import CreateProduct from "./CreateProduct";
import slugify from "slugify";

// Mock axios & toast (libraries used)
jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("react-router-dom");

jest.mock("../../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

describe("getAllCategory() functionality", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("getAllCategory() successfully retrieves categories", async () => {
        // mock the setCategories (setState) function
        const mockSetCategories = jest.fn();
        // create spy for observing categories useState
        const categoriesUseStateSpy = jest.spyOn(React, "useState").mockImplementation(() => [[], mockSetCategories]);

        // fake category object
        const mockCategory = [
            {
                _id: 1,
                name: "Electronics",
                slug: slugify("Electronics")
            }
        ];

        // mock successful GET axios response
        axios.get.mockResolvedValueOnce({
            data: {
                success: true,
                message: "All Categories List",
                category: mockCategory
            }
        });

        // fake component render
        render(<CreateProduct />);

        // ensure the GET request occurs & useState is called
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                `/api/v1/category/get-category`
            );
        });
        expect(categoriesUseStateSpy).toHaveBeenCalled();
    });

    test("getAllCategory() fails to retrieve categories due to error in GET request", async () => {
        axios.get.mockRejectedValue(new Error("Network error"));

        // fake component render
        render(<CreateProduct />);

        // ensure GET request occurs & toast error message is displayed
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                `/api/v1/category/get-category`
            );
        });
        expect(toast.error).toHaveBeenCalledWith("Something wwent wrong in getting catgeory");
    });

});

describe("form input functionality", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should allow typing in name field", async () => {
        // fake component render to extract HTML elements from
        render(<CreateProduct />);

        // extract input field
        const nameField = screen.getByPlaceholderText("write a name");
        // simulate entry in input field
        fireEvent.change(nameField, { target: { value: "Plushie" } });
        // expect entry to be in input field
        expect(nameField.value).toBe("Plushie");
    });

    test("should allow typing in description field", async () => {
        // fake component render to extract HTML elements from
        render(<CreateProduct />);

        // extract input field
        const descField = screen.getByPlaceholderText("write a description");
        // simulate entry in input field
        fireEvent.change(descField, { target: { value: "Soft" } });
        // expect entry to be in input field
        expect(descField.value).toBe("Soft");
    });

    test("should allow typing in price field", async () => {
        // fake component render to extract HTML elements from
        render(<CreateProduct />);

        // extract input field
        const priceField = screen.getByPlaceholderText("write a Price");
        // simulate entry in input field
        fireEvent.change(priceField, { target: { value: "5" } });
        // expect entry to be in input field
        expect(priceField.value).toBe("5");
    });

    test("should allow typing in quantity field", async () => {
        // fake component render to extract HTML elements from
        render(<CreateProduct />);

        // extract input field
        const quantityField = screen.getByPlaceholderText("write a quantity");
        // simulate entry in input field
        fireEvent.change(quantityField, { target: { value: "1" } });
        // expect entry to be in input field
        expect(quantityField.value).toBe("1");
    });

});

describe("create product form functionality", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should call handleCreate() when create button is clicked", async () => {
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
            if (url.includes("/api/v1/category/get-category")) {
                return Promise.resolve(mockCategories);
            }
        });

        render(<CreateProduct />);

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

        axios.post.mockResolvedValueOnce({
            data: {
                success: true,
                message: "Product Created Successfully",
                products: mockProduct
            }
        });

        fireEvent.click(await screen.findByText("CREATE PRODUCT"));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                `/api/v1/product/create-product`,
                expect.any(FormData)
            );
        });
        expect(toast.success).toHaveBeenCalledWith("Product Created Successfully");
    });

});