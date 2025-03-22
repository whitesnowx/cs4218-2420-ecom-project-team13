import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect"; 
import AdminMenu from "./AdminMenu";
import CreateCategory from "../pages/admin/CreateCategory"
import CreateProduct from "../pages/admin/CreateProduct"
import Products from "../pages/admin/Products"
import Orders from "../pages/admin/AdminOrders"

jest.mock("../context/auth", () => ({
    useAuth: () => [{ user: "testAdmin" }, jest.fn()],
  }));
  
  jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]),
  }));
  
  jest.mock("../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
  }));


describe("AdminMenu Integration Tests", () => {
  test("navigates to Create Category page from AdminMenu", async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<AdminMenu />} />
          <Route path="/dashboard/admin/create-category" element={<CreateCategory />} />
        </Routes>
      </MemoryRouter>
    );

    const createCategoryLink = screen.getByText("Create Category");
    await userEvent.click(createCategoryLink);

    expect(screen.getByText("Manage Category")).toBeInTheDocument();
  });

  test("navigates to Create Product page from AdminMenu", async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<AdminMenu />} />
          <Route path="/dashboard/admin/create-product" element={<CreateProduct />} />
        </Routes>
      </MemoryRouter>
    );

    const createProductLink = screen.getByText("Create Product");
    await userEvent.click(createProductLink);

    expect(screen.getByRole('heading', { name: /Create Product/i })).toBeInTheDocument();
  });

  test("navigates to Products page from AdminMenu", async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<AdminMenu />} />
          <Route path="/dashboard/admin/products" element={<Products />} />
        </Routes>
      </MemoryRouter>
    );

    const productsLink = screen.getByText("Products");
    await userEvent.click(productsLink);

    expect(screen.getByText("All Products List")).toBeInTheDocument();
  });

  test("navigates to Orders page from AdminMenu", async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<AdminMenu />} />
          <Route path="/dashboard/admin/orders" element={<Orders />} />
        </Routes>
      </MemoryRouter>
    );

    const ordersLink = screen.getByText("Orders");
    await userEvent.click(ordersLink);

    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });


});