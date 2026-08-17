import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { setLoadingHandlers } from "@/constants/api";

type LoadingContextValue = {
    isLoading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
};

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [requestCount, setRequestCount] = useState(0);

    const startLoading = useCallback(() => {
        setRequestCount((count) => count + 1);
    }, []);

    const stopLoading = useCallback(() => {
        setRequestCount((count) => Math.max(0, count - 1));
    }, []);

    React.useEffect(() => {
        setLoadingHandlers(startLoading, stopLoading);
        return () => setLoadingHandlers(() => undefined, () => undefined);
    }, [startLoading, stopLoading]);

    const value = useMemo(
        () => ({
            isLoading: requestCount > 0,
            startLoading,
            stopLoading,
        }),
        [requestCount, startLoading, stopLoading],
    );

    return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (!context) throw new Error("useLoading must be used within LoadingProvider");
    return context;
}
