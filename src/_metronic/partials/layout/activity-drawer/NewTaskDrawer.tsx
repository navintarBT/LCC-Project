import React, { FC, useState, useEffect } from "react";
import { KTIcon } from "../../../helpers";
import Select from "react-select";
import Flatpickr from "react-flatpickr";
import axios from "axios";
import Swal from "sweetalert2";

const BASE_URL = process.env.VITE_SERVER_URL;
const PRO_BASE_URL = `${BASE_URL}/projects`

interface NewTaskDrawerProps {
  projectId: string;
  onClose: () => void;
  sentCategorys : string[];
  sendProductDataToParent: (product: any) => void;
}

interface Category {
  value: string;
  label: string;
}

interface PersonsIncharge {
  id: string;
  value: string;
  label: string;
}

interface UserData {
  _id: string;
  display_name: string;
}

interface ProduxctType {
  sendProductDataToParent: (product: any) => void;
  categoryDataToparent: (data: any) => void;
}


let getUserData:UserData[] = []

type Task = {
  project_id: string;
  task_name: string;
  category: string | null;
  start: any;
  deadline: any;
  persons_in_charge: PersonsIncharge[];
  status: string;
  note: string;
}

const categorySelectedInit: Category = {
  value: "",
  label: "",
};

const personInchargeInit: PersonsIncharge = {
  id: "",
  value: "",
  label: ""
};

let taskDataObj : Task = {
  project_id: "",
  task_name: "",
  category: "",
  start: null,
  deadline: null,
  persons_in_charge: [],
  status: "on going",
  note : ""
}

