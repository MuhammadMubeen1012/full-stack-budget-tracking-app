import { addExpensesToDB, deleteExpense, getExpenses, updateExpense } from "../store/expensesSlice";
import { React, useEffect, useState } from "react";
import { Typography, Space, Table, Card, Button, Modal, Input, message, Popconfirm , Select} from "antd";
import Wrapper from "../components/Wrapper";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useDispatch, useSelector } from "react-redux";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function Expenses() {
  return (
    <Wrapper>
      <Space direction="vertical">
        <Typography.Title>Expenses</Typography.Title>

        <Space>
          <ExpensesTable />
          <ExpenseChart />
        </Space>
      </Space>
    </Wrapper>
  );
}

function ExpensesTable() {

  // const auth = getAuth();
  // const user = auth.currentUser;

  const [expenses, setExpenses] = useState([]);
  const [isExpensesLoaded, setIsExpensesLoaded] = useState(true);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState();
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [incomeRef, setIncomeRef] = useState();
  const [modalTitle, setModalTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [documentKey, setDocumentKey] = useState("");

  const [expensesPerPage, setExpensesPerPage] = useState(3);
  const [currentPage , setCurrentPage] = useState(1);

  const dispatch = useDispatch()
  const token = useSelector(state => state.auth.access_token)
  const user = useSelector((state) => state.auth.user);
  const expensesData = useSelector(state => state.expenses.expenseList)
  const incomesData = useSelector(state => state.incomes.incomesList)
  const isStateChanged = useSelector(state => state.expenses.isChanged)
  
  useEffect(() => {
    dispatch(getExpenses(token))
    setExpenses(expensesData)
    setIsExpensesLoaded(true)
  }, [dispatch])

  useEffect(() => {
    if (isStateChanged) {
      dispatch(getExpenses(token));
    }
  }, [expensesData]);

  const handleEdit = (key, obj) => {
    setModalTitle("Editing Expenses");
    setOpen(true);
    setIsEditing(true);
    console.log("Expense CP1", key);
    setDocumentKey(key);

    setType(obj.type);
    setName(obj.name);
    setAmount(obj.amount);
    setDate(obj.date);
    setDescription(obj.description);
  };

  const handleDelete = (key) => {
    // deleteExpenses(key);
    console.log("Delete button clicked", key);
  };

  const confirm = (id) => {
    console.log("Inside confirmation")
    const payload = {
      id: id,
      access_token: token,
    };
    dispatch(deleteExpense(payload));
    message.success("Record Deleted Successfully");
  };
  const cancel = (e) => {
    message.error("Operation Cancelled");
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      filters: [
        {
          text: "Operating",
          value: "Operating",
        },
        {
          text: "Salaries",
          value: "Salaries",
        },
      ],
      onFilter: (value, record) => record.type.startsWith(value),
      filterSearch: true,
      width: "40%",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      sorter: (a, b) => a.amount - b.amount,
      width: "40%",
    },
    {
      title: "Date",
      dataIndex: "date",
      sorter: (a, b) => a.date > b.date,
      width: "40%",
    },
    {
      title: "Description",
      dataIndex: "description",
      width: "40%",
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={() =>
              handleEdit(record.id, {
                name: record.name,
                type: record.type,
                amount: record.amount,
                date: record.date,
                description: record.description,
              })
            }
          >
            Edit
          </a>
          <Popconfirm
            title="Delete the expense"
            description="Are you sure to delete this expense?"
            onConfirm={() => confirm(record.id)}
            onCancel={cancel}
            okText="Yes"
            cancelText="No"
          >
            <a onClick={() => handleDelete(record.key)}>Delete</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  const handleAdd = () => {
    setModalTitle("Adding Expenses");
    setOpen(true);
  };

  const handleUpdatedExpense = () => {
    console.log("Expense updated");

    console.log("Editing Form");
    console.log(name);
    console.log(type);
    console.log(amount);
    console.log(date);
    console.log(description);

    let payload = {
      id: documentKey,
      expense: {
        name: name,
        type: type,
        amount: parseInt(amount),
        date: date,
        description: description,
      },
      access_token: token,
    };

    dispatch(updateExpense(payload));
    // updateIncome(documentKey, name, type, amount, date, description)
    setOpen(false);
    setIsEditing(false);

    setType("");
    setName("");
    setAmount(0);
    setDate("");
    setDescription("");
  };

  const showModal = () => {
    setOpen(true);
  };

  const handleSubmit = () => {
    console.log("User is: ", user);
    if (user) {
      let data = {
        expense: {
          name: name,
          type: type,
          amount: parseInt(amount),
          date: date,
          description: description,
          incomeID: parseInt(incomeRef),
        },
        access_token: token,
      };
      console.log("Before Adding I", data.access_token, data.expense);
      dispatch(addExpensesToDB(data));
    } else {
      console.log("User ID is null");
    }
    setOpen(false);
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setType("");
    setName("");
    setAmount(0);
    setDate("");
    setDescription("");

    setOpen(false);
    setIsEditing(false);
  };

  const [searchText, setSearchText] = useState("");
  const [filteredData, setFilteredData] = useState([]);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    console.log(searchText);
  };

  const searchData = () => {
    console.log("Income", expenses);
    let data = expensesData.filter((expense) => {
      return (
        expense.name.toLowerCase().includes(searchText.toLowerCase()) ||
        expense.type.toLowerCase().includes(searchText.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    console.log("Filtered Data", data);
    setFilteredData(data);
  };

  const resetData = () => {
    setFilteredData([]);
    setSearchText("");
  };

  const handleIncomeReferenceFilter = (value) => {
    console.log("Selecting option ... ")
    console.log("Selected Value is: " , value)
    setIncomeRef(parseInt(value));
  }

  return (
    <Space direction="vertical">
      <Button
        onClick={handleAdd}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        Add Expense
      </Button>
      <Modal
        title={modalTitle}
        open={open}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={isEditing ? handleUpdatedExpense : handleSubmit}
          >
            Submit
          </Button>,
        ]}
      >
        <Input
          value={type}
          placeholder="Type"
          style={{ marginBottom: 20 }}
          onChange={(e) => setType(e.target.value)}
        />
        <br />
        <Input
          value={name}
          placeholder="Name"
          style={{ marginBottom: 20 }}
          onChange={(e) => setName(e.target.value)}
        />
        <br />
        <Input
          value={amount}
          placeholder="Amount"
          style={{ marginBottom: 20 }}
          onChange={(e) => setAmount(e.target.value)}
        />
        <br />
        <Input
          value={date}
          placeholder="Date"
          style={{ marginBottom: 20 }}
          onChange={(e) => setDate(e.target.value)}
          type="date"
        />
        <br />
        <Input
          value={description}
          placeholder="Description"
          style={{ marginBottom: 20 }}
          onChange={(e) => setDescription(e.target.value)}
        />
        {!isEditing && (
          <>
            <br />
            {/* <Input
              value={incomeRef}
              placeholder="Income Reference"
              style={{ marginBottom: 20 }}
              onChange={(e) => setIncomeRef(e.target.value)}
            /> */}
            <Select
              onChange={handleIncomeReferenceFilter}
              style={{
                width: 473,
              }}
              options={incomesData.map((income) => {
                return {value: income.id , label: `ID:${income.id} | Name:${income.name} | Amount:${income.amount} | Date:${income.date}`}
              })}
            />
          </>
        )}
      </Modal>
      <Space align="center">
        <Input
          placeholder="input search text"
          size="medium"
          onChange={handleSearchChange}
          type="text"
          value={searchText}
        />

        <Button type="primary" onClick={searchData}>
          Search
        </Button>
        <Button type="primary" onClick={resetData}>
          Reset
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={
          filteredData && filteredData.length > 0 ? filteredData : expensesData
        }
        onChange={onChange}
        pagination={{
          position: ["bottomCenter"],
          pageSize: expensesPerPage,
          current: currentPage,
          onChange: (currentPage, expensesPerPage) => {
            setExpensesPerPage(expensesPerPage);
            setCurrentPage(currentPage);
          },
        }}
      />
    </Space>
  );
}

function ExpenseChart() {
  
  const dispatch = useDispatch();
  const expensesData = useSelector((state) => state.expenses.expenseList);
  const user = useSelector((state) => state.auth.user);
  const isStateChanged = useSelector(state => state.expenses.isChanged)
  const token = useSelector(state => state.auth.access_token)
  const [filteredData, setFilteredData] = useState(filterData(expensesData, 7));

  useEffect(() => {
  if (isStateChanged) {
    dispatch(getExpenses(token));
  }
}, [expensesData]);

  function filterData(data, days) {
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - days);

    console.log("Current Date", currentDate.getDate());
    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= currentDate;
    });
  }

  function filterDataToday(data) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to the beginning of the day

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // Set time to the end of the day

    return data.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= currentDate && itemDate <= endDate;
    });
  }

  const currentDate = new Date();
  const today = filterData(expensesData , 0)
  const last7Days = filterData(expensesData, 10);
  const thisMonth = filterData(expensesData, currentDate.getDate() - 1);

  console.log("Today" , today)
  console.log("7 Days", last7Days);
  console.log("This Month", thisMonth);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Expense Chart",
      },
    },
  };

  const monthlyLabels = {
    "01": "January",
    "02": "February",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "August",
    "09": "September",
    "10": "October",
    "11": "November",
    "12": "December",
  };

  const labels = filteredData.map((data) => data.date.split("T")[0]);

  console.log("Labels", labels);

  const data = {
    labels,
    datasets: [
      {
        label: "Expense Data",
        data: filteredData.map((data) => data.amount),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const handleFiltering = (value) => {
    if (value === "0") {
      setFilteredData(filterDataToday(expensesData));
    } else {
      console.log(`selected ${value}`);
      console.log("Selected Data ", filteredData);
      setFilteredData(filterData(expensesData, value));
    }
  };

  return (
    <>
      <Space wrap>
        <Select
          defaultValue="Last 7 Days"
          onChange={handleFiltering}
          style={{
            width: 120,
          }}
          options={[
            {
              value: "0",
              label: "Today",
            },
            {
              value: "6",
              label: "Last 7 days",
            },
            {
              value: currentDate.getDate() - 1,
              label: "This Month",
            },
            {
              value: "90",
              label: "Last 3 Months",
            },
          ]}
        />
      </Space>
      <Card>
        <Line options={options} data={data} />
      </Card>
    </>
  );
}
