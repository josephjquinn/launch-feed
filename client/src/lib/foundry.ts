import { Client, createClient } from "@osdk/client";
import { createPublicOauthClient } from "@osdk/oauth";

const url = import.meta.env.VITE_FOUNDRY_API_URL;
const clientId = import.meta.env.VITE_FOUNDRY_CLIENT_ID;
const redirectUrl = import.meta.env.DEV
  ? import.meta.env.VITE_FOUNDRY_REDIRECT_URL
  : import.meta.env.VITE_FOUNDRY_REDIRECT_URL_PROD;

function checkEnv(
  value: string | undefined,
  name: string
): asserts value is string {
  if (value == null) {
    throw new Error(`Missing environment variable: ${name}`);
  }
}

checkEnv(url, "VITE_FOUNDRY_API_URL");
checkEnv(clientId, "VITE_FOUNDRY_CLIENT_ID");
checkEnv(
  redirectUrl,
  import.meta.env.DEV
    ? "VITE_FOUNDRY_REDIRECT_URL"
    : "VITE_FOUNDRY_REDIRECT_URL_PROD"
);

const ontologyRid =
  "ri.ontology.main.ontology.ab3b7be9-b65d-4d93-b68c-c5fc218d81e0";

const scopes: string[] = [
  "api:ontologies-read",
  "api:ontologies-write",
  "api:mediasets-read",
  "api:mediasets-write",
];

export const auth = createPublicOauthClient(
  clientId,
  url,
  redirectUrl,
  true,
  undefined,
  window.location.toString(),
  scopes
);

/**
 * Initialize the client to interact with the Foundry API
 */
const client: Client = createClient(
  import.meta.env.DEV ? "http://localhost:5173" : url,
  ontologyRid,
  auth
);

export default client;
