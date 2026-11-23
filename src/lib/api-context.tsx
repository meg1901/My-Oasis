import { createContext, useContext } from "react";
import type { Api } from "./api";
import { liveApi } from "./api";

export const ApiContext = createContext<Api>(liveApi);
export const useApi = () => useContext(ApiContext);
