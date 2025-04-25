import { createClient } from "@osdk/client";
import { createPublicOauthClient } from "@osdk/oauth";

const url = import.meta.env.VITE_FOUNDRY_API_URL;
const clientId = import.meta.env.VITE_FOUNDRY_CLIENT_ID;
const ontologyRid = import.meta.env.VITE_FOUNDRY_ONTOLOGY_RID;
const redirectUrl = import.meta.env.VITE_REDIRECT_URL;

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
checkEnv(ontologyRid, "VITE_FOUNDRY_ONTOLOGY_RID");
checkEnv(redirectUrl, "VITE_REDIRECT_URL");

export const auth = createPublicOauthClient(clientId, url, redirectUrl);
export const client = createClient(url, ontologyRid, auth);

export default client;
