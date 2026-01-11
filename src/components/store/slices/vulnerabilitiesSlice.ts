import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

interface Vulnerability {
  id: string
  risk_id?: string  // Risk ID from CSV
  title: string
  category: string
  company_id: string
  company_name?: string  // Optional field for imported vulnerabilities
  domain?: string  // Optional field for domain information
  severity: 'critical' | 'high' | 'medium' | 'low'
  status: 'open' | 'fixed' | 'in_progress' | 'resolved'
  cvss: number
  cvss_score?: number  // Alias for cvss
  date_found: string
  sla_due: string
  sla_compliance?: number  // Optional field for imported vulnerabilities
  // User role detailed fields
  sensitivity?: string  // Sensitivity level from CSV
  exploitability?: string  // Exploitability from CSV
  url?: string  // URL from CSV
  evidence_type?: string  // Evidence type from CSV
  description?: string  // Detailed description from CSV
  impact_description?: string  // Impact description from CSV
  recommendation?: string  // Recommendation from CSV
  time_to_detect_hours?: number
  time_to_resolve_hours?: number
  risk_score?: number
}

export const fetchVulnerabilities = createAsyncThunk('vulns/fetch', async (): Promise<Vulnerability[]> => {
  // Returns empty array - vulnerabilities are imported via CSV import, not fetched
  return [];
})

const vulnerabilitiesSlice = createSlice({
  name: 'vulnerabilities',
  initialState: { items: [] as Vulnerability[] },
  reducers: {
    clearVulnerabilities: (state) => {
      state.items = []
    },
    importVulnerabilities: (state, action) => {
      state.items = [...state.items, ...action.payload]
    },
    addVulnerability: (state, action) => {
      state.items.push(action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchVulnerabilities.fulfilled, (state, action) => {
      state.items = action.payload
    })
  }
})

export const { clearVulnerabilities, importVulnerabilities, addVulnerability } = vulnerabilitiesSlice.actions
export default vulnerabilitiesSlice.reducer
