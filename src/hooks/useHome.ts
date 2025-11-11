import { useState } from "react";

// --- Kiểu role ---
export type RoleAccount = "ADMIN" | "LEARNER";
export const useHome = () => {

    const [roleAccount, setRoleAccountState] = useState<RoleAccount | null>(null);
    const [selectedClass, setSelectedClass] = useState("1");
    return {
        roleAccount,
        setRoleAccountState,
        selectedClass,
        setSelectedClass

    };
};
