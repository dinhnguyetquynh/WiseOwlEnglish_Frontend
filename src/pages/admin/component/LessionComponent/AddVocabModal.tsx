import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    TextField,
    Button,
    Checkbox,
    Select,
    MenuItem,
    CircularProgress,
} from "@mui/material";
import { useState } from "react";
import { createVocab, uploadAudio, uploadVocabImage } from "../../../../api/admin";
import { enqueueSnackbar } from "notistack";
import { useHomeContext } from "../../../../context/AuthContext";

interface AddVocabModalProps {
    open: boolean;
    lessonId: number;
    onClose: () => void;

    onSuccess: () => void;   // thêm
}

export default function AddVocabModal({ open, lessonId, onClose, onSuccess }: AddVocabModalProps) {
    const [orderIndex, setOrderIndex] = useState("");
    const [isUsed, setIsUsed] = useState(true);
    const {
        orderIndexList
    } = useHomeContext();
    const [loading, setLoading] = useState(false);

    const availableOrders = Array.from({ length: 100 }, (_, i) => i + 1)
        .filter(num => !orderIndexList.includes(num));

    const [termEn, setTermEn] = useState("");
    const [termVi, setTermVi] = useState("");

    const [phonetic, setPhonetic] = useState("");
    const [partOfSpeech, setPartOfSpeech] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState("");

    const [audioNormal, setAudioNormal] = useState<File | null>(null);
    const [audioSlow, setAudioSlow] = useState<File | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {

        if (!orderIndex || !termEn.trim() || !termVi.trim()) {
            enqueueSnackbar("Vui lòng nhập đầy đủ thông tin", { variant: "warning" });
            return;
        }
        try {

            setLoading(true);
            let imgUrl = "";
            let audioNormalUrl = "";
            let audioSlowUrl = "";

            if (imageFile) {
                imgUrl = await uploadVocabImage(imageFile);
            }

            if (audioNormal) {
                audioNormalUrl = await uploadAudio(audioNormal);
            }

            if (audioSlow) {
                audioSlowUrl = await uploadAudio(audioSlow);
            }

            await createVocab({
                term_en: termEn,
                term_vn: termVi,
                phonetic,
                partOfSpeech,
                orderIndex: Number(orderIndex),
                lessonId,
                isForLearning: isUsed,
                urlImg: imgUrl,
                urlAudioNormal: audioNormalUrl,
                durationSecNormal: 2,
                urlAudioSlow: audioSlowUrl,
                durationSecSlow: 2,
            });

            enqueueSnackbar("Tạo từ vựng thành công!", { variant: "success" });
            onSuccess();
            onClose();
        } catch (e) {
            enqueueSnackbar("Lỗi tạo từ vựng!", { variant: "error" });
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    };




    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    height: "95vh",         // đặt chiều cao manual
                },
            }}
        >

            <DialogTitle sx={{ fontWeight: 700, fontSize: 22 }}>
                Tạo từ vựng mới
            </DialogTitle>

            <DialogContent>
                <Box
                    sx={{
                        display: "flex",
                        gap: 4,
                        mt: 2,
                    }}
                >
                    {/* LEFT COLUMN */}
                    <Box sx={{ flex: 1 }}>
                        {/* Order + checkbox */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box>
                                <Typography sx={{ mb: 1 }}>Dùng cho bài học</Typography>
                                <Checkbox
                                    checked={isUsed}
                                    onChange={(e) => setIsUsed(e.target.checked)}
                                />
                            </Box>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <Typography sx={{ mb: 1 }}>Thứ tự từ vựng trong bài học :</Typography>

                            <Select
                                fullWidth
                                value={orderIndex}
                                onChange={(e) => setOrderIndex(e.target.value)}
                                displayEmpty
                                sx={{ height: 40 }}
                            >
                                <MenuItem value="" disabled>
                                    Chọn thứ tự
                                </MenuItem>

                                {availableOrders.map(num => (
                                    <MenuItem key={num} value={num}>
                                        {num}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Box>

                        {/* Term EN + VI */}
                        <Box sx={{ mt: 2 }}>
                            <Typography sx={{ mb: 1 }}>Từ tiếng anh</Typography>
                            <TextField
                                fullWidth
                                value={termEn}
                                onChange={(e) => setTermEn(e.target.value)}
                            />
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <Typography sx={{ mb: 1 }}>Từ tiếng việt</Typography>
                            <TextField
                                fullWidth
                                value={termVi}
                                onChange={(e) => setTermVi(e.target.value)}
                            />
                        </Box>

                        {/* Phonetic + Part of speech */}
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                mt: 2,
                            }}
                        >
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ mb: 1 }}>Phiên âm</Typography>
                                <TextField
                                    fullWidth
                                    value={phonetic}
                                    onChange={(e) => setPhonetic(e.target.value)}
                                />
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ mb: 1 }}>Loại từ</Typography>
                                <TextField
                                    fullWidth
                                    value={partOfSpeech}
                                    onChange={(e) => setPartOfSpeech(e.target.value)}
                                />
                            </Box>
                        </Box>

                        {/* Upload image */}
                        <Box sx={{ mt: 2 }}>
                            <Typography sx={{ mb: 1 }}>Chọn ảnh minh hoạ</Typography>

                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{
                                    height: 50,
                                    fontWeight: 700,
                                }}
                            >
                                THÊM ẢNH +
                                <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                            </Button>
                        </Box>

                        {/* Preview */}
                        {previewImage && (
                            <Box sx={{ mt: 2 }}>
                                <Typography sx={{ mb: 1 }}>Xem trước ảnh minh hoạ</Typography>
                                <Box
                                    component="img"
                                    src={previewImage}
                                    sx={{
                                        width: "100%",
                                        height: 180,
                                        objectFit: "contain",
                                        borderRadius: 2,
                                        border: "1px solid #ccc",
                                    }}
                                />
                            </Box>
                        )}
                    </Box>

                    {/* RIGHT COLUMN - AUDIO */}
                    <Box sx={{ flex: 1 }}>
                        {/* NORMAL SPEED */}
                        <Box>
                            <Typography sx={{ mb: 1 }}>
                                Chọn phát âm tốc độ thường
                            </Typography>

                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{ height: 50, fontWeight: 700 }}
                            >
                                THÊM ÂM THANH +
                                <input
                                    type="file"
                                    accept="audio/*"
                                    hidden
                                    onChange={(e) => setAudioNormal(e.target.files?.[0] ?? null)}
                                />
                            </Button>

                            {/* Preview */}
                            {audioNormal && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography sx={{ mb: 1 }}>Nghe lại âm thanh:</Typography>
                                    <audio controls src={URL.createObjectURL(audioNormal)} style={{ width: "100%" }} />
                                </Box>
                            )}
                        </Box>

                        {/* SLOW SPEED */}
                        <Box sx={{ mt: 4 }}>
                            <Typography sx={{ mb: 1 }}>
                                Chọn phát âm tốc độ chậm
                            </Typography>

                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{ height: 50, fontWeight: 700 }}
                            >
                                THÊM ÂM THANH +
                                <input
                                    type="file"
                                    accept="audio/*"
                                    hidden
                                    onChange={(e) => setAudioSlow(e.target.files?.[0] ?? null)}
                                />
                            </Button>

                            {audioSlow && (
                                <Box sx={{ mt: 1 }}>
                                    <Typography sx={{ mb: 1 }}>Nghe lại âm thanh:</Typography>
                                    <audio controls src={URL.createObjectURL(audioSlow)} style={{ width: "100%" }} />
                                </Box>
                            )}
                        </Box>
                    </Box>
                </Box>
            </DialogContent>

            {/* FOOTER BUTTONS */}
            <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{ width: 120 }}
                >
                    Hủy
                </Button>

                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{ width: 160, bgcolor: "#4CAF50", fontWeight: 700 }}
                    disabled={loading}
                >
                    {loading ? (
                        <CircularProgress size={24} sx={{ color: "white" }} />
                    ) : (
                        "Tạo từ vựng"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
