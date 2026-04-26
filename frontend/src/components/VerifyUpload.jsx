import React, { useState } from 'react';
import { verifyService } from '../services/api';
import { Upload, ShieldCheck, ShieldAlert, FileSearch, Info, CheckCircle, XCircle } from 'lucide-react';

const VerifyUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleVerify = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await verifyService.verify(file);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
          <FileSearch className="h-6 w-6 text-blue-400" />
          Cryptographic Verifier
        </h2>

        <div className="space-y-8">
          <div className="relative group">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${
              file ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 bg-slate-800/50 group-hover:border-slate-600'
            }`}>
              <Upload className={`h-12 w-12 mx-auto mb-4 transition-transform group-hover:-translate-y-1 ${
                file ? 'text-blue-400' : 'text-slate-500'
              }`} />
              <p className="text-xl text-slate-300 font-medium mb-1">
                {file ? file.name : 'Drop PDF certificate here'}
              </p>
              <p className="text-slate-500 text-sm italic">
                Supports only digitally signed .pdf files
              </p>
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={!file || loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>ANALYZING BINARY INTEGRITY...</span>
              </>
            ) : (
              <span>LAUNCH VERIFICATION ENGINE</span>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-8 p-4 bg-red-950/30 border border-red-500/50 rounded-xl text-red-400 flex items-center gap-3">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
      </div>

      {result && (
        <div className="animate-in zoom-in-95 duration-500">
          <div className={`p-8 rounded-2xl border shadow-xl ${
            result.status === 'VALID' 
              ? 'bg-emerald-950/20 border-emerald-500/30' 
              : 'bg-rose-950/20 border-rose-500/30'
          }`}>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${
                  result.status === 'VALID' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                }`}>
                  {result.status === 'VALID' ? (
                    <ShieldCheck className="h-10 w-10 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="h-10 w-10 text-rose-400" />
                  )}
                </div>
                <div>
                  <h3 className={`text-3xl font-black tracking-tight ${
                    result.status === 'VALID' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {result.status}
                  </h3>
                  <p className="text-slate-400 font-medium">Document Authenticity Assessment</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <StatusBadge label="INTEGRITY" success={result.document_intact} />
                <StatusBadge label="SIGNATURE" success={result.signature_valid} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Info className="h-4 w-4" /> Identity Artifacts
                </h4>
                <div className="space-y-4">
                  <DataRow label="Common Name" value={result.signer_name} />
                  <DataRow label="Authorized By" value={result.issuer} />
                  <DataRow label="Encryption" value={result.algorithm} />
                </div>
              </div>

              <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl space-y-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Certification Lifecycle
                </h4>
                <div className="space-y-4">
                  <DataRow label="Certified on" value={formatDate(result.valid_from)} />
                  <DataRow label="Expires on" value={formatDate(result.valid_to)} />
                  <div className="pt-2">
                    <div className={`text-xs font-bold px-3 py-1 rounded-full inline-block ${
                      result.document_intact ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {result.document_intact ? '✓ ZERO BINARY ALTERATIONS' : '⚠ TAMPERING DETECTED'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ label, success }) => (
  <div className={`px-4 py-2 rounded-lg flex items-center gap-2 border ${
    success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
  }`}>
    {success ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
    <span className="text-xs font-black tracking-tighter">{label}</span>
  </div>
);

const DataRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-bold text-slate-600 uppercase mb-1">{label}</span>
    <span className="text-slate-200 font-semibold truncate">{value || 'N/A'}</span>
  </div>
);

const formatDate = (dateStr) => {
  if (!dateStr || dateStr === 'N/A') return 'N/A';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

const Loader2 = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);

export default VerifyUpload;
