import { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Select,
    MenuItem,
    CircularProgress,
    FormHelperText,
} from "@mui/material";
import { KeyboardArrowDown as ArrowDownIcon } from "@mui/icons-material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createLesson, uploadMascot } from "../../../../api/admin";
import { useSnackbar } from "notistack";

interface CreateNewLessonProps {
    onSuccess: () => void;
    lessonIds: number[];   // thêm hàng này
}

export default function CreateNewLesson({ onSuccess, lessonIds }: CreateNewLessonProps) {
    console.log("lessonIds", lessonIds)
    const { enqueueSnackbar } = useSnackbar();
    const availableOrders = Array.from({ length: 20 }, (_, i) => i + 1)
        .filter(num => !lessonIds.includes(num));

    const [unitNumber, setUnitNumber] = useState("");
    const [unitName, setUnitName] = useState("");
    const [orderIndex, setOrderIndex] = useState<number>(1);
    const [mascotFile, setMascotFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [loading, setLoading] = useState(false);

    // 1. State lưu lỗi
    const [errors, setErrors] = useState<{
        unitNumber?: string;
        unitName?: string;
        mascot?: string;
    }>({});
  
    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setMascotFile(file);
        setPreviewUrl(URL.createObjectURL(file));

        if (errors.mascot) setErrors({ ...errors, mascot: undefined });
    };
    // 2. Hàm kiểm tra dữ liệu
    const validateForm = () => {
        const newErrors: { unitNumber?: string; unitName?: string; mascot?: string } = {};
        let isValid = true;

        // Regex kiểm tra ký tự đầu tiên là số
        const startsWithNumberRegex = /^\d/;

        // --- Validate Unit Number ---
        if (!unitNumber.trim()) {
            newErrors.unitNumber = "Tên Unit không được để trống";
            isValid = false;
        } else if (startsWithNumberRegex.test(unitNumber.trim())) {
            newErrors.unitNumber = "Tên Unit không được bắt đầu bằng số";
            isValid = false;
        }

        // --- Validate Unit Name ---
        if (!unitName.trim()) {
            newErrors.unitName = "Tên bài học không được để trống";
            isValid = false;
        } else if (startsWithNumberRegex.test(unitName.trim())) {
            newErrors.unitName = "Tên bài học không được bắt đầu bằng số";
            isValid = false;
        }

        // --- Validate Ảnh ---
        if (!mascotFile) {
            newErrors.mascot = "Vui lòng chọn ảnh minh hoạ";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };



    // Submit có upload ảnh + gửi dữ liệu về parent
    const handleSubmit = async () => {
        // 3. Gọi hàm validate trước khi xử lý
        if (!validateForm()) {
            enqueueSnackbar("Vui lòng kiểm tra lại thông tin nhập!", { variant: "warning" });
            return;
        }
        try {
            setLoading(true);

            let mascotUrl: string | null = null;
            if (mascotFile) {
                mascotUrl = await uploadMascot(mascotFile);
            }

            await createLesson({
                unitNumber,
                unitName,
                orderIndex,
                active: true,
                gradeLevelId: 1,
                urlMascot: mascotUrl,
            });

            enqueueSnackbar("Tạo bài học thành công!", { variant: "success" });

            setTimeout(() => {
                onSuccess();
            }, 300);

        } catch (err) {
            enqueueSnackbar("Lỗi tạo bài học!", { variant: "error" });
            console.error(err);

        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: "white",
                boxShadow: "0 0 0 1px #ddd",
            }}
        >
            <Button
                onClick={onSuccess}
                sx={{
                    mb: 2,
                    minWidth: 0,
                    p: 1,
                    borderRadius: "50%",
                    color: "black",
                }}
            >
                <ArrowBackIcon />
            </Button>


            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                TẠO BÀI HỌC MỚI
            </Typography>

            {/* Layout 2 cột */}
            <Grid container columnGap={3} rowGap={3}>
                <Box sx={{ width: "48%" }}>
                    <Typography sx={{ mb: 1 }}>Tên Unit<span style={{ color: 'red' }}>*</span></Typography>
                    <TextField
                        fullWidth
                        value={unitNumber}
                        onChange={(e) => {
                                setUnitNumber(e.target.value)
                                // Xóa lỗi khi người dùng nhập lại
                            if (errors.unitNumber) setErrors({ ...errors, unitNumber: undefined });
                        }
                        }
                        // Hiển thị lỗi
                        error={!!errors.unitNumber}
                        helperText={errors.unitNumber}
                        
                    />
                </Box>

                <Box sx={{ width: "48%" }}>
                    <Typography sx={{ mb: 1 }}>Tên bài học<span style={{ color: 'red' }}>*</span></Typography>
                    <TextField
                        fullWidth
                        value={unitName}
                        onChange={(e) => {
                            setUnitName(e.target.value);
                            // Xóa lỗi khi người dùng nhập lại
                            if (errors.unitName) setErrors({ ...errors, unitName: undefined });
                        }}
                        // Hiển thị lỗi
                        error={!!errors.unitName}
                        helperText={errors.unitName}
                    />
                </Box>

                {/* <Box sx={{ width: "48%" }}>
                    <Typography sx={{ mb: 1 }}>Thứ tự bài học</Typography>
                    <Select
                        value={orderIndex}
                        onChange={(e) => setOrderIndex(Number(e.target.value))}
                        fullWidth
                        IconComponent={ArrowDownIcon}
                    >
                        {availableOrders.map((num) => (
                            <MenuItem key={num} value={num}>
                                {num}
                            </MenuItem>
                        ))}

                    </Select>

                </Box> */}

                <Box sx={{ width: "48%" }}>
                    <Typography sx={{ mb: 1 }}>Chọn ảnh minh hoạ<span style={{ color: 'red' }}>*</span></Typography>

                    <Button
                        variant="outlined"
                        component="label"
                        fullWidth
                        // Đổi màu viền sang đỏ nếu có lỗi
                        color={errors.mascot ? "error" : "primary"}
                        sx={{
                            height: 54,
                            fontWeight: 700,
                            border: errors.mascot ? "1px solid #d32f2f" : undefined
                        }}
                    >
                        THÊM ẢNH +
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleUpload}
                        />
                    </Button>
                    {/* Hiển thị dòng thông báo lỗi cho ảnh */}
                    {errors.mascot && (
                        <FormHelperText error sx={{ mt: 1 }}>
                            {errors.mascot}
                        </FormHelperText>
                    )}
                </Box>
            </Grid>

            {/* Preview ảnh */}
            <Box sx={{ textAlign: "center", mt: 4 }}>
                <Typography sx={{ mb: 2 }}>Xem trước ảnh minh hoạ</Typography>

                <Box
                    sx={{
                        width: 350,
                        height: 200,
                        borderRadius: 2,
                        border: "1px solid #ccc",
                        mx: "auto",
                        overflow: "hidden",
                        bgcolor: "#fafafa",
                    }}
                >
                    {previewUrl ? (
                        <Box
                            component="img"
                            src={previewUrl}
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                            }}
                        />
                    ) : (
                        <Typography sx={{ mt: 8, color: "gray" }}>
                            Chưa có ảnh
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Buttons */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    mt: 4,
                    gap: 2,
                }}
            >
                <Button variant="outlined" sx={{ width: 120 }} onClick={onSuccess}>
                    Hủy
                </Button>

                <Button
                    variant="contained"
                    sx={{ width: 140, bgcolor: "#4CAF50", fontWeight: 600 }}
                    onClick={handleSubmit}
                >
                    {loading ? (
                        <CircularProgress size={22} sx={{ color: "white" }} />
                    ) : (
                        "Tạo bài học"
                    )}

                </Button>
            </Box>
        </Box>
    );
}
