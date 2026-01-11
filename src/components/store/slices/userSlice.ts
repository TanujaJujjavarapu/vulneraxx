import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

interface User {
  id: string
  full_name: string
  email: string
  role: string
}

export const fetchUser = createAsyncThunk('user/fetch', async () => {
  return { id: 'u1', full_name: 'Jane Doe', email: 'jane@example.com', role: 'admin' }
})

const userSlice = createSlice({
  name: 'user',
  initialState: { data: null as User | null },
  reducers: {
    clearUser: (state) => { state.data = null },
    clearAllData: (state) => { state.data = null }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUser.fulfilled, (state, action) => { state.data = action.payload })
  }
})

export const { clearUser, clearAllData } = userSlice.actions
export default userSlice.reducer
