import React, { useState } from 'react';

const GuitarPreview = ({ layers }) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [initialPinchDistance, setInitialPinchDistance] = useState(null);
    const [initialScale, setInitialScale] = useState(1);

    // Funkce pro výpočet vzdálenosti mezi dvěma prsty
    const getDistance = (touch1, touch2) => {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e) => {
        if (e.touches.length === 1) {
            // Jednoprstový dotyk - posuv
            setIsDragging(true);
            // Pro rotaci -90°: transformujeme souřadnice a invertujeme směr
            // Prohození os: clientX -> Y, clientY -> -X
            const transformedX = -e.touches[0].clientY;
            const transformedY = e.touches[0].clientX;
            setDragStart({
                x: transformedX - position.x,
                y: transformedY - position.y
            });
        } else if (e.touches.length === 2) {
            // Dvouprstový dotyk - pinch zoom
            setIsDragging(false);
            const distance = getDistance(e.touches[0], e.touches[1]);
            setInitialPinchDistance(distance);
            setInitialScale(scale);
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 1 && isDragging) {
            // Jednoprstový posuv
            // Pro rotaci -90°: transformujeme souřadnice a invertujeme směr
            // Prohození os: clientX -> Y, clientY -> -X
            const transformedX = -e.touches[0].clientY;
            const transformedY = e.touches[0].clientX;
            setPosition({
                x: transformedX - dragStart.x,
                y: transformedY - dragStart.y
            });
        } else if (e.touches.length === 2 && initialPinchDistance) {
            // Dvouprstový pinch zoom
            e.preventDefault(); // Zabránit defaultnímu zoom prohlížeče
            const currentDistance = getDistance(e.touches[0], e.touches[1]);
            const scaleChange = currentDistance / initialPinchDistance;
            const newScale = Math.min(Math.max(initialScale * scaleChange, 1), 3);
            setScale(newScale);
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setInitialPinchDistance(null);
    };

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.3, 3));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.3, 1));
    };

    const handleResetZoom = () => {
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const openFullscreen = () => {
        setIsFullscreen(true);
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    const closeFullscreen = () => {
        setIsFullscreen(false);
        setScale(1);
        setPosition({ x: 0, y: 0 });
    };

    return (
        <>
            {/* Normal Preview */}
            <div className="relative w-full aspect-[4/3] lg:aspect-[16/9] max-h-[35vh] lg:max-h-[85vh] flex items-center justify-center px-4 lg:px-0 lg:pr-24 transition-all duration-500">
                <div className="relative w-full h-full lg:max-w-none mx-auto flex items-center justify-center transform scale-95 lg:scale-105">
                    {layers.map((layer) => (
                        <img
                            key={layer.id}
                            src={layer.src}
                            alt={layer.id}
                            className="absolute w-full h-full object-contain pointer-events-none transition-opacity duration-300"
                            style={{ zIndex: layer.zIndex }}
                        />
                    ))}
                </div>

                {/* Fullscreen Button (Mobile Only) */}
                <button
                    onClick={openFullscreen}
                    className="lg:hidden absolute top-2 right-2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-2 rounded-full transition-all active:scale-95"
                    aria-label="Open fullscreen view"
                >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                </button>
            </div>

            {/* Fullscreen Modal */}
            {isFullscreen && (
                <div className="fixed inset-0 z-[300] bg-slate-950 flex flex-col">
                    {/* Header */}
                    <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-slate-950 to-transparent">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">Guitar Preview</h3>
                            <button
                                onClick={closeFullscreen}
                                className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-2 rounded-full transition-all active:scale-95"
                                aria-label="Close fullscreen"
                            >
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Guitar Container - Rotated 90 degrees */}
                    <div
                        className="flex-1 flex items-center justify-center overflow-hidden touch-none"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div
                            className="relative w-[90vh] h-[90vw] flex items-center justify-center"
                            style={{
                                transform: `rotate(-90deg) translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                            }}
                        >
                            {layers.map((layer) => (
                                <img
                                    key={layer.id}
                                    src={layer.src}
                                    alt={layer.id}
                                    className="absolute w-full h-full object-contain pointer-events-none"
                                    style={{ zIndex: layer.zIndex }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-slate-950 to-transparent">
                        <div className="flex justify-center items-center gap-3">
                            <button
                                onClick={handleZoomOut}
                                disabled={scale <= 1}
                                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md border border-white/20 px-6 py-3 rounded-full transition-all active:scale-95 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                                </svg>
                                <span className="text-white font-medium">Zoom Out</span>
                            </button>

                            <button
                                onClick={handleResetZoom}
                                className="bg-blue-600 hover:bg-blue-500 backdrop-blur-md border border-blue-500/20 px-6 py-3 rounded-full transition-all active:scale-95"
                            >
                                <span className="text-white font-medium">{Math.round(scale * 100)}%</span>
                            </button>

                            <button
                                onClick={handleZoomIn}
                                disabled={scale >= 3}
                                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-md border border-white/20 px-6 py-3 rounded-full transition-all active:scale-95 flex items-center gap-2"
                            >
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
                                <span className="text-white font-medium">Zoom In</span>
                            </button>
                        </div>

                        <p className="text-center text-gray-400 text-sm mt-3">
                            Pinch or use buttons to zoom • Drag to pan
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default GuitarPreview;
