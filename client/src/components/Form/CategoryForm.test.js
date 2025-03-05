import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CategoryForm from './CategoryForm';

describe("form renders properly", () => {
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

    test("form renders with input field & submit button", async () => {
        render(<CategoryForm />);
        
        expect(screen.getByPlaceholderText("Enter new category")).toBeInTheDocument();
        expect(screen.getByText("Submit")).toBeInTheDocument();
    });

    test("inputs should be initially empty", async () => {
        render(<CategoryForm />);

        expect(screen.getByPlaceholderText("Enter new category").value).toBe("");
    });
});

describe("form functionality", () => {
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

    test("should allow typing in input field", async () => {
        render(<CategoryForm setValue={jest.fn()} />);

        fireEvent.change(screen.getByPlaceholderText("Enter new category"), {
            target: { value: "test" },
        });
    });

    test("should call handleSubmit() when submit button is clicked", async () => {
        const mockHandleSubmit = jest.fn();
        render(<CategoryForm handleSubmit={mockHandleSubmit} />);

        fireEvent.submit(screen.getByRole("button"));
        expect(mockHandleSubmit).toHaveBeenCalled();
    });
});