import React, { useReducer, useEffect, useState } from 'react';
import { defaultState, getGuitarLayers, guitarData, BASE_PRICE } from './data/guitars';
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
    const items = [{ label: 'Base Model', name: 'Guitar Body', price: BASE_PRICE }];

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
    <div className="h-screen overflow-hidden bg-slate-950 bg-[radial-gradient(circle_at_center,_#1e293b_0%,#020617_100%)] text-white font-sans selection:bg-blue-500 selection:text-white">
      <div className="max-w-[1800px] h-full mx-auto px-4 lg:px-8 py-4 lg:py-8 flex flex-col lg:flex-row gap-4 lg:gap-12">

        {/* Left Column: Preview */}
        <div className="flex-1 flex flex-col justify-start lg:justify-center relative">
          <header className="relative lg:absolute lg:top-0 lg:left-0 z-10 mb-2 lg:mb-0 lg:p-4 text-center lg:text-left">
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Guitar Builder
            </h1>
          </header>

          <GuitarPreview layers={layers} />

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
        <div className="flex-1 lg:max-w-md flex flex-col justify-end lg:justify-start h-full">
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
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in"
            onClick={() => setShowQuoteModal(false)}
          />
          <div className="relative bg-slate-900 border border-white/20 rounded-[32px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                  Order Summary
                </h2>
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 mb-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Category</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Selection</th>
                      <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-bold text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getSelectedItems().map((item, idx) => (
                      <tr key={idx} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-400">{item.label}</td>
                        <td className="px-6 py-4 text-sm font-medium text-white">{item.name}</td>
                        <td className="px-6 py-4 text-sm font-mono text-right text-gray-300">
                          {item.price > 0 ? `+${item.price} €` : (item.price === 0 ? 'Inc.' : `${item.price} €`)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-blue-600/10">
                      <td colSpan="2" className="px-6 py-6 text-lg font-bold text-white">Total Estimated Price</td>
                      <td className="px-6 py-6 text-2xl font-black text-blue-400 text-right">
                        {calculateTotal().toLocaleString()} €
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowQuoteModal(false)}
                  className="flex-1 py-4 px-6 border border-white/10 rounded-xl font-bold text-gray-400 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert('Quote request sent successfully!');
                    setShowQuoteModal(false);
                  }}
                  className="flex-[2] py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
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
