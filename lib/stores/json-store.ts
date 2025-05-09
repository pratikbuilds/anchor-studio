import { create } from "zustand";
import { persist } from "zustand/middleware";

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
}

/**
 * JSON store with persistence
 */
export const useJsonStore = create<JsonState>()(
  persist(
    (set) => ({
      // Initial state
      jsonData: "",
      isValid: true,
      
      // Actions
      setJsonData: (data) => set({ jsonData: data }),
      setIsValid: (valid) => set({ isValid: valid }),
    }),
    {
      name: "json-storage",
    }
  )
);
