import { createClient } from "@osdk/client";
import { createPublicOauthClient } from "@osdk/oauth";

const url = import.meta.env.DEV
  ? import.meta.env.VITE_DEV_CLIENT_URL
  : import.meta.env.VITE_PROD_CLIENT_URL;
const clientId = import.meta.env.VITE_FOUNDRY_CLIENT_ID;
const ontologyRid = import.meta.env.VITE_FOUNDRY_ONTOLOGY_RID;

function checkEnv(
  value: string | undefined,
  name: string
): asserts value is string {
  if (value == null) {
    throw new Error(`Missing environment variable: ${name}`);
  }
}

checkEnv(
  url,
  import.meta.env.DEV ? "VITE_DEV_CLIENT_URL" : "VITE_PROD_CLIENT_URL"
);
checkEnv(clientId, "VITE_FOUNDRY_CLIENT_ID");
checkEnv(ontologyRid, "VITE_FOUNDRY_ONTOLOGY_RID");

const redirectUrl = url + "/auth-callback";

export const auth = createPublicOauthClient(clientId, url, redirectUrl);
export const client = createClient(url, ontologyRid, auth);

export default client;
