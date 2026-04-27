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
    </div>
  );
};

export default Generate;
