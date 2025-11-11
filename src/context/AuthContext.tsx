import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useHome } from "../hooks/useHome";

// Lấy kiểu tự động từ return type của hook
type HomeContextType = ReturnType<typeof useHome>;

const HomeContext = createContext<HomeContextType | undefined>(undefined);

export function HomeProvider({ children }: { children: ReactNode }) {
    const homeData = useHome();
    return <HomeContext.Provider value={homeData}>{children}</HomeContext.Provider>;
}

export function useHomeContext() {
    const context = useContext(HomeContext);
    if (!context) throw new Error("useHomeContext must be used within HomeProvider");
    return context;
}

