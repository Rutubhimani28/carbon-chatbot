import React, { createContext, useState, useContext } from "react";

const GrokContext = createContext();

export const GrokProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenCount, setTokenCount] = useState(0);
  const [sessionRemainingTokens, setSessionRemainingTokens] = useState(0);
  const [results, setResults] = useState([]);
  const [grokhistoryList, setGrokHistoryList] = useState([]);
    const [totalTokensUsed, setTotalTokensUsed] = useState(0);

  return (
    <GrokContext.Provider
      value={{
        loading,
        setLoading,
        error,
        setError,
        tokenCount,
        setTokenCount,
        sessionRemainingTokens,
        setSessionRemainingTokens,
        results,
        setResults,
        grokhistoryList,
        setGrokHistoryList,
        totalTokensUsed,
        setTotalTokensUsed,
      }}
    >
      {children}
    </GrokContext.Provider>
  );
};

export const useGrok = () => useContext(GrokContext);
