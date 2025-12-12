import { Box, Button, Select, Typography } from "@mui/material";
import { useHomeContext } from "../../../../../context/AuthContext";
import {
    MenuItem
} from "@mui/material";
import { KeyboardArrowDown as ArrowDownIcon } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { getTestsByGrade, type LessonTestItem } from "../../../../../api/admin";
import LessonDetail from "../component/LessonDetail";
export default function LessionPage() {
    const { selectedClass, setSelectedClass, setSelectedLesson, selectedLesson } = useHomeContext();
    const [data, setData] = useState<LessonTestItem[]>([]);

    // 1. Tách logic gọi API ra thành 1 hàm riêng để dễ quản lý
    const loadData = async () => {
        if (!selectedClass) return;
        try {
            const res = await getTestsByGrade(selectedClass);
            setData(res);
        } catch (error) {
            console.error("Failed to load tests:", error);
        }
    };

    // useEffect(() => {
    //     if (!selectedClass) return;    

    //     getTestsByGrade(selectedClass).then(setData);
    // }, [selectedClass]);

    useEffect(() => {
        // Chỉ gọi API khi:
        // - Có lớp được chọn (selectedClass)
        // - VÀ đang ở màn hình danh sách (selectedLesson === null)
        if (selectedClass && !selectedLesson) {
            loadData();
        }
        
    // 3. Thêm selectedLesson vào dependency array
    // Khi bạn bấm nút Back, selectedLesson chuyển về null -> useEffect chạy lại -> loadData()
    }, [selectedClass, selectedLesson]);


    const renderHeader = (
        <Box sx={{ mb: 3, width: 200 }}>
            <Select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                displayEmpty
                IconComponent={ArrowDownIcon}
                disabled={!!selectedLesson}   // 👈 DISABLE KHI VÀO LESSONDETAIL
                sx={{
                    bgcolor: "white",
                    fontSize: 14,
                    borderRadius: 1,
                    height: 40,
                    "& .MuiSelect-select": { display: "flex", alignItems: "center" },
                    "&.Mui-disabled": {
                        bgcolor: "grey.100",
                        color: "text.disabled",
                    },
                }}
            >
                <MenuItem value="" disabled>
                    Chọn lớp
                </MenuItem>
                {[1, 2, 3, 4, 5].map((grade) => (
                    <MenuItem key={grade} value={String(grade)}>
                        Lớp {grade}
                    </MenuItem>
                ))}
            </Select>
        </Box>
    );
    // ====== MÀN CHI TIẾT — DÙNG IF ======
    if (selectedLesson) {
        return (
            <>
                {renderHeader}

                <LessonDetail
                    lessonId={selectedLesson.lessonId}
                    onBack={() => setSelectedLesson(null)} // ← quay lại danh sách
                />
            </>
        );
    }
    return (
        <Box  >
            {renderHeader}
            {/* Khung tiêu đề trang */}
            <Box display="flex" flexDirection="column" gap={2} >
                <Box

                    display="flex"
                    justifyContent="center"
                >
                    <Typography fontWeight={600}>QUẢN LÝ BÀI KIỂM TRA</Typography>
                </Box>
                <Box
                    border="1px solid #ccc"
                    borderRadius={2}
                    px={2}
                    py={1.2}
                    display="flex"
                    fontWeight={600}
                >
                    <Box flex={1}>
                        <Typography fontWeight={600}>UNIT</Typography>
                    </Box>
                    <Box flex={1}>
                        <Typography fontWeight={600}>BÀI KIỂM TRA</Typography>
                    </Box>
                </Box>
                {data.map((unit) => (
                    <Box
                        key={unit.lessonId}
                        border="1px solid #ddd"
                        borderRadius={2}
                        px={3}
                        py={3}
                        bgcolor="#fafafa"
                        display="flex"
                        flexDirection="column"
                        gap={2}
                    >
                        <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            gap={2}
                        >
                            {/* Title */}
                            <Typography
                                fontWeight={700}
                                fontSize="1rem"
                                minWidth="180px"
                                lineHeight="28px"
                            >
                                {unit.unitName}: {unit.lessonName}
                            </Typography>

                            {/* Tests */}
                            <Box flex={1} display="flex" flexDirection="column" gap={1.5}>
                                {unit.tests.length > 0 ? (
                                    <>
                                        {/* Hàng 1 */}
                                        <Box display="flex" gap={2}>
                                            {unit.tests.slice(0, 2).map((test) => (
                                                <Box
                                                    key={test.id}
                                                    flex={1}
                                                    px={2}
                                                    py={1.2}
                                                    border="1px solid #c6c6c6"
                                                    borderRadius={2}
                                                    textAlign="center"
                                                    fontWeight={500}
                                                    sx={{
                                                        transition: "0.2s",
                                                        "&:hover": {
                                                            backgroundColor: "#f1f1f1",
                                                            cursor: "pointer",
                                                        },
                                                    }}
                                                >
                                                    {test.title}
                                                </Box>
                                            ))}
                                        </Box>

                                        {/* Hàng 2 */}
                                        {unit.tests[2] && (
                                            <Box
                                                px={2}
                                                py={1.2}
                                                border="1px solid #c6c6c6"
                                                borderRadius={2}
                                                width="50%"
                                                textAlign="center"
                                                fontWeight={500}
                                                sx={{
                                                    transition: "0.2s",
                                                    "&:hover": {
                                                        backgroundColor: "#f1f1f1",
                                                        cursor: "pointer",
                                                    },
                                                }}
                                            >
                                                {unit.tests[2].title}
                                            </Box>
                                        )}
                                    </>
                                ) : (
                                    <Typography
                                        color="text.secondary"
                                        fontStyle="italic"
                                        pl={0.5}
                                        py={0.5}
                                    >
                                        Chưa có bài kiểm tra nào
                                    </Typography>
                                )}
                            </Box>

                            {/* Button */}
                            <Button
                                variant="outlined"
                                // disabled={unit.tests.length === 0}     
                                sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    borderColor: "#ccc",
                                    color: "#555",  // màu mờ hơn khi disable
                                    fontWeight: 500,
                                    backgroundColor: "#eee",
                                    "&:hover": {
                                        backgroundColor: "#e0e0e0",
                                        borderColor: "#bbb",
                                    },
                                }}
                                onClick={() => {
                                    // if (unit.tests.length === 0) return;  // tránh click khi disable
                                    setSelectedLesson(unit);
                                }}
                            >
                                Xem chi tiết
                            </Button>


                        </Box>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}
