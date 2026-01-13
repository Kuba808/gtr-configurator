import gtrConfig from '../../gtr-configurator.json';

export const BASE_PRICE = 0;
export const guitarData = gtrConfig;

// Helper to resolve image path based on state
export const getGuitarLayers = (state) => {
    const layers = [];

    // Iterate through the categories in the JSON structure
    gtrConfig.structure.forEach(cat => {
        const value = state[cat.category_id];
        if (!value) return;

        // Find the item in the corresponding data sheet
        const sheetData = gtrConfig[cat.sheet_name];
        const item = sheetData.find(i => i.item_id === value);

        if (item && item.image) {
            layers.push({
                id: cat.category_id,
                src: `/gtr-configurator/${item.image}`,
                zIndex: cat.z_index
            });
        }

        // Special handling for pick-up variants (color) if not in JSON schema explicitly as a category
        // In the current JSON, pickups are simple items. 
        // If the state has 'pickupColor', we might need to handle it.
        // For now, let's stick to the JSON truth.
    });

    // Handle pickup color if it's still a separate state not in JSON structure
    if (state.pickup && state.pickupColor) {
        const pickup = gtrConfig.data_pickup.find(p => p.item_id === state.pickup);
        if (pickup) {
            // The JSON currently has "image/pickup-seymour-black.webp"
            // We can try to replace "black" with the selected color if it follows the pattern
            const src = pickup.image.replace('black', state.pickupColor);
            const layer = layers.find(l => l.id === 'pickup');
            if (layer) layer.src = `/gtr-configurator/${src}`;
        }
    }

    return layers.sort((a, b) => a.zIndex - b.zIndex);
};

export const defaultState = {
    'top-wood': 'wood-flamed',
    'color': 'col-flm-aqua',
    'hardware': 'hw-chrome',
    'pickup': 'pu-sd',
    'pickupColor': 'black',
    'knobs': 'knob-gold',
    'rings': 'ring-creme'
};
