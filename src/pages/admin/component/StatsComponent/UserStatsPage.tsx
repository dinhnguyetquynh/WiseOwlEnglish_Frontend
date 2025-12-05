import { useEffect, useState } from "react";
import {
  Box, Grid, Paper, Typography, CircularProgress, Card, CardContent
} from "@mui/material";
import { People, School, TrendingUp } from "@mui/icons-material";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { getLearnerStats, type LearnerStatsRes } from "../../../../api/stats";

export default function UserStatsPage() {
  const [data, setData] = useState<LearnerStatsRes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLearnerStats()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;
  if (!data) return <Typography color="error">Không tải được dữ liệu</Typography>;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: '#1a237e' }}>
        THỐNG KÊ NGƯỜI DÙNG
      </Typography>

      {/* 1. Card Tổng quan */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: "#e3f2fd", borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: '50%', color: '#1976d2' }}><School /></Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Tổng Hồ sơ học tập</Typography>
                <Typography variant="h3" fontWeight={800} color="#1565c0">{data.totalLearners}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: "#e8f5e9", borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: '50%', color: '#2e7d32' }}><People /></Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Tổng Tài khoản phụ huynh</Typography>
                <Typography variant="h3" fontWeight={800} color="#2e7d32">{data.totalUserAccounts}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 2. Phân bổ học sinh (List) & Biểu đồ tăng trưởng */}
      <Grid container spacing={3}>
        {/* List Phân bổ */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
               Phân bổ theo Lớp
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.gradeDistribution.map((item, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2, 
                    bgcolor: '#f5f5f5', 
                    borderRadius: 2,
                    borderLeft: `6px solid ${['#42a5f5', '#66bb6a', '#ffa726', '#ef5350', '#ab47bc'][index % 5]}`
                  }}
                >
                  <Typography fontWeight={600} color="text.secondary">{item.gradeName}</Typography>
                  <Typography fontWeight={800} fontSize={18}>{item.count} học sinh</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Chart Tăng trưởng */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp /> Người học mới theo tháng
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="timeLabel" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Học viên mới" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}