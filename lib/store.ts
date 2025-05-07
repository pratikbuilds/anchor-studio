import { create } from "zustand";
import { persist } from "zustand/middleware";

interface JsonState {
  jsonData: string;
  isValid: boolean;
  setJsonData: (data: string) => void;
  setIsValid: (valid: boolean) => void;
}

export const useJsonStore = create<JsonState>()(
  persist(
    (set) => ({
      jsonData: "",
      isValid: true,
      setJsonData: (data) => set({ jsonData: data }),
      setIsValid: (valid) => set({ isValid: valid }),
    }),
    {
      name: "json-storage",
    }
  )
);
