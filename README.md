# E-commerce Website

A modern e-commerce website built with Angular, featuring a responsive design, secure payment processing, and a seamless shopping experience.

## Features

- Product browsing and searching
- Shopping cart management
- Secure checkout with Stripe integration
- User authentication and profile management
- Wishlist functionality
- Order tracking
- Real-time chat support
- Product comparison
- Responsive design for all devices

## Technologies Used

- Angular 16+
- TypeScript
- RxJS
- Stripe Payment Gateway
- Angular Material (UI Components)
- SCSS for styling
- JWT for authentication

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Angular CLI (v16 or higher)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ecommerce-website.git
cd ecommerce-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
- Copy `src/environments/environment.example.ts` to `src/environments/environment.ts`
- Update the environment variables with your API keys and endpoints

4. Start the development server:
```bash
ng serve
```

5. Open your browser and navigate to `http://localhost:4200`

## Environment Setup

The application requires the following environment variables:

```typescript
export const environment = {
  production: false,
  apiUrl: 'your_api_url',
  wsUrl: 'your_websocket_url',
  stripePublishableKey: 'your_stripe_publishable_key',
  paymentApiUrl: 'your_payment_api_url',
  paymentApiKey: 'your_payment_api_key'
};
```

## Project Structure

```
src/
├── app/
│   ├── components/
│   ├── services/
│   ├── models/
│   ├── guards/
│   └── shared/
├── assets/
├── environments/
└── styles/
```

## Available Scripts

- `ng serve` - Start development server
- `ng build` - Build the application
- `ng test` - Run unit tests
- `ng e2e` - Run end-to-end tests
- `ng lint` - Lint the code

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Your Name - your.email@example.com
Project Link: https://github.com/yourusername/ecommerce-website 