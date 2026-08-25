import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AppState {
  isOnline: boolean;
}

// Check initial state from localStorage if running in browser
const getInitialOnlineState = (): boolean => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('moncradel_rider_online');
    if (saved !== null) {
      return saved === 'true';
    }
  }
  return true; // Default to online
};

const initialState: AppState = {
  isOnline: getInitialOnlineState(),
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('moncradel_rider_online', action.payload ? 'true' : 'false');
        // Dispatch event for legacy components that might still depend on it
        window.dispatchEvent(
          new CustomEvent('rider-status-changed', {
            detail: { isOnline: action.payload },
          })
        );
      }
    },
    toggleOnlineStatus: (state) => {
      const newStatus = !state.isOnline;
      state.isOnline = newStatus;
      if (typeof window !== 'undefined') {
        localStorage.setItem('moncradel_rider_online', newStatus ? 'true' : 'false');
        window.dispatchEvent(
          new CustomEvent('rider-status-changed', {
            detail: { isOnline: newStatus },
          })
        );
      }
    }
  },
});

export const { setOnlineStatus, toggleOnlineStatus } = appSlice.actions;
export default appSlice.reducer;
