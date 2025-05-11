# Cloudflare KV CRUD Application

A simple CRUD application using Node.js, Express, and Cloudflare KV for data storage.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Cloudflare KV:
   - Log in to your Cloudflare account
   - Create a KV namespace
   - Get your Account ID and API token
   - Note down your KV namespace ID

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Cloudflare credentials

## Development

Run the development server:
```bash
npm run dev
```

## Deployment to Heroku

1. Create a new Heroku app
2. Set environment variables in Heroku:
   ```bash
   heroku config:set CLOUDFLARE_ACCOUNT_ID=your_account_id
   heroku config:set CLOUDFLARE_API_TOKEN=your_api_token
   heroku config:set CLOUDFLARE_KV_NAMESPACE_ID=your_kv_namespace_id
   ```
3. Deploy to Heroku:
   ```bash
   git push heroku main
   ```

## API Endpoints

- `GET /api/items` - List all items
- `POST /api/items` - Create/Update an item
- `GET /api/items/:key` - Get a specific item
- `DELETE /api/items/:key` - Delete an item
