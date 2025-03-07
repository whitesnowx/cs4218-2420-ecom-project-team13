import { braintreeTokenController } from "../controllers/productController";
import braintree from "braintree";  // Importing the mocked Braintree
import { mockRequest, mockResponse } from "jest-mock-req-res"; // Mocking req and res
import { jest } from '@jest/globals'

// Mocking Braintree Gateway
jest.mock("braintree", () => ({
    BraintreeGateway: jest.fn().mockImplementation(() => ({
      clientToken: {
        generate: jest.fn().mockImplementationOnce((_, callback) => {
            callback(null, { token: "fake_token" });  // Simulating success response from Braintree
          }),
      },
    })),
  }));
  
  describe("braintreeTokenController", () => {
    let gateway;
  
    beforeEach(() => {
      // Mock BraintreeGateway instantiation
      gateway = new braintree.BraintreeGateway({
        environment: braintree.Environment.Sandbox,
        merchantId: "n62dnncdd58jsdnn",
        publicKey: "72hs9qnwmhpdrw66",
        privateKey: "0065cbddb022d78e1b4d32e45ab6f31a",
      });  // Initialize with necessary config

    });
  
    afterEach(() => {
      jest.clearAllMocks();  // Clear mocks after each test
    });
  
    it("should generate a client token successfully", async () => {
      const req = {};  // Mock request object
      const res = {
        status: jest.fn(),  // Mocking status method
        send: jest.fn(),  // Mocking send method
      };
  
      // Mock the generate method to simulate successful token generation
    //   gateway.clientToken.generate.mockImplementationOnce((_, callback) => {
    //     callback(null, { token: "fake_token" });  // Simulating success response from Braintree
    //   });
  
      // Call the controller function
      await braintreeTokenController(req, res);
  
      // Check that the response status is 500 and contains the expected token
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({ token: "fake_token" });
    });
  
    // it("should return an error when generating a token fails", async () => {
    //   const req = {};  // Mock request object
    //   const res = {
    //     status: jest.fn().mockReturnThis(),  // Mocking status method
    //     send: jest.fn(),  // Mocking send method
    //   };
  
    //   // Mock the generate method to simulate an error
    // //   gateway.clientToken.generate.mockImplementationOnce((_, callback) => {
    // //     callback("Error generating token", null);  // Simulating failure
    // //   });
  
    //   // Call the controller function
    //   await braintreeTokenController(req, res);
  
    //   // Check that the response status is 500 and contains the error message
    //   expect(res.status).toHaveBeenCalledWith(500);
    //   expect(res.send).toHaveBeenCalledWith("Error generating token");
    // });
  });