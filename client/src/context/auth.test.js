import { render } from "@testing-library/react";
import axios from "axios";
import '@testing-library/jest-dom/extend-expect';
import { AuthProvider, useAuth } from "./auth";

jest.mock("axios");

describe("Auth Provider Test", () => {
    const MockComponent = () => {
        const [auth] = useAuth();
        return (
            <div>
                <p>{auth?.user ? auth.user.name : "No Auth - User"}</p>
                <p>{auth?.token ? auth.token : "No Auth - Token"}</p>
            </div>
        )
    }

    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it("should return initial value", async () => {
        // Arrange
        // Act
        const { getByText } = render(
            <AuthProvider>
                <MockComponent />
            </AuthProvider>
        );

        // Assert
        expect(axios.defaults.headers.common["Authorization"]).toBe("");
        expect(getByText("No Auth - User")).toBeInTheDocument();
        expect(getByText("No Auth - Token")).toBeInTheDocument();
    });

    it("should set auth if there's data", () => {
        // Arrange
        const mockAuth = {
            user: {
                name: "John",
            },
            token: "mock token"
        };
        localStorage.setItem("auth", JSON.stringify(mockAuth));

        // Act
        const { getByText } = render(
            <AuthProvider>
                <MockComponent />
            </AuthProvider>
        );

        // Assert
        expect(axios.defaults.headers.common["Authorization"]).toBe(mockAuth.token);
        expect(getByText("John")).toBeInTheDocument();
        expect(getByText("mock token")).toBeInTheDocument();
    });
});