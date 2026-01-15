import { createContext } from "react";
import type { ThemeProviderState } from "./ThemeProvider";
import { initialState } from "./initialState";


export const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
