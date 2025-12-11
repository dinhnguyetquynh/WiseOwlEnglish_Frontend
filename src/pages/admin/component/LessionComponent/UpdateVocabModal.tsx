import { useState, useEffect, useRef } from "react";
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Button, FormControlLabel, Checkbox, 
    Alert, Box, Typography, Stack, CircularProgress 
} from "@mui/material";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { 
    updateVocab, uploadVocabImage, uploadAudio, 
    type VocabUpdateReq, type VocabRes 
} from "../../../../api/admin";

interface UpdateVocabModalProps {
    open: boolean;
    onClose: () => void;
    vocabData: VocabRes | null; // Sử dụng VocabRes trực tiếp
    onSuccess: (message: string) => void;
}

export default function UpdateVocabModal({ open, onClose, vocabData, onSuccess }: UpdateVocabModalProps) {
    // State dữ liệu text
    const [formData, setFormData] = useState<VocabUpdateReq>({
        term_en: "",
        term_vi: "",
        phonetic: "",
        partOfSpeech: "",
        isForLearning: true,
        imgUrl: null,
        audioNormal: null,
        audioSlow: null
    });

    // State lưu file người dùng mới chọn (nếu có)
    const [newImageFile, setNewImageFile] = useState<File | null>(null);
    const [newAudioNormalFile, setNewAudioNormalFile] = useState<File | null>(null);
    const [newAudioSlowFile, setNewAudioSlowFile] = useState<File | null>(null);

    // State quản lý UI
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false); // Loading khi đang upload/update

    // Reset form khi mở modal
    useEffect(() => {
        if (vocabData && open) {
            setFormData({
                term_en: vocabData.term_en || "",
                term_vi: vocabData.term_vi || "",
                phonetic: vocabData.phonetic || "",
                partOfSpeech: vocabData.partOfSpeech || "",
                isForLearning: vocabData.isForLearning ?? true,
                imgUrl: vocabData.imgUrl || null,
                audioNormal: vocabData.audioNormal || null,
                audioSlow: vocabData.audioSlow || null,
            });
            // Reset file mới chọn
            setNewImageFile(null);
            setNewAudioNormalFile(null);
            setNewAudioSlowFile(null);
            setError(null);
        }
    }, [vocabData, open]);

    const validate = () => {
        const textOnlyRegex = /^[\p{L}][\p{L}\s]*$/u;
        const notStartWithNumberRegex = /^[^0-9].*$/;

        if (!formData.term_en.trim()) return "Từ tiếng Anh không được bỏ trống.";
        if (!textOnlyRegex.test(formData.term_en)) return "Từ tiếng Anh phải là chữ và không được bỏ trống.";

        if (!formData.term_vi.trim()) return "Từ tiếng Việt không được bỏ trống.";
        if (!textOnlyRegex.test(formData.term_vi)) return "Từ tiếng Việt phải bắt đầu bằng chữ cái.";

        if (!formData.phonetic.trim()) return "Phiên âm không được bỏ trống.";
        if (!notStartWithNumberRegex.test(formData.phonetic)) return "Phiên âm không được bắt đầu bằng số.";

        if (!formData.partOfSpeech.trim()) return "Loại từ không được bỏ trống.";
        if (!notStartWithNumberRegex.test(formData.partOfSpeech)) return "Loại từ không được bắt đầu bằng số.";

        return null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File | null) => void) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        if (!vocabData) return;

        setLoading(true);
        setError(null);

        try {
            // 1. Upload file nếu có file mới được chọn
            let finalImgUrl = formData.imgUrl;
            let finalAudioNormal = formData.audioNormal;
            let finalAudioSlow = formData.audioSlow;

            // Upload Image
            if (newImageFile) {
                finalImgUrl = await uploadVocabImage(newImageFile);
            }
            // Upload Audio Normal
            if (newAudioNormalFile) {
                finalAudioNormal = await uploadAudio(newAudioNormalFile);
            }
            // Upload Audio Slow
            if (newAudioSlowFile) {
                finalAudioSlow = await uploadAudio(newAudioSlowFile);
            }

            // 2. Chuẩn bị payload cuối cùng
            const payload: VocabUpdateReq = {
                ...formData,
                imgUrl: finalImgUrl,
                audioNormal: finalAudioNormal,
                audioSlow: finalAudioSlow
            };

            // 3. Gọi API Update
            await updateVocab(vocabData.id, payload);
            
            onSuccess("Cập nhật từ vựng thành công!");
            onClose();

        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.message || err.message || "Có lỗi xảy ra khi cập nhật.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Cập nhật Từ vựng</DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
                    {/* --- PHẦN TEXT INFO --- */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextField
                            label="Từ tiếng Anh"
                            fullWidth
                            value={formData.term_en}
                            onChange={(e) => setFormData({ ...formData, term_en: e.target.value })}
                        />
                        <TextField
                            label="Từ tiếng Việt"
                            fullWidth
                            value={formData.term_vi}
                            onChange={(e) => setFormData({ ...formData, term_vi: e.target.value })}
                        />
                        <TextField
                            label="Phiên âm"
                            fullWidth
                            value={formData.phonetic}
                            onChange={(e) => setFormData({ ...formData, phonetic: e.target.value })}
                        />
                        <TextField
                            label="Loại từ"
                            fullWidth
                            value={formData.partOfSpeech}
                            onChange={(e) => setFormData({ ...formData, partOfSpeech: e.target.value })}
                        />
                    </Box>

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={formData.isForLearning}
                                onChange={(e) => setFormData({ ...formData, isForLearning: e.target.checked })}
                            />
                        }
                        label="Dùng cho việc học (Is For Learning)"
                    />

                    {/* --- PHẦN MEDIA UPLOAD --- */}
                    <Box sx={{ borderTop: '1px solid #eee', pt: 2 }}>
                        <Typography variant="subtitle1" fontWeight="bold" mb={2}>Media Assets</Typography>
                        
                        <Stack spacing={2}>
                            {/* 1. IMAGE UPLOAD */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, border: '1px dashed #ccc', p: 2, borderRadius: 1 }}>
                                <Box sx={{ width: 80, height: 80, bgcolor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 1 }}>
                                    {newImageFile ? (
                                        <img src={URL.createObjectURL(newImageFile)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : formData.imgUrl ? (
                                        <img src={formData.imgUrl} alt="Current" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <Typography variant="caption" color="text.secondary">No Img</Typography>
                                    )}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight="bold">Hình ảnh minh hoạ</Typography>
                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                                        {newImageFile ? newImageFile.name : (formData.imgUrl ? "Đang dùng ảnh hiện tại" : "Chưa có ảnh")}
                                    </Typography>
                                    <Button variant="outlined" size="small" component="label" startIcon={<CloudUploadIcon />}>
                                        Chọn ảnh
                                        <input hidden accept="image/*" type="file" onChange={(e) => handleFileChange(e, setNewImageFile)} />
                                    </Button>
                                </Box>
                            </Box>

                            {/* 2. AUDIO NORMAL UPLOAD */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, border: '1px dashed #ccc', p: 2, borderRadius: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight="bold">Audio Tốc độ thường</Typography>
                                    {/* Audio Player Preview */}
                                    {(newAudioNormalFile || formData.audioNormal) && (
                                        <audio 
                                            controls 
                                            src={newAudioNormalFile ? URL.createObjectURL(newAudioNormalFile) : formData.audioNormal || ""} 
                                            style={{ height: 30, marginTop: 4, marginBottom: 4, width: '100%' }} 
                                        />
                                    )}
                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                                        {newAudioNormalFile ? newAudioNormalFile.name : (formData.audioNormal ? "Đang dùng file hiện tại" : "Chưa có file")}
                                    </Typography>
                                    
                                    <Button variant="outlined" size="small" component="label" startIcon={<CloudUploadIcon />}>
                                        Chọn Audio Thường
                                        <input hidden accept="audio/*" type="file" onChange={(e) => handleFileChange(e, setNewAudioNormalFile)} />
                                    </Button>
                                </Box>
                            </Box>

                            {/* 3. AUDIO SLOW UPLOAD */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, border: '1px dashed #ccc', p: 2, borderRadius: 1 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight="bold">Audio Tốc độ chậm</Typography>
                                    {/* Audio Player Preview */}
                                    {(newAudioSlowFile || formData.audioSlow) && (
                                        <audio 
                                            controls 
                                            src={newAudioSlowFile ? URL.createObjectURL(newAudioSlowFile) : formData.audioSlow || ""} 
                                            style={{ height: 30, marginTop: 4, marginBottom: 4, width: '100%' }} 
                                        />
                                    )}
                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                                        {newAudioSlowFile ? newAudioSlowFile.name : (formData.audioSlow ? "Đang dùng file hiện tại" : "Chưa có file")}
                                    </Typography>

                                    <Button variant="outlined" size="small" component="label" startIcon={<CloudUploadIcon />}>
                                        Chọn Audio Chậm
                                        <input hidden accept="audio/*" type="file" onChange={(e) => handleFileChange(e, setNewAudioSlowFile)} />
                                    </Button>
                                </Box>
                            </Box>
                        </Stack>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit" disabled={loading}>Hủy</Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained" 
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} color="inherit"/> : null}
                >
                    {loading ? "Đang xử lý..." : "Lưu thay đổi"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}