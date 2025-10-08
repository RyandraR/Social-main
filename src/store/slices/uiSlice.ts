import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type UiState = { search: string; filterCategory: string | null };

const initialState: UiState = { search: '', filterCategory: null };

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    setFilterCategory(state, action: PayloadAction<string | null>) {
      state.filterCategory = action.payload;
    },
  },
});

export const { setSearch, setFilterCategory } = uiSlice.actions;
export default uiSlice.reducer;
