import { useState } from "react";
import type { Lessons } from "../pages/admin/schemas/game.schema";
import type { LessonRes, LessonTestItem } from "../api/admin";

// --- Kiểu role ---
export type RoleAccount = "ADMIN" | "LEARNER";
export const useHome = () => {
    const [lessons, setLessons] = useState<Lessons>([]);
    const [roleAccount, setRoleAccountState] = useState<RoleAccount | null>(null);
    const [selectedLesson, setSelectedLesson] = useState<LessonTestItem | null>(null);
    const [selectedClass, setSelectedClass] = useState(1);
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
        selectedLesson,
        setSelectedLesson,
        setLessonData, orderIndexList, setOrderIndexList,
        editingGameInfo, setEditingGameInfo
    };
};
