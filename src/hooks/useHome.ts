import { useState } from "react";
import type { Lessons } from "../pages/admin/schemas/game.schema";
import type { LessonRes } from "../api/admin";

// --- Kiểu role ---
export type RoleAccount = "ADMIN" | "LEARNER";
export const useHome = () => {
    const [lessons, setLessons] = useState<Lessons>([]);
    const [roleAccount, setRoleAccountState] = useState<RoleAccount | null>(null);
    const [selectedClass, setSelectedClass] = useState("1");
    const [lessonData, setLessonData] = useState<LessonRes[]>([]);

    return {
        lessons,
        setLessons,
        roleAccount,
        setRoleAccountState,
        selectedClass,
        setSelectedClass,
        lessonData,
        setLessonData

    };
};
