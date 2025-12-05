import { useEffect, useState } from "react";
import {
  Box,  Grid, Paper, Typography, CircularProgress, Card, CardContent, Select, MenuItem
} from "@mui/material";
import { People, School, BarChart as BarChartIcon } from "@mui/icons-material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { getLearnerStats, type LearnerStatsRes } from "../../../../api/stats";

export default function UserStatsPage() {
  const [data, setData] = useState<LearnerStatsRes | null>(null);
  const [loading, setLoading] = useState(true);
  
  // State chọn năm (mặc định 2025)
  const [selectedYear, setSelectedYear] = useState(2025);
  const years = [2023, 2024, 2025, 2026]; // Danh sách năm tùy chỉnh

  useEffect(() => {
    setLoading(true);
    getLearnerStats(selectedYear)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedYear]); // Gọi lại khi đổi năm

  if (!data) return <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3, color: '#1a237e' }}>
        THỐNG KÊ NGƯỜI DÙNG
      </Typography>

      <Grid container spacing={3}>
        
        {/* --- HÀNG 1: CÁC THẺ TỔNG QUAN --- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: "#e3f2fd", borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: '50%', color: '#1976d2' }}><School /></Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Tổng Hồ sơ học tập</Typography>
                <Typography variant="h4" fontWeight={800} color="#1565c0">{data.totalLearners}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: "#e8f5e9", borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: '50%', color: '#2e7d32' }}><People /></Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Tổng Tài khoản phụ huynh</Typography>
                <Typography variant="h4" fontWeight={800} color="#2e7d32">{data.totalUserAccounts}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* --- HÀNG 1 (BÊN PHẢI): LIST PHÂN BỔ LỚP --- */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2, borderRadius: 3, height: '100%', maxHeight: 300, overflow: 'auto' }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
               Phân bổ theo Lớp
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {data.gradeDistribution.map((item, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    p: 1.5, bgcolor: '#f9fafb', borderRadius: 2,
                    borderLeft: `4px solid ${['#42a5f5', '#66bb6a', '#ffa726', '#ef5350', '#ab47bc'][index % 5]}`
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>{item.gradeName}</Typography>
                  <Typography variant="body2" fontWeight={700}>{item.count}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* --- HÀNG 2: BIỂU ĐỒ CỘT (FULL WIDTH) --- */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            {/* Header biểu đồ + Dropdown Năm */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChartIcon /> Người học mới năm {selectedYear}
              </Typography>
              
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                size="small"
                sx={{ minWidth: 100, bgcolor: '#f5f5f5', fontWeight: 600 }}
              >
                {years.map(y => <MenuItem key={y} value={y}>Năm {y}</MenuItem>)}
              </Select>
            </Box>

            {/* Chart */}
            <div style={{ width: '100%', height: 350 }}>
              {loading ? <CircularProgress sx={{ display: 'block', margin: 'auto' }} /> : (
                <ResponsiveContainer>
                  <BarChart data={data.monthlyGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="timeLabel" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      cursor={{fill: '#f0f9ff'}}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar 
                      dataKey="count" 
                      name="Học viên mới" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]} 
                      barSize={40}
                      // Animation
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}