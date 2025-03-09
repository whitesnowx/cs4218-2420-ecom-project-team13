import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import Search from "./Search";
import { useSearch } from "../context/search";

jest.mock('../components/Layout', () => ({ title, children }) => (
    <div>
        <h1>{title}</h1>
        <div>{children}</div>
    </div>
));

jest.mock('../context/search', () => ({
    useSearch: jest.fn()
}))

const renderComponent = () => {
    render(
        <Router>
            <Search/>
        </Router>
    )
};


describe("Search page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("should displays 'No Products Found' when there are no search results", () => {
        useSearch.mockReturnValue([{ results: [] }]);

        renderComponent();
        
        expect(screen.getByText("Search Results")).toBeInTheDocument();
        expect(screen.getByText("No Products Found")).toBeInTheDocument();
    })


    test("should displays correct results when found", () => {
        useSearch.mockReturnValue([{ 
            results: [
                {
                    _id: "1",
                    name: "Product1",
                    description: "Product1's description",
                    price: 10,
                },
                {
                    _id: "2",
                    name: "Product2",
                    description: "Product2's description",
                    price: 30,
                },
                {
                    _id: "3",
                    name: "Product3",
                    description: "Product3's description",
                    price: 50,
                },
            ]
         }]);

        renderComponent();
        
        expect(screen.getByText("Search Results")).toBeInTheDocument();
        expect(screen.getByText("Found 3")).toBeInTheDocument();
        expect(screen.getByText("Product1")).toBeInTheDocument();
        expect(screen.getByText("Product1's description...")).toBeInTheDocument();
        expect(screen.getByText("$ 10")).toBeInTheDocument();
        expect(screen.getByText("Product2")).toBeInTheDocument();
        expect(screen.getByText("Product2's description...")).toBeInTheDocument();
        expect(screen.getByText("$ 30")).toBeInTheDocument();
        expect(screen.getByText("Product3")).toBeInTheDocument();
        expect(screen.getByText("Product3's description...")).toBeInTheDocument();
        expect(screen.getByText("$ 50")).toBeInTheDocument();
        expect(screen.getAllByText("More Details")).toHaveLength(3);
        expect(screen.getAllByText("ADD TO CART")).toHaveLength(3);
    });

});