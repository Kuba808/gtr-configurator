import React from 'react';

const GuitarPreview = ({ layers }) => {
    return (
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
        </div>
    );
};

export default GuitarPreview;
