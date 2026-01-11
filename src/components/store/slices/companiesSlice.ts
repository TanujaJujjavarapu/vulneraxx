import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

export type Company = {
  id: string
  name: string
  url?: string
  environment?: string
  risk_score?: number
  files_analyzed?: number
}

export const fetchCompanies = createAsyncThunk<Company[]>('companies/fetch', async () => {
  // Returns empty array - companies are imported via CSV import, not fetched
  return []
})

type CompaniesState = { items: Company[] }

const initialState: CompaniesState = { items: [] }

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    clearCompanies: (state) => {
      state.items = []
    },
    importCompanies: (state, action) => {
      state.items = [...state.items, ...action.payload]
    },
    addCompany: (state, action) => {
      state.items.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchCompanies.fulfilled, (state, action) => {
      state.items = action.payload
    })
  }
})

export const { clearCompanies, importCompanies, addCompany } = companiesSlice.actions
export default companiesSlice.reducer
