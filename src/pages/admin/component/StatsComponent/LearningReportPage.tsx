import { useEffect, useState } from "react";
import {
  Box, Grid, Paper, Typography, Select, MenuItem, CircularProgress, Card, CardContent
} from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { getGradeReport, type GradeReportRes } from "../../../../api/stats";
import { ClassOutlined } from "@mui/icons-material";

export default function LearningReportPage() {
  const [selectedGrade, setSelectedGrade] = useState(1);
  const [reportData, setReportData] = useState<GradeReportRes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getGradeReport(selectedGrade)
      .then(setReportData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedGrade]);

  return (
    <Box>
      {/* Header & Filter */}
      <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h5" fontWeight={700} color="#1a237e">BÁO CÁO HỌC TẬP</Typography>
        <Select 
          value={selectedGrade} 
          onChange={(e) => setSelectedGrade(Number(e.target.value))}
          size="small"
          sx={{ bgcolor: "white", minWidth: 150, borderRadius: 2, fontWeight: 600 }}
        >
          {[1,2,3,4,5].map(g => <MenuItem key={g} value={g}>Lớp {g}</MenuItem>)}
        </Select>
      </Box>

      {loading ? <CircularProgress sx={{ display: 'block', margin: '40px auto' }} /> : reportData && (
        <>
          {/* Thông tin tổng quan của Lớp */}
          <Card sx={{ mb: 4, bgcolor: '#fff3e0', borderRadius: 3, border: '1px solid #ffe0b2' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <ClassOutlined sx={{ fontSize: 40, color: '#f57c00' }} />
              <Box>
                <Typography variant="subtitle1" color="#e65100" fontWeight={600}>
                   Đang xem báo cáo: Lớp {selectedGrade}
                </Typography>
                <Typography variant="h4" fontWeight={800} color="#f57c00">
                   {reportData.totalStudentsInGrade} <span style={{fontSize: '1rem', fontWeight: 500}}>học sinh đang theo học</span>
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Charts Grid */}
          <Grid container spacing={4}>
            
            {/* Chart 1: Tỷ lệ hoàn thành */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} color="#2e7d32" sx={{ mb: 2 }}>
                  📊 Tỷ lệ hoàn thành bài học (%)
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.lessons} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="lessonName" tick={{fontSize: 12}} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip cursor={{fill: '#f1f8e9'}} />
                      <Bar 
                        dataKey="completionRate" 
                        name="Tỷ lệ hoàn thành" 
                        fill="#66bb6a" 
                        radius={[4, 4, 0, 0]} 
                        barSize={50}
                        label={{ position: 'top', fill: '#33691e', fontSize: 12 }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

            {/* Chart 2: Điểm trung bình */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} color="#5e35b1" sx={{ mb: 2 }}>
                  🎯 Điểm kiểm tra trung bình (Thang 10)
                </Typography>
                <Box sx={{ height: 350 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.lessons} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="lessonName" tick={{fontSize: 12}} />
                      <YAxis domain={[0, 10]} />
                      <Tooltip cursor={{fill: '#ede7f6'}} />
                      <Bar 
                        dataKey="averageTestScore" 
                        name="Điểm trung bình" 
                        fill="#7e57c2" 
                        radius={[4, 4, 0, 0]} 
                        barSize={50}
                        label={{ position: 'top', fill: '#4527a0', fontSize: 12 }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </Grid>

          </Grid>
        </>
      )}
    </Box>
  );
}