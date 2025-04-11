export interface OAuthParams {
  client_id: string | null;
  state: string | null;
  redirect_uri: string | null;
  scope: string | null;
  code_challenge: string | null;
  code_challenge_method: string | null;
  response_type: string | null;
}

export interface AppDetails {
  name: string;
  description: string;
  logo: string;
  scopes: string[];
}
