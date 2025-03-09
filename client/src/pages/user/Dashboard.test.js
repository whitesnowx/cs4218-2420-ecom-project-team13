import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import { useAuth } from "../../context/auth";
import "@testing-library/jest-dom/extend-expect";

jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
})); //prevent return undefined

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../context/cart', () => ({
    useCart: jest.fn(() => [null, jest.fn()]) 
  }));
    
jest.mock('../../context/search', () => ({
    useSearch: jest.fn(() => [{ keyword: '' }, jest.fn()]) 
  }));  

describe("Dashboard Component", () => {
  let mockUser;
  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = {
      name: "John Doe",
      email: "john.doe@example.com",
      address: "Blk 123 Drive 50",
    };

    useAuth.mockReturnValue([{ user: mockUser }]);
  });

  it("renders user information", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByTestId("dashboard-name")).toHaveTextContent(
      mockUser.name
    );
    expect(screen.getByTestId("dashboard-email")).toHaveTextContent(
      mockUser.email
    );
    expect(screen.getByTestId("dashboard-address")).toHaveTextContent(
      mockUser.address
    );
  });

  it("renders empty if no user is provided", () => {
    useAuth.mockReturnValue([{ user: null, token: "" }, jest.fn()]);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    // Check if the values are empty or undefined when there is no user
    expect(screen.getByTestId("dashboard-name")).toHaveTextContent("");
    expect(screen.getByTestId("dashboard-email")).toHaveTextContent("");
    expect(screen.getByTestId("dashboard-address")).toHaveTextContent("");
  });

  it("renders User Menu components", () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });
});
