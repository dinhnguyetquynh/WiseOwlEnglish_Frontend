// import {
//     Dialog,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     Box,
//     Typography,
//     TextField,
//     Button,
//     Checkbox,
//     CircularProgress,
// } from "@mui/material";
// import { enqueueSnackbar } from "notistack";
// import { useEffect, useState } from "react";
// import { uploadAudio, uploadVocabImage, createVocab, createSentences } from "../../../../api/admin";

// interface AddContentModalProps {
//     open: boolean;
//     onClose: () => void;
//     lessonId: number;
//     onSuccess: () => void;
//     mode: "vocab" | "sentence";
// }

// export default function AddContentModal({
//     open,
//     onClose,
//     lessonId,
//     onSuccess,
//     mode,
// }: AddContentModalProps) {
//     const isVocab = mode === "vocab";


//     const [loading, setLoading] = useState(false);

//     const [isUsed, setIsUsed] = useState(true);




//     useEffect(() => {
//         // Reset tất cả field khi đổi mode
//         setTermEn("");
//         setTermVi("");
//         setPhonetic("");
//         setPartOfSpeech("");

//         setIsUsed(true);

//         setImageFile(null);
//         setPreviewImage("");

//         setAudioNormal(null);
//         setAudioSlow(null);

//     }, [mode, open]);



//     const [termEn, setTermEn] = useState("");
//     const [termVi, setTermVi] = useState("");

//     const [phonetic, setPhonetic] = useState("");
//     const [partOfSpeech, setPartOfSpeech] = useState("");

//     const [imageFile, setImageFile] = useState<File | null>(null);
//     const [previewImage, setPreviewImage] = useState("");

//     const [audioNormal, setAudioNormal] = useState<File | null>(null);
//     const [audioSlow, setAudioSlow] = useState<File | null>(null);

//     const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const file = e.target.files?.[0];
//         if (file) {
//             setImageFile(file);
//             setPreviewImage(URL.createObjectURL(file));
//         }
//     };

//     const handleSubmit = async () => {
//         if (!termEn.trim() || !termVi.trim()) {
//             enqueueSnackbar("Vui lòng nhập đầy đủ thông tin", { variant: "warning" });
//             return;
//         }

//         try {
//             setLoading(true);

//             let imgUrl = "";
//             let audioNormalUrl = "";
//             let audioSlowUrl = "";

//             if (imageFile) imgUrl = await uploadVocabImage(imageFile);
//             if (audioNormal) audioNormalUrl = await uploadAudio(audioNormal);
//             if (audioSlow) audioSlowUrl = await uploadAudio(audioSlow);

//             if (isVocab) {
//                 await createVocab({
//                     term_en: termEn,
//                     term_vn: termVi,
//                     phonetic,
//                     partOfSpeech,
//                     lessonId,
//                     isForLearning: isUsed,
//                     urlImg: imgUrl,
//                     urlAudioNormal: audioNormalUrl,
//                     durationSecNormal: 2,
//                     urlAudioSlow: audioSlowUrl,
//                     durationSecSlow: 2,
//                 });
//             } else {
//                 await createSentences({
//                     sen_en: termEn,
//                     sen_vn: termVi,
//                     lessonId,
//                     isForLearning: isUsed,
//                     urlImg: imgUrl,
//                     urlAudioNormal: audioNormalUrl,
//                     durationSecNormal: 2,
//                     urlAudioSlow: audioSlowUrl,
//                     durationSecSlow: 2,
//                 });
//             }

//             enqueueSnackbar(isVocab ? "Tạo từ vựng thành công!" : "Tạo câu thành công!", {
//                 variant: "success",
//             });

//             onSuccess();
//             onClose();
//         } catch (e) {
//             console.error(e);
//             enqueueSnackbar("Lỗi tạo dữ liệu!", { variant: "error" });
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
//             PaperProps={{ sx: { height: "95vh" } }}
//         >
//             <DialogTitle sx={{ fontWeight: 700, fontSize: 22 }}>
//                 {isVocab ? "Tạo từ vựng mới" : "Tạo câu mới"}
//             </DialogTitle>

//             <DialogContent>
//                 <Box
//                     sx={{
//                         display: "flex",
//                         flexDirection: "column",
//                         gap: 2, // optional: khoảng cách giữa các dòng
//                     }}
//                 >
//                     <Box>

