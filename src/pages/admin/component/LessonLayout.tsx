import { useEffect, useState } from "react";
import { Box, Button, Card, Grid, Select, Typography, MenuItem } from "@mui/material";
import { KeyboardArrowDown as ArrowDownIcon } from "@mui/icons-material";
import { useHomeContext } from "../../../context/AuthContext";
import { getListLesson, type LessonRes } from "../../../api/admin";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CreateNewLesson from "./LessionComponent/CreateNewLession";
import LessonDetail from "./LessionComponent/LessonDetail";


export default function LessonLayout() {
    const {
        selectedClass,
        setSelectedClass,
        lessonData, setLessonData, setOrderIndexList
    } = useHomeContext();



    const [selectedLesson, setSelectedLesson] = useState<LessonRes | null>(null);

    const [isCreating, setIsCreating] = useState(false);


    const fetchData = async () => {
        if (!selectedClass) return;
        try {
            const res = await getListLesson(Number(selectedClass));
            setLessonData(res);

            // Lưu mảng orderIndex
            const list = res.map(item => item.orderIndex);
            setOrderIndexList(list);

            console.log("orderIndexList =", list);
        } catch (err) {
            console.error(err);
        }
    };


    // Gọi khi đổi lớp
    useEffect(() => {
        fetchData();
    }, [selectedClass]);

    // UI tạo bài học
    if (isCreating) {
        return (
            <CreateNewLesson
                onSuccess={() => {
                    setIsCreating(false);
                    fetchData();
                }}
                lessonIds={lessonData.map(item => item.orderIndex)}
            />
        );
    }

    if (selectedLesson) {
        return (
            <LessonDetail
                lesson={selectedLesson}
                onBack={() => setSelectedLesson(null)}
            />
        );
    }


    return (
        <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Quản lý Bài học (Lesson)
            </Typography>

            {/* Select lớp */}
            <Box
                sx={{
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    displayEmpty
                    IconComponent={ArrowDownIcon}
                    sx={{
                        bgcolor: "white",
                        fontSize: 14,
                        borderRadius: 1,
                        height: 40,
                        "& .MuiSelect-select": { display: "flex", alignItems: "center" },
                    }}
                >
                    <MenuItem value="" disabled>Chọn lớp</MenuItem>

                    {[1, 2, 3, 4, 5].map((grade) => (
                        <MenuItem key={grade} value={String(grade)}>
                            Lớp {grade}
                        </MenuItem>
                    ))}
                </Select>

                <Button
                    variant="contained"
                    sx={{ bgcolor: "#4CAF50", px: 3, height: 40 }}
                    onClick={async () => {
                        await fetchData();        // load danh sách trước
                        setIsCreating(true);      // rồi mới mở form tạo mới
                    }}
                >
                    Tạo bài học
                </Button>



            </Box>

            {/* Header */}
            <Grid container sx={{ p: 1, borderBottom: "1px solid #ddd", fontWeight: 600 }}>
                <Box sx={{ width: "8%" }}>Thứ tự</Box>
                <Box sx={{ width: "32%" }}>Tên bài học</Box>
                <Box sx={{ width: "20%" }}>Ngày sửa gần nhất</Box>
                <Box sx={{ width: "20%" }}>Hình minh họa</Box>
                <Box sx={{ width: "20%" }}></Box>
            </Grid>

            {/* Rows */}
            {Array.isArray(lessonData) &&
                lessonData.map((item) => (
                    <Card
                        onClick={() => setSelectedLesson(item)}

                        key={item.id}
                        sx={{
                            p: 2,
                            mb: 2,
                            borderRadius: 2,
                            boxShadow: "0 0 0 1px #e0e0e0",
                        }}
                    >
                        <Grid container alignItems="center">
                            <Box sx={{ width: "8%" }}>
                                <Typography>{item.orderIndex}</Typography>
                            </Box>

                            <Box sx={{ width: "32%" }}>
                                <Box
                                    sx={{
                                        borderRadius: 1,
                                        p: 1.5,
                                    }}
                                >
                                    <Typography fontWeight={600} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        {item.unitNumber}: {item.unitName}

                                        {item.active && (
                                            <CheckCircleIcon
                                                sx={{ fontSize: 20, color: "green" }}
                                            />
                                        )}
                                    </Typography>
                                </Box>
                            </Box>


                            <Box sx={{ width: "20%" }}>
                                <Typography fontWeight={600}>
                                    {new Date(item.updatedAt).toLocaleDateString("vi-VN")}
                                </Typography>
                            </Box>

                            <Box sx={{ width: "20%" }}>
                                <Box
                                    component="img"
                                    src={item.urlMascot ?? undefined}   // <-- fix
                                    alt="Mascot"
                                    sx={{ width: 80, height: "auto" }}
                                />

                            </Box>

                            <Box sx={{ width: "20%" }}>
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                    <Button fullWidth variant="contained" sx={{ bgcolor: "#a5d6a7" }}>
                                        Sửa
                                    </Button>
                                    <Button fullWidth variant="contained" sx={{ bgcolor: "#ef9a9a" }}>
                                        Xoá
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    </Card>
                ))
            }
        </Box>
    );
}
