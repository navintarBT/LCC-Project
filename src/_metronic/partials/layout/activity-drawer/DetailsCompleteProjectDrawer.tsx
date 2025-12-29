import React, { FC, useEffect, useState } from "react";
import { KTIcon, toAbsoluteUrl } from "../../../helpers";
import Flatpickr from "react-flatpickr";
import Select from "react-select";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "../../../../app/modules/auth";
const BASE_URL = process.env.VITE_SERVER_URL;
const PRO_BASE_URL = `${BASE_URL}/projects`
const USER_BASE_URL = `${BASE_URL}/users`
const SETTING_BASE_URL = `${BASE_URL}/settings`
interface Task {
  id: string;
  displayName: string[];
  label: string;
  deadline?: string;
  category: string;
  status: string;
}

interface Project {
  project_id: string;
  projectName: string;
  createDate: string;
  completeDate: string;
  status: string;
  tasks: Task[];
}

interface ProjectUpdate {
  business_name: string;
  business_number: string;
  customer_name: string;
  complete_date: string | null;
  status: string;
}

type props = {
  projectId: string | null;
  projectData: Project[] ;
  onProjectUpdateFromDetail : (data : any) => void;
};
const DetailsCompleteProjectDrawer: FC<props> = ({ projectId, projectData, onProjectUpdateFromDetail}) => {
  const [projectDetails, setProjectDetails] = useState<Project[]>([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const { currentUser } = useAuth();

  const fetchProdata = async () => {
    await axios.get(`${PRO_BASE_URL}`)
              .then(res => {
                onProjectUpdateFromDetail(res.data)
              })
              .catch(error => {
                console.log('Error updating student:', error);
              });
  }

  const ReturnOngoing = () => {
    let setDataToEdit : ProjectUpdate;
    let pro_id = projectDetails[0].project_id;
    let proNameStr = projectDetails[0].projectName;
    let proNameToArry = proNameStr.split("/")
    let business_name = proNameToArry[2];
    let business_number = proNameToArry[0];
    let customer_name = proNameToArry[1];

    setDataToEdit = {
      "business_name" : business_name,
      "business_number" : business_number,
      "customer_name" : customer_name,
      "complete_date" : null,
      "status" : "Ongoing"
    }
    
    Swal.fire({
      icon: "question",
      title: "Project Continuation",
      text:"Do you really wish to return this project to active status?",
      showCancelButton: true,
      confirmButtonColor: "#1E7ABD",
      confirmButtonText: "Yes, confirm",
    }).then((result) => {
      if (result.isConfirmed) {
       async function getNeditPeo() {
          await axios.put(`${PRO_BASE_URL}/update-project/${pro_id}`, setDataToEdit)
          .then(res => {
            // console.log('project Successfully Updated:', res.data);
          })
          .catch(error => {
            console.log('Error updating student:', error);
          });
       }
        getNeditPeo();
        fetchProdata();
        setSubmitSuccess(true)
        Swal.fire("Saved!", "", "success");
      } else if (result.isDenied) {
        Swal.fire("Changes are not saved", "", "info");
      }
    });
  };

  useEffect(() => { 
    if (submitSuccess) {
        const cancelButton = document.getElementById("details_complete_project_close");
      if (cancelButton) {
        setSubmitSuccess(false)
        cancelButton.click();
      }
    }
    
  }, [submitSuccess]);

  useEffect(() => {
    if (projectData) {
      const filteredProjectData = projectData.filter((item) => item.project_id === projectId);
      setProjectDetails(filteredProjectData);
    }
    
  }, [projectId,]);
  return (
    <div
      id="details_complete_project"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="activities"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'700px', 'lg': '700px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#details_complete_project_toggle"
      data-kt-drawer-close="#details_complete_project_close"
    >
      <div className="card shadow-none rounded-0  w-100">
        <div className="card-header" id="details_complete_project_header">
          <h3 className="card-title fw-bolder text-gray-900">
            Project Details
          </h3>

          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
              id="details_complete_project_close"
            >
              <KTIcon iconName="cross" className="fs-1" />
            </button>
          </div>
        </div>
        <div
          className="card-body position-relative"
          id="details_complete_project_body"
        >
         {projectDetails.map(project => (
            <div key={project.project_id}>
              <div className="mb-5">
                <span className="fw-bold text-gray-700">Main project name</span>
                <input
                  type="text"
                  className="form-control"
                  value={project.projectName}
                  disabled
                />
              </div>
              <div className="mb-5" style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <span className="fw-bold text-gray-700">Create date</span>
                  <Flatpickr
                    className="form-control"
                    data-date-format="Y/m/d"
                    placeholder="Pick date"
                    style={{ width: "310px" }}
                    value={project.createDate}
                    disabled
                  />
                </div>
                <div>
                  <span className="fw-bold text-gray-700">Complete date</span>
                  <Flatpickr
                    className="form-control"
                    placeholder="Pick date"
                    data-date-format="Y/m/d"
                    style={{ width: "310px" }}
                    value={project.completeDate}
                    disabled
                  />
                </div>
              </div>
              <div className="mb-5">
                <span className="fw-bold text-gray-700">Tasks lists</span>
                <div className="card" style={{ height: "50vh" }}>
                  <div className="table-responsive p-6">
                    <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-3">
                      <tbody>
                        {project.tasks.map(task => (
                          <tr key={task.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="d-flex justify-content-start flex-column">
                                  <span className="text-gray-600 fw-bold fs-6">Task name: {task.label}</span>
                                  <span className="text-muted fw-semibold text-muted d-block fs-7">Category: {task.category? task.category:"N/A"}</span>
                                </div>
                              </div>
                            </td>
                            <td className="text-end">
                              <span className="text-gray-600 fw-bold d-block fs-6">Persons in charge: {task.displayName.join(", ")}</span>
                              <span className="text-muted fw-semibold text-muted d-block fs-7">Deadline: {task.deadline}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div style={{ display : "flex", width : "100%", justifyContent : "end"}}>
          {currentUser?.role === "administrator" && (
          <input
            type="button"
            className="btn btn-primary me-3"
            value={"Return to ongoing"}
            onClick={() => ReturnOngoing()}
          />
          )}
          <input
            type="button"
            className="btn btn-secondary"
            value={"Cancel"}
            id="details_complete_project_close"
          />
        </div>
        </div>
      </div>
    </div>
  );
};
export { DetailsCompleteProjectDrawer };