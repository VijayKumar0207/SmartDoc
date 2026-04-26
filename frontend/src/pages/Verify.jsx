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

      <div className="mt-16 bg-slate-900 border border-slate-700 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">How Verification Works</h2>
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
            <div>
              <h4 className="text-white font-bold mb-1">Binary Integrity Check</h4>
              <p className="text-slate-400">The system calculates a cryptographic hash and checks it against the digital signature embedded in the PDF.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
            <div>
              <h4 className="text-white font-bold mb-1">Certificate Authority Validation</h4>
              <p className="text-slate-400">The X.509 certificate used for signing is validated for expiration and issuer credibility.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
            <div>
              <h4 className="text-white font-bold mb-1">Extraction of Evidence</h4>
              <p className="text-slate-400">Signer details, timestamps, and algorithms are extracted to provide full transparency of the document's history.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
