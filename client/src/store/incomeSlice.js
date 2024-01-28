import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";

//thunk functions for firestore operations
export const addIncomeToDB = createAsyncThunk(
  "incomes/addIncomeToDB",
  async (payload) => {
    console.log("Adding Income Token----> ", payload.access_token);
    try {
      const response = await fetch("http://localhost:5959/incomes", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${payload.access_token}`,
          // "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
        body: JSON.stringify(payload.income),
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

export const getIncomes = createAsyncThunk(
  "incomes/getIncomes",
  async (token) => {
    console.log("In Slice getIncomes()");
    console.log("Token ", token);
    const response = await fetch("http://localhost:5959/incomes", {
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
      console.log("Income Data from API" , data);
      
      const modifiedData = data.map((item) => {        
          const date = item.date.split("T")[0];
          return {
            ...item, // Copy all other properties from the original object
            date: date, // Replace 'date' with the split date
          };
      });

      return modifiedData
    } else {
      console.log("Something went wrong");
    }
  }
);

export const deleteIncome = createAsyncThunk(
  "incomes/deleteIncome",
  async (payload) => {
    try {
      console.log("In Slice deleteIncome()");
      console.log("Token ", payload.access_token);
      const response = await fetch(
        `http://localhost:5959/incomes/${payload.id}`,
        {
          method: "DELETE",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${payload.access_token}`,
            // "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
          },
        }
      );

      console.log("Before Response");
      if (response.ok) {
        console.log("Response received");
        const data = await response.json();

        if(data.success) {
          console.log("Message: " , data.message)
          console.log("Data: " , data);
          return {
            id: data.income.id,
            success: data.success,
            message: data.message
          };
        } else {
          console.log("Hye! Msg from Income Slice: Went wrong");
          return {
            success: data.success,
            message: data.message,
          };
        }
      } else {
        console.log("Something went wrong");
      }
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  }
);

export const updateIncome = createAsyncThunk(
  "incomes/updateIncome",
  async (payload) => {
    try {
      console.log("In Slice deleteIncome()");
      console.log("Token ", payload.access_token);
      const response = await fetch(
        `http://localhost:5959/incomes/${payload.id}`,
        {
          method: "PATCH",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${payload.access_token}`,
            // "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
          },
          body: JSON.stringify(payload.income),
        }
      );

      console.log("Before Response");
      if (response.ok) {
        console.log("Response received");
        const data = await response.json();

        if(data.success) {
          console.log("Sucess Hogaye")
        } else {
          console.log("Sucess nahi hue");
        }
        console.log(data);
        return data;
      } else {
        console.log("Something went wrong");
      }
    } catch (e) {
      console.log("Incomes updated failed");
    }
  }
);

const incomesSlice = createSlice({
  name: "incomes",
  initialState: {
    incomesList: [],
    message: "",
    changed: false,
  },
  extraReducers: (builder) => {
    builder.addCase(addIncomeToDB.fulfilled, (state, action) => {
      console.log("Added to the income list: ");
      console.log(state.incomesList);
      state.incomesList.push(action.payload);
      state.changed = true
    });
    builder.addCase(getIncomes.fulfilled, (state, action) => {
      console.log("Income Payload returned ", action.payload);
      state.incomesList = action.payload;
      console.log("Inside Income Slice", state.incomesList);
      state.changed = false;
    });
    builder.addCase(deleteIncome.fulfilled, (state, action) => {
      if(action.payload.success) {
        state.incomesList = state.incomesList.filter(
          (income) => income.id !== action.payload.id
        );
        state.changed = true;
        state.message = action.payload.message
        console.log("State after deletion: ");
        console.log(state.incomesList);
      } else {
        state.changed = false;
        state.message = action.payload.message;
      }
    });
    builder.addCase(updateIncome.fulfilled, (state, action) => {
      console.log("Updated Payload --> ", action.payload);
      const id = action.payload.id;
      const updatedIncome = {
        uid: action.payload.uid,
        name: action.payload.name,
        amount: action.payload.amount,
        type: action.payload.type,
        description: action.payload.description,
      };
      const index = state.incomesList.findIndex((income) => income.id === id);
      if (index !== -1) {
        state.incomesList[index] = {
          id: id,
          name: updateIncome.name,
          amount: updateIncome.amount,
          type: updateIncome.type,
          description: updateIncome.description,
          uid: updateIncome.uid,
        };
      }
      state.changed = true;
      console.log("Updated Income List: " , state.incomesList)
    });
  },
});

export const incomesActions = incomesSlice.actions;
export default incomesSlice;
