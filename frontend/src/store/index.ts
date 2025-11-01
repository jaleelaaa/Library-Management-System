import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import inventoryReducer from './slices/inventorySlice'
import usersReducer from './slices/usersSlice'
import rolesReducer from './slices/rolesSlice'
import circulationReducer from './slices/circulationSlice'
import acquisitionsReducer from './slices/acquisitionsSlice'
import dashboardReducer from './slices/dashboardSlice'
import coursesReducer from './slices/coursesSlice'
import searchReducer from './slices/searchSlice'
import notificationsReducer from './slices/notificationsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    inventory: inventoryReducer,
    users: usersReducer,
    roles: rolesReducer,
    circulation: circulationReducer,
    acquisitions: acquisitionsReducer,
    dashboard: dashboardReducer,
    courses: coursesReducer,
    search: searchReducer,
    notifications: notificationsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
