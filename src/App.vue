<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-icons/vue";
import type { OAuthParams, AppDetails } from "@/types/oauth";
import { getScopeDetails, authorizeRequest } from "@/services/oauthApi";
import ConsentCard from "@/components/ConsentCard.vue";

// --- Environment Variables ---
const API_BASE_URL = import.meta.env.VITE_ORQESTRA_API_BASE_URL;
const AUTH_TOKEN = import.meta.env.VITE_ORQESTRA_API_TOKEN;

// --- Reactive State ---
const oauthParams = ref<OAuthParams>({
  client_id: null,
  state: null,
  redirect_uri: null,
  scope: null,
  code_challenge: null,
  code_challenge_method: null,
  response_type: null,
});

const appDetails = ref<AppDetails | null>(null);
const isLoading = ref<boolean>(true);
const requestError = ref<string | null>(null);
const authError = ref<string | null>(null);
const authInProgress = ref<boolean>(false);

// --- Computed Properties ---
const isValidRequest = computed(() => {
  const params = oauthParams.value;
  return (
    params.client_id &&
    params.state &&
    params.redirect_uri &&
    params.scope &&
    params.code_challenge &&
    params.code_challenge_method &&
    params.response_type === "code"
  );
});

// --- Lifecycle Hooks ---
onMounted(() => {
  requestError.value = null;
  authError.value = null;

  if (!API_BASE_URL || !AUTH_TOKEN) {
    requestError.value = "Configuration error: API URL or Token is missing.";
    isLoading.value = false;
    return;
  }

  parseQueryParams();

  if (isValidRequest.value) {
    fetchAppDetails();
  } else {
    requestError.value = "Missing or invalid OAuth parameters in the URL.";
    isLoading.value = false;
  }
});

// --- Methods ---
function parseQueryParams() {
  const urlParams = new URLSearchParams(window.location.search);
  oauthParams.value = {
    client_id: urlParams.get("client_id"),
    state: urlParams.get("state"),
    redirect_uri: urlParams.get("redirect_uri"),
    scope: urlParams.get("scope"),
    code_challenge: urlParams.get("code_challenge"),
    code_challenge_method: urlParams.get("code_challenge_method"),
    response_type: urlParams.get("response_type"),
  };
}

async function fetchAppDetails() {
  isLoading.value = true;
  requestError.value = null;
  authError.value = null;
  const { client_id, scope } = oauthParams.value;

  if (!client_id || !scope || !AUTH_TOKEN) {
    requestError.value = "Client ID, Scope, or Auth Token missing for fetching app details.";
    isLoading.value = false;
    return;
  }

  try {
    const details = await getScopeDetails(client_id, scope, AUTH_TOKEN);
    appDetails.value = details;
  } catch (err: any) {
    console.error("Error fetching app details:", err);
    requestError.value = err.message || "An unknown error occurred while fetching application details.";
    appDetails.value = null;
  } finally {
    isLoading.value = false;
  }
}

async function handleAuthorize() {
  if (!isValidRequest.value || authInProgress.value || !AUTH_TOKEN) return;

  authInProgress.value = true;
  authError.value = null;

  try {
    await authorizeRequest(oauthParams.value, AUTH_TOKEN);
  } catch (err: any) {
    console.error("Error during authorization:", err);
    authError.value = err.message || "An unknown error occurred during authorization.";
    authInProgress.value = false;
  }
}

function handleDeny() {
  requestError.value = null;
  authError.value = null;

  if (!oauthParams.value.redirect_uri || !oauthParams.value.state) {
    requestError.value = "Cannot deny access: redirect URI or state is missing.";
    return;
  }

  try {
    const redirectUrl = new URL(oauthParams.value.redirect_uri);
    redirectUrl.searchParams.set("error", "access_denied");
    redirectUrl.searchParams.set("state", oauthParams.value.state);
    window.location.href = redirectUrl.toString();
  } catch (urlError) {
    console.error("Error constructing deny redirect URL:", urlError);
    requestError.value = "Failed to construct the redirect URL for denying access.";
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-background p-4">
    <div v-if="isLoading" class="text-center">
      <p>Loading consent details...</p>
    </div>

    <Alert v-else-if="requestError && !appDetails" variant="destructive" class="w-full max-w-md">
      <ExclamationTriangleIcon class="h-4 w-4" />
      <AlertTitle>Request Error</AlertTitle>
      <AlertDescription>
        {{ requestError }}
        <span v-if="!isValidRequest"> Please ensure the link you followed is correct.</span>
      </AlertDescription>
    </Alert>

    <ConsentCard
      v-else-if="appDetails"
      :app-details="appDetails"
      :auth-in-progress="authInProgress"
      :authorization-error="authError"
      @authorize="handleAuthorize"
      @deny="handleDeny"
      class="w-full max-w-md"
    />

    <div v-else class="text-center text-muted-foreground">Could not load consent details.</div>
  </div>
</template>
