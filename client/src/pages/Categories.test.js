import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import Categories from "./Categories";
import useCategory from "../hooks/useCategory";

jest.mock('../components/Layout', () => ({ title, children }) => (
    <div>
        <h1>{title}</h1>
        <div>{children}</div>
    </div>
));

jest.mock('../hooks/useCategory')

const renderComponent = () => {
    render(
        <Router>
            <Categories/>
        </Router>
    )
};

describe('Categories page', () => {
    beforeEach(() => {
        useCategory.mockReturnValue([
            { _id: 1, name: 'Electronics', slug: 'electronics' },
            { _id: 2, name: 'Books', slug: 'books' },
            { _id: 3, name: 'Clothing', slug: 'clothing' },
        ]);
    });

    test('should show all the categories correctly', () => {
        renderComponent();

        // Checking all texts appearred 
        expect(screen.getByText('All Categories')).toBeInTheDocument();
        expect(screen.getByText('Electronics')).toBeInTheDocument();
        expect(screen.getByText('Books')).toBeInTheDocument();
        expect(screen.getByText('Clothing')).toBeInTheDocument();

        // Checking all links are correctly attached
        expect(screen.getByText('Electronics')).toHaveAttribute('href', '/category/electronics');
        expect(screen.getByText('Books')).toHaveAttribute('href', '/category/books');
        expect(screen.getByText('Clothing')).toHaveAttribute('href', '/category/clothing');
    });
});