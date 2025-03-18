import React from "react";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import CreateCategory from "./CreateCategory";
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

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

// set up fake rendering of single/multiple existing categories
// 1 single existing category
const getSingleCategoryRender = () => {
    const mockResponse = {
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
    }
    axios.get.mockResolvedValueOnce(mockResponse);
    render(
        <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
            <Routes>
                <Route path="/dashboard/admin/create-category" element={<CreateCategory />} />
            </Routes>
        </MemoryRouter>
    );
};

// block for testing creation of new category
describe("handleSubmit() functionality", () => {
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

    test("handleSubmit() creates new category with any input value", async () => {
        // mock successful POST response for new category created
        axios.post.mockResolvedValueOnce({
            data: {
                success: true,
                message: "new category created",
                category: [{
                    _id: 1,
                    name: "Plushie",
                    slug: slugify("Plushie")
                }]
            }
        });

        // mock successful GET response after new category created
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

        // fake object render of create category component to extract HTML elements from
        const { getByText, getByPlaceholderText, findByText } = render(
            <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
                <Routes>
                    <Route path="/dashboard/admin/create-category" element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        );

        // extract the category input field & submit button HTML elements
        const categoryInput = getByPlaceholderText("Enter new category");
        const submitButton = getByText("Submit");

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
        const newCategoryCreated = await findByText("Plushie");
        expect(newCategoryCreated).toBeInTheDocument();
    });

    // duplicate category is not created, but will display toast message as if new category is created
    test("handleSubmit() does not create duplicate category", async () => {
        getSingleCategoryRender();

        // mock axios POST response (error message from API is not displayed by toast success)
        axios.post.mockResolvedValueOnce({
            data: {
                success: true,
                message: "Category Already Exists"
            }
        });

        // expect the single existing category to be displayed
        await waitFor(() => {
            expect(screen.getByText("Electronics")).toBeInTheDocument();
        });

        // extract the category input field & submit button HTML elements
        const categoryInput = screen.getByPlaceholderText("Enter new category");
        const submitButton = screen.getByText("Submit");

        // simulate duplicate value to be submitted & clicking of submit button
        fireEvent.change(categoryInput, { target: { value: "Electronics" } });
        fireEvent.click(submitButton);

        // expect successful axios POST & toast success message saying category is created
        // but ensure only 1 "Electronics" is displayed
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                `/api/v1/category/create-category`,
                { name: "Electronics" }
            );
        });
        expect(toast.success).toHaveBeenCalledWith("Electronics is created");
        expect(screen.getAllByText("Electronics")).toHaveLength(1);
    });

    test("handleSubmit() failed to create new category due to error in POST request", async () => {
        // mock a failed POST response
        axios.post.mockRejectedValueOnce(new Error("Network error"));

        // fake object render of create category component to extract HTML elements from
        const { getByText, getByPlaceholderText } = render(
            <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
                <Routes>
                    <Route path="/dashboard/admin/create-category" element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        );

        // extract the category input field & submit button HTML elements
        const categoryInput = getByPlaceholderText("Enter new category");
        const submitButton = getByText("Submit");

        // simulate value to be submitted & clicking of submit button
        fireEvent.change(categoryInput, { target: { value: "Plushie" } });
        fireEvent.click(submitButton);

        // expect axios POST & toast error message to be displayed
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                `/api/v1/category/create-category`,
                { name: "Plushie" }
            );
        });
        expect(toast.error).toHaveBeenCalledWith("Something went wrong in input form");
    });

    test("handleSubmit() cannot create new category with empty input value", async () => {
        // mock axios POST failed response with error message from API
        axios.post.mockResolvedValueOnce({
            data: {
                success: false,
                message: "Error in Category"
            }
        });

        // fake object render of create category component to extract HTML elements from
        const { getByText } = render(
            <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
                <Routes>
                    <Route path="/dashboard/admin/create-category" element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        );

        // extract the submit button HTML element
        const submitButton = getByText("Submit");

        // simulate clicking of submit button
        fireEvent.click(submitButton);

        // expect axios POST to occur & toast error message displayed using error message from POST
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                `/api/v1/category/create-category`,
                { name: "" }
            );
        });
        expect(toast.error).toHaveBeenCalledWith("Error in Category");
    });

});

