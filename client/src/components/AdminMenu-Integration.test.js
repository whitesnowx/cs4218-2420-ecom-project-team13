import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import AdminMenu from "./AdminMenu";
import CreateCategory from "../pages/admin/CreateCategory";
import CreateProduct from "../pages/admin/CreateProduct";
import Products from "../pages/admin/Products";
import Orders from "../pages/admin/AdminOrders";
import { useAuth } from "../context/auth";
import axios from "axios";
import Private from "./Routes/Private";

jest.mock("axios");

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("./Spinner", () => {
  return {
    __esModule: true,
    default: () => <div data-testid="spinner">Mocked Spinner</div>,
  };
});

describe("AdminMenu Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("navigates to Create Category page from AdminMenu", async () => {
    useAuth.mockReturnValue([
      { user: "testAdmin", token: "valid-token" },
      jest.fn(),
    ]);
    axios.get.mockResolvedValue({ data: { ok: true } });

    render(
      <MemoryRouter>
        <Routes>
          <Route element={<Private />}>
            <Route path="/" element={<AdminMenu />} />
            <Route
              path="/dashboard/admin/create-category"
              element={<CreateCategory />}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });

    const createCategoryLink = screen.getByText("Create Category");
    await userEvent.click(createCategoryLink);

    expect(screen.getByText("Manage Category")).toBeInTheDocument();
  });

  test("navigates to Create Product page from AdminMenu", async () => {
    useAuth.mockReturnValue([
      { user: "testAdmin", token: "valid-token" },
      jest.fn(),
    ]);
    axios.get.mockResolvedValue({ data: { ok: true } });
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<Private />}>
            <Route path="/" element={<AdminMenu />} />
            <Route
              path="/dashboard/admin/create-product"
              element={<CreateProduct />}
            />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });

    const createProductLink = screen.getByText("Create Product");
    await userEvent.click(createProductLink);

    expect(
      screen.getByRole("heading", { name: /Create Product/i })
    ).toBeInTheDocument();
  });

  test("navigates to Products page from AdminMenu", async () => {
    useAuth.mockReturnValue([
      { user: "testAdmin", token: "valid-token" },
      jest.fn(),
    ]);
    axios.get.mockResolvedValue({ data: { ok: true } });

    render(
      <MemoryRouter>
        <Routes>
          <Route element={<Private />}>
            <Route path="/" element={<AdminMenu />} />
            <Route path="/dashboard/admin/products" element={<Products />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });

    const productsLink = screen.getByText("Products");
    await userEvent.click(productsLink);

    expect(screen.getByText("All Products List")).toBeInTheDocument();
  });

  test("navigates to Orders page from AdminMenu", async () => {
    useAuth.mockReturnValue([
      { user: "testAdmin", token: "valid-token" },
      jest.fn(),
    ]);
    axios.get.mockResolvedValue({ data: { ok: true } });

    render(
      <MemoryRouter>
        <Routes>
          <Route element={<Private />}>
            <Route path="/" element={<AdminMenu />} />
            <Route path="/dashboard/admin/orders" element={<Orders />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });

    const ordersLink = screen.getByText("Orders");
    await userEvent.click(ordersLink);

    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  test("renders spinner when not logged in", async () => {
    useAuth.mockReturnValue([null, jest.fn()]);

    render(
      <MemoryRouter>
        <Routes>
          <Route element={<Private />}>
            <Route path="/" element={<AdminMenu />} />
            <Route path="/dashboard/admin/orders" element={<Orders />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByTestId("spinner")).toBeInTheDocument()
    );
  });
});
