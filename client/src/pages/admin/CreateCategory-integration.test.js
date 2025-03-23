import React from "react";
import axios from "axios";
import toast from "react-hot-toast";
import CreateCategory from "./CreateCategory";
import { render, screen, waitFor, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import '@testing-library/jest-dom/extend-expect';
import { AuthProvider } from "../../context/auth";
import { CartProvider } from "../../context/cart";
import { SearchProvider } from "../../context/search";
import slugify from "slugify";

jest.mock("axios");
jest.mock("react-hot-toast");

console.error = () => { };

const getPageRender = () => {
    const mockGetResponse = {
        data: {
            success: true,
            message: "All Categories List",
            category: [
                {
                    _id: 1,
                    name: "Electronics",
                    slug: slugify("Electronics")
                }
            ]
        }
    };

    const mockPostResponse = {
        data: {
            success: true,
            message: "new category created",
            category: [
                {
                    _id: 1,
                    name: "Plushie",
                    slug: slugify("Plushie")
                }
            ]
        }
    };

    const mockDeleteResponse = {
        data: {
            success: true,
            message: "Category Deleted Successfully"
        }
    };

    axios.get.mockImplementation((url) => {
        if (url.includes("/api/v1/category/get-category")) {
            return Promise.resolve(mockGetResponse);
        }
    })

    axios.post.mockImplementation((url) => {
        if (url.includes("/api/v1/category/create-category")) {
            return Promise.resolve(mockPostResponse);
        }
    });

    axios.delete.mockImplementation((url) => {
        if (url.includes("/api/v1/category/delete-category")) {
            return Promise.resolve(mockDeleteResponse);
        }
    });

    render(
        <AuthProvider>
            <SearchProvider>
                <CartProvider>
                    <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
                        <Routes>
                            <Route path="/dashboard/admin/create-category" element={<CreateCategory />} />
                        </Routes>
                    </MemoryRouter>
                </CartProvider>
            </SearchProvider>
        </AuthProvider>
    );
};

describe("Admin create category integration with other components", () => {
    beforeEach(async () => {
        jest.clearAllMocks();
    });

    test("page renders successfully with other components", async () => {
        getPageRender();

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                `/api/v1/category/get-category`
            );
        });

        // wait for the category to be rendered in table
        await waitFor(() => {
            expect(screen.getByRole('cell', { name: 'Electronics' })).toBeInTheDocument();
        });

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

        // check that table has "edit" and "delete" buttons for the existing category
        expect(screen.getByText("Edit")).toBeInTheDocument();
        expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    test("able to create new category", async () => {
        getPageRender();

        // mock successful GET response after new category created
        axios.get.mockResolvedValueOnce({
            data: {
                success: true,
                message: "All Categories List",
                category: [{
                    _id: 1,
                    name: "Electronics",
                    slug: slugify("Electronics")
                }, {
                    _id: 2,
                    name: "Plushie",
                    slug: slugify("Plushie")
                }]
            }
        });

        // extract the category input field & submit button HTML elements
        const categoryInput = screen.getByPlaceholderText("Enter new category");
        const submitButton = screen.getByText("Submit");

        // simulate value to be submitted & clicking of submit button
        fireEvent.change(categoryInput, { target: { value: "Plushie" } });
        fireEvent.click(submitButton);

        // expect successful axios POST & toast success message with new category displayed in page
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                `/api/v1/category/create-category`,
                { name: "Plushie" }
            );
        });

        expect(toast.success).toHaveBeenCalledWith("Plushie is created");

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                `/api/v1/category/get-category`
            )
        });

        const newCategoryCreated = await screen.findByRole('cell', { name: 'Plushie' });
        expect(newCategoryCreated).toBeInTheDocument();
    });

    test("able to update category", async () => {
        // mock the successful axios PUT response
        axios.put.mockResolvedValueOnce({
            data: {
                success: true,
                message: "Category Updated Successfully",
                category: [{
                    _id: 1,
                    name: "Plushie",
                    slug: slugify("Plushie")
                }]
            }
        });

        getPageRender();

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                `/api/v1/category/get-category`
            );
        });

        // wait for the category to be rendered in table
        await waitFor(() => {
            expect(screen.getByRole('cell', { name: 'Electronics' })).toBeInTheDocument();
        });

        const editButton = await screen.getByText("Edit");
        fireEvent.click(editButton);

        axios.get.mockResolvedValueOnce({
            data: {
                success: true,
                message: "All Categories List",
                category: [{
                    _id: 1,
                    name: "Plushie",
                    slug: slugify("Plushie")
                }]
            }
        });

        // extract the modal that appears upon clicking edit button
        // extract the input field (in modal) to enter updated category name
        // extract the submit button to submit updated category name
        // simulate value to be submitted for updated category & clicking on it
        const updateCategoryModal = await screen.findByRole("dialog");
        const updateCategoryModalInput = within(updateCategoryModal).getByPlaceholderText("Enter new category");
        const updateCategoryModalSubmitButton = within(updateCategoryModal).getByText("Submit");
        fireEvent.change(updateCategoryModalInput, { target: { value: "Plushie" } });
        fireEvent.click(updateCategoryModalSubmitButton);

        // expect successful PUT & GET requests with toast success message
        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                `/api/v1/category/update-category/1`,
                { name: "Plushie" }
            );
        });

        expect(toast.success).toHaveBeenCalledWith("Plushie is updated");

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                `/api/v1/category/get-category`
            );
        });

        // expect not to see "Electronics" in table anymore
        const updatedCategory = await screen.findByRole('cell', { name: 'Plushie' });

        expect(screen.queryByRole('cell', { name: 'Electronics' })).not.toBeInTheDocument();
        expect(updatedCategory).toBeInTheDocument();
    });

    test("able to delete category", async () => {
        getPageRender();

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                `/api/v1/category/get-category`
            );
        });

        await waitFor(() => {
            expect(screen.getByRole('cell', { name: 'Electronics' })).toBeInTheDocument();
        });

        // expect delete button to exist in document
        expect(screen.getByText("Delete")).toBeInTheDocument();

        const deleteButton = await screen.getByText("Delete");
        fireEvent.click(deleteButton);

        // mock the successful GET axios response after successful deletion
        axios.get.mockResolvedValueOnce({
            data: {
                success: true,
                message: "All Categories List",
                category: []
            }
        });

        // expect successful DELETE & GET requests
        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(
                `/api/v1/category/delete-category/1`
            );
        });

        // show toast successful delete message
        expect(toast.success).toHaveBeenCalledWith("Category is deleted");

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                `/api/v1/category/get-category`
            );
        });
        // ensure that the deleted category is no longer displayed
        await waitFor(() => {
            expect(screen.queryByRole('cell', { name: 'Electronics' })).not.toBeInTheDocument();
        })
    });

});