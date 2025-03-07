import React from 'react';
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import UserMenu from './UserMenu'


describe("UserMenu Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render userMenu page', () => {
         const { getByText } = render(
            <MemoryRouter>
              <UserMenu />
            </MemoryRouter>
          );

        expect(getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByTestId("navlink-profile")).toBeInTheDocument();
        expect(screen.getByTestId("navlink-orders")).toBeInTheDocument();
    });
});
