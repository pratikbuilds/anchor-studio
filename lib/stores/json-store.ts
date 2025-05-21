import { create } from "zustand";

/**
 * JSON state interface
 */
export interface JsonState {
  // State
  readonly jsonData: string;
  readonly isValid: boolean;
  
  // Actions
  setJsonData: (data: string) => void;
  setIsValid: (valid: boolean) => void;
  reset: () => void;
}

/**
 * JSON store without persistence to avoid keeping old IDL data
 */
export const useJsonStore = create<JsonState>()((set) => ({
  // Initial state
  jsonData: "",
  isValid: true,
  
  // Actions
  setJsonData: (data) => set({ jsonData: data }),
  setIsValid: (valid) => set({ isValid: valid }),
  reset: () => set({ jsonData: "", isValid: true }),
}));
