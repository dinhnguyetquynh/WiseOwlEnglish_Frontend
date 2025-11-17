import { useState } from "react";
import type { Lessons } from "../pages/admin/schemas/game.schema";

// --- Kiểu role ---
export type RoleAccount = "ADMIN" | "LEARNER";
export const useHome = () => {
    const [lessons, setLessons] = useState<Lessons>([]);
    const [roleAccount, setRoleAccountState] = useState<RoleAccount | null>(null);
    const [selectedClass, setSelectedClass] = useState("1");


    return {
        lessons,
        setLessons,
        roleAccount,
        setRoleAccountState,
        selectedClass,
        setSelectedClass

    };
};
