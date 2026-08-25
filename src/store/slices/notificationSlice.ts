import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/axios';

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        return res.data.data;
      }
      return rejectWithValue(res.data.message || 'Failed to fetch notifications');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error fetching notifications');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.data.success) {
        return id;
      }
      return rejectWithValue('Failed to mark as read');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error marking as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/notifications/${id}`);
      if (res.data.success) {
        return id;
      }
      return rejectWithValue('Failed to delete notification');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Error deleting notification');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // We can add sync reducers here if needed (e.g. adding a real-time notification)
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
        state.unreadCount = state.items.filter(n => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Mark as Read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const id = action.payload;
        const notification = state.items.find(n => n._id === id);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Delete
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const id = action.payload;
        const notification = state.items.find(n => n._id === id);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.items = state.items.filter(n => n._id !== id);
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
