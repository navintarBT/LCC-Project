import React, { FC, useEffect, useState } from "react";
import { KTIcon } from "../../../helpers";
import Select from "react-select";
import "flatpickr/dist/flatpickr.css";
import Flatpickr from "react-flatpickr";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "../../../../app/modules/auth";



const BASE_URL = process.env.VITE_SERVER_URL;
const PRO_BASE_URL = `${BASE_URL}/projects`
const USER_BASE_URL = `${BASE_URL}/users`
const SETTING_BASE_URL = `${BASE_URL}/settings`
interface EditTaskDrawerProps {
  task_id: string;
  setupdateData : (data: any) => void
}

type Task = {
  project_id: string;
  task_name: string;
  category?: string | null;
  start: any;
  deadline: any;
  persons_in_charge: any;
  status: string;
  note: string;
  version: number | null;
};

let taskDataObj: Task = {
  project_id: "",
  task_name: "",
  category: "",
  start: null,
  deadline: null,
  persons_in_charge: [],
  status: "on going",
  note: "",
  version: 1
};

interface PersonsIncharge {
  id: string;
  value: string;
  label: string;
}

interface Category {
  id: string;
  value?: string;
  label?: string;
}

interface DetaultActualdate {
  id : string;
  person_id: string;
  task_id: string;
  actualDate: string[];
}

const categorySelectedInit: Category = {
  id: "",
  value: "",
  label: "",
};

type UserData = { _id: string; display_name: string; label: string };
type CategoryData = { _id: string; category_name: string; label: string };

