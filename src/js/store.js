import { getMarketCode } from "./utils.js";

export const apiStore = {
  data: {},
  loading: {},
  error: {},
  lastUpdated: {},
  listeners: new Set(),
  background: null,

  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  },

  notify() {
    this.listeners.forEach((callback) => callback());
  },

  setState(updater) {
    const newState = updater(this);
    Object.assign(this, newState);
    this.notify();
  },

  async fetchBackground() {
    if (this.background) {
      this.notify();
      return;
    }

    const endpoint = `/api?format=js&idx=0&n=1&mkt=${getMarketCode()}&tab=1&imgsize=1`;

    this.setState((state) => ({
      ...state,
      loading: { ...state.loading, background: true },
    }));

    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const imageData = data.images?.[0];
      if (imageData) {
        this.setState((state) => ({
          ...state,
          background: imageData,
          loading: { ...state.loading, background: false },
        }));
      } else {
        throw new Error("No image data found for background");
      }
    } catch (error) {
      this.setState((state) => ({
        ...state,
        error: { ...state.error, background: error },
        loading: { ...state.loading, background: false },
      }));
    }
  },

  async fetchData(fetchEndpoint) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      this.lastUpdated[fetchEndpoint] &&
      this.lastUpdated[fetchEndpoint] > today.getTime() &&
      this.data[fetchEndpoint]
    ) {
      this.notify(); // Notify listeners even if using cached data
      return;
    }

    this.setState((state) => ({
      ...state,
      loading: { ...state.loading, [fetchEndpoint]: true },
      error: { ...state.error, [fetchEndpoint]: null },
    }));

    try {
      const response = await fetch(fetchEndpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.setState((state) => ({
        ...state,
        data: { ...state.data, [fetchEndpoint]: data },
        loading: { ...state.loading, [fetchEndpoint]: false },
        lastUpdated: { ...state.lastUpdated, [fetchEndpoint]: Date.now() },
      }));
    } catch (error) {
      this.setState((state) => ({
        ...state,
        error: { ...state.error, [fetchEndpoint]: error },
        loading: { ...state.loading, [fetchEndpoint]: false },
      }));
    }
  },
};
