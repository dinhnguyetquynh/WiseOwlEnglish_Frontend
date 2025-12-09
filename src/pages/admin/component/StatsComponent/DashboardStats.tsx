// // src/pages/admin/component/StatsComponent/DashboardStats.tsx
// import { useEffect, useState } from "react";
// import { 
//   Box, 
//   Typography, 
//   CircularProgress, 
//   Card, 
//   CardContent, 
//   Avatar,
//   CardActionArea
// } from "@mui/material";
// import Grid from "@mui/material/Grid";
// import { 
//   MenuBook as LessonIcon, 
//   Translate as VocabIcon, 
//   ShortText as SentenceIcon, 
//   SportsEsports as GameIcon, 
//   Quiz as TestIcon 
// } from "@mui/icons-material";
// import { getTotalData, type TotalDataRes } from "../../../../api/stats";

// // Định nghĩa Props để nhận hàm chuyển trang từ cha
// interface Props {
//   onNavigate: (page: string) => void;
// }

// export default function DashboardStats({ onNavigate }: Props) {
//   const [data, setData] = useState<TotalDataRes | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await getTotalData();
//         setData(res);
//       } catch (error) {
//         console.error("Lỗi tải dữ liệu thống kê:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   if (loading) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (!data) {
//     return <Typography color="error">Không thể tải dữ liệu.</Typography>;
//   }

//   // Cấu hình thẻ Dashboard có thêm trường 'linkTo'
//   const statCards = [
//     {
//       title: "Tổng Bài Học",
//       value: data.totalLessons,
//       icon: <LessonIcon fontSize="large" />,
//       color: "#1976d2",
//       bgColor: "#e3f2fd",
//       linkTo: "lesson", // Chuyển đến trang Quản lý bài học
//     },
//     {
//       title: "Tổng Từ Vựng",
//       value: data.totalVocabularies,
//       icon: <VocabIcon fontSize="large" />,
//       color: "#2e7d32",
//       bgColor: "#e8f5e9",
//       linkTo: "lesson", // Từ vựng nằm trong bài học -> cũng chuyển về Lesson
//     },
//     {
//       title: "Tổng Câu Mẫu",
//       value: data.totalSentences,
//       icon: <SentenceIcon fontSize="large" />,
//       color: "#ed6c02",
//       bgColor: "#fff3e0",
//       linkTo: "lesson", // Tương tự từ vựng
//     },
//     {
//       title: "Câu Hỏi Game",
//       value: data.totalGameQuestions,
//       icon: <GameIcon fontSize="large" />,
//       color: "#9c27b0",
//       bgColor: "#f3e5f5",
//       linkTo: "game", // Chuyển đến trang Game
//     },
//     {
//       title: "Câu Hỏi Kiểm Tra",
//       value: data.totalTestQuestions,
//       icon: <TestIcon fontSize="large" />,
//       color: "#d32f2f",
//       bgColor: "#ffebee",
//       linkTo: "test", // Chuyển đến trang Test
//     },
//   ];

//   return (
//     <Box>
//       <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: "#1a237e" }}>
//         TỔNG QUAN HỆ THỐNG
//       </Typography>