// block for testing display of categories when component is being rendered
describe("getAllCategory() functionality", () => {
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

    test("getAllCategory() displays existing category when component is mounted", async () => {
        getSingleCategoryRender();

        // expect successful axios GET & existing category to be displayed
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                `/api/v1/category/get-category`
            );
        });
        const categoryDisplay = await screen.findByText("Electronics");
        expect(categoryDisplay).toBeInTheDocument();
    });

    test("getAllCategory() shows error message if there is error in GET request", async () => {
        // mock the failed GET response
        axios.get.mockRejectedValueOnce(new Error("Network error"));

        // fake object render of create category component to simulate GET request being sent while rendering
        render(
            <MemoryRouter initialEntries={["/dashboard/admin/create-category"]}>
                <Routes>
                    <Route path="/dashboard/admin/create-category" element={<CreateCategory />} />
                </Routes>
            </MemoryRouter>
        );

        // expect failed axios GET & toast error message
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(`/api/v1/category/get-category`);
        });
        expect(toast.error).toHaveBeenCalledWith("Something went wrong in getting category");
    });
});

// block for testing updating of existing categories
describe("handleUpdate() functionality", () => {
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

    test("handleUpdate() successfully updates a category", async () => {
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

        getSingleCategoryRender();

        // extract edit button HTML element & simulate clicking on it
        await waitFor(() => {
            expect(screen.getByText("Electronics")).toBeInTheDocument();
        });
        const editButton = await screen.getByText("Edit");
        fireEvent.click(editButton);

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
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                `/api/v1/category/get-category`
            );
        });
        expect(toast.success).toHaveBeenCalledWith("Plushie is updated");
    });

    test("handleUpdate() fails to update category due to error in PUT request", async () => {
        // mock the failed axios PUT response with error message from API
        axios.put.mockResolvedValueOnce({
            data: {
                success: false,
                message: "Error while updating category"
            }
        });

        getSingleCategoryRender();

        // extract edit button HTML element & simulate clicking on it
        await waitFor(() => {
            expect(screen.getByText("Electronics")).toBeInTheDocument();
        });
        const editButton = await screen.getByText("Edit");
        fireEvent.click(editButton);

        // extract the modal that appears upon clicking edit button
        // extract the input field (in modal) to enter updated category name
        // extract the submit button to submit updated category name
        // simulate value to be submitted for updated category & clicking on it
        const updateCategoryModal = await screen.findByRole("dialog");
        const updateCategoryModalInput = within(updateCategoryModal).getByPlaceholderText("Enter new category");
        const updateCategoryModalSubmitButton = within(updateCategoryModal).getByText("Submit");
        fireEvent.change(updateCategoryModalInput, { target: { value: "Plushie" } });
        fireEvent.click(updateCategoryModalSubmitButton);

        // expect failed PUT request with toast error message displaying API error message
        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                `/api/v1/category/update-category/1`,
                { name: "Plushie" }
            );
        });
        expect(toast.error).toHaveBeenCalledWith("Error while updating category");
    });

    test("handleUpdate() fails to update category due to exception", async () => {
        // mock the failed axios PUT response
        axios.put.mockRejectedValueOnce(new Error("Network error"));

        getSingleCategoryRender();

        // extract edit button HTML element & simulate clicking on it
        await waitFor(() => {
            expect(screen.getByText("Electronics")).toBeInTheDocument();
        });
        const editButton = await screen.getByText("Edit");
        fireEvent.click(editButton);

        // extract the modal that appears upon clicking edit button
        // extract the input field (in modal) to enter updated category name
        // extract the submit button to submit updated category name
        // simulate value to be submitted for updated category & clicking on it
        const updateCategoryModal = await screen.findByRole("dialog");
        const updateCategoryModalInput = within(updateCategoryModal).getByPlaceholderText("Enter new category");
        const updateCategoryModalSubmitButton = within(updateCategoryModal).getByText("Submit");
        fireEvent.change(updateCategoryModalInput, { target: { value: "Plushie" } });
        fireEvent.click(updateCategoryModalSubmitButton);

        // expect failed PUT request with toast error message
        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledWith(
                `/api/v1/category/update-category/1`,
                { name: "Plushie" }
            );
        });
        expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });

});