//                         <Box
//                             sx={{
//                                 display: "flex",
//                                 flexDirection: "row",
//                                 gap: 2,
//                                 mt: 2,
//                             }}
//                         >
//                             <Box sx={{ flex: 1 }}>
//                                 <Typography sx={{ mb: 1 }}>
//                                     {isVocab ? "Từ tiếng Anh" : "Câu tiếng Anh"}
//                                 </Typography>
//                                 <TextField
//                                     fullWidth
//                                     value={termEn}
//                                     onChange={(e) => setTermEn(e.target.value)}
//                                 />
//                             </Box>

//                             <Box sx={{ flex: 1 }}>
//                                 <Typography sx={{ mb: 1 }}>
//                                     {isVocab ? "Từ tiếng Việt" : "Câu tiếng Việt"}
//                                 </Typography>
//                                 <TextField
//                                     fullWidth
//                                     value={termVi}
//                                     onChange={(e) => setTermVi(e.target.value)}
//                                 />
//                             </Box>
//                         </Box>
//                         {/* Chỉ từ vựng mới có phiên âm + loại từ */}
//                         {isVocab && (
//                             <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
//                                 <Box sx={{ flex: 1 }}>
//                                     <Typography sx={{ mb: 1 }}>Phiên âm</Typography>
//                                     <TextField fullWidth value={phonetic} onChange={(e) => setPhonetic(e.target.value)} />
//                                 </Box>

//                                 <Box sx={{ flex: 1 }}>
//                                     <Typography sx={{ mb: 1 }}>Loại từ</Typography>
//                                     <TextField fullWidth value={partOfSpeech} onChange={(e) => setPartOfSpeech(e.target.value)} />
//                                 </Box>
//                             </Box>
//                         )}


//                         <Box
//                             sx={{
//                                 display: "flex",
//                                 alignItems: "center",
//                                 justifyContent: "center",
//                                 gap: 2,
//                             }}
//                         >
//                             <Box
//                                 sx={{
//                                     display: "flex",
//                                     alignItems: "center",
//                                     gap: 1,
//                                     mt: 1,
//                                 }}
//                             >
//                                 <Checkbox
//                                     checked={isUsed}
//                                     onChange={(e) => setIsUsed(e.target.checked)}
//                                 />
//                                 <Typography sx={{ mb: 0 }}>Dùng cho bài học</Typography>

//                             </Box>
//                         </Box>




//                     </Box>


//                     <Box sx={{ display: "flex", gap: 4, mt: 2 }}>

//                         {/* LEFT */}
//                         <Box sx={{ flex: 1 }}>


//                             <Box sx={{ mt: 2 }}>
//                                 <Typography sx={{ mb: 1 }}>Ảnh minh hoạ</Typography>
//                                 <Button variant="outlined" component="label" fullWidth sx={{ height: 50, fontWeight: 700 }}>
//                                     THÊM ẢNH +
//                                     <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
//                                 </Button>
//                             </Box>

//                             {previewImage && (
//                                 <Box sx={{ mt: 2 }}>
//                                     <Typography sx={{ mb: 1 }}>Xem trước</Typography>
//                                     <Box
//                                         component="img"
//                                         src={previewImage}
//                                         sx={{
//                                             width: "100%",
//                                             height: 180,
//                                             objectFit: "contain",
//                                             border: "1px solid #ccc",
//                                             borderRadius: 2,
//                                         }}
//                                     />
//                                 </Box>
//                             )}
//                         </Box>

//                         {/* RIGHT – AUDIO */}
//                         <Box sx={{ flex: 1 }}>
//                             <Box>
//                                 <Typography sx={{ mb: 1 }}>Âm thanh tốc độ thường</Typography>
//                                 <Button variant="outlined" component="label" fullWidth sx={{ height: 50, fontWeight: 700 }}>
//                                     THÊM ÂM THANH +
//                                     <input type="file" hidden accept="audio/*"
//                                         onChange={(e) => setAudioNormal(e.target.files?.[0] ?? null)} />
//                                 </Button>

//                                 {audioNormal && (
//                                     <Box sx={{ mt: 1 }}>
//                                         <Typography sx={{ mb: 1 }}>Preview:</Typography>
//                                         <audio controls src={URL.createObjectURL(audioNormal)} style={{ width: "100%" }} />
//                                     </Box>
//                                 )}
//                             </Box>

//                             <Box sx={{ mt: 4 }}>
//                                 <Typography sx={{ mb: 1 }}>Âm thanh tốc độ chậm</Typography>
//                                 <Button variant="outlined" component="label" fullWidth sx={{ height: 50, fontWeight: 700 }}>
//                                     THÊM ÂM THANH +
//                                     <input type="file" hidden accept="audio/*"
//                                         onChange={(e) => setAudioSlow(e.target.files?.[0] ?? null)} />
//                                 </Button>

