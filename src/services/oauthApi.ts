import type { AppDetails, OAuthParams } from "@/types/oauth";

const API_BASE_URL = import.meta.env.VITE_ORQESTRA_API_BASE_URL;

export async function getScopeDetails(clientId: string, scope: string, token: string): Promise<AppDetails> {
  if (!API_BASE_URL) {
    throw new Error("Configuration error: VITE_ORQESTRA_API_BASE_URL is not defined.");
  }

  const url = `${API_BASE_URL}/oauth/scopes?client_id=${encodeURIComponent(clientId)}&scope=${encodeURIComponent(
    scope
  )}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Failed to fetch app details: ${response.status} ${response.statusText}. ${errorData.message || ""}`
    );
  }

  const responseData = await response.json();

  const apiData = responseData?.data;

  if (!apiData) {
    console.error("API response missing 'data' field:", responseData);
    throw new Error("Received invalid data structure from scope details API.");
  }

  const details: AppDetails = {
    name: apiData.name ?? "Unknown Application",
    description: apiData.display_description ?? "No description provided.",
    scopes: Array.isArray(apiData.scope_description) ? apiData.scope_description : [],
    logo: apiData.logo_uri ?? undefined,
  };

  console.log("Parsed app details:", details);
  return details;
}

/**
 * Initiates the OAuth authorization process.
 * Handles the POST request and expects the browser to follow redirects.
 * Includes fallback for non-standard JSON response with code.
 */
export async function authorizeRequest(params: OAuthParams, token: string): Promise<void> {
  if (!API_BASE_URL) {
    throw new Error("Configuration error: VITE_ORQESTRA_API_BASE_URL is not defined.");
  }
  if (
    !params.client_id ||
    !params.redirect_uri ||
    !params.response_type ||
    !params.scope ||
    !params.code_challenge ||
    !params.code_challenge_method
  ) {
    throw new Error("Cannot authorize: Missing required OAuth parameters.");
  }

  const authorizeUrl = new URL(`${API_BASE_URL}/oauth/authorize`);
  authorizeUrl.searchParams.set("client_id", params.client_id);
  authorizeUrl.searchParams.set("redirect_uri", params.redirect_uri);
  authorizeUrl.searchParams.set("response_type", params.response_type);
  authorizeUrl.searchParams.set("scope", params.scope);
  authorizeUrl.searchParams.set("code_challenge", params.code_challenge);
  authorizeUrl.searchParams.set("code_challenge_method", params.code_challenge_method);

  const response = await fetch(authorizeUrl.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    redirect: "follow",
  });

  // Handle non-standard API behavior where code is
  // returned in body instead of 302 redirect (Standard OAuth 2.0 behavior).
  if (response.ok && !response.redirected) {
    try {
      const data = await response.json();
      if (data.code && params.redirect_uri && params.state) {
        const redirectUrl = new URL(params.redirect_uri);
        redirectUrl.searchParams.set("code", data.code);
        redirectUrl.searchParams.set("state", params.state);
        window.location.href = redirectUrl.toString();
        return; // Exit function after manual redirect starts
      } else {
        throw new Error("Authorization succeeded but no redirect occurred and no code found in response.");
      }
    } catch (parseError) {
      console.warn(
        "Authorization POST succeeded but did not redirect, and response body could not be parsed for a code or was empty.",
        response,
        parseError
      );
      throw new Error("Authorization process did not complete as expected. The server did not redirect automatically.");
    }
  } else if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Authorization failed: ${response.status} ${response.statusText}. ${errorData.message || ""}`);
  }
}
