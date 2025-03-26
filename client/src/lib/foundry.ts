import { Client, createClient } from "@osdk/client";
import { createPublicOauthClient } from "@osdk/oauth";

const client_id: string = "bf0313cefb46ae52f8b9c048e8790089";
const foundryUrl: string = "https://jquinn-launch.usw-18.palantirfoundry.com";
const proxyUrl: string = "http://localhost:5173";
const ontologyRid: string =
  "ri.ontology.main.ontology.ab3b7be9-b65d-4d93-b68c-c5fc218d81e0";
const redirectUrl: string = "http://localhost:5173/";
const scopes: string[] = [
  "api:ontologies-read",
  "api:ontologies-write",
  "api:mediasets-read",
  "api:mediasets-write",
];

const auth = createPublicOauthClient(
  client_id,
  foundryUrl,
  redirectUrl,
  true,
  undefined,
  window.location.toString(),
  scopes
);

export const client: Client = createClient(proxyUrl, ontologyRid, auth);