//                                 {audioSlow && (
//                                     <Box sx={{ mt: 1 }}>
//                                         <Typography sx={{ mb: 1 }}>Preview:</Typography>
//                                         <audio controls src={URL.createObjectURL(audioSlow)} style={{ width: "100%" }} />
//                                     </Box>
//                                 )}
//                             </Box>
//                         </Box>

//                     </Box>
//                 </Box>

//             </DialogContent >

//             <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
//                 <Button onClick={onClose} variant="outlined" sx={{ width: 120 }}>
//                     Hủy
//                 </Button>

//                 <Button
//                     onClick={handleSubmit}
//                     variant="contained"
//                     sx={{ width: 160, bgcolor: "#4CAF50", fontWeight: 700 }}
//                     disabled={loading}
//                 >
//                     {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> :
//                         isVocab ? "Tạo từ vựng" : "Tạo câu"}
//                 </Button>
//             </DialogActions>
//         </Dialog >
//     );
// }

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
    CircularProgress,
    FormHelperText, // Thêm component này
} from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { uploadAudio, uploadVocabImage, createVocab, createSentences } from "../../../../api/admin";

interface AddContentModalProps {
    open: boolean;
    onClose: () => void;
    lessonId: number;
    onSuccess: () => void;
    mode: "vocab" | "sentence";
}