const EditTaskDrawer: FC<EditTaskDrawerProps> = ({ task_id, setupdateData }) => {
  const [selectedOptions, setSelectedOptions] = useState<PersonsIncharge[]>([]);

  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [getProId, setGetProId] = useState("");
  const [taskName, setTaskName] = useState("");
  const [categorySelected, setCategorySelected] = useState<
    Category | undefined
  >(categorySelectedInit);
  const [dateStart, setDateStart] = useState<Date[]>([new Date()]);
  const [deadline, setDeadline] = useState<Date[]>([new Date()]);
  const [taskData, setTaskData] = useState<Task>(taskDataObj);
  const [defaultTaskData, setDefaultTaskData] = useState<Task>(taskDataObj);
  const [getUserData, setGetUserData] = useState<UserData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [oldActualDate, setOldActualDate] = useState<DetaultActualdate>();
  const [getTaskNote, setTaskNote] = useState("");
  const [spaceDate, setSpaceDate] = useState<any[]>([]);
  const [version, setVersion] = useState<number | null>();
  const { currentUser } = useAuth();

  let data: Task;
  let GETACTUALDATE : any = [];
  let userId = currentUser?._id;
  

  const fetchData = async () => {
    try {
      await axios
        .post(`${PRO_BASE_URL}/edit-task/${task_id}`)
        .then((res) => {
          data = {
            persons_in_charge: res.data?.persons_in_charge,
            project_id: res.data.project_id,
            start: res.data.start,
            deadline: res.data.deadline,
            category: res.data.category,
            task_name: res.data.task_name,
            status: res.data.status,
            note: res.data.note ? res.data.note : "",
            version: res.data.version
          };
        });
        setVersion(data.version);
      await axios.get(`${PRO_BASE_URL}/category`).then((res) => {
        setCategoryData(res.data);
      });
      const userResponse = await axios.get(`${USER_BASE_URL}/get-all-user`);
      let userData = userResponse.data;
      ((user: any) => user.role === "worker");
      setGetUserData(userData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  let personOptions: PersonsIncharge[] = [];
  let categoryOptions: PersonsIncharge[] = [];

  getUserData.forEach((taskData) => {
    personOptions.push({
      id: taskData._id,
      value: taskData._id,
      label: taskData.display_name,
    });
  });
  categoryData.forEach((categoryData) => {
    categoryOptions.push({
      id: categoryData._id,
      value: categoryData.category_name,
      label: categoryData.category_name,
    });
  });
  categoryOptions.unshift({ id: "", value: "" , label: "" })
  function deepEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
  }
  useEffect(() => {
    let dateStartForSave = new Date(dateStart[0]);
    dateStartForSave.setUTCHours(0, 0, 0, 0);

    let deadlineForSave = new Date(deadline[0]);
    deadlineForSave.setUTCHours(0, 0, 0, 0);
    
    setTaskData((prevTaskData) => ({
      ...prevTaskData,
      project_id: getProId,
      task_name: taskName,
      category: categorySelected?.id || null,
      start: dateStartForSave,
      deadline: deadlineForSave,
      note: getTaskNote,
      persons_in_charge: selectedOptions.map(item => ({ user: item.id, user_name_done: {user:null, user_name:null} })),
      version: version || null,
    }));
  }, [getProId, taskName, categorySelected, dateStart, deadline, selectedOptions, getTaskNote]);

  function getDatesBetween(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    let currentDate = new Date(startDate);
  
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  
    return dates;
  }

  function getDateStringsBetween(startDateStr: string, endDateStr: string): string[] {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    endDate.setHours(23, 59, 59, 999);
    const dates = getDatesBetween(startDate, endDate);
    
    return dates.map(date => date.toISOString().split('T')[0]); // Format as YYYY-MM-DD
  }

  const UpadateTask  = async () => {
    let actualDateToUpdate;
    try {
      await axios.put(`${PRO_BASE_URL}/update-task/${task_id}`, taskData).then((response : any) => {
        setSubmitSuccess(true);
      });
    const dateStrings = getDateStringsBetween(taskData.start, taskData.deadline);
    
    const difference = dateStrings.filter(date => oldActualDate?.actualDate.includes(date));
    
    actualDateToUpdate = {
      person_id: oldActualDate?.person_id,
      task_id: oldActualDate?.task_id,
      actualDate : difference
    }

    if (oldActualDate?.id) {
      await axios.put(`${PRO_BASE_URL}/update-actual/${oldActualDate?.id}`, actualDateToUpdate)
      .then(response => {
      });
    }

    await axios.get(`${PRO_BASE_URL}/tasks`).then(res => {
        setupdateData(res.data);
        })
      } catch(error : any) {
        if (error.response && error.response.status === 409) {
          Swal.fire({
            title: "Please reload and try again.",
            text: "Conflict detected. Update failed.",
            icon: "warning",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "Yes, reload it!"
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.reload();
            }
          });
        } else {
          console.log(error);
        }
      }
    }

  useEffect(() => { 
    if (submitSuccess) {
        const cancelButton = document.getElementById("edit_task_close");
      if (cancelButton) {
        cancelButton.click();
        setSubmitSuccess(false)
      }
    }
    
  }, [submitSuccess]);

  //TODO: submit From
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(taskData.start > taskData.deadline) {
      Swal.fire({
        title: `Invalid Date Range`,
        text: `The start date must be earlier than the deadline. Please adjust your dates accordingly.`,
        icon: "info",
        confirmButtonColor: "#1E7ABD",
        confirmButtonText: "OK",
      })
      return;
    }
    setSubmitSuccess(true);
    if (deepEqual(defaultTaskData, taskData)) {
      Swal.fire({
        title: "No changes detected",
        text: "No changes have been made to the task data.",
        icon: "info",
        confirmButtonColor: "#1E7ABD",
      });
    } else {
      UpadateTask()
    }
  };

  //close popup
  const onClose = () => {
    // axios.put(`${PRO_BASE_URL}/unlock-task/${task_id}`, { userId }).then((res) => {console.log(res.status)});
    setGetProId("");
    setTaskName("");
    setDateStart([]);
    setDeadline([]);
    setTaskNote("");
    setCategorySelected(categorySelectedInit);
    setSelectedOptions([]);
  };
  const handleSelectChange = (selectedOptions: any) => {
    setSelectedOptions(selectedOptions);
  };
  const handleSelectCategory = (selectedOptions: any) => {
    setCategorySelected(selectedOptions);
  };

  useEffect(() => {
    const fetchDataAndSetTaskData = async () => {
      if (task_id) {
        await fetchData();
        let getPersonalAuctuaDate;
        data.persons_in_charge.forEach(async (person : any) => {
          if (person.user != null) {
            GETACTUALDATE = await axios.post(`${PRO_BASE_URL}/person-actual/${person.user._id}`).then((res) => { 
              return res.data
            });
            getPersonalAuctuaDate = GETACTUALDATE.filter((actual  :any) => task_id == actual.task_id)
            if (getPersonalAuctuaDate[0]?._id) {
              setOldActualDate({
                id: getPersonalAuctuaDate[0]._id,
                person_id: getPersonalAuctuaDate[0].person_id,
                task_id: getPersonalAuctuaDate[0].task_id,
                actualDate : getPersonalAuctuaDate[0].actualDate
              })
            }
          }
        })
        const updatedPersonsInCharge = data.persons_in_charge.map((person:any) => ({
          user: person.user?._id,
          user_name_done: {user:null, user_name:null}
        }));
        const fetchedTaskData: Task = {
          project_id: data.project_id,
          task_name: data.task_name,
          category: data.category,
          start: data.start,
          deadline: data.deadline,
          persons_in_charge: updatedPersonsInCharge,
          status: data.status,
          note: data.note,
          version: data.version,
        };
        setDefaultTaskData(fetchedTaskData);

        setGetProId(data.project_id);
        setTaskName(data.task_name);
        setCategorySelected(
          categoryOptions.find((option) => option.id == data.category)
        );
        setTaskNote(data.note);
        setDateStart(data.start ? [data.start] : [new Date()]);
        setDeadline(data.deadline ? [data.deadline] : [new Date()]);
        setSelectedOptions(
          personOptions.filter((option) =>
            data.persons_in_charge.flatMap((person:any) => person.user?._id).includes(option.id)
          )
        );
        
      }
    };


    fetchDataAndSetTaskData();
  }, [task_id,getProId]);

  return (
    <div
      id="edit_task"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="activities"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'710px', 'lg': '710px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#edit_task_toggle"
      data-kt-drawer-close="#edit_task_close"
      style={{ overflowY: "scroll" }}
    >
      <div className="card shadow-none rounded-0  w-100">
        <div className="card-header" id="edit_task_header">
          <h3 className="card-title fw-bolder text-gray-900">Edit task</h3>

          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
              id="edit_task_close"
              onClick={onClose}
            >
              <KTIcon iconName="cross" className="fs-1" />
            </button>
          </div>
        </div>
        <div className="card-body position-relative" id="edit_task_body">
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <span className="fw-bold text-gray-700">Task name</span>
              <input
                type="text"
                className="form-control"
                name="taskName"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
              />
            </div>
            <div className="mb-5">
              <span className="fw-bold text-gray-700">
                Category <span className=" text-muted">(Optional)</span>
              </span>
              <div>
                <Select
                  className="react-select-style"
                  classNamePrefix="react-select"
                  options={categoryOptions}
                  value={categorySelected}
                  onChange={(e: any) => handleSelectCategory(e)}
                />
              </div>
            </div>
            <div
              className="mb-5"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <div>
                <span className="fw-bold text-gray-700">Start date</span>
                <Flatpickr
                  value={dateStart}
                  onChange={(startDate: Date[]) => {
                    const nextDay = new Date(startDate[0].toISOString());
                    nextDay.setUTCHours(0, 0, 0, 0);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setDateStart([nextDay]);
                  }}
                  className="form-control"
                  placeholder="Pick date"
                  data-date-format="Y/m/d"
                  style={{ width: "310px" }}
                />
              </div>

              <div>
                <span className="fw-bold text-gray-700">Deadline</span>
                <Flatpickr
                  value={deadline}
                  onChange={(deadline: Date[]) => {
                    const nextDay = new Date(deadline[0].toISOString());
                    nextDay.setUTCHours(0, 0, 0, 0);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setDeadline([nextDay]);
                  }}
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
                className="react-select-style rounded mb-3"
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
                <textarea className="form-control" name="task_note" id="" value={getTaskNote} onChange={(e) => setTaskNote(e.target.value)} ></textarea>
            </div>
            <div style={{ display : "flex", width : "100%", justifyContent : "end"}}>
            <input type="submit" className="btn btn-primary" value={"Save"} />
            <input
              type="button"
              className="btn btn-secondary ms-3"
              value={"Cancel"}
              id="edit_task_close"
              onClick={onClose}
            />
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export { EditTaskDrawer };
