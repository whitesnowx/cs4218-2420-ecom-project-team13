import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminOrders from "./AdminOrders";
import { useAuth } from "../../context/auth";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import moment from "moment";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../../components/Layout", () => ({
  __esModule: true,
  default: ({ title, children }) => (
    <div>
      <h1>{title}</h1>
      {children}
    </div>
  ),
}));

describe("AdminOrders Component", () => {
  const mockOrders = [
    {
      _id: "1",
      status: "Processing",
      buyer: { name: "John Doe" },
      createdAt: new Date("2025-02-17T12:00:00Z"),
      payment: { success: true },
      products: [
        {
          _id: "p1",
          name: "Product 1",
          description: "Description 1",
          price: 250,
        },
      ],
    },
  ];
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth.mockReturnValue([{ token: "mockToken" }, jest.fn()]);
    axios.get.mockResolvedValue({ data: mockOrders });
  });

  it("renders admin orders information", async () => {
    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/api/v1/auth/all-orders");
    });
    expect(screen.getByText("All Orders Data")).toBeInTheDocument();

    expect(await screen.findByText(mockOrders[0].status)).toBeInTheDocument();
    expect(
      await screen.findByText(mockOrders[0].buyer.name)
    ).toBeInTheDocument();
    expect(
      await screen.findByText(moment(mockOrders[0].createdAt).fromNow())
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        mockOrders[0].payment.success ? "Success" : "Failed"
      )
    ).toBeInTheDocument();
    expect(await screen.findByTestId("product-count")).toHaveTextContent(
      mockOrders[0].products.length
    );
  });


  it("should display error message on failure", async () => {
    console.log = jest.fn();
    axios.get.mockRejectedValue(new Error("Error fetching orders"));

    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it("should be able to process orders with payment failure", async () => {
    const mockOrdersFailure = [
      {
        ...mockOrders[0],
        payment: { success: false },
      },
    ];
    axios.get.mockResolvedValue({ data: mockOrdersFailure });
    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );
    expect(screen.getByText("All Orders")).toBeInTheDocument();
    expect(await screen.findByText("Failed")).toBeInTheDocument();
  });

  it("should not render if auth token is not true", async () => {
    useAuth.mockReturnValue([{ token: undefined }, jest.fn()]);
    render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(axios.get).not.toHaveBeenCalledWith("/api/v1/auth/all-orders");
    });
    expect(
      await screen.queryByText(mockOrders[0].buyer.name)
    ).not.toBeInTheDocument();
  });
});