export default function AddContentModal({
    open,
    onClose,
    lessonId,
    onSuccess,
    mode,
}: AddContentModalProps) {
    const isVocab = mode === "vocab";

    const [loading, setLoading] = useState(false);
    const [isUsed, setIsUsed] = useState(true);

    // --- STATE DỮ LIỆU ---
    const [termEn, setTermEn] = useState("");
    const [termVi, setTermVi] = useState("");
    const [phonetic, setPhonetic] = useState("");
    const [partOfSpeech, setPartOfSpeech] = useState("");

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState("");

    const [audioNormal, setAudioNormal] = useState<File | null>(null);
    const [audioSlow, setAudioSlow] = useState<File | null>(null);

    // --- STATE LỖI ---
    const [errors, setErrors] = useState<{
        termEn?: string;
        termVi?: string;
        phonetic?: string;
        partOfSpeech?: string;
        image?: string;
        audioNormal?: string;
        audioSlow?: string;
    }>({});

    useEffect(() => {
        // Reset tất cả field và lỗi khi đổi mode hoặc mở lại modal
        setTermEn("");
        setTermVi("");
        setPhonetic("");
        setPartOfSpeech("");
        setIsUsed(true);
        setImageFile(null);
        setPreviewImage("");
        setAudioNormal(null);
        setAudioSlow(null);
        setErrors({}); // Reset lỗi
    }, [mode, open]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
            // Xóa lỗi khi chọn file
            if (errors.image) setErrors({ ...errors, image: undefined });
        }
    };

    const handleAudioNormalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioNormal(file);
            if (errors.audioNormal) setErrors({ ...errors, audioNormal: undefined });
        }
    };

    const handleAudioSlowUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAudioSlow(file);
            if (errors.audioSlow) setErrors({ ...errors, audioSlow: undefined });
        }
    };

    // --- HÀM VALIDATE ---
    const validateForm = () => {
        const newErrors: typeof errors = {};
        let isValid = true;

        // Regex: Bắt đầu bằng số
        const startsWithNumber = /^\d/;
        // Regex: Chỉ cho phép chữ cái (bao gồm tiếng Việt), số và khoảng trắng. 
        // Nếu chứa ký tự đặc biệt (như @, #, $, %, dấu chấm câu...) sẽ trả về false.
        const validTextRegex = /^[a-zA-ZÀ-ỹ0-9\s]+$/;

        // Helper function validate text field
        const validateText = (value: string, fieldName: keyof typeof errors, label: string) => {
            if (!value.trim()) {
                newErrors[fieldName] = `${label} không được để trống`;
                isValid = false;
            } else if (startsWithNumber.test(value.trim())) {
                newErrors[fieldName] = `${label} không được bắt đầu bằng số`;
                isValid = false;
            } else if (!validTextRegex.test(value.trim())) {
                newErrors[fieldName] = `${label} không được chứa kí tự đặc biệt`;
                isValid = false;
            }
        };

        // 1. Validate Text Fields
        validateText(termEn, "termEn", isVocab ? "Từ tiếng Anh" : "Câu tiếng Anh");
        validateText(termVi, "termVi", isVocab ? "Từ tiếng Việt" : "Câu tiếng Việt");

        if (isVocab) {
            // Với phiên âm, thường có ký tự đặc biệt (/ : '). Nếu bạn muốn chặn tuyệt đối thì dùng hàm trên.
            // Nếu muốn cho phép ký tự IPA, hãy bỏ check validTextRegex cho phonetic.
            // Ở đây mình làm theo yêu cầu chặt chẽ của bạn:
            validateText(phonetic, "phonetic", "Phiên âm");
            validateText(partOfSpeech, "partOfSpeech", "Loại từ");
        }

        // 2. Validate Files
        if (!imageFile) {
            newErrors.image = "Vui lòng chọn ảnh minh hoạ";
            isValid = false;
        }
        if (!audioNormal) {
            newErrors.audioNormal = "Vui lòng chọn âm thanh tốc độ thường";
            isValid = false;
        }
        if (!audioSlow) {
            newErrors.audioSlow = "Vui lòng chọn âm thanh tốc độ chậm";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async () => {
        // Gọi hàm validate trước khi xử lý
        if (!validateForm()) {
            enqueueSnackbar("Vui lòng kiểm tra lại thông tin nhập!", { variant: "warning" });
            return;
        }

        try {
            setLoading(true);

            let imgUrl = "";
            let audioNormalUrl = "";
            let audioSlowUrl = "";

            if (imageFile) imgUrl = await uploadVocabImage(imageFile);
            if (audioNormal) audioNormalUrl = await uploadAudio(audioNormal);
            if (audioSlow) audioSlowUrl = await uploadAudio(audioSlow);

            if (isVocab) {
                await createVocab({
                    term_en: termEn,
                    term_vn: termVi,
                    phonetic,
                    partOfSpeech,
                    lessonId,
                    isForLearning: isUsed,
                    urlImg: imgUrl,
                    urlAudioNormal: audioNormalUrl,
                    durationSecNormal: 2,
                    urlAudioSlow: audioSlowUrl,
                    durationSecSlow: 2,
                });
            } else {
                await createSentences({
                    sen_en: termEn,
                    sen_vn: termVi,
                    lessonId,
                    isForLearning: isUsed,
                    urlImg: imgUrl,
                    urlAudioNormal: audioNormalUrl,
                    durationSecNormal: 2,
                    urlAudioSlow: audioSlowUrl,
                    durationSecSlow: 2,
                });
            }

            enqueueSnackbar(isVocab ? "Tạo từ vựng thành công!" : "Tạo câu thành công!", {
                variant: "success",
            });

            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            enqueueSnackbar("Lỗi tạo dữ liệu!", { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
            PaperProps={{ sx: { height: "95vh" } }}
        >
            <DialogTitle sx={{ fontWeight: 700, fontSize: 22 }}>
                {isVocab ? "Tạo từ vựng mới" : "Tạo câu mới"}
            </DialogTitle>

            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box>
                        <Box sx={{ display: "flex", flexDirection: "row", gap: 2, mt: 2 }}>
                            {/* TERM EN */}
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ mb: 1 }}>
                                    {isVocab ? "Từ tiếng Anh" : "Câu tiếng Anh"} <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={termEn}
                                    onChange={(e) => {
                                        setTermEn(e.target.value);
                                        if (errors.termEn) setErrors({ ...errors, termEn: undefined });
                                    }}
                                    error={!!errors.termEn}
                                    helperText={errors.termEn}
                                />
                            </Box>

                            {/* TERM VI */}
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ mb: 1 }}>
                                    {isVocab ? "Từ tiếng Việt" : "Câu tiếng Việt"} <span style={{ color: 'red' }}>*</span>
                                </Typography>
                                <TextField
                                    fullWidth
                                    value={termVi}
                                    onChange={(e) => {
                                        setTermVi(e.target.value);
                                        if (errors.termVi) setErrors({ ...errors, termVi: undefined });
                                    }}
                                    error={!!errors.termVi}
                                    helperText={errors.termVi}
                                />
                            </Box>
                        </Box>

                        {/* Chỉ từ vựng mới có phiên âm + loại từ */}
                        {isVocab && (
                            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ mb: 1 }}>Phiên âm <span style={{ color: 'red' }}>*</span></Typography>
                                    <TextField
                                        fullWidth
                                        value={phonetic}
                                        onChange={(e) => {
                                            setPhonetic(e.target.value);
                                            if (errors.phonetic) setErrors({ ...errors, phonetic: undefined });
                                        }}
                                        error={!!errors.phonetic}
                                        helperText={errors.phonetic}
                                    />
                                </Box>

                                <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ mb: 1 }}>Loại từ <span style={{ color: 'red' }}>*</span></Typography>
                                    <TextField
                                        fullWidth
                                        value={partOfSpeech}
                                        onChange={(e) => {
                                            setPartOfSpeech(e.target.value);
                                            if (errors.partOfSpeech) setErrors({ ...errors, partOfSpeech: undefined });
                                        }}
                                        error={!!errors.partOfSpeech}
                                        helperText={errors.partOfSpeech}
                                    />
                                </Box>
                            </Box>
                        )}

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, mt: 1 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Checkbox
                                    checked={isUsed}
                                    onChange={(e) => setIsUsed(e.target.checked)}
                                />
                                <Typography sx={{ mb: 0 }}>Dùng cho bài học</Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", gap: 4, mt: 2 }}>

                        {/* LEFT - IMAGE */}
                        <Box sx={{ flex: 1 }}>
                            <Box sx={{ mt: 2 }}>
                                <Typography sx={{ mb: 1 }}>Ảnh minh hoạ <span style={{ color: 'red' }}>*</span></Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                    color={errors.image ? "error" : "primary"}
                                    sx={{
                                        height: 50,
                                        fontWeight: 700,
                                        border: errors.image ? "1px solid #d32f2f" : undefined
                                    }}
                                >
                                    THÊM ẢNH +
                                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                                </Button>
                                {errors.image && <FormHelperText error>{errors.image}</FormHelperText>}
                            </Box>

                            {previewImage && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography sx={{ mb: 1 }}>Xem trước</Typography>
                                    <Box
                                        component="img"
                                        src={previewImage}
                                        sx={{
                                            width: "100%", height: 180, objectFit: "contain",
                                            border: "1px solid #ccc", borderRadius: 2,
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>

                        {/* RIGHT – AUDIO */}
                        <Box sx={{ flex: 1 }}>
                            <Box>
                                <Typography sx={{ mb: 1 }}>Âm thanh tốc độ thường <span style={{ color: 'red' }}>*</span></Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                    color={errors.audioNormal ? "error" : "primary"}
                                    sx={{
                                        height: 50,
                                        fontWeight: 700,
                                        border: errors.audioNormal ? "1px solid #d32f2f" : undefined
                                    }}
                                >
                                    THÊM ÂM THANH +
                                    <input type="file" hidden accept="audio/*" onChange={handleAudioNormalUpload} />
                                </Button>
                                {errors.audioNormal && <FormHelperText error>{errors.audioNormal}</FormHelperText>}

                                {audioNormal && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography sx={{ mb: 1 }}>Preview:</Typography>
                                        <audio controls src={URL.createObjectURL(audioNormal)} style={{ width: "100%" }} />
                                    </Box>
                                )}
                            </Box>

                            <Box sx={{ mt: 4 }}>
                                <Typography sx={{ mb: 1 }}>Âm thanh tốc độ chậm <span style={{ color: 'red' }}>*</span></Typography>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                    color={errors.audioSlow ? "error" : "primary"}
                                    sx={{
                                        height: 50,
                                        fontWeight: 700,
                                        border: errors.audioSlow ? "1px solid #d32f2f" : undefined
                                    }}
                                >
                                    THÊM ÂM THANH +
                                    <input type="file" hidden accept="audio/*" onChange={handleAudioSlowUpload} />
                                </Button>
                                {errors.audioSlow && <FormHelperText error>{errors.audioSlow}</FormHelperText>}

                                {audioSlow && (
                                    <Box sx={{ mt: 1 }}>
                                        <Typography sx={{ mb: 1 }}>Preview:</Typography>
                                        <audio controls src={URL.createObjectURL(audioSlow)} style={{ width: "100%" }} />
                                    </Box>
                                )}
                            </Box>
                        </Box>

                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ justifyContent: "center", mt: 2 }}>
                <Button onClick={onClose} variant="outlined" sx={{ width: 120 }}>Hủy</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    sx={{ width: 160, bgcolor: "#4CAF50", fontWeight: 700 }}
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> :
                        isVocab ? "Tạo từ vựng" : "Tạo câu"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
