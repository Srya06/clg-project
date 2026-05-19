'use client';

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Users, BarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const TeacherDashboard = () => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSummary, setUploadSummary] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'attendance' | 'marks') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(20);
    setUploadSummary(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`/api/v1/upload/${type}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setProgress(percent);
        },
      });

      setUploadSummary(response.data.summary);
      toast({
        title: "Upload Successful",
        description: `Successfully processed ${response.data.summary.success} records.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.response?.data?.message || "Something went wrong during upload.",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-500">
          Teacher Console
        </h1>
        <p className="text-gray-400 text-lg">Manage classroom data and monitor student academic health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Classes</CardTitle>
            <Users className="h-4 w-4 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">4 Active</div>
            <p className="text-xs text-gray-500">+1 from last semester</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Avg. Attendance</CardTitle>
            <BarChart className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">82%</div>
            <div className="mt-2 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-500 w-[82%]" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Risky Students</CardTitle>
            <AlertCircle className="h-4 w-4 text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12 High Alert</div>
            <p className="text-xs text-rose-400/80">Requires counseling</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#0D121F] border-white/10 overflow-hidden shadow-2xl">
        <Tabs defaultValue="attendance" className="w-full">
          <div className="px-6 pt-6 border-b border-white/5">
            <TabsList className="bg-white/5 p-1 border border-white/10">
              <TabsTrigger value="attendance" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 transition-all">
                Attendance Ingestion
              </TabsTrigger>
              <TabsTrigger value="marks" className="data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400 transition-all">
                Marks Ingestion
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="attendance" className="p-10">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Update Attendance Records</h3>
                <p className="text-gray-400 leading-relaxed">
                  Upload a CSV file containing daily attendance. The system will automatically map students by their 
                  university email and update their performance metrics.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 bg-white/5 p-4 rounded-xl border border-white/5">
                  <FileSpreadsheet className="h-5 w-5 text-cyan-500" />
                  <span>Required Format: <code>email, subject, date, status, semester</code></span>
                </div>
                
                <div className="pt-4">
                   <label className="block">
                    <span className="sr-only">Choose CSV file</span>
                    <input 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, 'attendance')}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-500/10 file:text-cyan-400 hover:file:bg-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-black/20 rounded-2xl p-8 border border-white/5 min-h-[250px] flex flex-col justify-center">
                {uploading ? (
                  <div className="space-y-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-cyan-400 font-medium">Processing Data...</span>
                      <span className="text-gray-500">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/5" />
                    <p className="text-xs text-gray-500 text-center italic animate-pulse">Running AI Validation and DB Upserts</p>
                  </div>
                ) : uploadSummary ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <CheckCircle2 className="h-6 w-6" />
                      <span className="text-lg font-semibold">Processing Complete</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                         <p className="text-xs text-gray-500 uppercase">Success</p>
                         <p className="text-2xl font-bold text-white">{uploadSummary.success}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                         <p className="text-xs text-gray-500 uppercase">Failed</p>
                         <p className="text-2xl font-bold text-rose-400">{uploadSummary.failed}</p>
                      </div>
                    </div>
                    {uploadSummary.errors?.length > 0 && (
                      <div className="mt-4 p-3 bg-rose-500/10 rounded-lg text-xs text-rose-400 border border-rose-500/20 max-h-32 overflow-y-auto">
                        {uploadSummary.errors[0]} {uploadSummary.errors.length > 1 && `(+ ${uploadSummary.errors.length - 1} more errors)`}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <div className="mx-auto h-16 w-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                      <Upload className="h-8 w-8 text-gray-600" />
                    </div>
                    <p className="text-gray-500">Awaiting file selection...</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="marks" className="p-10">
            {/* Similar structure for Marks */}
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Bulk Marks Entry</h3>
                <p className="text-gray-400 leading-relaxed">
                  Ingest scores for internal or external exams. These scores directly impact the student's credit 
                  score and the final AI-powered leaderboard ranking.
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 bg-white/5 p-4 rounded-xl border border-white/5">
                  <FileSpreadsheet className="h-5 w-5 text-indigo-500" />
                  <span>Required Format: <code>email, subject, type, score, maxScore, semester</code></span>
                </div>
                
                <div className="pt-4">
                   <label className="block">
                    <span className="sr-only">Choose CSV file</span>
                    <input 
                      type="file" 
                      accept=".csv"
                      onChange={(e) => handleFileUpload(e, 'marks')}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
                    />
                  </label>
                </div>
              </div>

               <div className="bg-black/20 rounded-2xl p-8 border border-white/5 min-h-[250px] flex flex-col justify-center text-center">
                  <p className="text-gray-500">Select a Marks CSV to see processing summary</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
