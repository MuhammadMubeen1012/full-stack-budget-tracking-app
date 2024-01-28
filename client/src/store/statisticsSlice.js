import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";

//thunk functions for firestore operations
export const getTotalIncome = createAsyncThunk(
  "statistics/getTotalIncome",
  async (token) => {
    try {
      const response = await fetch("http://localhost:5959/incomes", {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          // "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
      });
      if (response.ok) {
        const data = await response.json();
        let totalIncome = 0;

        data.forEach(element => {
          totalIncome += parseInt(element.amount);
        });

        console.log("Total Income is: " , totalIncome)
        return totalIncome
      }
    } catch (e) {
      console.error("Error Calculating Income: ", e);
    }
  }
);

export const getTotalExpenses = createAsyncThunk(
  "statistics/getTotalExpense",
  async (token) => {
    try {
      const response = await fetch("http://localhost:5959/expense", {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          // "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
      });
      if (response.ok) {
        const data = await response.json();
        let totalExpenses = 0;

        data.forEach((element) => {
          totalExpenses += parseInt(element.amount);
        });

        console.log("Total Expenses is: ", totalExpenses);
        return totalExpenses;
      }
    } catch (e) {
      console.error("Error Calculating Income: ", e);
    }
  }
);

export const getTotalSavings = createAsyncThunk(
  "statistics/getTotalSavings",
  async (token) => {
    try {
      const response = await fetch("http://localhost:5959/saving", {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          // "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
      });
      if (response.ok) {
        const data = await response.json();
        let totalSavings = 0;

        data.forEach((element) => {
          totalSavings += parseInt(element.amount);
        });

        console.log("Total Savings is: ", totalSavings);
        return totalSavings;
      }
    } catch (e) {
      console.error("Error Calculating Income: ", e);
    }
  }
);

const statisticsSlice = createSlice({
  name: "statistics",
  initialState: {
    totalIncome: 0,
    totalExpenses: 0,
    totalSavings: 0,
    isChanged: false
  },
  extraReducers: (builder) => {
    builder.addCase(getTotalIncome.fulfilled, (state, action) => {
      state.totalIncome = action.payload;
      state.isChanged = true
    });
    builder.addCase(getTotalExpenses.fulfilled, (state, action) => {
      state.totalExpenses = action.payload;
      state.isChanged = true;

    });
    builder.addCase(getTotalSavings.fulfilled, (state, action) => {
      state.totalSavings = action.payload;
      state.isChanged = true;
    });
  },
});

export const statisticsActions = statisticsSlice.actions;
export default statisticsSlice;
