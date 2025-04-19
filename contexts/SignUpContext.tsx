// contexts/SignUpContext.tsx
import React, { createContext, useContext, useState } from 'react';

type SignUpData = {
  name?: string;
  email?: string;
  password?: string;
  birthdate?: string | Date;
  // outros campos futuros...
};

type SignUpContextType = {
  data: SignUpData;
  updateData: (newData: Partial<SignUpData>) => void;
  reset: () => void;
};

const SignUpContext = createContext({} as SignUpContextType);

export const SignUpProvider = ({ children }: { children: React.ReactNode }) => {
  const [data, setData] = useState<SignUpData>({});

  function updateData(newData: Partial<SignUpData>) {
    setData((prev) => ({ ...prev, ...newData }));
  }

  function reset() {
    setData({});
  }

  return (
    <SignUpContext.Provider value={{ data, updateData, reset }}>
      {children}
    </SignUpContext.Provider>
  );
};

export const useSignUp = () => useContext(SignUpContext);
