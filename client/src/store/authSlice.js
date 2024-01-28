import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";

export const signInWithCredientials = createAsyncThunk(
  "auth/signInWithCredientials",
  async (payload) => {
    try {
      console.log("In Slice Signin")
      console.log("Email: " , payload.email , "Password: " , payload.password)
      const data = new URLSearchParams();
      data.append("email", payload.email);
      data.append("password", payload.password);

      console.log("In Slice")
      const response = await fetch("http://localhost:5959/auth/signin", {
        method: "POST",
        mode: "cors",
        headers: {
          // "Content-Type": "application/json",
          "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
        body: data.toString()
      })

      if(response.ok){
        console.log("Response received")
        const data = await response.json()
        return data
      }
    } catch (e) {
      console.log("Error: ", e);
    }
  }
);

export const signWithGoogle = createAsyncThunk(
  "auth/signInWithGoogle",
  async () => {
    try {
      window.location.href = "http://localhost:5959/auth/google";
    } catch (err) {
      console.error(err);
    }
  }
);

export const findUserAndSignedIn = createAsyncThunk(
  "auth/findUserAndSignedIn",
  async (payload) => {
    try {
      const response = await fetch(`http://localhost:5959/auth/user/${payload.id}`, {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          // "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
      });

      if(response.ok) {
        const data = await response.json();
        const credientials = {
          user: data,
          access_token: payload.access_token
        }
        console.log("Find and Sign in" , credientials)
        return credientials
      }
    } catch (err) {
      console.error(err);
    }
  }
);

export const signOut = createAsyncThunk("auth/signOut", async () => {
  try {
    return {
      user: null, 
      access_token: null,
      isAuthenticated: false
    }
  } catch (err) {
    console.error(err);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: {},
    access_token: null,
    isAuthenticated: false,
    isRegistered: false,
  },
  // reducers: {
  //   signIn(state, action) {
  //     console.log("In Sign in Reducer");
  //     state.user = action.payload;
  //     state.isLoading = false;
  //     state.isAuthenticated = true;
  //   },
  //   signOut(state, action) {
  //     console.log("In Sign out Reducer");
  //     state.user = null;
  //     state.isLoading = true;
  //     state.isAuthenticated = false;
  //   },
  // },
  extraReducers: (builder) => {
    builder.addCase(signInWithCredientials.fulfilled, (state, action) => {
      console.log("Case Fullfilled");
      state.user = action.payload.user;
      state.access_token = action.payload.access_token;
      state.isAuthenticated = true;
      console.log({
        user: state.user,
        token: state.access_token,
        isAuthenticated: state.isAuthenticated,
      });
    });
    builder.addCase(signOut.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.access_token = action.payload.access_token;
    });
    builder.addCase(signWithGoogle.fulfilled, (state, action) => {
      console.log("Signing with Google successfully")
    });
    builder.addCase(findUserAndSignedIn.fulfilled, (state, action) => {
      console.log("Signing with Google successfully");
      state.user = action.payload.user
      state.isAuthenticated = true
      state.access_token = action.payload.access_token;
    });
  },
});

export const authActions = authSlice.actions;

export default authSlice;
