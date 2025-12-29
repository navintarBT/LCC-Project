import React, { FC, useEffect, useState } from "react";
import { KTIcon } from "../../../helpers";
import Select from "react-select";
import "flatpickr/dist/flatpickr.css";
import axios from "axios";
import Swal from "sweetalert2";
const BASE_URL = process.env.VITE_SERVER_URL;
const PRO_BASE_URL = `${BASE_URL}/projects`
const USER_BASE_URL = `${BASE_URL}/users`
const SETTING_BASE_URL = `${BASE_URL}/settings`
interface proSelected {
  projectId : string;
  proToParent: (data : any) => void;
}

interface Project {
  business_number: string;
  customer_name: string;
  business_name: string;
  complate_date?: any;
  status?: string;
}

let projectObj: Project = {
  business_number: "",
  customer_name: "",
  business_name: "",
  complate_date: null,
  status: "",
};

const EditProjectDrawer: FC<proSelected> = ({projectId, proToParent}) => {
  const [proData, setProData] = useState()
  const [proId, setProId] = useState<string>(projectId)
  const [projectUpdate, setProjectUpdate] = useState<Project>(projectObj)
  const [statusProject, setStatusProject] = useState<string>("")
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false)

  const statusOptions = [
    { value: "Complete", label: "Complete" },
    { value: "Ongoing", label: "Ongoing" },
    { value: "Delete", label: "Delete" },
  ];

  function inputData(e : any) {
    const { name, value } = e.target;
    
    setProjectUpdate((prev) => {
       return {...prev, [name] : value}
    });
  }

  const handleFetchData = async () => {
    let pro_data = await axios.get(`${PRO_BASE_URL}`).then(res => {
      return res.data;
    })
  .catch (error => {
    console.error("Error fetching data:", error);
  });

  return pro_data
  };

  // get selected category 
  const getStatusProject = (data:any) => {
    setStatusProject(data);

    if (data.value == "Complete") {
      let today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      setProjectUpdate((prev) => {
        return {...prev, status : data.value, complate_date : today.toISOString()}
     });
    } else {
      setProjectUpdate((prev) => {
        return {...prev, status : data.value}
     });
    }
  }
  function deepEqual(obj1: any, obj2: any): boolean {
  const newObj = {
    "business_number": obj1.business_number,
    "customer_name": obj1.customer_name,
    "business_name": obj1.business_name,
    "status": obj1.status
};
    return JSON.stringify(newObj) === JSON.stringify(obj2);
  }

  const onSunmit = async (e : any) => {
    e.preventDefault();

    if (deepEqual(proData, projectUpdate)) {
      Swal.fire({
        title: "No changes detected",
        text: "No changes have been made to the project data.",
        icon: "info",
        confirmButtonColor: "#1E7ABD",
      });
    } else {
      setSubmitSuccess(true);
      await axios.put(`${PRO_BASE_URL}/update-project/${projectId}`, projectUpdate)
                .then(res => {
                  // console.log('project Successfully Updated:', res.data);
                })
                .catch(error => {
                  console.log('Error updating student:', error);
                });
      let NewProToparent = await handleFetchData();
      proToParent(NewProToparent)
  
      setProjectUpdate(projectObj)
    }
  };

  const fetchDataFromProId = async () => {
  let data = await axios.post(`${PRO_BASE_URL}/edit-project/${projectId}`).then((res) => {
      return res.data;
    });
    return data;
  }

  let GETDATA;

  useEffect(() => {
    setProId(projectId)
    setSubmitSuccess(false);
    const funcAsync = async () => {
      GETDATA = await fetchDataFromProId();      
      await setProData(GETDATA)
    }
    if (projectId) {
      funcAsync()
    }
  
    
  }, [projectId])

  useEffect(() => { 
    setProId("")
    if (submitSuccess) {
        const cancelButton = document.getElementById("edit_project_close");
      if (cancelButton) {
        cancelButton.click();
      }
    }
    
  }, [submitSuccess]);
  
  let business_name_data : string = "";
  let business_number_data : string = "";
  let customer_name_data : string = "";
  let status_data : string = "";

  if (proData) {
    
    const { business_name, business_number, customer_name,createDate, status } = proData;
    business_name_data = business_name
    business_number_data = business_number
    customer_name_data = customer_name
    status_data = status
  }

  useEffect(() => {
      setProjectUpdate({
        "business_number": business_number_data,
        "customer_name": customer_name_data,
        "business_name": business_name_data,
        "status" : status_data
      });

      let defauleStatus = {value: status_data, label: status_data}
      getStatusProject(defauleStatus);

  }, [proData]);
  
  return (
    <div
      id="edit_project"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="activities"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'700px', 'lg': '700px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#edit_project_toggle"
      data-kt-drawer-close="#edit_project_close"
    >
      <div className="card shadow-none rounded-0  w-100">
        <div className="card-header" id="edit_project_header">
          <h3 className="card-title fw-bolder text-gray-900">Edit project</h3>

          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
              id="edit_project_close"
            >
              <KTIcon iconName="cross" className="fs-1" />
            </button>
          </div>
        </div>
        <div className="card-body position-relative" id="edit_project_body">
          <form onSubmit={onSunmit}>
            <div className="mb-5" style={{display : "none"}}>
              <span className="fw-bold text-gray-700">Project Id</span>
              <input type="text" className="form-control" name='project_id' defaultValue={projectId} onChange={inputData}/>
            </div>
            <div className="mb-5">
              <span className="fw-bold text-gray-700">Business number</span>
              <input type="text" className="form-control" name='business_number' defaultValue={business_number_data} onChange={inputData}/>
            </div>
            <div className="mb-5">
              <span className="fw-bold text-gray-700">Customer name</span>
              <input type="text" className="form-control" name='customer_name' defaultValue={customer_name_data} onChange={inputData}/>
            </div>
            <div className="mb-5">
              <span className="fw-bold text-gray-700">Business name</span>
              <input type="text" className="form-control" name='business_name' defaultValue={business_name_data} onChange={inputData}/>
            </div>
            <div className="mb-5">
              <span className="fw-bold text-gray-700">
                Status 
              </span>

              <Select
                className="react-select-style"
                classNamePrefix="react-select"
                options={statusOptions}
                value={statusProject}
                onChange={(e:any) => getStatusProject(e)}
              />
            </div>
            <div style={{ display : "flex", width : "100%", justifyContent : "end"}}>
            <input type="submit" className="btn btn-primary mt-5" value={"Submit"}/>
            <input type="button" className="btn btn-secondary ms-3 mt-5" value={"Cancel"} id="edit_project_close"/>
        </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export { EditProjectDrawer };
