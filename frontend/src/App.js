import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileText, Loader2, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || 
          selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please upload only PDF or DOCX files.');
        setFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setSummary('');
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/summarize', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSummary(response.data.summary);
      } else {
        setError(response.data.error || 'Failed to summarize document.');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.details || err.response?.data?.error || 'Server error. Make sure backend is running.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const downloadSummary = () => {
    const element = document.createElement("a");
    const file = new Blob([summary], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "summary.txt";
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mb-4"
          >
            <FileText size={16} />
            <span>AI Powered</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4"
          >
            Document <span className="text-blue-600">Summarizer</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-lg max-w-xl mx-auto"
          >
            Upload your PDF or Word documents and get instant AI-generated summaries, key points, and insights.
          </motion.p>
        </header>

        {/* Main Section */}
        <main className="grid grid-cols-1 gap-8">
          {/* Upload Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100"
          >
            <div 
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                file ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
              }`}
            >
              <input 
                type="file" 
                id="fileInput" 
                className="hidden" 
                onChange={handleFileChange}
                accept=".pdf,.docx"
              />
              <label htmlFor="fileInput" className="cursor-pointer">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload size={32} />
                </div>
                {file ? (
                  <div className="flex flex-col items-center">
                    <span className="text-slate-900 font-medium text-lg">{file.name}</span>
                    <span className="text-slate-500 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ) : (
                  <div>
                    <span className="text-slate-900 font-medium text-lg">Click to upload or drag and drop</span>
                    <p className="text-slate-500 text-sm mt-1">PDF or DOCX (max 10MB)</p>
                  </div>
                )}
              </label>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 flex items-center gap-3"
              >
                <AlertCircle size={20} />
                <span className="text-sm font-medium">{error}</span>
              </motion.div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`w-full mt-8 py-4 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                !file || loading 
                  ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" />
                  <span>Processing Document...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  <span>Summarize Now</span>
                </>
              )}
            </button>
          </motion.div>

          {/* Results Area */}
          <AnimatePresence>
            {summary && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100"
              >
                <div className="flex items-center justify-between mb-6 pb-6 border-border-slate-100">
                  <h3 className="text-2xl font-bold text-slate-900">Summary Results</h3>
                  <button 
                    onClick={downloadSummary}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Download size={20} />
                    Download
                  </button>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  {summary.split('\n').map((line, i) => (
                    <p key={i} className="text-slate-700 leading-relaxed mb-4">
                      {line}
                    </p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="mt-20 text-center text-slate-400 text-sm">
          Built with React & Google Gemini AI
        </footer>
      </div>
    </div>
  );
};

export default App;
