import express from 'express';
import dotenv from 'dotenv';
import braintree from 'braintree';
import { braintreeTokenController, brainTreePaymentController } from './productController';
import { jest } from '@jest/globals'

dotenv.config();

const app = express();

jest.mock('braintree', () => {
  return {
    BraintreeGateway: jest.fn().mockImplementation(() => ({
      clientToken: {
        generate: jest.fn().mockImplementation((_, callback) => callback(null, { clientToken: 'fake-client-token' })),
      },
      transaction: {
        sale: jest.fn().mockImplementation((_, callback) => callback(null, { success: true, transaction: { id: '123456' } })),
      },
    })),
  };
});

describe('Braintree Controller Tests', () => {
    test('test 1', async () => {
        // const gateway = new braintree.BraintreeGateway({
        //     environment: braintree.Environment.Sandbox,
        //     merchantId: 'n62dnncdd58jsdnn',
        //     publicKey: '72hs9qnwmhpdrw66',
        //     privateKey: '0065cbddb022d78e1b4d32e45ab6f31a',
        //   });

        //   const gateway = new braintree.BraintreeGateway({
        //     environment: braintree.Environment.Sandbox,
        //     merchantId: 'your_merchant_id',
        //     publicKey: 'your_public_key',
        //     privateKey: 'your_private_key',
        //   });

        braintree.BraintreeGateway.clientToken.generate({}, (err, response) => {
            if (err) {
              console.error('Error generating client token:', err);
            } else {
              console.log('Generated client token:', response.clientToken);
              expect(response.clientToken).toBe('fake-client-token');
            }
          });

        // Test logic here
        // console.log(braintree.BraintreeGateway.clientToken.generate())
      });
    
    //   test('should process payment successfully when calling /braintree/payment', async () => {
    //     // Test logic here
    //   });
    
    //   test('should return error if payment fails', async () => {
    //     // Test logic here
    //   });
})



// describe('Braintree Controller Tests', () => {
// //   Test braintreeTokenController
//   test('should return a token when calling /braintree/token', async () => {
//     const response = await request(app).post('/braintree/token');
    
//     expect(response.status).toBe(200);
//     expect(response.body.clientToken).toBe('fake-client-token');
//   });

// //   Test brainTreePaymentController
//   test('should process payment successfully when calling /braintree/payment', async () => {
//     const mockCart = [
//       { price: 100 },
//       { price: 150 },
//     ];

//     const response = await request(app)
//       .post('/braintree/payment')
//       .send({
//         nonce: 'fake-nonce',
//         cart: mockCart,
//       });

//     expect(response.status).toBe(200);
//     expect(response.body.ok).toBe(true);
//   });

//   // Test brainTreePaymentController for failed transaction
//   test('should return error if payment fails', async () => {
//     // Mock the failure of the transaction sale
//     braintree.BraintreeGateway.mockImplementationOnce(() => ({
//       transaction: {
//         sale: jest.fn().mockImplementation((_, callback) => callback(new Error('Payment failed'), null)),
//       },
//     }));

//     const mockCart = [
//       { price: 100 },
//       { price: 150 },
//     ];

//     const response = await request(app)
//       .post('/braintree/payment')
//       .send({
//         nonce: 'fake-nonce',
//         cart: mockCart,
//       });

//     expect(response.status).toBe(500);
//     expect(response.body).toHaveProperty('error');
//   });
// });
