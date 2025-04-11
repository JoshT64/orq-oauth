<script setup lang="ts">
import type { PropType } from "vue";
import type { AppDetails } from "@/types/oauth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-icons/vue";

defineProps({
  appDetails: {
    type: Object as PropType<AppDetails>,
    required: true,
  },
  authInProgress: {
    type: Boolean,
    default: false,
  },
  authorizationError: {
    type: String as PropType<string | null>,
    default: null,
  },
});

const emit = defineEmits(["authorize", "deny"]);

function onAuthorizeClick() {
  emit("authorize");
}

function onDenyClick() {
  emit("deny");
}
</script>

<template>
  <Card class="w-full max-w-md">
    <CardHeader class="items-center pt-6 pb-4">
      <div class="flex flex-row items-center justify-center space-x-4 mb-4">
        <img
          v-if="appDetails.logo"
          :src="appDetails.logo"
          :alt="`${appDetails.name} Logo`"
          class="w-16 h-16 rounded-md object-contain bg-muted p-1"
        />
        <div v-else class="w-16 h-16 rounded-md bg-muted flex items-center justify-center shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="w-8 h-8 text-muted-foreground"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-1.997-5.456C15.854 5.776 14.15 4.5 12 4.5c-1.75 0-3.362.805-4.5 2.023A5.25 5.25 0 0 0 2.25 15Z"
            />
          </svg>
        </div>

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="w-6 h-6 text-muted-foreground"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>

        <img src="/logos/orqestra.jpg" alt="Orqestra User" class="w-16 h-16 rounded-full object-cover border" />
      </div>

      <CardTitle class="text-center text-lg">
        <a :href="'https://zapier.com'" class="app-link" target="_blank" rel="noopener noreferrer">
          {{ appDetails.name }}
        </a>
      </CardTitle>
      <CardDescription class="text-center text-sm"> Wants to access your Orqestra account </CardDescription>
    </CardHeader>
    <CardContent class="pt-0">
      <Alert v-if="authorizationError" variant="destructive" class="mb-4">
        <ExclamationTriangleIcon class="h-4 w-4" />
        <AlertTitle>Authorization Error</AlertTitle>
        <AlertDescription>
          {{ authorizationError }}
        </AlertDescription>
      </Alert>

      <div v-if="!authorizationError">
        <hr class="my-4" />
        <p class="text-sm text-muted-foreground mb-4">
          {{ appDetails.description }}
        </p>
        <div class="mb-4">
          <h3 class="text-sm font-semibold mb-2">
            This will allow
            <a :href="'https://zapier.com'" class="app-link" target="_blank" rel="noopener noreferrer">{{
              appDetails.name
            }}</a>
            to:
          </h3>
          <ul class="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            <li v-for="scopeName in appDetails.scopes" :key="scopeName">
              {{ scopeName }}
            </li>
          </ul>
        </div>
        <p class="text-xs text-muted-foreground mt-4">
          By authorizing, you allow this application to use your information in accordance with their terms of service
          and privacy policy (not provided here). You can revoke access at any time in your Orqestra account settings.
        </p>
      </div>

      <div v-if="authInProgress" class="text-center text-sm text-muted-foreground mt-4">Authorizing...</div>
    </CardContent>
    <CardFooter class="flex justify-end space-x-2 pb-6">
      <Button variant="outline" @click="onDenyClick" :disabled="authInProgress"> Deny </Button>
      <Button @click="onAuthorizeClick" :disabled="authInProgress"> Authorize {{ appDetails.name }} </Button>
    </CardFooter>
  </Card>
</template>
