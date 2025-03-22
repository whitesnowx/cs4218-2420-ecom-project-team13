import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import UserMenu from "./UserMenu";
import Profile from "../pages/user/Profile";
import Orders from "../pages/user/Orders";
import Private from "./Routes/Private";
import { useAuth } from "../context/auth";
import axios from "axios";

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

describe("UserMenu Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("navigates to Profile page from UserMenu", async () => {
    useAuth.mockReturnValue([
      { user: "testuser", token: "valid-token" },
      jest.fn(),
    ]);
    axios.get.mockResolvedValue({ data: { ok: true } });
    render(
      <MemoryRouter>
        <Routes>
          <Route element={<Private />}>
            <Route path="/" element={<UserMenu />} />
            <Route path="/dashboard/user/profile" element={<Profile />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });

    const profileLink = await screen.getByTestId("navlink-profile");
    await userEvent.click(profileLink);

    expect(screen.getByText("USER PROFILE")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your Name")).toBeInTheDocument();
  });

  test("navigates to Orders page from UserMenu", async () => {
    useAuth.mockReturnValue([
      { user: "testuser", token: "valid-token" },
      jest.fn(),
    ]);
    axios.get.mockResolvedValue({ data: { ok: true } });

    render(
      <MemoryRouter>
        <Routes>
          <Route element={<Private />}>
            <Route path="/" element={<UserMenu />} />
            <Route path="/dashboard/user/orders" element={<Orders />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    });
    const ordersLink = screen.getByTestId("navlink-orders");
    await userEvent.click(ordersLink);

    expect(screen.getByText("All Orders")).toBeInTheDocument();
  });

  test("renders spinner when not logged in", async () => {
    useAuth.mockReturnValue([null, jest.fn()]);

    render(
      <MemoryRouter>
        <Routes>
          <Route element={<Private />}>
            <Route path="/" element={<UserMenu />} />
            <Route path="/dashboard/user/orders" element={<Orders />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() =>
      expect(screen.getByTestId("spinner")).toBeInTheDocument()
    );
  });
});
