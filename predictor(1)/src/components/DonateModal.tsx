import React, { useState } from 'react';
import { X, Copy, Check, QrCode } from 'lucide-react';

interface DonateModalProps {
  onClose: () => void;
}

export default function DonateModal({ onClose }: DonateModalProps) {
  const [activeTab, setActiveTab] = useState<'upi' | 'crypto'>('upi');
  const [copied, setCopied] = useState('');

  const cryptoAddresses = [
    { name: 'Bitcoin (BTC)', address: '19Ra1Uz11yHT4PzFrmQvLR8BzgyhwAMYJW', icon: '₿' },
    { name: 'Ethereum (Polygon)', address: '0xc2132...1D8F', full: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f@137/transfer?address=0x357362107EECdd6678715ECCf7A96c0b52551D8F', icon: 'Ξ' },
    { name: 'Ethereum (USDT/ERC20)', address: '0xdac17...1D8F', full: '0xdac17f958d2ee523a2206206994597c13d831ec7@1/transfer?address=0x357362107EECdd6678715ECCf7A96c0b52551D8F', icon: 'Ξ' },
    { name: 'Ethereum (ETH)', address: '0x95ad6...1D8F', full: '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce@1/transfer?address=0x357362107EECdd6678715ECCf7A96c0b52551D8F', icon: 'Ξ' }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-[var(--bg-color)] border border-[var(--border-color)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden fade-in">
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
          <h2 className="text-xl font-bold tracking-tight">Support the Creator</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-[var(--accent-bg)] hover:bg-[var(--card-bg)] rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          <div className="flex bg-[var(--accent-bg)] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('upi')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'upi' ? 'bg-[var(--card-bg)] shadow-md text-fuchsia-500' : 'text-slate-500 hover:text-[var(--text-color)]'
              }`}
            >
              <QrCode size={16} /> UPI
            </button>
            <button
              onClick={() => setActiveTab('crypto')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'crypto' ? 'bg-[var(--card-bg)] shadow-md text-fuchsia-500' : 'text-slate-500 hover:text-[var(--text-color)]'
              }`}
            >
              <span className="font-serif">₿</span> Crypto
            </button>
          </div>

          {activeTab === 'upi' ? (
            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <div className="bg-white p-3 rounded-2xl shadow-inner border border-slate-200">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=samihanchatterjee@fam&pn=Samihan+Chatterjee&am=50.00&cu=INR&tn=Wonderful+Website" 
                  alt="UPI QR Code"
                  className="w-48 h-48 rounded-lg"
                />
              </div>
              <p className="text-sm font-mono text-[var(--muted-text)]">Scan to pay via any UPI app</p>
              
              <button 
                onClick={() => window.open('https://upi.pe/samihanchatterjee@fam/50.00?pn=Samihan+Chatterjee&tn=Wonderful+Website', '_blank')}
                className="w-full mt-4 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-fuchsia-900/20"
              >
                Pay via App
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cryptoAddresses.map((crypto, idx) => (
                <div key={idx} className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-[var(--text-color)]">
                    <span className="w-6 h-6 rounded-full bg-[var(--accent-bg)] flex items-center justify-center text-xs">
                      {crypto.icon}
                    </span>
                    {crypto.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-[var(--accent-bg)] font-mono text-[10px] sm:text-xs overflow-hidden text-ellipsis p-2 rounded-lg border border-[var(--border-color)]">
                      {crypto.full || crypto.address}
                    </div>
                    <button
                      onClick={() => handleCopy(crypto.full || crypto.address, crypto.name)}
                      className="p-2 bg-[var(--accent-bg)] border border-[var(--border-color)] hover:border-fuchsia-500 rounded-lg transition-colors group"
                      title="Copy Address"
                    >
                      {copied === crypto.name ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} className="text-[var(--muted-text)] group-hover:text-fuchsia-500 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
