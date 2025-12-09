import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import profileReducer from "./slices/profileSlice";
import disputeReducer from "./slices/disputeSlice";
import { baseApi } from "./api/baseApi";
import { expertBaseApi } from "./api/expertBaseApi";
// Import APIs to ensure endpoints are injected
import "./api/privacyApi";
import "./api/accountApi";
import "./api/bookingApi";
import "./api/expertApi";
import "./api/organiserApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    dispute: disputeReducer,
    [baseApi.reducerPath]: baseApi.reducer,
    [expertBaseApi.reducerPath]: expertBaseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(baseApi.middleware, expertBaseApi.middleware),
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

