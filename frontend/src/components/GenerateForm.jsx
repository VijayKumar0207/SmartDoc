import React, { useState, useEffect } from 'react';
import { studentService, docGenerationService, pdfService } from '../services/api';
import { Download, Loader2, AlertCircle, CheckCircle2, ShieldCheck, Cpu, Search, User, BookOpen, GraduationCap, Send, Mail } from 'lucide-react';

const GenerateForm = () => {
  const [studentSearch, setStudentSearch] = useState('');
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [currentPhase, setCurrentPhase] = useState('');
  const [docType, setDocType] = useState('academic_record');
  const [shareEmail, setShareEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState(null);
  const [showShareInput, setShowShareInput] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (studentSearch.trim()) {
        fetchStudents();
      } else {
        setStudents([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [studentSearch]);

  const fetchStudents = async () => {
    setSearchLoading(true);
    try {
      const response = await studentService.search(studentSearch);
      setStudents(response.data);
    } catch (err) {
      console.error('Failed to search students', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      setCurrentPhase('Phase 1: Validating Student Context...');
      await new Promise(r => setTimeout(r, 600));
      
      setCurrentPhase('Phase 2: Generating Vector PDF...');
      const response = await docGenerationService.generate(selectedStudent.id, docType);
      
      setResult(response.data);
      setCurrentPhase('Document Generated & Signed');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate document');
      setCurrentPhase('Generation Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (result) {
      window.open(pdfService.download(result.id), '_blank');
    }
  };

  const handleShare = async () => {
    if (!shareEmail || !result) return;
    setShareLoading(true);
    setShareMessage(null);
    try {
      await docGenerationService.share(result.id, shareEmail);
      setShareMessage({ type: 'success', text: 'Email sent successfully!' });
      setTimeout(() => {
          setShowShareInput(false);
          setShareMessage(null);
      }, 4000);
    } catch (err) {
      setShareMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to send email' });
    } finally {
      setShareLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-900 border border-slate-800 p-1 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-8 rounded-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Cpu className="h-6 w-6 text-blue-500" />
            Document Generation Engine
          </h2>

          <div className="space-y-6">
            {/* Student Search */}
            <div className="group relative">
              <label className="block text-sm font-medium text-slate-400 mb-2 group-focus-within:text-blue-400 transition-colors">
                Search Student (Name or Register Number)
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                <input
                  type="text"
                  className="w-full bg-slate-800 border border-slate-700 text-white pl-12 pr-4 py-4 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none placeholder:text-slate-600"
                  placeholder="Type to search..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                {searchLoading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                  </div>
                )}
              </div>

              {/* Search Results Dropdown */}
              {students.length > 0 && !selectedStudent && (
                <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto divide-y divide-slate-700">
                  {students.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setSelectedStudent(s);
                        setStudentSearch(s.name);
                        setStudents([]);
                      }}
                      className="w-full text-left px-6 py-4 hover:bg-slate-700 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <User className="h-5 w-5 text-slate-400 group-hover:text-blue-400" />
                        <div>
                          <p className="font-bold text-white tracking-wide">{s.name}</p>
                          <p className="text-xs text-slate-400 uppercase tracking-widest">{s.register_number} • {s.branch}</p>
                        </div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-transparent group-hover:text-blue-500" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Student Details Card */}
            {selectedStudent && (
              <div className="bg-blue-600/5 border border-blue-500/20 p-6 rounded-2xl animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 text-blue-400">
                    <GraduationCap className="h-6 w-6" />
                    <h3 className="font-bold uppercase tracking-widest text-sm">Target Identity Verified</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedStudent(null);
                      setStudentSearch('');
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-red-400 uppercase tracking-tighter transition-colors"
                  >
                    Change Selection
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Name</p>
                    <p className="text-white font-bold">{selectedStudent.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Registration</p>
                    <p className="text-blue-400 font-mono font-bold tracking-wider">{selectedStudent.register_number}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Branch</p>
                    <p className="text-white font-bold">{selectedStudent.branch}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Year</p>
                    <p className="text-white font-bold">{selectedStudent.year}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Document Type Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setDocType('academic_record')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${docType === 'academic_record' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`h-3 w-3 rounded-full ${docType === 'academic_record' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-slate-700'}`}></div>
                  <span className={`text-sm font-bold uppercase tracking-wider ${docType === 'academic_record' ? 'text-white' : 'text-slate-500'}`}>Academic Record</span>
                </div>
                <p className="text-xs text-slate-400">Official landscape format with academic details grid.</p>
              </button>
              <button
                type="button"
                onClick={() => setDocType('bonafide')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${docType === 'bonafide' ? 'border-purple-500 bg-purple-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`h-3 w-3 rounded-full ${docType === 'bonafide' ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-slate-700'}`}></div>
                  <span className={`text-sm font-bold uppercase tracking-wider ${docType === 'bonafide' ? 'text-white' : 'text-slate-500'}`}>Bonafide Certificate</span>
                </div>
                <p className="text-xs text-slate-400">Portrait format with college logo, seal, and formal phrasing.</p>
              </button>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !selectedStudent}
              className="w-full relative overflow-hidden group bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed disabled:border-slate-700 disabled:border"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              {loading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="uppercase tracking-widest font-black">{currentPhase}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-6 w-6" />
                  <span className="uppercase tracking-widest font-black">Generate & Securely Sign PDF</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-950/30 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-3 animate-in fade-in duration-300">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {result && !loading && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 bg-green-500/10 border border-green-500/30 rounded-3xl">
                <div className="flex items-center gap-3 text-green-400 font-black uppercase tracking-widest mb-8">
                  <CheckCircle2 className="h-7 w-7" />
                  <span className="text-sm">Blockchain-Grade Security Applied</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <button
                    onClick={handleDownload}
                    className="flex-grow bg-green-600 hover:bg-green-500 text-white py-4 px-8 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-green-900/40 active:scale-95"
                  >
                    <Download className="h-6 w-6" />
                    Download Signed PDF
                  </button>
                  <button
                    onClick={() => {
                        setShowShareInput(!showShareInput);
                        if (!showShareInput && selectedStudent) {
                            setShareEmail(selectedStudent.email);
                        }
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white py-4 px-8 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-900/40 active:scale-95"
                  >
                    <Send className="h-6 w-6" />
                    Share via Email
                  </button>
                </div>
                
                {showShareInput && (
                  <div className="mb-8 p-6 bg-slate-900/50 rounded-2xl border border-slate-700 animate-in slide-in-from-top-4 duration-300">
                    <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-widest">Recipient Email Address</label>
                    <div className="flex gap-3">
                      <div className="relative flex-grow">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        <input 
                          type="email" 
                          value={shareEmail}
                          onChange={(e) => setShareEmail(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 text-white pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="recipient@example.com"
                        />
                      </div>
                      <button 
                        onClick={handleShare}
                        disabled={shareLoading || !shareEmail}
                        className="bg-blue-500 hover:bg-blue-400 text-white px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {shareLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Send Email'}
                      </button>
                    </div>
                    {shareMessage && (
                      <div className={`mt-4 flex items-center gap-2 text-sm font-bold ${shareMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {shareMessage.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {shareMessage.text}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-start gap-3 p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl">
                  <BookOpen className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    <strong className="text-blue-400 not-italic uppercase tracking-tighter">Cryptographic Integrity:</strong> The document includes an embedded X.509 signature. Verification can be performed in real-time using the system's public key.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateForm;
