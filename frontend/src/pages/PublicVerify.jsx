import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { docGenerationService } from '../services/api';
import { ShieldCheck, AlertCircle, Loader2, GraduationCap, User, Hash, BookOpen, Calendar, CheckCircle2 } from 'lucide-react';

const PublicVerify = () => {
    const { uuid } = useParams();
    const [loading, setLoading] = useState(true);
    const [doc, setDoc] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDoc = async () => {
            try {
                setLoading(true);
                const response = await docGenerationService.verifyPublic(uuid);
                setDoc(response.data);
            } catch (err) {
                console.error('Final verification error:', err);
                setError('Invalid verification link or document not found.');
            } finally {
                setLoading(false);
            }
        };

        if (uuid) fetchDoc();
    }, [uuid]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Authenticating Record...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-500/10 p-6 rounded-full mb-6 border border-red-500/20">
                    <AlertCircle className="h-16 w-16 text-red-500" />
                </div>
                <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Verification Failed</h1>
                <p className="text-slate-400 max-w-xs leading-relaxed">{error}</p>
                <div className="mt-10 h-1 w-20 bg-red-500/30 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 py-12 md:p-10">
            <div className="max-w-md w-full">
                {/* Status Badge */}
                <div className="flex justify-center mb-8">
                    <div className="bg-green-500/10 border border-green-500/30 px-6 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-green-900/10">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-xs font-black text-green-400 uppercase tracking-widest">Officially Verified</span>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
                    
                    {/* Header */}
                    <div className="p-8 text-center border-b border-white/5 bg-slate-900/50">
                        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-900/40">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-2">Smart Document</h2>
                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.3em] opacity-80">Authenticity Certificate</p>
                    </div>

                    {/* Student Info */}
                    <div className="p-8 space-y-8">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                <User className="h-5 w-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Student Name</p>
                                <p className="text-xl font-bold text-white">{doc.student.name}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                    <Hash className="h-4 w-4 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Reg Number</p>
                                    <p className="text-sm font-bold text-white font-mono">{doc.student.register_number}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                    <BookOpen className="h-4 w-4 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-0.5">Branch</p>
                                    <p className="text-sm font-bold text-white">{doc.student.branch}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                                <GraduationCap className="h-5 w-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Academic Year</p>
                                <p className="text-lg font-bold text-white">Year {doc.student.year}</p>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-8 bg-slate-950/50 border-t border-white/5 space-y-4">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-slate-500" />
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Issued On</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-300">{new Date(doc.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="pt-2">
                            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                <p className="text-[9px] text-slate-500 leading-relaxed italic text-center">
                                    This document is cryptographically signed using RSA-2048 and secured by the Smart Document Verification System.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-10 text-[10px] text-slate-600 font-bold uppercase tracking-widest px-10 leading-loose">
                    Security ID: <span className="text-slate-500 font-mono">{uuid.substring(0, 18).toUpperCase()}...</span>
                </p>
            </div>
        </div>
    );
};

export default PublicVerify;
