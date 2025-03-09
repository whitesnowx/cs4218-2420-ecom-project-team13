import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, useNavigate } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import SearchInput from "./SearchInput";
import axios from "axios";
import { useSearch } from "../../context/search";

jest.mock("axios");

jest.mock("../../context/search", () => ({
  useSearch: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("SearchInput Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("render search page", () => {
    useSearch.mockReturnValue([{ keyword: "" }, jest.fn()]);

    render(
      <MemoryRouter>
        <SearchInput />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search").value).toBe("");
  });

  it("updates search value upon input change", async () => {
    const setKeywordMock = jest.fn();
    useSearch.mockReturnValue([{ keyword: "" }, setKeywordMock]);
    render(
      <MemoryRouter>
        <SearchInput />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "Calculator" },
    });

    expect(setKeywordMock).toHaveBeenCalledWith({
      keyword: "Calculator",
    });
  });

  it("render search results correctly", async () => {
    const mockProduct = {
      _id: 1,
      name: "Calculator",
      description: "this is a calculator",
      price: 19,
      quantity: 1,
      shipping: true,
      category: { _id: "1", name: "Electronics" },
    };
    axios.get.mockResolvedValue({
      data: { products: [mockProduct] },
    });

    const setKeywordMock = jest.fn();
    const mockNavigate = jest.fn();
    useSearch.mockReturnValue([{ keyword: "Calculator" }, setKeywordMock]);
    useNavigate.mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <SearchInput />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "Calculator" },
    });

    fireEvent.click(screen.getByText("Search"));
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    await waitFor(() =>
      expect(setKeywordMock).toHaveBeenCalledWith({
        keyword: "Calculator",
        results: { products: [mockProduct] },
      })
    );
    await expect(mockNavigate).toHaveBeenCalledWith("/search");
  });

  it("display error message on console if failed", async () => {
    console.log = jest.fn();

    axios.get.mockRejectedValue(new Error("Error with Search"));

    render(
      <MemoryRouter>
        <SearchInput />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "Calculator" },
    });

    fireEvent.click(screen.getByText("Search"));
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
