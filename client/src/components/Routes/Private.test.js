import "@testing-library/jest-dom";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "../../context/auth";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";
import Private from "./Private";

jest.mock("axios");

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

describe("PrivateRoute Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Outlet when authenticated", async () => {
    useAuth.mockReturnValue([{ token: "valid-token" }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: true } });

    render(
      <MemoryRouter initialEntries={["/private"]}> 
        <Routes>
          <Route element={<Private />}>
            <Route path="/private" element={<div data-testid="private-page">Protected Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.queryByTestId("spinner")).not.toBeInTheDocument()
    );

    await waitFor(() =>
      expect(screen.getByTestId("private-page")).toBeInTheDocument()
    );

  });

  it("renders spinner with valid auth but setOK false", async () => {
    useAuth.mockReturnValue([{ token: "valid-token" }, jest.fn()]);

    axios.get.mockResolvedValue({ data: { ok: false } });

    
    render(
      <MemoryRouter initialEntries={["/private"]}> 
        <Routes>
          <Route element={<Private />}>
            <Route path="/private" element={<div data-testid="private-page">Protected Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByTestId("spinner")).toBeInTheDocument()
    );
    expect(screen.queryByTestId("private-page")).not.toBeInTheDocument();

  });

  it("renders spinner when no auth and setOK false", async () => {
    useAuth.mockReturnValue([{ token: null }, jest.fn()]);
    axios.get.mockResolvedValue({ data: { ok: false } });

    render(
      <MemoryRouter initialEntries={["/private"]}> 
        <Routes>
          <Route element={<Private />}>
            <Route path="/private" element={<div data-testid="private-page">Protected Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() =>
      expect(screen.getByTestId("spinner")).toBeInTheDocument()
    );
    expect(screen.queryByTestId("private-page")).not.toBeInTheDocument();
  });

});
