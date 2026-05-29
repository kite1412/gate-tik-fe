# Portal TIK FE

Frontend React + Vite untuk sistem NexGate Access.

## Setup

1. Salin file environment.

```bash
copy .env.example .env
```

2. Jalankan development server.

```bash
npm install
npm run dev
```

## API

Base URL diatur lewat `VITE_API_BASE_URL` (default `http://localhost:8000`).

Endpoint login:

- `POST /api/auth/login`
- Body: `{ "email": "admin@example.com", "password": "admin1234" }`

## Routing

Routing menggunakan React Router v6 dengan proteksi auth dasar. Halaman login ada di `/login`, dan halaman lain sementara placeholder di `src/pages`.
