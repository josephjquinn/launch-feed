import { Client, createClient } from "@osdk/client";

const url = import.meta.env.VITE_FOUNDRY_API_URL;
const token = import.meta.env.VITE_FOUNDRY_TOKEN;

function checkEnv(
  value: string | undefined,
  name: string
): asserts value is string {
  if (value == null) {
    throw new Error(`Missing environment variable: ${name}`);
  }
}

checkEnv(url, "VITE_FOUNDRY_API_URL");
checkEnv(token, "VITE_FOUNDRY_TOKEN");

const ontologyRid =
  "ri.ontology.main.ontology.ab3b7be9-b65d-4d93-b68c-c5fc218d81e0";

const client: Client = createClient(
  import.meta.env.DEV ? "http://localhost:5173" : window.location.origin,
  ontologyRid,
  () => Promise.resolve(token)
);

export default client;
