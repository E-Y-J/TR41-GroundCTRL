# E2E Test Alternative: Production Build Server

This directory contains a simple static file server configuration for serving the production build during E2E tests.

## Why?

Vite dev server can be unreliable during E2E tests due to:
- HMR (Hot Module Replacement) websocket overhead
- Rate limiting when multiple tests hit it simultaneously  
- 429 errors causing CSS files to be returned as HTML

Serving the production build is:
- ✅ Much faster and more reliable
- ✅ No HMR/websocket overhead
- ✅ Closer to production environment
- ✅ No rate limiting issues

## Usage

### Install dependencies
```bash
cd frontend/tests/e2e-serve
npm install
```

### Build and serve for testing
```bash
# From frontend directory
npm run build
cd tests/e2e-serve
npm run serve
```

### Run tests against production build
```bash
# In another terminal, from frontend directory
SKIP_WEBSERVER=true PLAYWRIGHT_BASE_URL=http://localhost:5173 npm run test:e2e
```

## GitHub Actions Integration

Update `.github/workflows/frontend-e2e-tests.yml`:

```yaml
- name: Build frontend for E2E tests
  working-directory: ./frontend
  run: npm run build

- name: Install serve dependencies
  working-directory: ./frontend/tests/e2e-serve
  run: npm ci

- name: Start production build server
  working-directory: ./frontend/tests/e2e-serve
  run: |
    npm run serve &
    echo $! > serve.pid
    sleep 5  # Give serve time to start

- name: Wait for frontend to be ready
  run: npx wait-on --timeout 30000 http-get://localhost:5173/

- name: Run E2E tests
  working-directory: ./frontend
  run: npx playwright test --project=chromium
  env:
    SKIP_WEBSERVER: "true"
    PLAYWRIGHT_BASE_URL: http://localhost:5173

- name: Stop production build server
  if: always()
  working-directory: ./frontend/tests/e2e-serve
  run: |
    if [ -f serve.pid ]; then
      kill $(cat serve.pid) || true
      rm serve.pid
    fi
```

## Benefits

- **80-90% faster** - Pre-built assets, no compilation
- **More reliable** - No dev server instability
- **Closer to production** - Tests actual build output
- **Less resource intensive** - Lower CPU/memory usage on CI
