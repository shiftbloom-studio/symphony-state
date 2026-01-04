import React, { createContext, useContext } from "react";
import type { Conductor } from "../core/types";

const SymphonyContext = createContext<Conductor | null>(null);

export type SymphonyProviderProps = {
  conductor: Conductor;
  children: React.ReactNode;
};

export const SymphonyProvider = ({ conductor, children }: SymphonyProviderProps) => {
  return (
    <SymphonyContext.Provider value={conductor}>
      {children}
    </SymphonyContext.Provider>
  );
};

export const useConductor = () => {
  const conductor = useContext(SymphonyContext);
  if (!conductor) {
    throw new Error("SymphonyProvider is missing in the React tree.");
  }
  return conductor;
};
