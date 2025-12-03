import { useEffect, useState } from "react";
import { Box, Button, Card, Grid, Select, Typography, MenuItem, Switch, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { KeyboardArrowDown as ArrowDownIcon } from "@mui/icons-material";
import { useHomeContext } from "../../../context/AuthContext";
import { deleteLesson, getListLesson, updateLessonStatus, type LessonRes } from "../../../api/admin";

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

    // Trong LessonLayout function
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [deletingLessonId, setDeletingLessonId] = useState<number | null>(null);


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

    // --- HÀM XỬ LÝ UPDATE ACTIVE ---
    const handleToggleActive = async (lessonId: number, currentStatus: boolean) => {
        try {
            // 1. Tính trạng thái mới (ngược lại với hiện tại)
            const newStatus = !currentStatus;

            // 2. Gọi API cập nhật
            const updatedLesson = await updateLessonStatus(lessonId, newStatus);
            
            // 3. Cập nhật State Local ngay lập tức với dữ liệu mới từ Backend trả về
            // (Bao gồm cả active mới và updatedAt mới)
            const normalized = {
            ...updatedLesson,
            // convert API string timestamp to Date to match local state type
            updatedAt: new Date(updatedLesson.updatedAt),
            } as {
            id: number;
            unitNumber: string;
            unitName: string;
            orderIndex: number;
            active: boolean;
            urlMascot: string | null;
            updatedAt: Date;
            };

            setLessonData((prevData) => 
                prevData.map((item) => 
                    item.id === lessonId ?  normalized : item
                )
            );
            
            console.log("Cập nhật thành công:", updatedLesson);
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            // Có thể thêm thông báo lỗi (Toast/Snackbar) ở đây
        }
    };
    // --- HÀM XỬ LÝ XOÁ MỚI ---
    // 1. Hàm được gọi khi bấm nút "Xoá" trên Card
    const handleClickDelete = (id: number) => {
        setDeletingLessonId(id); // Lưu lại ID cần xoá
        setOpenDeleteDialog(true); // Mở hộp thoại
    };
    // 2. Hàm được gọi khi bấm nút "Xoá" trong Hộp thoại
        const handleConfirmDelete = async () => {
            if (deletingLessonId === null) return;

            try {
                // Gọi API xoá
                await deleteLesson(deletingLessonId);

                // Cập nhật UI (Lọc bỏ item đã xoá)
                setLessonData((prevData) => 
                    prevData.filter((item) => item.id !== deletingLessonId)
                );

                // Đóng hộp thoại
                setOpenDeleteDialog(false);
                setDeletingLessonId(null);
                
            } catch (error) {
                console.error("Lỗi xoá:", error);
                // Có thể hiện thông báo lỗi ở đây
            }
        };
    // 3. Hàm đóng hộp thoại (khi bấm Hủy hoặc bấm ra ngoài)
        const handleCloseDialog = () => {
            setOpenDeleteDialog(false);
            setDeletingLessonId(null);
        };

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

                                        {/* {item.active && (
                                            <CheckCircleIcon
                                                sx={{ fontSize: 20, color: "green" }}
                                            />
                                        )} */}
                                    </Typography>
                                    {/* --- PHẦN SWITCH MỚI --- */}
                                    <Box 
                                        onClick={(e) => e.stopPropagation()} // Ngăn chặn sự kiện click lan ra Card cha
                                    >
                                        <Switch
                                            checked={item.active}
                                            onChange={() => handleToggleActive(item.id, item.active)}
                                            color="success" // Màu xanh khi bật
                                            size="small"
                                        />
                                    </Box>
                                    {/* ----------------------- */}
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
                                    <Button 
                                        fullWidth variant="contained" 
                                        sx={{ bgcolor: "#a5d6a7" }}
                                        onClick={(e) => {
                                        e.stopPropagation(); // Ngăn click vào card
                                        // Logic xoá
                                        }}
                                        >
                                        Sửa
                                    </Button>
                                    <Button 
                                        fullWidth variant="contained" 
                                        sx={{ bgcolor: "#ef9a9a" }}
                                        onClick={(e) => {
                                        e.stopPropagation(); // Ngăn click vào card
                                        handleClickDelete(item.id); // Chỉ mở Dialog, chưa xoá ngay
                                        }}
                                        >
                                        Xoá
                                    </Button>
                                </Box>
                            </Box>
                        </Grid>
                    </Card>
                ))
            }
            {/* --- PHẦN DIALOG XÁC NHẬN --- */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Xác nhận xoá bài học?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xoá bài học này không? Hành động này sẽ chuyển bài học vào thùng rác (hoặc xoá vĩnh viễn tuỳ cài đặt).
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog} color="primary">
                        Hủy bỏ
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
                        Đồng ý Xoá
                    </Button>
                </DialogActions>
            </Dialog>
            {/* ---------------------------- */}
        </Box>
    );
}
