import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Users from "./Users";

jest.mock("../../components/Layout", () => ({
    __esModule: true, 
    default: ({ title, children }) => (
      <div>
        <h1>{title}</h1>
        {children}
      </div>
    ),
  }));

describe("Users Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all users page", () => {
    const { getByText } = render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );

    expect(getByText("All Users")).toBeInTheDocument();
  });
});
