import { useEffect, useState } from "react";
import { Box, Button, Card, Grid, Select, Typography, MenuItem, Switch, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField } from "@mui/material";
import { KeyboardArrowDown as ArrowDownIcon } from "@mui/icons-material";
import { useHomeContext } from "../../../context/AuthContext";
import { deleteLesson, getListLesson, updateLesson, updateLessonStatus, uploadMascot, type LessonRes } from "../../../api/admin";


import CreateNewLesson from "./LessionComponent/CreateNewLession";
import LessonDetail from "./LessionComponent/LessonDetail";
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material";

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


// State cho Dialog Sửa
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState({
        unitName: "",
        lessonName: "",
        mascot: ""
    });

    // 1. STATE MỚI CẦN THÊM
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // Lưu file ảnh mới chọn
    const [previewUrl, setPreviewUrl] = useState<string>(""); // URL để hiển thị preview
    const [errors, setErrors] = useState({ unitName: "", lessonName: "" }); // Lưu lỗi validation
    const [isSubmitting, setIsSubmitting] = useState(false); // Loading khi đang lưu


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

    // 1. Khi bấm nút "Sửa" trên Card -> Đổ dữ liệu cũ vào Form
    const handleClickEdit = (item: any) => {
        setEditingLessonId(item.id);
        setEditFormData({
            unitName: item.unitNumber || "",
            lessonName: item.unitName || "", // Giả sử trong data trả về có field này
            mascot: item.urlMascot || ""       // Mapping urlMascot từ data sang field mascot của API
        });

        // Reset state phụ trợ
        setPreviewUrl(item.urlMascot || ""); // Ban đầu preview là ảnh cũ
        setSelectedFile(null);               // Chưa chọn file mới
        setErrors({ unitName: "", lessonName: "" }); // Xóa lỗi cũ
        setOpenEditDialog(true);
    };

    // 3. HÀM XỬ LÝ CHỌN FILE TỪ MÁY TÍNH
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            // Tạo URL tạm thời để xem trước ảnh ngay lập tức
            setPreviewUrl(URL.createObjectURL(file)); 
        }
    };

    // 4. HÀM VALIDATE DỮ LIỆU
    const validateForm = (name: string, value: string) => {
        let errorMsg = "";
        
        if (name === "lessonName") {
            if (!value.trim()) {
                errorMsg = "Tên bài học không được để trống.";
            } else if (/\d/.test(value)) { 
                // Regex: \d kiểm tra có số hay không
                errorMsg = "Tên bài học phải là chữ (không chứa số).";
            }
        }
        
        if (name === "unitName") {
            if (!value.trim()) errorMsg = "Tên Unit không được để trống.";
        }

        setErrors(prev => ({ ...prev, [name]: errorMsg }));
        return errorMsg === "";
    };



    // 2. Khi bấm "Lưu" trong Dialog
    // 5. CẬP NHẬT HÀM LƯU (handleConfirmUpdate)
    const handleConfirmUpdate = async () => {
        // A. Validate toàn bộ trước khi xử lý
        const isLessonNameValid = validateForm("lessonName", editFormData.lessonName);
        const isUnitNameValid = validateForm("unitName", editFormData.unitName);

        // Nếu có lỗi thì dừng lại, kiểm tra thông qua state errors hiện tại
        // (Hoặc check lại trực tiếp để chắc chắn)
        if (!editFormData.lessonName.trim() || /\d/.test(editFormData.lessonName) || !editFormData.unitName.trim()) {
             return; 
        }

        setIsSubmitting(true); // Bật loading

        try {
            let finalImageUrl = editFormData.mascot; // Mặc định dùng link ảnh cũ

            // B. Nếu có chọn file mới -> Upload lên Cloudinary trước
            if (selectedFile) {
                console.log("Đang upload ảnh...");
                finalImageUrl = await uploadMascot(selectedFile);
            }

            // C. Gọi API Update Lesson với link ảnh (mới hoặc cũ)
            if (editingLessonId) {
                const updatedData = await updateLesson(editingLessonId, {
                    unitName: editFormData.unitName,
                    lessonName: editFormData.lessonName,
                    mascot: finalImageUrl 
                });

                // D. Cập nhật UI
                setLessonData((prevData) =>
                    prevData.map((item) => {
                        if (item.id === editingLessonId) {
                            return {
                                ...item,
                                unitName: updatedData.unitName,
                                lessonName: updatedData.lessonName,
                                urlMascot: updatedData.mascot, // mascot trả về từ API update
                                updatedAt: new Date(),
                            };
                        }
                        return item;
                    })
                );
                
                setOpenEditDialog(false);
            }
        } catch (error) {
            console.error("Lỗi khi lưu:", error);
            // Alert lỗi nếu cần
        } finally {
            setIsSubmitting(false); // Tắt loading
        }
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
                                        handleClickEdit(item);
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
            {/* --- DIALOG SỬA BÀI HỌC --- */}
            <Box>
            {/* ... Các phần khác giữ nguyên ... */}

            <Dialog 
                open={openEditDialog} 
                onClose={() => !isSubmitting && setOpenEditDialog(false)} // Không cho đóng khi đang upload
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Cập nhật bài học</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
                        
                        {/* INPUT UNIT NAME */}
                        <TextField
                            label="Tên Unit (Unit Name)"
                            variant="outlined"
                            fullWidth
                            value={editFormData.unitName}
                            onChange={(e) => {
                                setEditFormData({ ...editFormData, unitName: e.target.value });
                                validateForm("unitName", e.target.value); // Check lỗi ngay khi gõ
                            }}
                            error={!!errors.unitName} // Hiển thị màu đỏ nếu có lỗi
                            helperText={errors.unitName} // Hiển thị dòng text lỗi
                        />

                        {/* INPUT LESSON NAME (Có check số) */}
                        <TextField
                            label="Tên Bài học (Lesson Name)"
                            variant="outlined"
                            fullWidth
                            value={editFormData.lessonName}
                            onChange={(e) => {
                                setEditFormData({ ...editFormData, lessonName: e.target.value });
                                validateForm("lessonName", e.target.value); // Check lỗi ngay khi gõ
                            }}
                            error={!!errors.lessonName}
                            helperText={errors.lessonName}
                        />

                        {/* INPUT HÌNH ẢNH (BUTTON UPLOAD) */}
                        <Box sx={{ border: "1px dashed #ccc", p: 2, borderRadius: 2, textAlign: "center" }}>
                            <Typography variant="body2" sx={{ mb: 1, color: "#666" }}>
                                Hình ảnh Mascot
                            </Typography>

                            {/* Preview Ảnh */}
                            {previewUrl ? (
                                <Box sx={{ mb: 2 }}>
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        style={{ height: 100, objectFit: 'contain', borderRadius: 4 }} 
                                    />
                                </Box>
                            ) : (
                                <Typography variant="caption" sx={{ display: "block", mb: 2, color: "#999" }}>
                                    (Chưa có ảnh)
                                </Typography>
                            )}

                            {/* Nút chọn ảnh ẩn input file */}
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="raised-button-file"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="raised-button-file">
                                <Button 
                                    variant="outlined" 
                                    component="span" 
                                    startIcon={<CloudUploadIcon />}
                                >
                                    {previewUrl ? "Đổi ảnh khác" : "Chọn hình ảnh"}
                                </Button>
                            </label>
                        </Box>

                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setOpenEditDialog(false)} 
                        color="secondary"
                        disabled={isSubmitting} // Disable khi đang lưu
                    >
                        Hủy
                    </Button>
                    <Button 
                        onClick={handleConfirmUpdate} 
                        variant="contained" 
                        color="primary"
                        disabled={isSubmitting || !!errors.unitName || !!errors.lessonName} // Disable nếu đang lưu hoặc có lỗi
                    >
                        {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
        </Box>
    );
}
