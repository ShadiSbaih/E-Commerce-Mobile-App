import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { setLoadingHandlers } from "@/constants/api";
import BrandLoader from "@/components/BrandLoader";
import { colors } from "@/theme";

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

    return (
        <LoadingContext.Provider value={value}>
            {children}
            {value.isLoading && (
                <View style={styles.overlay} pointerEvents="none" accessibilityLiveRegion="polite">
                    <BrandLoader label="Loading" />
                </View>
            )}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (!context) throw new Error("useLoading must be used within LoadingProvider");
    return context;
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
        zIndex: 1000,
    },
});
