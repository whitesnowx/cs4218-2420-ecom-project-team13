import React from 'react';
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Contact from './Contact'

jest.mock("react-icons/bi", () => ({
  BiMailSend: () => <span data-testid="BiMailSend" />,
  BiPhoneCall: () => <span data-testid="BiPhoneCall" />,
  BiSupport: () => <span data-testid="BiSupport" />,
}));


jest.mock("../components/Layout", () => ({
    __esModule: true, 
    default: ({ title, children }) => (
      <div>
        <h1>{title}</h1>
        {children}
      </div>
    ),
  }));

describe("Contact Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it ('should render contact page', () => {
        render(
            <MemoryRouter>
              <Contact />
            </MemoryRouter>
          );

        expect(screen.getByText("Contact us")).toBeInTheDocument();

    });
});
