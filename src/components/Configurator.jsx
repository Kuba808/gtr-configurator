import React, { useState } from 'react';
import { guitarData } from '../data/guitars';

const Configurator = ({ state, dispatch, onShare, isCopied, calculateTotal, setShowQuoteModal }) => {
    const [activeCategory, setActiveCategory] = useState(null);

    const [isClosing, setIsClosing] = useState(false);

    const closeSheet = () => {
        setIsClosing(true);
        setTimeout(() => {
            setActiveCategory(null);
            setIsClosing(false);
        }, 300);
    };

    const update = (key, value) => {
        // If this category has dependent categories, reset them
        const dependents = guitarData.structure.filter(cat => cat.is_dependent && cat.depends_on === key);
        if (dependents.length > 0) {
            const updates = { [key]: value };
            dependents.forEach(dep => {
                updates[dep.category_id] = null;
            });
            dispatch({ type: 'UPDATE_MULTIPLE', data: updates });
        } else {
            dispatch({ type: 'UPDATE', key, value });
        }

        // Auto-close sheet on mobile after selection with animation
        if (activeCategory) {
            closeSheet();
        }
    };

    const categories = guitarData.structure.map(cat => {
        const item = guitarData[cat.sheet_name].find(i => i.item_id === state[cat.category_id]);
        let value = item?.label_us || 'None';

        // Add variant info for pickups
        if (cat.category_id === 'pickup' && state.pickupColor) {
            value += ` (${state.pickupColor})`;
        }

        return {
            id: cat.category_id,
            label: cat.label_us,
            value: value
        };
    });

    const renderCategoryOptions = (categoryId) => {
        const category = guitarData.structure.find(c => c.category_id === categoryId);
        if (!category) return null;

        let items = guitarData[category.sheet_name];

        // Filter by dependency if applicable
        if (category.is_dependent) {
            const parentValue = state[category.depends_on];
            items = items.filter(item => item.depends_on === parentValue);
        }

        const isColor = categoryId === 'color';

        return (
            <div className="space-y-3">
                <div className={isColor ? "grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-2 lg:gap-1.5" : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2 lg:gap-1.5"}>
                    {items.map((item) => (
                        <button
                            key={item.item_id}
                            onClick={() => update(categoryId, item.item_id)}
                            className={isColor
                                ? `group relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${state[categoryId] === item.item_id ? 'border-blue-500' : 'border-white/10'}`
                                : `p-2 lg:p-1.5 rounded-lg border text-sm transition-all ${state[categoryId] === item.item_id ? 'border-blue-500 bg-blue-500/20 text-white' : 'border-white/10 text-gray-400'}`
                            }
                        >
                            {isColor ? (
                                <>
                                    <img
                                        src={`${import.meta.env.BASE_URL}${item.color_thumbnail || item.image}`}
                                        alt={item.label_us}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.parentElement.style.backgroundColor = '#1e293b';
                                        }}
                                    />
                                    {item.price > 0 && (
                                        <div className="absolute bottom-1 right-1 bg-blue-600 px-2 py-0.5 rounded text-sm font-black text-white shadow-lg pointer-events-none">
                                            +{item.price} €
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <span>{item.label_us}</span>
                                    {item.price > 0 && (
                                        <span className={`text-sm font-bold mt-0.5 ${state[categoryId] === item.item_id ? 'text-white' : 'text-blue-400'}`}>
                                            +{item.price} €
                                        </span>
                                    )}
                                </div>
                            )}
                            {isColor && <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </button>
                    ))}
                </div>

                {/* Special case for Pickup Colors - keeping it for now as it's a popular feature */}
                {
                    categoryId === 'pickup' && (
                        <div className="flex gap-2 pt-2 border-t border-white/5">
                            {['black', 'gold', 'silver'].map(variant => (
                                <button
                                    key={variant}
                                    onClick={() => dispatch({ type: 'UPDATE', key: 'pickupColor', value: variant })}
                                    className={`px-4 py-2 rounded-full border text-sm capitalize transition-all ${state.pickupColor === variant
                                        ? 'border-blue-500 bg-blue-500/20 text-white'
                                        : 'border-white/10 text-gray-400'
                                        }`}
                                >
                                    {variant}
                                </button>
                            ))}
                        </div>
                    )
                }
            </div >
        );
    };

    return (
        <div className="flex-1 flex flex-col lg:h-full">
            {/* Desktop View */}
            <div className="hidden lg:flex lg:flex-col h-full overflow-y-auto scrollbar-custom scroll-fade pr-4 pb-12">
                <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4">Configuration</h2>
                {categories.map(cat => (
                    <div key={cat.id} className="mb-6 last:mb-0">
                        <label className="block text-sm uppercase tracking-widest text-gray-400 font-bold mb-3">
                            {cat.label} {cat.id === 'color' && <span className="text-blue-400">: {cat.value}</span>}
                        </label>
                        {renderCategoryOptions(cat.id)}
                    </div>
                ))}
            </div>

            {/* Mobile View: Category List */}
            <div className="lg:hidden flex flex-col gap-6 pb-12 mt-4">
                <div className="grid grid-cols-2 gap-3">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 p-4 rounded-xl text-left transition-all active:scale-95 group"
                        >
                            <span className="block text-sm uppercase tracking-wider text-gray-500 font-bold mb-1">{cat.label}</span>
                            <span className="block text-sm text-white font-medium truncate group-active:text-blue-400">{cat.value}</span>
                        </button>
                    ))}
                </div>

                {/* Mobile Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => setShowQuoteModal(true)}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <span>{calculateTotal().toLocaleString()} € — Request a Quote</span>
                    </button>
                    <button
                        onClick={onShare}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-xl text-sm font-medium text-gray-300 transition-all active:scale-95 flex items-center justify-center gap-2"
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
                </div>
            </div>

            {/* Mobile Bottom Sheet Overlay */}
            {activeCategory && (
                <div className="lg:hidden fixed inset-0 z-[100] flex flex-col justify-end">
                    {/* Backdrop */}
                    <div
                        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? 'fade-out' : 'fade-in'}`}
                        onClick={closeSheet}
                    />

                    {/* Sheet Content */}
                    <div className={`relative bg-slate-900 border-t border-white/20 rounded-t-[32px] p-6 pb-12 shadow-2xl animate-in ${isClosing ? 'slide-out-to-bottom' : 'slide-in-from-bottom'}`}>
                        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" onClick={closeSheet} />

                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-white">
                                {categories.find(c => c.id === activeCategory)?.label}
                            </h3>
                            <button
                                onClick={closeSheet}
                                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="max-h-[50vh] overflow-y-auto scrollbar-hide">
                            {renderCategoryOptions(activeCategory)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Configurator;

