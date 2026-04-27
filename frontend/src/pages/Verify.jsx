import React from 'react';
import VerifyUpload from '../components/VerifyUpload';
import { Search } from 'lucide-react';

const Verify = () => {
  return (
    <div className="w-full py-10 space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <Search className="h-10 w-10 text-blue-500" />
          Document Verifier
        </h1>
        <p className="text-slate-400 text-lg">Upload any signed PDF to check its authenticity and detect potential tampering.</p>
      </div>

      <VerifyUpload />
    </div>
  );
};

export default Verify;
