import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export const fetchScans = createAsyncThunk('scans/fetch', async () => {
  return [
    { id: 's1', company_id: 'c1', status: 'completed', scan_date: new Date().toISOString(), duration: 120 },
    { id: 's2', company_id: 'c2', status: 'running', scan_date: new Date().toISOString(), duration: 10 },
    { id: 's3', company_id: 'c3', status: 'completed', scan_date: new Date().toISOString(), duration: 95 },
    { id: 's4', company_id: 'c4', status: 'completed', scan_date: new Date().toISOString(), duration: 115 },
    { id: 's5', company_id: 'c5', status: 'running', scan_date: new Date().toISOString(), duration: 25 },
  ]
})

interface ScanPayload {
  company_id: string
  status: string
  scan_date: string
  duration: number
}

interface Scan extends ScanPayload {
  id: string
}

export const createScan = createAsyncThunk('scans/create', async (payload: ScanPayload) => {
  // return the created scan (mock)
  return { id: `s_${Math.random().toString(36).slice(2, 8)}`, ...payload }
})

const scansSlice = createSlice({
  name: 'scans',
  initialState: { items: [] as Scan[] },
  reducers: {
    clearScans: (state) => {
      state.items = []
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchScans.fulfilled, (state, action) => { state.items = action.payload })
    builder.addCase(createScan.fulfilled, (state, action) => { state.items.unshift(action.payload) })
  }
})

export const { clearScans } = scansSlice.actions
export default scansSlice.reducer
