import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";

//thunk functions for firestore operations
export const addExpensesToDB = createAsyncThunk(
  "expenses/addExpensesToDB",
  async (payload) => {
    console.log("Adding Expense Token----> ", payload.access_token);
    try {
      const response = await fetch("http://localhost:5959/expense", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${payload.access_token}`,
          // "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
        body: JSON.stringify(payload.expense),
      });

      console.log("Before Response");
      if (response.ok) {
        console.log("Response received");
        const data = await response.json();
        console.log(data);
        return data;
      } else {
        console.log("Something went wrong");
      }
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }
);

export const getExpenses = createAsyncThunk(
  "expenses/getExpenses",
  async (token) => {
    console.log("In Slice getExpenses()");
    console.log("Token ", token);
    const response = await fetch("http://localhost:5959/expense", {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        // "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
      },
    });

    console.log("Before Response");
    if (response.ok) {
      console.log("Response received");
      const data = await response.json();
      console.log(data);
      const modifiedData = data.map((item) => {
        const date = item.date.split("T")[0];
        return {
          ...item, // Copy all other properties from the original object
          date: date, // Replace 'date' with the split date
        };
      });

      return modifiedData;
    } else {
      console.log("Something went wrong");
    }
  }
);

export const deleteExpense = createAsyncThunk(
  "expenses/deleteExpense",
  async (payload) => {
    try {
      console.log("In Slice deleteIncome()");
      console.log("Data: " , payload.incomeID)
      const response = await fetch(
        `http://localhost:5959/expense/${payload.id}`,
        {
          method: "DELETE",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${payload.access_token}`,
            // "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
          },
          body: JSON.stringify({ incomeID: payload.incomeID }),
        }
      );

      console.log("Before Response");
      if (response.ok) {
        console.log("Response received");
        const data = await response.json();
        console.log(data);
        return data.id;
      } else {
        console.log("Something went wrong");
      }
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  }
);

export const updateExpense = createAsyncThunk(
  "expenses/updateExpense",
  async (payload) => {
    try {
      console.log("In Slice updateExpense()");
      console.log("Token ", payload.access_token);
      const response = await fetch(
        `http://localhost:5959/expense/${payload.id}`,
        {
          method: "PATCH",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${payload.access_token}`,
            // "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
          },
          body: JSON.stringify(payload.expense),
        }
      );

      console.log("Before Response");
      if (response.ok) {
        console.log("Response received");
        const data = await response.json();
        console.log(data);
        return data;
      } else {
        console.log("Something went wrong");
      }
    } catch (e) {
      console.log("Expenses updated failed");
    }
  }
);

const expensesSlice = createSlice({
  name: "expenses",
  initialState: {
    expenseList: [],
    isChanged: false,
  },
  extraReducers: (builder) => {
    builder.addCase(addExpensesToDB.fulfilled, (state, action) => {
      state.expenseList.push(action.payload);
      state.isChanged = true;
    });
    builder.addCase(getExpenses.fulfilled, (state, action) => {
      state.expenseList = action.payload;
      state.isChanged = false;
    });
    builder.addCase(deleteExpense.fulfilled, (state, action) => {
      state.expenseList = state.expenseList.filter(
        (expense) => expense.id !== action.payload
      );
      state.isChanged = true;
    });
    builder.addCase(updateExpense.fulfilled, (state, action) => {
      const id = action.payload.id;
      const expense = {
        name: action.payload.name,
        amount: action.payload.amount,
        type: action.payload.type,
        description: action.payload.description,
        date: action.payload.date,
      };
      const index = state.expenseList.findIndex((expense) => expense.id === id);
      if (index !== -1) {
        state.expenseList[index] = { id: id, expense };
      }
      state.isChanged = true;
    });
  },
});

export const expensesActions = expensesSlice.actions;
export default expensesSlice;
