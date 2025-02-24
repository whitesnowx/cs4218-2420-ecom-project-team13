import axios from "axios";
import { renderHook, waitFor } from "@testing-library/react";
import useCategory from "./useCategory";

jest.mock("axios");

describe("Use Categories Test", () => {
    it("should return categories", async () => {
        // Arrange
        const mockCategories = [
            {
                "_id": "1",
                "name": "Electronics",
                "slug": "electronics",
                "__v": 0
            },
            {
                "_id": "2",
                "name": "Book",
                "slug": "book",
                "__v": 0
            }
        ];

        axios.get.mockResolvedValueOnce({ data: { category: mockCategories } });

        // Act
        const { result } = renderHook(() => useCategory());

        // Assert
        expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
        expect(result.current).toEqual([]); // Initial Value
        await waitFor(() => expect(result.current).toEqual(mockCategories));
    });

    it("should return an error", async () => {
        // Arrange
        const mockError = new Error("mock error");
        axios.get.mockRejectedValueOnce(mockError);
        console.log = jest.fn();

        // Act
        const { result } = renderHook(() => useCategory());

        // Assert
        expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
        expect(result.current).toEqual([]); // Initial Value
        await waitFor(() => expect(console.log).toHaveBeenCalledWith(mockError));
    });
});