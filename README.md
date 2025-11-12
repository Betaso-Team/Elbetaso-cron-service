# Elbetaso Cron Service

A NestJS-based cron service for scheduling and executing periodic tasks.

## Features

- Scheduled cron jobs using `@nestjs/schedule`
- Type-safe environment configuration with Zod validation
- Structured logging with Pino
- RESTful API with Swagger documentation
- HTTP client integration with Axios

## Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

## Project setup

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

4. Configure your environment variables in the `.env` file:

```env
# Server Configuration
PORT=3000

# Environment
NODE_ENV=development

# Logging
LOG_LEVEL=debug

# API Configuration
API_KEY=your-api-key-here
BASE_URL=https://api.example.com
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Environment Variables

The application validates all environment variables on startup using Zod. If any required variable is missing or invalid, the application will fail to start with a detailed error message.

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `PORT` | number | No | `3000` | Server port (1-65535) |
| `NODE_ENV` | enum | No | `development` | Environment (`development`, `production`, `test`) |
| `LOG_LEVEL` | enum | No | `debug` | Log level (`fatal`, `error`, `warn`, `info`, `debug`, `trace`) |
| `API_KEY` | string | Yes | - | API key for authentication |
| `BASE_URL` | string | Yes | - | Base URL for external API |

## Project Structure

```
src/
├── app/                    # Main application module
├── cron/                   # Cron job implementations
├── env/                    # Environment configuration
│   ├── env.service.ts     # Type-safe env service with Zod validation
│   └── env.module.ts      # Global env module
└── main.ts                # Application entry point
```

## API Documentation

When running in development mode, Swagger documentation is available at:

```
http://localhost:3000/api
```

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
