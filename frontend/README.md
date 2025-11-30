# NeuraDesk Frontend

NeuraDesk is your intelligent workspace for asking questions, exploring answers, and building knowledge with AI assistance.

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn-ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend and authentication
- **React Query** - Data fetching and caching

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```sh
# Step 1: Clone the repository
git clone <repository-url>

# Step 2: Navigate to the frontend directory
cd frontend

# Step 3: Install dependencies
npm install

# Step 4: Set up environment variables
# Copy .env.example to .env and fill in your Supabase credentials
cp .env.example .env

# Step 5: Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and configurations
│   └── main.tsx        # Application entry point
├── public/             # Static assets
└── supabase/           # Supabase configuration
```

## Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

© 2025 NeuraDesk. All rights reserved.
