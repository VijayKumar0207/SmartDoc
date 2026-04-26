import React, { useState, useEffect } from 'react';
import { studentService } from '../services/api';
import { UserPlus, Users, Search, Filter, BookOpen, GraduationCap, Mail, Calendar, Hash, CheckCircle2, XCircle } from 'lucide-react';

const AcademicEntry = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [formData, setFormData] = useState({
        name: '',
        register_number: '',
        branch: '',
        year: 1,
        email: ''
    });

    const branches = ['CSE', 'ECE', 'MECH', 'CIVIL', 'IT'];

    useEffect(() => {
        fetchStudents();
    }, [selectedBranch]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await studentService.list(selectedBranch || '');
            setStudents(response.data || []);
        } catch (err) {
            console.error('Failed to fetch students:', err);
            setStudents([]); // Ensure students is an empty array on error to stop loader
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            fetchStudents();
            return;
        }
        try {
            setLoading(true);
            const response = await studentService.search(searchQuery.trim());
            setStudents(response.data || []);
        } catch (err) {
            console.error('Search failed:', err);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'year' ? (value === '' ? '' : parseInt(value)) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setMessage({ text: '', type: '' });

        try {
            console.log('Submitting student data:', formData);
            const response = await studentService.create(formData);
            console.log('Creation response:', response.data);

            setMessage({ text: 'Student added successfully!', type: 'success' });
            setFormData({ name: '', register_number: '', branch: '', year: 1, email: '' });
            setShowAddForm(false);
            await fetchStudents();

            // Clear success message after delay
            setTimeout(() => setMessage(prev => prev.type === 'success' ? { text: '', type: '' } : prev), 5000);
        } catch (err) {
            console.error('Student creation error:', err);
            const errorMsg = err.response?.data?.detail || err.message || 'Failed to add student. Ensure Register Number is unique.';
            setMessage({
                text: typeof errorMsg === 'string' ? errorMsg : 'Check your inputs and try again.',
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight border-b border-blue-500 pb-2 inline-block">
                        Academic Entry
                    </h1>
                    <p className="mt-2 text-slate-400">Manage student enrollment and records.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                    <UserPlus className="h-5 w-5" />
                    <span>{showAddForm ? 'Close Form' : 'Add New Student'}</span>
                </button>
            </header>

            {/* Status Message */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center space-x-3 border ${message.type === 'success' ? 'bg-green-900/20 border-green-500/50 text-green-400' : 'bg-red-900/20 border-red-500/50 text-red-400'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            {/* Add Student Form */}
            {showAddForm && (
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl animate-in slide-in-from-top duration-500">
                    <div className="flex items-center space-x-2 mb-6">
                        <GraduationCap className="h-6 w-6 text-blue-400" />
                        <h2 className="text-2xl font-bold text-white">Enroll New Student</h2>
                    </div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Full Name</label>
                            <input
                                required
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Enter student name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Register Number</label>
                            <input
                                required
                                name="register_number"
                                value={formData.register_number}
                                onChange={handleInputChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="e.g. REG12345"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Branch</label>
                            <select
                                required
                                name="branch"
                                value={formData.branch}
                                onChange={handleInputChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="">Select Branch</option>
                                {branches.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Year of Study</label>
                            <input
                                required
                                type="number"
                                min="1"
                                max="4"
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Email Address</label>
                            <input
                                required
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="student@university.edu"
                            />
                        </div>
                        <div className="md:col-span-2 pt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/40 active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? 'Processing Enrollment...' : 'Submit Registration'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <form onSubmit={handleSearch} className="relative flex-grow group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name or reg number..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors shadow-lg"
                    />
                </form>
                <div className="flex items-center space-x-3 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 shadow-lg">
                    <Filter className="h-5 w-5 text-blue-400" />
                    <select
                        value={selectedBranch}
                        onChange={(e) => setSelectedBranch(e.target.value)}
                        className="bg-transparent text-white focus:outline-none cursor-pointer font-medium"
                    >
                        <option value="">All Branches</option>
                        {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                </div>
            </div>

            {/* Student Table */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-400" />
                    <h2 className="text-xl font-bold text-white">Enrolled Students</h2>
                    <span className="ml-2 px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20">
                        {students.length} Total
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900 text-slate-400 uppercase text-xs font-bold tracking-widest">
                            <tr>
                                <th className="px-6 py-4">Register No</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Branch</th>
                                <th className="px-6 py-4">Year</th>
                                <th className="px-6 py-4">Email</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center">
                                        <div className="flex items-center justify-center space-x-2 text-blue-400">
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400 border-t-transparent"></div>
                                            <span className="font-medium animate-pulse">Loading dataset...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : students.length > 0 ? (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-700/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap font-mono text-blue-400 font-bold tracking-wider">
                                            {student.register_number}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                                            {student.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 bg-slate-900 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 group-hover:border-blue-500/30 transition-colors">
                                                {student.branch}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                                            Year {student.year}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm italic">
                                            {student.email}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic">
                                        No students found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AcademicEntry;
