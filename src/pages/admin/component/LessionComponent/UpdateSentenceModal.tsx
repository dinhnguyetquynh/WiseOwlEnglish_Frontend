import { useEffect, useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, Typography, CircularProgress, IconButton
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloseIcon from "@mui/icons-material/Close";
import { updateSentence, uploadAudio, uploadVocabImage, type SentenceFullRes, type SentenceUpdateReq } from "../../../../api/admin";
// Đường dẫn trỏ tới file admin.ts của bạn

interface Props {
    open: boolean;
    onClose: () => void;
    data: SentenceFullRes | null; // Dữ liệu câu cần sửa
    onSuccess: (msg: string) => void;
    onError: (msg: string) => void;
}

export default function UpdateSentenceModal({ open, onClose, data, onSuccess ,onError}: Props) {
    const [loading, setLoading] = useState(false);

    // State lưu trữ dữ liệu text và url hiện tại
    const [formData, setFormData] = useState<SentenceUpdateReq>({
        sen_en: "",
        sen_vi: "",
        imgUrl: "",
        audioNormal: "",
        audioSlow: ""
    });

    // State lưu file mới nếu người dùng chọn upload lại
    const [files, setFiles] = useState<{
        img: File | null;
        audioNormal: File | null;
        audioSlow: File | null;
    }>({ img: null, audioNormal: null, audioSlow: null });

    // Load dữ liệu cũ khi mở Modal
    useEffect(() => {
        if (data && open) {
            setFormData({
                sen_en: data.sen_en || "",
                sen_vi: data.sen_vi || "", // Nếu backend chưa trả về thì để rỗng
                imgUrl: data.imgUrl || "",
                audioNormal: data.audioNormal || "",
                audioSlow: data.audioSlow || ""
            });
            // Reset file upload
            setFiles({ img: null, audioNormal: null, audioSlow: null });
        }
    }, [data, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "img" | "audioNormal" | "audioSlow") => {
        if (e.target.files && e.target.files[0]) {
            setFiles({ ...files, [type]: e.target.files[0] });
        }
    };

    const handleSubmit = async () => {
        if (!data) return;
        setLoading(true);

        try {
            // 1. Xử lý Upload file (chỉ upload nếu có file mới được chọn)
            let finalImgUrl = formData.imgUrl;
            let finalAudioNormal = formData.audioNormal;
            let finalAudioSlow = formData.audioSlow;

            // Upload ảnh (dùng hàm uploadVocabImage có sẵn)
            if (files.img) {
                finalImgUrl = await uploadVocabImage(files.img);
            }
            // Upload Audio Normal
            if (files.audioNormal) {
                finalAudioNormal = await uploadAudio(files.audioNormal);
            }
            // Upload Audio Slow
            if (files.audioSlow) {
                finalAudioSlow = await uploadAudio(files.audioSlow);
            }

            // 2. Gọi API Update
            const payload: SentenceUpdateReq = {
                sen_en: formData.sen_en,
                sen_vi: formData.sen_vi,
                imgUrl: finalImgUrl,
                audioNormal: finalAudioNormal,
                audioSlow: finalAudioSlow
            };

            await updateSentence(data.id, payload);

            onSuccess("Cập nhật câu thành công!");
            onClose();
        } catch (error: any) {
            console.error("Update Error:", error);
            
            // 1. Lấy message từ backend trả về (thường nằm trong error.response.data.message)
            const backendMessage = error.response?.data?.message;
            
            // 2. Nếu có message từ BE thì dùng, nếu không thì dùng câu mặc định
            const displayMessage = backendMessage || "Có lỗi xảy ra khi cập nhật (Vui lòng thử lại)";
            
            // 3. Gọi hàm onError để Parent hiển thị Toast đỏ
            onError(displayMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Cập nhật câu mẫu
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>
            
            <DialogContent dividers>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    {/* Hàng 1: Text inputs */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                            label="Câu tiếng Anh (EN)"
                            name="sen_en"
                            value={formData.sen_en}
                            onChange={handleChange}
                            fullWidth
                            multiline
                        />
                        <TextField
                            label="Câu tiếng Việt (VI)"
                            name="sen_vi"
                            value={formData.sen_vi}
                            onChange={handleChange}
                            fullWidth
                            multiline
                        />
                    </Box>

                    {/* Hàng 2: Hình ảnh */}
                    <Box sx={{ border: "1px dashed #ccc", p: 2, borderRadius: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Hình ảnh minh hoạ</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            {(files.img || formData.imgUrl) && (
                                <Box
                                    component="img"
                                    src={files.img ? URL.createObjectURL(files.img) : formData.imgUrl!}
                                    sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1, border: "1px solid #eee" }}
                                />
                            )}
                            <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
                                Chọn ảnh mới
                                <input type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, "img")} />
                            </Button>
                        </Box>
                    </Box>

                    {/* Hàng 3: Audio */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* Audio Normal */}
                        <Box sx={{ flex: 1, border: "1px dashed #ccc", p: 2, borderRadius: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Audio (Tốc độ thường)</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {formData.audioNormal && !files.audioNormal && (
                                    <audio controls src={formData.audioNormal} style={{ height: 30, width: "100%" }} />
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Button component="label" size="small" variant="contained" startIcon={<CloudUploadIcon />}>
                                        Upload
                                        <input type="file" hidden accept="audio/*" onChange={(e) => handleFileChange(e, "audioNormal")} />
                                    </Button>
                                    <Typography variant="caption" noWrap sx={{ maxWidth: 150 }}>
                                        {files.audioNormal ? files.audioNormal.name : "Giữ file cũ"}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Audio Slow */}
                        <Box sx={{ flex: 1, border: "1px dashed #ccc", p: 2, borderRadius: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>Audio (Tốc độ chậm)</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {formData.audioSlow && !files.audioSlow && (
                                    <audio controls src={formData.audioSlow} style={{ height: 30, width: "100%" }} />
                                )}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Button component="label" size="small" variant="contained" color="secondary" startIcon={<CloudUploadIcon />}>
                                        Upload
                                        <input type="file" hidden accept="audio/*" onChange={(e) => handleFileChange(e, "audioSlow")} />
                                    </Button>
                                    <Typography variant="caption" noWrap sx={{ maxWidth: 150 }}>
                                        {files.audioSlow ? files.audioSlow.name : "Giữ file cũ"}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
            
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit" disabled={loading}>Hủy bỏ</Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Lưu thay đổi"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}