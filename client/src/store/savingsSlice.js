import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";

//thunk functions for firestore operations
export const addSavingsToDB = createAsyncThunk(
  "savings/addSavingsToDB",
  async (payload) => {
    try {
      const response = await fetch("http://localhost:5959/saving", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${payload.access_token}`,
          // "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
        },
        body: JSON.stringify(payload.saving),
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

export const getSavings = createAsyncThunk(
  "savings/getSavings",
  async (token) => {
    console.log("In Slice getSavings()");
    console.log("Token ", token);
    const response = await fetch("http://localhost:5959/saving", {
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
        const deadline = item.deadline.split("T")[0];
        return {
          ...item, // Copy all other properties from the original object
          deadline: deadline, // Replace 'date' with the split date
        };
      });

      return modifiedData;
    } else {
      console.log("Something went wrong");
    }
  }
);

export const deleteSaving = createAsyncThunk(
  "savings/deleteSaving",
  async (payload) => {
    try {
      console.log("In Slice deleteSaving()");
      console.log("Data: " , payload.incomeID)
      const response = await fetch(
        `http://localhost:5959/saving/${payload.id}`,
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
        return data.saving.id;
      }
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  }
);

export const updateSaving = createAsyncThunk(
  "savings/updateSaving",
  async (payload) => {
    try {
      console.log("In Slice updateSaving()");
      console.log("Data in slice", payload);
      const response = await fetch(
        `http://localhost:5959/saving/${payload.id}`,
        {
          method: "PATCH",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${payload.access_token}`,
            // "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
          },
          body: JSON.stringify(payload.saving),
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
      console.log("Savings updated failed");
    }
  }
);

const savingsSlice = createSlice({
  name: "savings",
  initialState: {
    savingsList: [],
    isChanged: false,
  },
  extraReducers: (builder) => {
    builder.addCase(addSavingsToDB.fulfilled, (state, action) => {
      state.savingsList.push(action.payload);
      state.isChanged = true
    });
    builder.addCase(getSavings.fulfilled, (state, action) => {
      state.savingsList = action.payload;
      state.isChanged = false;
    });
    builder.addCase(deleteSaving.fulfilled, (state, action) => {
      state.savingsList = state.savingsList.filter(
        (saving) => saving.id !== action.payload
      );
      state.isChanged = true;
    });
    builder.addCase(updateSaving.fulfilled, (state, action) => {
      const id = action.payload.id;
      const saving = {
        source: action.payload.source,
        amount: action.payload.amount,
        deadline: action.payload.deadline,
        description: action.payload.description,
      };
      const index = state.savingsList.findIndex((saving) => saving.id === id);
      if (index !== -1) {
        state.savingsList[index] = { id: id, saving };
      }
      state.isChanged = true;
    });
  },
});

export const savingsAction = savingsSlice.actions;
export default savingsSlice;
