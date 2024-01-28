import { React, useState, useEffect } from "react";
import Wrapper from "../components/Wrapper";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, line } from "react-chartjs-2";
import { current } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import {
  Typography,
  Table,
  Space,
  Card,
  Button,
  Modal,
  Input,
  Popconfirm,
  message,
  Select
} from "antd";
import { addIncomeToDB, deleteIncome, getIncomes, updateIncome } from "../store/incomeSlice";
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Income() {
  return (
    <Wrapper>
      <Space direction="vertical">
        <Typography.Title>Income</Typography.Title>

        <Space>
          <IncomeTable />
          <IncomeChart />
        </Space>
      </Space>
    </Wrapper>
  );
}

function IncomeTable() {
  
  const [incomes, setIncomes] = useState([]);
  const [isLoadingIncomes, setIsIncomeLoaded] = useState(true);
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [id , setId] = useState()
  const [type, setType] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [modalTitle, setModalTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [documentKey, setDocumentKey] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [incomesPerPage, setIncomesPerPage] = useState(3);

  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.access_token)
  const user = useSelector(state => state.auth.user)
  const incomesData = useSelector((state) => state.incomes.incomesList);
  const isStateChanged = useSelector((state) => state.incomes.changed);
    const feedback = useSelector((state) => state.incomes.message);


  useEffect(() => {
    console.log("Calling getIncomes()");
    dispatch(getIncomes(token));
    setIncomes(incomesData);
    setIsIncomeLoaded(false);
    console.log("Incomes Data ", incomesData);
  }, [dispatch , incomes]);

  useEffect(() => {
    if(isStateChanged){
      dispatch(getIncomes(token))
    }
  }, [incomesData]);

  const handleEdit = (key, obj) => {
    setModalTitle("Editing Income");
    setOpen(true);
    setIsEditing(true);
    console.log("Income CP1", key);
    setDocumentKey(key);

    setType(obj.type);
    setName(obj.name);
    setAmount(obj.amount);
    setDate(obj.date);
    setDescription(obj.description);
  };

  const handleDelete = (key) => {
    console.log("Delete button clicked", key);
  };

  const confirm = (id) => {
    const payload = {
      id: id,
      access_token: token
    }
    dispatch(deleteIncome(payload));
    message.warning(feedback);
  };

  const cancel = (e) => {
    message.error("Operation Cancelled");
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "id"
    },
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Type",
      dataIndex: "type",
      filters: [
        {
          text: "Freelancing",
          value: "Freelancing",
        },
        {
          text: "Side Hustle",
          value: "Side Hustle",
        },
        {
          text: "Salary",
          value: "Salary",
        },
        {
          text: "Other",
          value: "Other",
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
                amount: parseInt(record.amount),
                date: record.date,
                description: record.description,
              })
            }
          >
            Edit
          </a>
          <Popconfirm
            title="Delete the income"
            description="Are you sure to delete this income?"
            onConfirm={() => confirm(record.id)}
            onCancel={cancel}
            okText="Yes"
            cancelText="No"
          >
            <a onClick={() => handleDelete(record.id)}>Delete</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  const handleAdd = () => {
    setModalTitle("Adding Income");
    setOpen(true);
  };

  const handleUpdatedIncome = () => {
    console.log("Income updated");

    console.log("Editing Form");
    console.log(name);
    console.log(type);
    console.log(amount);
    console.log(date);
    console.log(description);

    let payload = {
      id: documentKey,
      income: {
        name: name,
        type: type,
        amount: parseInt(amount),
        date: date,
        description: description,
      },
      access_token: token,
    };

    dispatch(updateIncome(payload));
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

  const handleSubmit = async () => {
    console.log("User is: " , user)
    if (user) {
      let data = {
        income: {
          name: name,
          type: type,
          amount: parseInt(amount),
          date: date,
          description: description,
        },
        access_token: token,
      };
      console.log("Before Adding I", data.access_token, data.income);
      dispatch(addIncomeToDB(data));
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
    console.log("Income", incomesData);
    let data = incomesData.filter((income) => {
      return (
        income.name.toLowerCase().includes(searchText.toLowerCase()) ||
        income.type.toLowerCase().includes(searchText.toLowerCase()) ||
        income.description.toLowerCase().includes(searchText.toLowerCase())
      );
    });
    console.log("Filtered Data", data);
    setFilteredData(data);
  };

  const resetData = () => {
    setFilteredData([]);
    setSearchText("")
  };

  return (
    <Space direction="vertical">
      <Button
        onClick={handleAdd}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        Add Income
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
            onClick={isEditing ? handleUpdatedIncome : handleSubmit}
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
        <br />
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
          filteredData && filteredData.length > 0 ? filteredData : incomesData
        }
        onChange={onChange}
        pagination={{
          pageSize: incomesPerPage,
          current: currentPage,
          onChange: (currentPage, incomesPerPage) => {
            setIncomesPerPage(incomesPerPage);
            setCurrentPage(currentPage);
          },
        }}
      />
    </Space>
  );
}

function IncomeChart() {
  
  const dispatch = useDispatch()
  const incomesData = useSelector((state) => state.incomes.incomesList);
  const user = useSelector((state) => state.auth.user);
  const isStateChanged = useSelector(state => state.incomes.isChanged)
  const token = useSelector(state => state.auth.access_token)
  const [filteredData, setFilteredData] = useState(filterData(incomesData, 7));
  
  useEffect(() => {
    if (isStateChanged) {
      dispatch(getIncomes(token));
    }
  }, [incomesData]);

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
  const today = filterData(incomesData , 0)
  const last7Days = filterData(incomesData, 10);
  const thisMonth = filterData(incomesData, currentDate.getDate() - 1);

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
        text: "Income Chart",
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

  console.log("Labels" , labels)

    const data = {
      labels,
      datasets: [
        {
          label: "Incomes Data",
          data: filteredData.map((data) => data.amount),
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
      ],
    };
  
  const handleFiltering = (value) => {
    if(value === "0"){
          setFilteredData(filterDataToday(incomesData));
    } else {
      console.log(`selected ${value}`);
      console.log("Selected Data ", filteredData);
      setFilteredData(filterData(incomesData, value));
    }
  }

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
              value: currentDate.getDate() -1,
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