// block for testing deletion of existing categories
describe("handleDelete() functionality", () => {
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

    test("handleDelete() successfully deletes a category", async () => {
        getSingleCategoryRender();

        // mock the successful DELETE axios response
        axios.delete.mockResolvedValueOnce({
            data: {
                success: true,
                message: "Category Deleted Successfully"
            }
        });

        // mock the successful GET axios response after successful deletion
        axios.get.mockResolvedValueOnce({
            data: {
                success: true,
                message: "All Categories List",
                category: []
            }
        });

        // ensure the existing category is displayed
        // extract the delete button HTML element & simulate clicking on it
        await waitFor(() => {
            expect(screen.getByText("Electronics")).toBeInTheDocument();
        });
        const deleteButton = await screen.getByText("Delete");
        fireEvent.click(deleteButton);

        // expect successful DELETE & GET requests
        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(
                `/api/v1/category/delete-category/1`
            );
        });

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                `/api/v1/category/get-category`
            );
        });
        // show toast successful delete message
        expect(toast.success).toHaveBeenCalledWith("Category is deleted");
        // ensure that the deleted category is no longer displayed
        await waitFor(() => {
            // have to use queryByText instead of getByText as getBy throws error when element cannot be found
            expect(screen.queryByText("Electronics")).not.toBeInTheDocument();
        })
    });

    test("handleDelete() fails to delete category due to error in DELETE request", async () => {
        // mock the failed axios DELETE response with API error message
        axios.delete.mockResolvedValueOnce({
            data: {
                success: false,
                message: "Error while deleting category"
            }
        });

        getSingleCategoryRender();

        // ensure the existing category is displayed
        // extract the delete button HTML element & simulate clicking on it
        await waitFor(() => {
            expect(screen.getByText("Electronics")).toBeInTheDocument();
        });
        const deleteButton = await screen.getByText("Delete");
        fireEvent.click(deleteButton);

        // expect failed DELETE request with toast error message displaying API error message
        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(
                `/api/v1/category/delete-category/1`
            );
        });
        expect(toast.error).toHaveBeenCalledWith("Error while deleting category");
        // ensure the category is still displayed after failed deletion
        expect(screen.getByText("Electronics")).toBeInTheDocument();
    });

    test("handleDelete() fails to delete category due to exception", async () => {
        // mock the failed axios DELETE response
        axios.delete.mockRejectedValueOnce(new Error("Network error"));

        getSingleCategoryRender();

        // ensure the existing category is displayed
        // extract the delete button HTML element & simulate clicking on it
        await waitFor(() => {
            expect(screen.getByText("Electronics")).toBeInTheDocument();
        });
        const deleteButton = await screen.getByText("Delete");
        fireEvent.click(deleteButton);

        // expect failed DELETE request with toast error message
        await waitFor(() => {
            expect(axios.delete).toHaveBeenCalledWith(
                `/api/v1/category/delete-category/1`
            );
        });
        expect(toast.error).toHaveBeenCalledWith("Something went wrong");
        // ensure the category is still displayed after failed deletion
        expect(screen.getByText("Electronics")).toBeInTheDocument();
    });

})