// src/components/common/ConfirmDialog.tsx (hoặc đường dẫn phù hợp với dự án của bạn)
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Typography
} from "@mui/material";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box } from "@mui/system";

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    content: string;
    onClose: () => void;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
}

export default function ConfirmDialog({
    open,
    title = "Xác nhận xoá",
    content,
    onClose,
    onConfirm,
    confirmText = "Xoá",
    cancelText = "Hủy bỏ"
}: ConfirmDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
                sx: { borderRadius: 2, padding: 1, minWidth: "400px" }
            }}
        >
            <DialogTitle id="alert-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberIcon color="warning" />
                <Typography variant="h6" fontWeight="bold">
                    {title}
                </Typography>
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description" sx={{ color: '#555' }}>
                    {content}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: 2 }}>
                <Button 
                    onClick={onClose} 
                    variant="outlined" 
                    color="inherit"
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                    {cancelText}
                </Button>
                <Button 
                    onClick={onConfirm} 
                    variant="contained" 
                    color="error" 
                    autoFocus
                    sx={{ borderRadius: 2, textTransform: 'none', boxShadow: 'none' }}
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}