const NewTaskDrawer: FC<NewTaskDrawerProps> = ({ projectId, sentCategorys }) => {
  const [dateStart, setDateStart] = useState<Date[]>([]);
  const [deadline, setDeadline] = useState<Date[]>([]); 
  const [taskName, setTaskName] = useState(""); 
  const [categorySelected, setCategorySelected] = useState<Category>(categorySelectedInit);  

  const [getProId, setGetProId] = useState("");
  const [categoryData, setCategoryData] = useState<any>([]);
  const [selectedOptions, setSelectedOptions] = useState<PersonsIncharge[]>([]);
  const [taskData, setTaskData] = useState<Task>(taskDataObj);
  const [allPersonInChart, setAllPersonInChart] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [getStatus, setGetStatus] = useState("on going");
  const [getTaskNote, setTaskNote] = useState("");
  const [getUserData, setGetUserData] = useState<UserData[]>([]);
  const [categoryProp, setCategoryProp] = useState<any[]>(sentCategorys);
  
  let category_data: any = [];

  

  // get selected category 
  const getCategorySelected = async (data:any) => {
    setCategorySelected(data);
  }

  //get project id
  const getProjectId = (data:any) => {
    setGetProId(data)
  }

  //close popup
  const onClose = () => {
    setGetProId("");
    setTaskName("");
    setDateStart([]);
    setDeadline([]);
    setCategorySelected(categorySelectedInit);
    setSelectedOptions([]);
    setAllPersonInChart([]);

  };

  useEffect(() => {
    getProjectId(projectId)
  }, [taskName]);

  useEffect(() => {
    category_data = [];
      setCategoryProp(sentCategorys);
  }, [sentCategorys]);

  
    // get category from database
    if (categoryProp.length == 0) {
      categoryData.forEach((item: any) => {
        category_data.push({ value: item._id, label: item.category_name });
      });
      category_data.unshift({ id: 0, value: "" , label: "" })
    } else {
      categoryProp.forEach((item: any) => {
        category_data.push({ value: item._id, label: item.category_name });
      });
      category_data.unshift({ id: 0, value: "", label: "" })
    }

  useEffect(() => { 
    if (submitSuccess) {
        const cancelButton = document.getElementById("new_task_close");
      if (cancelButton) {
        cancelButton.click();
      }
    }
    
  }, [submitSuccess]);
  


  //TODO: submit From
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
if (!dateStart[0] || !deadline[0]) {
  Swal.fire({
    title: `Please pick the date`,
    text: `You need to select both a start date and a deadline`,
    icon: "info",
    confirmButtonColor: "#1E7ABD",
    confirmButtonText: "OK",
  })
}else{
  if (dateStart[0] > deadline[0]) {
    Swal.fire({
      title: `Invalid Date Range`,
      text: `The start date must be earlier than the deadline. Please adjust your dates accordingly.`,
      icon: "info",
      confirmButtonColor: "#1E7ABD",
      confirmButtonText: "OK",
    })
    return;
  }
  let dateStartForSave = new Date(dateStart[0]);
  dateStartForSave.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00.000 UTC
  dateStartForSave.setUTCDate(dateStartForSave.getUTCDate() + 1)
  let deadlineForSave = new Date(deadline[0]);
  deadlineForSave.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00.000 UTC
  deadlineForSave.setUTCDate(deadlineForSave.getUTCDate() + 1)
  
  setTaskData({
    "project_id" : getProId,
    "task_name" : taskName ,
    "category" : categorySelected.value || null,
    "start" : dateStartForSave.toISOString(),
    "deadline" : deadlineForSave.toISOString(),
    "persons_in_charge" : allPersonInChart,
    "status" : getStatus,
    "note" : getTaskNote
  });

  setSubmitSuccess(true);
}
  };

  useEffect(() => {
    const fetchData = async () => {
      setSubmitSuccess(false);
      if (taskData.project_id) {
        axios.post(`${PRO_BASE_URL}/create-task`, taskData)
        .then(res => {
          onClose()
        })
        .catch(error => {
          console.log(error);
        });
      }
  
      setTaskData(taskDataObj);
    }

    fetchData();
    
    
  }, [taskData])

  let personOptions: PersonsIncharge[] = [];
  getUserData.forEach((taskData) => {
    personOptions.push({id : taskData._id, value : taskData._id, label : taskData.display_name })
  });

  const handleSelectChange = (selectedOptions: any) => {
    const selectedValues = selectedOptions.map((item:any) => ({ user: item.id, user_name_done: {user:null, user_name:null} }));
    setSelectedOptions(selectedOptions);
    setAllPersonInChart(selectedValues);
  };

  

  const OptionWithDelete: React.FC<any> = (props) => {
    const { children, innerProps, data, isFocused, isSelected } = props;
  
    const handleDelete = (event: React.MouseEvent) => {
      Swal.fire({
        title: `Are you sure you want to delete the \n ${data.label} category?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1E7ABD",
        confirmButtonText: "Yes, confirm",
      }).then((result) => {
        if (result.isConfirmed) {
              const onConfirm = async () => {
                await axios.delete(`${PRO_BASE_URL}/delete-category/` + data.value)
                .then((res) => {
                  // console.log('Category successfully deleted');
                })
                .catch((err) => {
                  console.log(err);
                });
                setCategorySelected(categorySelectedInit);
              };
  
              onConfirm();
              Swal.fire({
                title: "Delete!",
                text: "Your category has been Delete.",
                icon: "success"
              });
        }
      });
    };
    

    return (
      <div
        {...innerProps}
        className="d-flex justify-content-between"
        style={{ backgroundColor: isFocused ? "#F9F9F9" : "transparent" }}
      >
        <span
          className={`react-select__option ${
            isSelected || isFocused ? "text-primary" : ""
          }`}
        >
          {children}
        </span>
        {children !== "" && (
          <button
            className="btn btn-sm btn-light mt-2 me-3 btn-icon btn-active-light-danger"
            onClick={handleDelete}
          >
            <KTIcon iconName="trash" className="fs-5" />
          </button>
        )}
      </div>
    );
  };

  const customComponents = {
    Option: (props: any) => <OptionWithDelete {...props} />
  };

  
  return (
    <div
      id="new_task"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="activities"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'710px', 'lg': '710px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#new_task_toggle"
      data-kt-drawer-close="#new_task_close"
      style={{ overflowY: "scroll" }}
    >
      <div className="card shadow-none rounded-0  w-100">
        <div className="card-header" id="new_task_header">
          <h3 className="card-title fw-bolder text-gray-900">New Task</h3>

          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
              id="new_task_close"
              onClick={onClose}
            >
              <KTIcon iconName="cross" className="fs-1" />
            </button>
          </div>
        </div>
        <div className="card-body position-relative" id="new_task_body">
          <form onSubmit={handleSubmit}>
            <div className="mb-5" style={{display : "none"}}>
              <span className="fw-bold text-gray-700">Project id</span>
              <input type="text" className="form-control" name="project_id" defaultValue={projectId} onChange={(e) => getProjectId(e.target.value)}/>
            </div>
            <div className="mb-5" style={{display : "none"}}>
              <span className="fw-bold text-gray-700">status</span>
              <input type="text" className="form-control" name="status" defaultValue={"on going"} onChange={(e) => setGetStatus(e.target.value)}/>
            </div>
            <div className="mb-5">
              <span className="fw-bold text-gray-700">Task name</span>
              <input type="text" className="form-control" name="task_name" value={taskName} onChange={(e) => setTaskName(e.target.value)} required/>
            </div>
            <div className="mb-5">
              <span className="fw-bold text-gray-700">
                Category <span className=" text-muted">(Optional)</span>
              </span>
              <div className="d-flex justify-content-between">
                <div>
                  <Select
                    className="react-select-style w-475px"
                    classNamePrefix="react-select"
                    options={category_data}
                    value={categorySelected}
                    onChange={(e:any) => getCategorySelected(e)}
                    components={customComponents}
                  />
                </div>
                <a
                  href="#"
                  className="card-title parent-hover"
                  data-kt-menu-trigger="click"
                  data-kt-menu-overflow="true"
                  data-kt-menu-placement="top-start"
                  data-bs-toggle="tooltip"
                  data-bs-placement="right"
                  data-bs-dismiss="click"
                  id="new_category_toggle"
                >
                  <span className="text-gray-700 parent-hover-primary fs-5 btn btn-light">
                    + New category
                  </span>
                </a>
              </div>
            </div>
            <div
              className="mb-5"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <div>
                <span className="fw-bold text-gray-700">Start date</span>
                <Flatpickr
                  value={dateStart[0]}
                  onChange={(startDate: Date[]) => {
                    setDateStart(startDate);
                  }}
                  // options={dateOption}
                  className="form-control"
                  data-date-format="Y/m/d"
                  placeholder="Pick date"
                  style={{ width: "310px" }}
                />
              </div>

              <div>
                <span className="fw-bold text-gray-700">Deadline</span>
                <Flatpickr
                  value={deadline[0]}
                  onChange={(deadline: Date[]) => {
                    setDeadline(deadline);
                  }}
                  // options={dateOption}
                  className="form-control"
                  placeholder="Pick date"
                  data-date-format="Y/m/d"
                  style={{ width: "310px" }}
                />
              </div>
            </div>
            <div className="mb-10">
              <span className="fw-bold text-gray-700">Persons in charge</span>
              <i
                className="fas fa-exclamation-circle ms-2 fs-7"
                data-bs-toggle="tooltip"
                title="The person in charge can select up to five person."
              ></i>
              <Select
                className="react-select-style mb-3"
                classNamePrefix="react-select"
                options={personOptions}
                onChange={handleSelectChange}
                closeMenuOnSelect={false}
                value={selectedOptions}
                isMulti
                isOptionDisabled={() => selectedOptions.length >= 5}
                required
              />
            </div>
            <div className="mb-10">
              <span className="fw-bold text-gray-700 d-block">Note</span>
                <textarea className="form-control" name="task_note" id="" onChange={(e) => setTaskNote(e.target.value)} ></textarea>
            </div>
            <div style={{ display : "flex", width : "100%", justifyContent : "end"}}>
            <input type="submit" className="btn btn-primary" value={"Submit"} />
            <input
              type="button"
              className="btn btn-secondary ms-3"
              value={"Cancel"}
              id="new_task_close"
              onClick={onClose}
            />
        </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export { NewTaskDrawer };