//       <Grid container spacing={3}>
//         {statCards.map((item, index) => (
//           <Grid key={index} size={{ xs: 12, sm: 6, md: 2.4 }}>
//             <Card
//               elevation={0}
//               sx={{
//                 borderRadius: 3,
//                 bgcolor: item.bgColor,
//                 height: "100%",
//                 transition: "transform 0.2s",
//                 "&:hover": {
//                   transform: "translateY(-5px)",
//                   boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
//                 },
//               }}
//             >
//               {/* CardActionArea giúp toàn bộ thẻ bấm được & có hiệu ứng sóng nước */}
//               <CardActionArea 
//                 onClick={() => onNavigate(item.linkTo)}
//                 sx={{ height: "100%", padding: 2 }}
//               >
//                 <CardContent
//                   sx={{
//                     display: "flex",
//                     flexDirection: "column",
//                     alignItems: "center",
//                     textAlign: "center",
//                     padding: "0 !important", // Reset padding mặc định của MUI
//                   }}
//                 >
//                   <Avatar
//                     sx={{
//                       bgcolor: "white",
//                       color: item.color,
//                       width: 56,
//                       height: 56,
//                       mb: 2,
//                       boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
//                     }}
//                   >
//                     {item.icon}
//                   </Avatar>
//                   <Typography variant="h4" fontWeight={800} color={item.color}>
//                     {new Intl.NumberFormat("vi-VN").format(item.value)}
//                   </Typography>
//                   <Typography
//                     variant="subtitle2"
//                     fontWeight={600}
//                     color="text.secondary"
//                     sx={{ mt: 0.5, textTransform: "uppercase", fontSize: "0.75rem" }}
//                   >
//                     {item.title}
//                   </Typography>
//                 </CardContent>
//               </CardActionArea>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     </Box>
//   );
// }
// src/pages/admin/component/StatsComponent/DashboardStats.tsx

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  CardActionArea,
  IconButton
} from "@mui/material";
import Grid from "@mui/material/Grid"; // Sử dụng Grid2 cho MUI v6 (hoặc Grid nếu v5)
import {
  MenuBook as LessonIcon,
  Translate as VocabIcon,
  ShortText as SentenceIcon,
  SportsEsports as GameIcon,
  Quiz as TestIcon,
  TrendingUp,
  ArrowBackIos,
  ArrowForwardIos
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks } from "date-fns";
import {
  getTotalData,
  getLearningActivity,
  type TotalDataRes,
  type DailyStatRes
} from "../../../../api/stats";

interface Props {
  onNavigate: (page: string) => void;
}

