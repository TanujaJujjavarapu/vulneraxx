import { createSlice } from '@reduxjs/toolkit'

export interface EmailThread {
  id: string
  from: string
  subject: string
  preview: string
  date: string
  isRead: boolean
  hasAttachment: boolean
}

interface EmailsState {
  items: EmailThread[]
}

const initialState: EmailsState = {
  items: [],
}

const emailsSlice = createSlice({
  name: 'emails',
  initialState,
  reducers: {
    importEmails: (state, action) => {
      state.items = action.payload
    },
    clearEmails: (state) => {
      state.items = []
    },
  },
})

export const { importEmails, clearEmails } = emailsSlice.actions
export default emailsSlice.reducer
