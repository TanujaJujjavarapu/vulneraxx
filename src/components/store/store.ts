import { configureStore } from '@reduxjs/toolkit'
import companies, { clearCompanies } from './slices/companiesSlice'
import vulnerabilities, { clearVulnerabilities } from './slices/vulnerabilitiesSlice'
import scans, { clearScans } from './slices/scansSlice'
import user, { clearAllData as clearUserData } from './slices/userSlice'
import emails, { clearEmails } from './slices/emailsSlice'

export const store = configureStore({
  reducer: {
    companies,
    vulnerabilities,
    scans,
    user,
    emails,
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// Clear all data function
export const clearAllData = () => {
  store.dispatch(clearCompanies())
  store.dispatch(clearScans())
  store.dispatch(clearVulnerabilities())
  store.dispatch(clearUserData())
  store.dispatch(clearEmails())
}

export default store
