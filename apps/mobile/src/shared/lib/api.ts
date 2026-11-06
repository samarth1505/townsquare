import { createAuthApi } from "@hub/core";
import { plainHttp } from "./http";

// Feature APIs, built once from the shared factories in @hub/core and the app's HTTP client.
export const authApi = createAuthApi(plainHttp);