export default function DashboardStats({ onNavigate }: Props) {
  // State tổng quan
  const [totalData, setTotalData] = useState<TotalDataRes | null>(null);

  // State biểu đồ hoạt động
  const [activityData, setActivityData] = useState<DailyStatRes[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date()); // Dùng để xác định tuần hiện tại
  
  const [loading, setLoading] = useState(true);

  // 1. Tải dữ liệu tổng quan (chỉ chạy 1 lần khi mount)
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        const res = await getTotalData();
        setTotalData(res);
      } catch (error) {
        console.error("Lỗi tải stats tổng quan:", error);
      }
    };
    fetchTotal();
  }, []);

  // 2. Tải dữ liệu biểu đồ (chạy mỗi khi currentDate thay đổi - tức là khi đổi tuần)
  useEffect(() => {
    const fetchActivity = async () => {
      // Giữ loading nhẹ hoặc không (tuỳ trải nghiệm), ở đây mình không set loading toàn trang để tránh nháy
      try {
        // Tính ngày đầu tuần (Thứ 2) và cuối tuần (CN)
        const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // 1 là thứ Hai
        const end = endOfWeek(currentDate, { weekStartsOn: 1 });

        // Format sang YYYY-MM-DD để gửi xuống Backend
        const sStr = format(start, "yyyy-MM-dd");
        const eStr = format(end, "yyyy-MM-dd");

        const res = await getLearningActivity(sStr, eStr);
        setActivityData(res);
      } catch (error) {
        console.error("Lỗi tải biểu đồ hoạt động:", error);
      } finally {
        // Chỉ tắt loading lần đầu tiên load trang
        setLoading(false);
      }
    };
    fetchActivity();
  }, [currentDate]);

  // Xử lý chuyển tuần
  const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));

  // Kiểm tra xem có phải tuần hiện tại không (để disable nút Next nếu muốn chặn tương lai)
  // const isCurrentWeek = endOfWeek(currentDate, { weekStartsOn: 1 }) >= endOfWeek(new Date(), { weekStartsOn: 1 });
  // Ở đây mình không chặn nút Next để Admin có thể xem linh hoạt, bạn có thể uncomment dòng trên nếu muốn chặn.

  if (loading && !totalData) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Cấu hình thẻ Dashboard
  const statCards = totalData ? [
    { title: "Tổng Bài Học", value: totalData.totalLessons, icon: <LessonIcon fontSize="large" />, color: "#1976d2", bgColor: "#e3f2fd", linkTo: "lesson" },
    { title: "Tổng Từ Vựng", value: totalData.totalVocabularies, icon: <VocabIcon fontSize="large" />, color: "#2e7d32", bgColor: "#e8f5e9", linkTo: "lesson" },
    { title: "Tổng Câu Mẫu", value: totalData.totalSentences, icon: <SentenceIcon fontSize="large" />, color: "#ed6c02", bgColor: "#fff3e0", linkTo: "lesson" },
    { title: "Câu Hỏi Game", value: totalData.totalGameQuestions, icon: <GameIcon fontSize="large" />, color: "#9c27b0", bgColor: "#f3e5f5", linkTo: "game" },
    { title: "Câu Hỏi Test", value: totalData.totalTestQuestions, icon: <TestIcon fontSize="large" />, color: "#d32f2f", bgColor: "#ffebee", linkTo: "test" },
  ] : [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: "#1a237e" }}>
        TỔNG QUAN HỆ THỐNG
      </Typography>

      {/* --- PHẦN 1: CÁC THẺ THỐNG KÊ (COUNTERS) --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((item, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                bgcolor: item.bgColor,
                height: "100%",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "translateY(-5px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                },
              }}
            >
              <CardActionArea
                onClick={() => onNavigate(item.linkTo)}
                sx={{ height: "100%", padding: 2 }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    padding: "0 !important",
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: "white",
                      color: item.color,
                      width: 56,
                      height: 56,
                      mb: 2,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    {item.icon}
                  </Avatar>
                  <Typography variant="h4" fontWeight={800} color={item.color}>
                    {new Intl.NumberFormat("vi-VN").format(item.value)}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ mt: 0.5, textTransform: "uppercase", fontSize: "0.75rem" }}
                  >
                    {item.title}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* --- PHẦN 2: BIỂU ĐỒ HOẠT ĐỘNG HỌC TẬP --- */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 3, p: 3, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
            
            {/* Header của biểu đồ */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              
              <Typography variant="h6" fontWeight={700} display="flex" alignItems="center" gap={1} color="#1565c0">
                <TrendingUp color="primary" /> Hoạt động học tập
              </Typography>

              {/* Bộ điều khiển Tuần (Trước - Sau) */}
              <Box 
                display="flex" 
                alignItems="center" 
                gap={1} 
                bgcolor="#f5f5f5" 
                borderRadius={2} 
                p={0.5}
                border="1px solid #e0e0e0"
              >
                <IconButton size="small" onClick={handlePrevWeek}>
                    <ArrowBackIos fontSize="inherit" sx={{ fontSize: 14 }} />
                </IconButton>
                
                <Typography variant="body2" fontWeight={600} sx={{ minWidth: 160, textAlign: 'center', color: '#424242' }}>
                    {format(startOfWeek(currentDate, { weekStartsOn: 1 }), "dd/MM")} - {format(endOfWeek(currentDate, { weekStartsOn: 1 }), "dd/MM/yyyy")}
                </Typography>
                
                <IconButton size="small" onClick={handleNextWeek}>
                    <ArrowForwardIos fontSize="inherit" sx={{ fontSize: 14 }} />
                </IconButton>
              </Box>

            </Box>

            {/* Vùng vẽ biểu đồ */}
            <Box height={400} width="100%">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                    <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 13, fill: '#616161' }} 
                        axisLine={false} 
                        tickLine={false} 
                        dy={10}
                    />
                    <YAxis 
                        allowDecimals={false} 
                        tick={{ fontSize: 13, fill: '#616161' }} 
                        axisLine={false} 
                        tickLine={false}
                    />
                    <Tooltip 
                        cursor={{ fill: "#f0f7ff" }} 
                        contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar 
                        dataKey="count" 
                        name="Bài học hoàn thành" 
                        fill="#4caf50" 
                        radius={[6, 6, 0, 0]} 
                        barSize={40} 
                        animationDuration={1000}
                    />
                </BarChart>
                </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}