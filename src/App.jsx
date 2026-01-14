import React, { useReducer, useEffect, useState } from 'react';
import { defaultState, getGuitarLayers, guitarData, BASE_PRICE, BASE_MODEL } from './data/guitars';
import { getConfigurationFromUrl, updateUrlFromConfiguration } from './utils/urlConfig';
import GuitarPreview from './components/GuitarPreview';
import Configurator from './components/Configurator';

// Reducer for state management
const reducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE':
      return { ...state, [action.key]: action.value };
    case 'UPDATE_MULTIPLE':
      return { ...state, ...action.data };
    case 'SET_FULL':
      return action.value;
    default:
      return state;
  }
};

function App() {
  // Initialize state from URL immediately to prevent race conditions
  const [state, dispatch] = useReducer(reducer, null, () => {
    const urlConfig = getConfigurationFromUrl();
    return { ...defaultState, ...urlConfig };
  });

  const [isCopied, setIsCopied] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const calculateTotal = () => {
    let total = BASE_PRICE;

    guitarData.structure.forEach(cat => {
      const selectedId = state[cat.category_id];
      if (selectedId) {
        const item = guitarData[cat.sheet_name].find(i => i.item_id === selectedId);
        if (item) total += (item.price || 0);
      }
    });

    return total;
  };

  const getSelectedItems = () => {
    const items = [{ label: BASE_MODEL.label, name: BASE_MODEL.name, price: BASE_PRICE }];

    guitarData.structure.forEach(cat => {
      const selectedId = state[cat.category_id];
      if (selectedId) {
        const item = guitarData[cat.sheet_name].find(i => i.item_id === selectedId);
        if (item) {
          let name = item.label_us;
          if (cat.category_id === 'pickup') name += ` (${state.pickupColor})`;

          items.push({
            label: cat.label_us,
            name: name,
            price: item.price
          });
        }
      }
    });

    return items;
  };

  // Update URL whenever state changes
  useEffect(() => {
    updateUrlFromConfiguration(state);
  }, [state]);

  const layers = getGuitarLayers(state);

  const handleShare = () => {
    // Ensure URL is up to date before copying
    updateUrlFromConfiguration(state);
    const url = window.location.href;

    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-950 bg-[radial-gradient(circle_at_center,_#1e293b_0%,#020617_100%)] text-white font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-[1800px] h-full mx-auto px-4 lg:px-8 py-4 lg:py-8 flex flex-col lg:flex-row gap-4 lg:gap-12">

        {/* Left Column: Preview */}
        <div className="flex-1 flex flex-col justify-start lg:justify-center relative">
          <header className="relative lg:absolute lg:top-0 lg:left-0 lg:right-0 z-10 mb-[10px] lg:mb-0 lg:p-[18px] flex items-center justify-between">
            <h1 className="text-[26px] lg:text-[32px] font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Guitar Builder
            </h1>
            <button
              onClick={() => setIsFullscreen(true)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-2.5 rounded-full transition-all active:scale-95 group shadow-xl"
              aria-label="Open fullscreen view"
            >
              <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </header>

          <GuitarPreview layers={layers} isFullscreen={isFullscreen} setIsFullscreen={setIsFullscreen} />

          {/* Bottom Actions (Desktop: Bottom Left, Mobile: Hidden - rendered in Configurator) */}
          <div className="hidden lg:flex absolute bottom-4 left-4 z-50 flex-wrap gap-3">
            <button
              onClick={handleShare}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full text-sm font-medium transition-all active:scale-95 flex items-center gap-2"
            >
              {isCopied ? (
                <>
                  <span className="text-green-400">✓</span> Copied
                </>
              ) : (
                <>
                  <span>Share Configuration</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowQuoteModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-600/20 flex items-center gap-2"
            >
              <span>{calculateTotal().toLocaleString()} € — Request a Quote</span>
            </button>
          </div>
        </div>

        {/* Right Column: Configurator */}
        <div className="flex-1 lg:max-w-md flex flex-col justify-start h-auto lg:h-full">
          <Configurator
            state={state}
            dispatch={dispatch}
            onShare={handleShare}
            isCopied={isCopied}
            calculateTotal={calculateTotal}
            setShowQuoteModal={setShowQuoteModal}
          />
        </div>

      </div>

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 lg:p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in"
            onClick={() => setShowQuoteModal(false)}
          />
          <div className="relative bg-slate-900 border-0 lg:border lg:border-white/20 lg:rounded-[32px] w-full h-full lg:h-auto max-w-2xl lg:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-4 lg:p-8 pb-3 lg:pb-4 shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Order Summary
                </h2>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Content area */}
            <div className="px-4 lg:px-8 flex-1 min-h-0 flex flex-col mb-3 lg:mb-4 overflow-hidden">
              <div className="bg-white/5 rounded-xl lg:rounded-2xl border border-white/10 flex flex-col overflow-hidden">
                {/* Fixed Header */}
                <div className="bg-slate-900/50 backdrop-blur-md border-b border-white/10 shrink-0">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="px-2 lg:px-6 py-2 lg:py-4 text-[10px] lg:text-xs uppercase tracking-wider lg:tracking-widest text-gray-400 font-bold w-[30%]">Category</th>
                        <th className="px-2 lg:px-6 py-2 lg:py-4 text-[10px] lg:text-xs uppercase tracking-wider lg:tracking-widest text-gray-400 font-bold w-[45%]">Selection</th>
                        <th className="px-2 lg:px-6 py-2 lg:py-4 text-[10px] lg:text-xs uppercase tracking-wider lg:tracking-widest text-gray-400 font-bold text-right w-[25%]">Price</th>
                      </tr>
                    </thead>
                  </table>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto scrollbar-hide max-h-[40vh] lg:max-h-none">
                  <table className="w-full text-left border-collapse">
                    <tbody className="divide-y divide-white/5">
                      {getSelectedItems().map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-2 lg:px-6 py-2 lg:py-4 text-xs lg:text-sm text-gray-400 w-[30%]">{item.label}</td>
                          <td className="px-2 lg:px-6 py-2 lg:py-4 text-xs lg:text-sm font-medium text-white w-[45%] break-words">{item.name}</td>
                          <td className="px-2 lg:px-6 py-2 lg:py-4 text-xs lg:text-sm font-mono text-right text-gray-300 w-[25%] whitespace-nowrap">
                            {item.price > 0 ? `+${item.price} €` : (item.price === 0 ? 'Inc.' : `${item.price} €`)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Estimated Price - Outside table container */}
              <div className="bg-blue-600/10 border border-white/10 rounded-xl lg:rounded-2xl mt-3 lg:mt-4 shrink-0 px-3 lg:px-6 py-4 lg:py-6 flex justify-between items-center">
                <span className="text-base lg:text-lg font-bold text-white">Total Estimated Price</span>
                <span className="text-xl lg:text-2xl font-black text-blue-400">
                  {calculateTotal().toLocaleString()} €
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 lg:p-8 pt-3 lg:pt-4 shrink-0 border-t border-white/5 bg-slate-900/50 backdrop-blur-sm pb-safe">
              <div className="mb-4 lg:mb-6">
                <label htmlFor="email" className="block text-[10px] lg:text-xs uppercase tracking-wider lg:tracking-widest text-gray-400 font-bold mb-2 lg:mb-3">
                  Your Email / Kontakt
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 lg:px-6 py-3 lg:py-4 text-white placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div className="flex gap-3 lg:gap-4">
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="flex-1 py-3 lg:py-4 px-4 lg:px-6 border border-white/10 rounded-xl font-bold text-sm lg:text-base text-gray-400 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!email) {
                      alert('Please enter your email address.');
                      return;
                    }
                    if (!email.includes('@')) {
                      alert('Please enter a valid email address.');
                      return;
                    }
                    alert(`Quote request sent successfully to ${email}!`);
                    setShowQuoteModal(false);
                  }}
                  className="flex-[2] py-3 lg:py-4 px-4 lg:px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm lg:text-base rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
