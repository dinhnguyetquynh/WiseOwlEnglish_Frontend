import { useEffect, useState } from "react";
import {
    Box, AppBar, Toolbar, Typography, Drawer,
    List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, Divider, Avatar,
} from "@mui/material";
import {
    School as LessonIcon,
    SportsEsports as GameIcon,
    Assignment as TestIcon,
    People as UsersIcon,
    BarChart as ReportIcon,
    AccountCircle as ProfileIcon,
    ExitToApp as LogoutIcon,
    KeyboardArrowDown as ArrowDownIcon
} from "@mui/icons-material";
import GameLayout from "../component/GameLayout";
import LessonLayout from "../component/LessonLayout";
import { useHomeContext } from "../../../context/AuthContext";

type Game = { vocab: string[]; sentence: string[] };
type Unit = { id: string; title: string; games: Game | null };


const drawerWidth = 240;

// --- Component chính ---
export default function AdminPageMUI() {
    const [activeItem, setActiveItem] = useState("game");
    const { setSelectedClass } = useHomeContext();

    useEffect(() => {
        // Chỉ reset khi chuyển sang màn Lesson
        if (activeItem === "lesson") {
            setSelectedClass("1");
        }
    }, [activeItem, setSelectedClass]);
    return (
        <Box sx={{ display: "flex" }}>
            <AdminHeader />
            <SidebarMUI activeItem={activeItem} setActiveItem={setActiveItem} />
            <MainContentMUI activeItem={activeItem} />
        </Box>
    );
}

// --- Header ---
function AdminHeader() {
    return (
        <AppBar
            position="fixed"
            sx={{
                width: `calc(100% - ${drawerWidth}px)`,
                ml: `${drawerWidth}px`,
                backgroundColor: "white",
                boxShadow: 0,
                borderBottom: "1px solid #e0e0e0",
            }}
        >
            <Toolbar sx={{ justifyContent: "flex-end" }}>
                <Typography variant="body1" color="text.secondary" sx={{ mr: 2 }}>
                    ADMIN 1
                </Typography>
                <Avatar sx={{ bgcolor: "grey.400" }} />
            </Toolbar>
        </AppBar>
    );
}

// --- Sidebar ---
function SidebarMUI({
    activeItem,
    setActiveItem,
}: {
    activeItem: string;
    setActiveItem: (id: string) => void;
}) {
    const navSections = [
        {
            title: "Quản lý nội dung học",
            items: [
                { id: "lesson", label: "Bài học (Lesson)", icon: <LessonIcon /> },
                { id: "game", label: "Ôn tập (Game)", icon: <GameIcon /> },
                { id: "test", label: "Kiểm tra (Test)", icon: <TestIcon /> },
            ],
        },
        {
            title: "Thống kê và Báo cáo",
            items: [
                { id: "stats", label: "Thống kê người dùng", icon: <UsersIcon /> },
                { id: "report", label: "Báo cáo học tập", icon: <ReportIcon /> },
            ],
        },
        {
            title: "Tài khoản",
            items: [
                { id: "profile", label: "Hồ sơ", icon: <ProfileIcon /> },
                { id: "logout", label: "Đăng xuất", icon: <LogoutIcon /> },
            ],
        },
    ];

    return (
        <Drawer
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: drawerWidth,
                    boxSizing: "border-box",
                    borderRight: "1px solid #e0e0e0",
                },
            }}
            variant="permanent"
            anchor="left"
        >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: "grey.200" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    WISEOWL ENGLISH
                </Typography>
            </Box>

            {navSections.map((section, index) => (
                <List key={section.title} sx={{ px: 1, pt: index === 0 ? 1 : 0 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            textTransform: "uppercase",
                            fontWeight: "bold",
                            color: "text.secondary",
                            ml: 2,
                            mt: 2,
                            mb: 1,
                        }}
                    >
                        {section.title}
                    </Typography>
                    {section.items.map((item) => (
                        <ListItem key={item.id} disablePadding>
                            <ListItemButton
                                selected={activeItem === item.id}
                                onClick={() => setActiveItem(item.id)}
                                sx={{
                                    borderRadius: 1,
                                    "&.Mui-selected": {
                                        backgroundColor: "grey.200",
                                        "&:hover": { backgroundColor: "grey.300" },
                                    },
                                    "&:hover": { backgroundColor: "grey.100" },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    {index < navSections.length - 1 && <Divider sx={{ mt: 2, mb: 2 }} />}
                </List>
            ))}
        </Drawer>
    );
}

// --- MainContent (hiển thị layout theo menu) ---
function MainContentMUI({ activeItem }: { activeItem: string }) {
    return (
        <Box
            component="main"
            sx={{
                flexGrow: 1,
                bgcolor: "grey.100",
                p: 3,
                mt: 8,
                height: "100vh",
                overflow: "auto",
            }}
        >
            {activeItem === "lesson" && <LessonLayout />}
            {activeItem === "game" && <GameLayout />}
            {activeItem === "test" && <Typography>Trang kiểm tra</Typography>}
            {activeItem === "stats" && <Typography>Thống kê người dùng</Typography>}
            {activeItem === "report" && <Typography>Báo cáo học tập</Typography>}
            {activeItem === "profile" && <Typography>Hồ sơ cá nhân</Typography>}
            {activeItem === "logout" && <Typography>Đăng xuất hệ thống</Typography>}
        </Box>
    );
}








