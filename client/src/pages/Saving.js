import { React , useState, useEffect} from "react";
import { Typography, Space, Table, Card, Button, Modal, Input, message, Popconfirm, Select} from "antd";
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
import { addSavingsToDB, deleteSaving, getSavings, updateSaving } from "../store/savingsSlice";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


export default function Saving() {
  return (
    <Wrapper>
      <Space direction="vertical">
        <Typography.Title>Savings</Typography.Title>

        <Space>
          <SavingsTable />
          <SavingsChart />
        </Space>
      </Space>
    </Wrapper>
  );
}

function SavingsTable() {

  const [count, setCount] = useState(2);
  const [savings, setSavings] = useState([]);
  const [isSavingsLoaded, setIsSavingsLoaded] = useState(true);
  
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [documentKey, setDocumentKey] = useState("");

  const [source, setSource] = useState("");
  const [amount, setAmount] = useState();
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [incomeRef, setIncomeRef] = useState()
  
  const [savingsPerPage, setSavingsPerPage] = useState(3)
  const [currentPage, setCurrentPage] = useState(1)

  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.access_token);
  const user = useSelector((state) => state.auth.user);
  const savingsData = useSelector((state) => state.savings.savingsList);
  const incomesData = useSelector((state) => state.incomes.incomesList)
  const isStateChanged = useSelector((state) => state.savings.isChanged);

  useEffect(() => {
    console.log("Calling getSavings()");
    dispatch(getSavings(token));
    setSavings(savingsData);
    setIsSavingsLoaded(false);
    console.log("Savings Data ", savingsData);
  }, [dispatch, savingsData]);

  useEffect(() => {
    if (isStateChanged) {
      dispatch(getSavings(token));
    }
  }, [savingsData]);

  const handleEdit = (key, obj) => {
    setModalTitle("Editing Savings");
    setOpen(true);
    setIsEditing(true);
    console.log("Editing Checkpoint 1: " , key)
    setDocumentKey(key);

    setSource(obj.source);
    setAmount(obj.amount);
    console.log("Editing Checkpoint 2: ", deadline);
    setDeadline(obj.deadline);
    setDescription(obj.description);
  };

  const confirm = (id) => {
    const payload = {
      id: id,
      access_token: token,
    };
    dispatch(deleteSaving(payload));
    message.success("Record Deleted Successfully");
  };
  const cancel = (e) => {
    message.error("Operation Cancelled");
  };

  const columns = [
    {
      title: "Source",
      dataIndex: "source",
      filters: [
        {
          text: "Freelancing",
          value: "Freelancing",
        },
        {
          text: "Side Hustle",
          value: "Side Hustle",
        },
      ],
      onFilter: (value, record) => record.source.startsWith(value),
      filterSearch: true,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      sorter: (a, b) => a.amount - b.amount,
      width: "40%",
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      sorter: (a, b) => a.deadline > b.deadline,
      width: "40%",
    },
    {
      title: "Description",
      dataIndex: "description",
      width: "60%",
    },
    {
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={() =>
              handleEdit(record.id, {
                source: record.source,
                amount: record.amount,
                deadline: record.deadline,
                description: record.description,
              })
            }
          >
            Edit
          </a>
          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this income?"
            onConfirm={() => confirm(record.id)}
            onCancel={cancel}
            okText="Yes"
            cancelText="No"
          >
            <a>Delete</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  
  const onChange = (pagination, filters, sorter, extra) => {
    console.log("params", pagination, filters, sorter, extra);
  };

   const handleAdd = () => {
     setModalTitle("Adding Savings");
     setOpen(true);
   };

   const handleUpdatedSavings = () => {
      console.log("Saving updated");

      console.log("Editing Form");
      console.log(source);
      console.log(amount);
      console.log(deadline);
      console.log(description);

      let payload = {
        id: documentKey,
        saving: {
          source: source,
          amount: parseInt(amount),
          deadline: deadline.split('T')[0],
          description: description,
        },
        access_token: token,
      };

      dispatch(updateSaving(payload));
      // updateIncome(documentKey, name, type, amount, date, description)
      setOpen(false);
      setIsEditing(false);

      setSource("");
      setAmount(0);
      setDeadline("");
      setDescription("");
     setOpen(false);
   };

   const showModal = () => {
     setOpen(true);
   };

   const handleSubmit = () => {
     console.log("User is: ", user);
     if (user) {
       let data = {
         saving: {
           source: source,
           amount: parseInt(amount),
           deadline: deadline,
           description: description,
           incomeID: parseInt(incomeRef),
         },
         access_token: token,
       };
       console.log("Before Adding I", data.access_token, data.saving);
       dispatch(addSavingsToDB(data));
     } else {
       console.log("User ID is null");
     }

     setOpen(false);
   };

   const handleCancel = () => {
     console.log("Clicked cancel button");
     setSource("");
     setAmount(0);
     setDeadline("");
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
     console.log("Savings", savings);
     let data = savingsData.filter((saving) => {
       return (
         saving.description.toLowerCase().includes(searchText.toLowerCase()) ||
         saving.source.toLowerCase().includes(searchText.toLowerCase()) 
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
     console.log("Selecting option ... ");
     console.log("Selected Value is: ", value);
     setIncomeRef(parseInt(value));
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
        Add Saving
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
            onClick={isEditing ? handleUpdatedSavings : handleSubmit}
          >
            Submit
          </Button>,
        ]}
      >
        <Input
          value={source}
          placeholder="Source"
          style={{ marginBottom: 20 }}
          onChange={(e) => setSource(e.target.value)}
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
          value={deadline}
          placeholder="Deadline"
          style={{ marginBottom: 20 }}
          onChange={(e) => setDeadline(e.target.value)}
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
                return {
                  value: income.id,
                  label: `ID:${income.id} | Name:${income.name} | Amount:${income.amount} | Date:${income.date}`,
                };
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
          filteredData && filteredData.length > 0 ? filteredData : savingsData
        }
        onChange={onChange}
        pagination={{
          pageSize: savingsPerPage,
          current: currentPage,
          onChange: (currentPage, savingsPerPage) => {
            setSavingsPerPage(savingsPerPage);
            setCurrentPage(currentPage);
          },
        }}
      />
    </Space>
  );
}

function SavingsChart() {
  
  const dispatch = useDispatch();
  const savingsData = useSelector((state) => state.savings.savingsList);
  const user = useSelector((state) => state.auth.user);
  const isStateChanged = useSelector((state) => state.savings.isChanged);
  const token = useSelector((state) => state.auth.access_token);
  const [filteredData, setFilteredData] = useState(filterData(savingsData, 7));

  useEffect(() => {
    if (isStateChanged) {
      dispatch(getSavings(token));
    }
  }, [savingsData]);

  function filterData(data, days) {
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - days);

    console.log("Current Date", currentDate.getDate());
    return data.filter((item) => {
      const itemDate = new Date(item.deadline);
      return itemDate >= startDate && itemDate <= currentDate;
    });
  }

  function filterDataToday(data) {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to the beginning of the day

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // Set time to the end of the day

    return data.filter((item) => {
      const itemDate = new Date(item.deadline);
      return itemDate >= currentDate && itemDate <= endDate;
    });
  }

  const currentDate = new Date();
  const today = filterData(savingsData , 0)
  const last7Days = filterData(savingsData, 10);
  const thisMonth = filterData(savingsData, currentDate.getDate() - 1);

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
        text: "Savings Chart",
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

  const labels = filteredData.map((data) => data.deadline.split("T")[0]);

  console.log("Labels", labels);

  const data = {
    labels,
    datasets: [
      {
        label: "Savings Data",
        data: filteredData.map((data) => data.amount),
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  const handleFiltering = (value) => {
    if (value === "0") {
      setFilteredData(filterDataToday(savingsData));
    } else {
      console.log(`selected ${value}`);
      console.log("Selected Data ", filteredData);
      setFilteredData(filterData(savingsData, value));
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
