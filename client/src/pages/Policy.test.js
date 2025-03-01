import React from 'react';
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Policy from './Policy'

jest.mock("./../components/Layout", () => ({
    __esModule: true,
    default: ({ title, children }) => (
        <div>
            <h1>{title}</h1>
            {children}
        </div>
    )
  }));
  

describe("Policy Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render privacy policy page', () => {
         const { getByText } = render(
            <MemoryRouter>
              <Policy />
            </MemoryRouter>
          );

        expect(getByText("Privacy Policy")).toBeInTheDocument();
        expect(screen.getAllByText("add privacy policy")).toHaveLength(7);
    });
});
