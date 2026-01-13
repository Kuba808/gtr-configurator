import { defaultState } from '../data/guitars';

export const getConfigurationFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const config = { ...defaultState };
    let hasParams = false;

    for (const key of Object.keys(defaultState)) {
        const value = params.get(key);
        if (value) {
            config[key] = value;
            hasParams = true;
        }
    }
    return config;
};

export const updateUrlFromConfiguration = (config) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(config)) {
        if (value !== null && value !== undefined) {
            params.set(key, value);
        }
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
};
