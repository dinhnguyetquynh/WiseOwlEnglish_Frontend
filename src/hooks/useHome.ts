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
    const [orderIndexList, setOrderIndexList] = useState<number[]>([]);
    const [editingGameInfo, setEditingGameInfo] = useState<{
        gameType: string | null;
        lessonId: number | null;
        gameId: number | null;
    } | null>(null);

    return {
        lessons,
        setLessons,
        roleAccount,
        setRoleAccountState,
        selectedClass,
        setSelectedClass,
        lessonData,
        setLessonData, orderIndexList, setOrderIndexList,
        editingGameInfo, setEditingGameInfo
    };
};
