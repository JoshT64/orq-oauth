# ❓ Answer to 10,000+ list of items

See [QUESTION.md](./QUESTION.md)

# 🔑 Orqestra OAuth Consent Screen Documentation

## Overview

This project implements an OAuth 2.0 + PKCE (Proof of Key Code Exchange) consent screen using Vue, Vite, and Shadcn-Vue. It allows users to authorize third-party applications (Zapier) to access their Orqestra account data based on requested scopes.

## Setup

1.  **Environment Variables:**

    - Create a `.env` file in the project root.
    - Add the following variables:

      ```
      VITE_ORQESTRA_API_BASE_URL=https://dev-api.orqestra.io
      VITE_ORQESTRA_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im5ldGZvcnVtK29saXZAZ21haWwuY29tIiwiaWQiOjc1LCJwcm92aWRlciI6Im5vbmUifQ.hBu6-PxvoyoHUorzCs6xkP2A1ZgmcZ8QzRTKepq0iIY
      ```

2.  **Dependencies:** Install project dependencies:

    ```bash
    bun install
    ```

3.  **Run Development Server:**

    ```bash
    bun run dev
    ```

4.  **Check the console for the correct url to redirect to**

    - The url will shown in the console when the app starts.
    - CMD/CTRL click the url to open it in a new tab.
    - You should see the Orqestra OAuth consent card.
    - Click "Authorize" to continue.
    - You should then be redirected to a Zapier 404 page with the proper `params` in the url.

    If you can't find the url in the console, try this:

    ```
    http://localhost:5173/?client_id=8f9a0002-ae0f-4412-ac4c-902f1e88e5ff&state=-G2EoDooYcrJ5p8EF1AM677T8BvnSMxQMU4HtUjoQ4Y&redirect_uri=https%3A%2F%2Fzapier.com%2Fdashboard%2Fauth%2Foauth%2Freturn%2FApp222291CLIAPI%2F&response_type=code&scope=conversion&code_challenge=BSupaW6JDyiPDgU4HM8wkLj94DELW0BvsxPAoO2d5XA&code_challenge_method=S256
    ```

## Architecture

- **Frameworks/Libraries:** Vue 3, Vite, Shadcn-Vue, Tailwind CSS.

- **Authentication:** API calls (`/oauth/scopes`, `/oauth/authorize`) are authenticated using a static Bearer token (JWT) provided via environment variables (`VITE_ORQESTRA_API_TOKEN`).

- **OAuth Flow:**

  - The application expects standard OAuth 2.0 Authorization Code Grant with PKCE parameters in the URL (`client_id`, `state`, `redirect_uri`, `scope`, `code_challenge`, `code_challenge_method`, `response_type=code`).
  - It fetches application details (name, description, scopes) from `GET /oauth/scopes` using the `client_id` and `scope`.
  - Clicking "Authorize" triggers a `POST` request to `/oauth/authorize` with the necessary parameters.

  - **Backend Interaction (`POST /oauth/authorize`):**

    - **Expected Standard Behavior:** The backend `/oauth/authorize` endpoint validates the request (including checking if the `redirect_uri` is allowed for the `client_id`) and, upon success, should issue an HTTP 302 Redirect to the `redirect_uri` provided in the initial request, appending the `code` and `state` parameters.
    - **Observed Behavior (Handled by Frontend):** During testing, the Orqestra `dev-api` endpoint was observed to return an HTTP 200 OK with the authorization `code` in the JSON response body, instead of issuing a 302 Redirect.
    - **Frontend Handling:** The `authorizeRequest` function in `oauthApi.ts` includes fallback logic. It uses `fetch` with `redirect: 'follow'` (to handle standard 302s if the API behavior changes) but also explicitly checks if the response is `ok` but `!redirected`. If so, it attempts to parse the JSON body for the `code` and performs a manual redirect using `window.location.href` to the `redirect_uri` with the extracted `code` and `state`.

  - Clicking "Deny" redirects the user to the `redirect_uri` with `error=access_denied` and the `state`.

- **Error Handling:** Displays errors related to missing configuration, invalid URL parameters, API fetch failures, and authorization failures using the Shadcn `Alert` component and red warning text.
