import React from 'react';
import GenerateForm from '../components/GenerateForm';
import { FilePlus } from 'lucide-react';

const Generate = () => {
  return (
    <div className="w-full py-10 space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Certificate Minting Engine</h1>
        <p className="text-slate-400 text-lg">Input recipient details to generate a cryptographically signed PDF certificate.</p>
      </div>
      
      <GenerateForm />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 bg-slate-800 p-8 rounded-xl border border-slate-700">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-blue-400 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-400"></div> RSA Signature
          </h3>
          <p className="text-slate-300 leading-relaxed">
            Every document is signed using an RSA-2048 private key. This ensures that the document originates from our system and has not been altered since generation.
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-purple-400 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-400"></div> Metadata Embedding
          </h3>
          <p className="text-slate-300 leading-relaxed">
            JSON metadata is embedded directly into the QR code shown on the certificate, allowing for quick offline verification of the student's details.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Generate;
