import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import AdminDashboard from "./AdminDashboard";
import { useAuth } from "../../context/auth";

jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: ({ title, children }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

describe("AdminDashboard Component", () => {
  let mockAdmin;
  beforeEach(() => {
    jest.clearAllMocks();
    mockAdmin = {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "9123 4568",
    };

    useAuth.mockReturnValue([{ user: mockAdmin }]);
  });

  it("renders admin information", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Admin Name : " + mockAdmin.name)
    ).toBeInTheDocument();
    expect(
      screen.getByText("Admin Email : " + mockAdmin.email)
    ).toBeInTheDocument();
    expect(
      screen.getByText("Admin Contact : " + mockAdmin.phone)
    ).toBeInTheDocument();
  });

  it("renders Admin Menu components", () => {
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getByText("Admin Panel")).toBeInTheDocument();
    expect(screen.getByText("Create Category")).toBeInTheDocument();
    expect(screen.getByText("Create Product")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Orders")).toBeInTheDocument();
  });

  it("admin information does not render if auth fails", () => {
    useAuth.mockReturnValue([{ token: undefined }, jest.fn()]);
    render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(
      screen.queryByText("Admin Name : " + mockAdmin.name)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Admin Email : " + mockAdmin.email)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Admin Contact : " + mockAdmin.phone)
    ).not.toBeInTheDocument();
  });
});
