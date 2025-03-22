import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect"; 
import UserMenu from "./UserMenu";
import Profile from "../pages/user/Profile"
import Orders from "../pages/user/Orders"

jest.mock("../context/auth", () => ({
    useAuth: () => [{ user: "testuser" }, jest.fn()],
  }));
  
  jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]),
  }));
  
  jest.mock("../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
  }));


describe("UserMenu Integration Tests", () => {
  test("navigates to Profile page from UserMenu", async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<UserMenu />} />
          <Route path="/dashboard/user/profile" element={<Profile />} />
        </Routes>
      </MemoryRouter>
    );

    const profileLink = screen.getByTestId("navlink-profile");
    await userEvent.click(profileLink);

    expect(screen.getByText("USER PROFILE")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Name")).toBeInTheDocument();
  });

  test("navigates to Orders page from UserMenu", async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<UserMenu />} />
          <Route path="/dashboard/user/orders" element={<Orders />} />
        </Routes>
      </MemoryRouter>
    );

    const ordersLink = screen.getByTestId("navlink-orders");
    await userEvent.click(ordersLink);

    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

});