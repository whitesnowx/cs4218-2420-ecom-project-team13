import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";
import Profile from "./Profile";
import { useAuth } from "../../context/auth";

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: ({ children }) => <div>{children}</div>,
}));

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

describe("Profile Component", () => {
  const mockUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "12344000",
    password: "password123",
    address: "123 Street",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([{ user: mockUser }, jest.fn()]);
    Object.defineProperty(window, "localStorage", {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(() => JSON.stringify(mockUser)), //getItem returns users
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it("renders profile form", () => {
    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(getByText("USER PROFILE")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your Name")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your Email")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your Password")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your Phone")).toBeInTheDocument();
    expect(getByPlaceholderText("Enter Your Address")).toBeInTheDocument();
  });

  it("updates profile successfully", async () => {
    axios.put.mockResolvedValue({
      data: { updatedUser: { name: "John Doe 2" } },
    });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    
    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "John Doe 2" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Password"), {
      target: { value: "password321" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Phone"), {
      target: { value: "1234567890" },
    });
    fireEvent.change(getByPlaceholderText("Enter Your Address"), {
      target: { value: "321 Street" },
    });

    fireEvent.click(getByText("UPDATE"));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully");
  });

  it("display error if data error", async () => {
    axios.put.mockResolvedValue({
      data: { error: "Error with updating profile" },
    });

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "John Doe 2" },
    });
    fireEvent.click(getByText("UPDATE"));

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalledWith("Error with updating profile");
  });

  it("display error if error in updating profile", async () => {
    const consoleSpy = jest.spyOn(console, "log");
    axios.put.mockRejectedValue(new Error("Error updating profile"));

    const { getByText, getByPlaceholderText } = render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("Enter Your Name"), {
      target: { value: "John Doe 2" },
    });
    fireEvent.click(getByText("UPDATE"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
    });
    expect(toast.error).toHaveBeenCalledWith("Something went wrong");

    consoleSpy.mockRestore();
  });
});
