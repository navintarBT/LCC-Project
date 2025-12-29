import React from "react";
import styles from "./task-list-table.module.css";
import { Task } from "../../types/public-types";
import { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useListViewContext } from "../../../src/app/modules/systory/components/systorytask/core/GantListViewProvider";
import { useChangeStatusContext } from "../../../src/app/modules/systory/components/systorytask/core/GantListViewProvider";
// import 'bootstrap/dist/css/bootstrap.min.css';
import Form from "react-bootstrap/Form";
// import axios from 'axios';
import Swal from "sweetalert2";
import axios from "axios";
import { useIntl } from "react-intl";
import { useAuth } from "../../../src/app/modules/auth";
let init = {
  _id: "",
  username: "",
  display_name: "",
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  segment: "",
  __v: 0,
};

const BASE_URL = process.env.VITE_SERVER_URL;
const PRO_BASE_URL = `${BASE_URL}/projects`;

export const TaskListTableDefault: React.FC<{
  rowHeight: number;
  rowWidth: string;
  fontFamily: string;
  fontSize: string;
  locale: string;
  tasks: Task[];
  selectedTaskId: string;
  setSelectedTask: (taskId: string) => void;
  onExpanderClick: (task: Task) => void;
}> = ({
  rowHeight,
  rowWidth,
  tasks,
  fontFamily,
  fontSize,
  onExpanderClick,
}) => {
  const { currentUser } = useAuth();
  const [userLogin, setUserLogin] = useState<any>(init);
  const [systoryStatus, setSystoryStatus] = useState("");
  const [kumonosStatus, setKumonosStatus] = useState("");
  const [showComplete, setShowComplete] = useState(false);
  const [completeID, setCompleteID] = useState("");
  const [completeURL, setCompleteURL] = useState("");
  const [statusOnHold, setStatusOnHold] = useState("");
  const [statusNotStart, setStatusNotStart] = useState("");


  useEffect(() => {
    setUserLogin(currentUser);
    if (userLogin.segment == "systory" && userLogin.role == "worker") {
      setSystoryStatus(userLogin.role);
    } else if (
      userLogin.segment == "systory" &&
      (userLogin.role == "administrator" || userLogin.role == "management")
    ) {
      setSystoryStatus(userLogin.role);
    } else if (
      userLogin.segment == "kumonos" &&
      userLogin.role == "administrator"
    ) {
      setKumonosStatus(userLogin.role);
    } else if (
      (userLogin.segment == "kumonos" && userLogin.role == undefined) ||
      (userLogin.segment == "kumonos" && userLogin.role == "worker")
    ) {
      setKumonosStatus("worker");
    }
  }, [currentUser, userLogin]);

  const closeShowComplete = () => setShowComplete(false);
  const { setItemIdForUpdate } = useListViewContext();
  const { setStatus } = useChangeStatusContext();
  let pageName = window.location.pathname.split("/").filter(Boolean).pop();

  function formatDateToISOWithoutUTC(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    const milliseconds = String(date.getMilliseconds()).padStart(3, "0");
  
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  const onChangeStatusNotStart = async (event: any, taskId: any) => {
    const selectedStatus = event.target.value;
    // console.log("selectedStatus", selectedStatus);
    
    const taskID = taskId;
    let request_task = await axios
      .get(`${PRO_BASE_URL}/request-task`)
      .then((res) => {
        return res.data;
      });
    Swal.fire({
      title: "Are you sure?",
      text: `You want to change the status to ${selectedStatus}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, change",
    }).then((result) => {
      if (result.isConfirmed) {
        if (selectedStatus !== "waitingDelivery") {
          request_task?.forEach((project: any) => {
            if (
              project.sub_project_name.sub_project_name === taskID &&
              project.status !== "waitingDelivery" && project.status !== "complete"
            ) {
              let mainProject = project;
              console.log("selectedStatus", selectedStatus);
              
              mainProject.status = selectedStatus;
              if (selectedStatus == "removal" ) {
                mainProject.start_for_check = formatDateToISOWithoutUTC(new Date());
                let request_id = mainProject.request_id._id;
                console.log("mainProject",mainProject); 
                let new_start_for_check = mainProject.request_id.start_for_check = formatDateToISOWithoutUTC(new Date());
                //update request start for check
                axios.put(`${PRO_BASE_URL}/update-request-start-for-check/${request_id}`, { start_for_check : new_start_for_check })
                .then((response) => {
                })
                .catch((error) => {
                  console.log("error", error);
                });
              }  
              const update = axios.put(`${PRO_BASE_URL}/update-request-task/${mainProject._id}`,mainProject)
                .then((response) => {
                })
                .catch((error) => {
                });
            }
          });
          Swal.fire({
            title: "Successfully",
            text: "Changed the status of the task",
            icon: "success",
          })
          setStatus(selectedStatus);
        } else {
          let progress: any = [];
          request_task.forEach((project: any) => {
            if (project.request_id.project_id === taskID) {
              let mainProject = project;
              mainProject.status = selectedStatus;
              progress.push(mainProject.request_id.progress);
            }
          });
          progress.forEach((value: any) => {
            if (value < 100) {
              Swal.fire({
                title: "Can't change status!",
                text: "Please update on the process!",
                icon: "info",
              });
            } else {
              request_task.forEach((project: any) => {
                if (
                  project.request_id.project_id === taskID &&
                  project.status !== "waitingDelivery"
                ) {
                  let mainProject = project;
                  mainProject.status = selectedStatus;
                  axios
                    .put(
                      `${PRO_BASE_URL}/update-request-task/${mainProject._id}`,
                      mainProject
                    )
                    .then((response) => {

                    })
                    .catch((error) => {
                      console.error("Error updating project", error);
                    });
                }
              });
              Swal.fire({
                title: "Successfully",
                text: "Changed the status of the task",
                icon: "success",
              })
              setStatus(selectedStatus);
            }
          });
        }
        setStatusNotStart(selectedStatus);
      }
    });
  };

  const inputURL = (event: any) => {
    let textURL = event.target.value;
    setCompleteURL(textURL);
  };
  const showPopupComplete = (id: any) => {
    setCompleteID(id);
    setItemIdForUpdate(id);
  };
  const onSubmitComplete = () => {
    const dataFroUpload = {
      id: completeID,
      status: "Complete",
      dataLink: completeURL,
    };
    closeShowComplete();
  };

  return (
    <div
      className={styles.taskListWrapper}
      style={{ fontFamily: fontFamily, fontSize: fontSize }}
    >
      {tasks.map((t) => {     
        let expanderSymbol = "";
        if (t.hideChildren === false) {
          expanderSymbol = "▼";
        } else if (t.hideChildren === true) {
          expanderSymbol = "▶";
        }
        return (
          <div
            className={styles.taskListTableRow}
            style={{ height: rowHeight }}
            key={`${t.id}row`}
          >
            <div
              className={styles.taskListCell}
              style={{ minWidth: rowWidth, maxWidth: rowWidth }}
              title={t.name}
            >
              <div
                className={styles.taskListNameWrapper}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <div style={{ display: "flex" }} className="sybolAndName">
                  <div
                    style={{ fontSize: "13px", marginTop: "-2px" }}
                    className={
                      expanderSymbol
                        ? styles.taskListExpander
                        : styles.taskListEmptyExpander
                    }
                    onClick={() => onExpanderClick(t)}
                  >
                    {expanderSymbol}
                  </div>
                  <div
                    style={{ display: "flex" }}
                    className="projectName-content"
                  >
                    
                    {t.type === "project" && <div>{t.name}</div>}


                    {t.type !== "project" && (<div style={{ marginLeft: "15px" }}>{t.name}</div>)}
                  </div>
                </div>
                <div className="checkStatus" title="Edit">
                  {t.progress === 90 && t.type !== "project" && (
                    <div style={{ marginRight: "10px" }} className="icons">
                      {systoryStatus == "administrator" && (
                          <i
                            style={{
                              color: "#707B7C",
                              cursor: "pointer",
                              fontSize: "17px",
                              marginTop: "2px",
                            }}
                            onClick={() => showPopupComplete(t.task_id)}
                            className="ki-duotone ki-send"
                          >
                            <span className="path1"></span>
                            <span className="path2"></span>
                          </i>
                        )}
                    </div>
                  )}
                  {t.type === "project" && t.status === "waitingDelivery" && (
                    <div style={{ marginRight: "10px" }} className="icons">
                      <i
                        style={{
                          color: "#707B7C",
                          cursor: "pointer",
                          fontSize: "17px",
                          marginTop: "2px",
                        }}
                        onClick={() => showPopupComplete(t.request_id)}
                        className="ki-duotone ki-send"
                        data-bs-toggle="modal"
                        data-bs-target="#kt_modal_1"
                      >
                        <span className="path1"></span>
                        <span className="path2"></span>
                      </i>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div
              className={styles.taskListCell}
              style={{
                display: "flex",
                minWidth: rowWidth,
                maxWidth: rowWidth,
              }}
            >
              <div
                style={{
                  width: "1px",
                  height: "50px",
                  backgroundColor: "#E4E4E4",
                }}
                className="border"
              ></div>
              {t.status === "removal" && t.type === "project" && (
                <div
                  style={{
                    display: "flex",
                    backgroundColor: "#D1EBDA",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "155px",
                    height: "50px",
                  }}
                  className="status-content"
                >
                  {(systoryStatus == "administrator" || systoryStatus == "management") &&
                    pageName !== "dashboard" && (
                      <Form.Select
                        className="custom-select"
                        style={{
                          height: "45px",
                          backgroundColor: "#D1EBDA",
                          fontSize: "14px",
                        }}
                        value={t.status}
                        aria-label="Default select example"
                        onChange={(event) =>
                          onChangeStatusNotStart(event, t.id)
                        }
                      >
                        <option value="removal">Removal</option>
                        <option value="onHold">On Hold</option>
                        <option value="waitingDelivery">
                          Waiting Delivery
                        </option>
                      </Form.Select>
                    )}
                  {pageName == "dashboard" && (
                    <div className="status">Removal</div>
                  )}
                  {kumonosStatus == "worker" && pageName != "dashboard" && (
                    <div className="status">Removal</div>
                  )}
                  {systoryStatus == "worker" && pageName != "dashboard" && (
                    <div className="status">Removal</div>
                  )}
                  {kumonosStatus == "administrator" &&
                    pageName != "dashboard" && (
                      <div className="status">Removal</div>
                    )}
                </div>
              )}
              {t.status === "onHold" && t.type === "project" && (
                <div
                  style={{
                    display: "flex",
                    backgroundColor: "#FCF3CF",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "155px",
                    height: "50px",
                  }}
                  className="status-content"
                >
                  {(systoryStatus == "administrator" || systoryStatus == "management") &&
                    pageName !== "dashboard" && (
                      <Form.Select
                        className="custom-select"
                        style={{
                          height: "45px",
                          backgroundColor: "#FCF3CF",
                          border: "none",
                          fontSize: "14px",
                        }}
                        value={t.status}
                        aria-label="Default select example"
                        onChange={(event) =>
                          onChangeStatusNotStart(event, t.id)
                        }
                      >
                        <option value="removal">Removal</option>
                        <option value="onHold">On Hold</option>
                        <option value="waitingDelivery">
                          Waiting Delivery
                        </option>
                        {/* <option value="Cancel">Cancel</option> */}
                      </Form.Select>
                    )}
                  {pageName == "dashboard" && (
                    <div className="status">On Hold</div>
                  )}
                  {kumonosStatus == "worker" && pageName != "dashboard" && (
                    <div className="status">On Hold</div>
                  )}
                  {systoryStatus == "worker" && pageName != "dashboard" && (
                    <div className="status">On Hold</div>
                  )}
                  {kumonosStatus == "administrator" &&
                    pageName != "dashboard" && (
                      <div className="status">On Hold</div>
                    )}
                </div>
              )}
              {t.status === "notStart" && t.type === "project" && (
                <div
                  style={{
                    display: "flex",
                    backgroundColor: "#F4D0D0",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "155px",
                    height: "50px",
                  }}
                  className="status-content"
                >
                  {(systoryStatus == "administrator" || systoryStatus == "management") &&
                    pageName !== "dashboard" && (
                      <Form.Select
                        className="custom-select"
                        style={{
                          height: "45px",
                          backgroundColor: "#F4D0D0",
                          border: "none",
                          fontSize: "14px",
                        }}
                        value={t.status}
                        aria-label="Default select example"
                        onChange={(event) =>
                          onChangeStatusNotStart(event, t.id)
                        }
                      >
                        <option value="notStart">Not Start</option>
                        <option value="removal">Removal</option>
                        <option value="onHold">On Hold</option>
                        <option value="waitingDelivery">Waiting Delivery</option>
                      </Form.Select>
                    )}
                  {pageName == "dashboard" && (
                    <div className="status">Not Start</div>
                  )}
                  {kumonosStatus == "worker" && pageName != "dashboard" && (
                    <div className="status">Not Start</div>
                  )}
                  {systoryStatus == "worker" && pageName != "dashboard" && (
                    <div className="status">Not Start</div>
                  )}
                  {kumonosStatus == "administrator" &&
                    pageName != "dashboard" && (
                      <div className="status">Not Start</div>
                    )}
                </div>
              )}
              {t.status === "waitingDelivery" && t.type === "project" && (
                <div
                  style={{
                    display: "flex",
                    backgroundColor: "#EBDDF0",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "155px",
                    height: "50px",
                  }}
                  className="status-content"
                >
                  {(systoryStatus == "administrator" || systoryStatus == "management") &&
                    pageName !== "dashboard" && (
                      <Form.Select
                        className="custom-select"
                        style={{
                          height: "45px",
                          backgroundColor: "#F4D0D0",
                          border: "none",
                          fontSize: "14px",
                        }}
                        value={t.status}
                        aria-label="Default select example"
                        onChange={(event) =>
                          onChangeStatusNotStart(event, t.id)
                        }
                      >
                        <option value="notStart">Not Start</option>
                        <option value="removal">Removal</option>
                        <option value="onHold">On Hold</option>
                        <option value="waitingDelivery">
                          Waiting Delivery
                        </option>
                        {/* <option value="Cancel">Cancel</option> */}
                      </Form.Select>
                    )}
                  {pageName == "dashboard" && (
                    <div className="status">Waiting Delivery</div>
                  )}
                  {kumonosStatus == "worker" && pageName != "dashboard" && (
                    <div className="status">Waiting Delivery</div>
                  )}
                  {systoryStatus == "worker" && pageName != "dashboard" && (
                    <div className="status">Waiting Delivery</div>
                  )}
                  {kumonosStatus == "administrator" &&
                    pageName != "dashboard" && (
                      <div className="status">Waiting Delivery</div>
                    )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <Modal
        style={{ margin: "auto", top: "0", bottom: "0" }}
        show={showComplete}
        onHide={closeShowComplete}
        animation={false}
      >
        <Modal.Header>
          <Modal.Title>Upload link</Modal.Title>
          <div
            className="btn btn-icon btn-sm btn-color-gray-500 btn-active-icon-primary"
            data-bs-toggle="tooltip"
            title="Hide Event"
            data-bs-dismiss="modal"
            onClick={closeShowComplete}
          >
            <i style={{ fontSize: "22px" }} className="ki-duotone ki-cross">
              <span className="path1"></span>
              <span className="path2"></span>
            </i>
          </div>
        </Modal.Header>
        <form onSubmit={onSubmitComplete}>
          <Modal.Body>
            <div className="row">
              <div className="col-md-12">
                <Form.Group
                  style={{ marginTop: "7px" }}
                  controlId="exampleForm.ControlInput1"
                >
                  <Form.Label>Data link</Form.Label>
                  <Form.Control
                    className="input"
                    type="text"
                    value={"completeURL"}
                    placeholder="Please input this URL."
                    onChange={inputURL}
                    required
                  />
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              style={{
                backgroundColor: "#F1F1F4",
                border: "none",
                color: "black",
                height: "45px",
                width: "90px",
              }}
              variant="secondary"
              onClick={closeShowComplete}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              style={{
                backgroundColor: "#1E7ABD",
                height: "45px",
                width: "90px",
                border: "none",
              }}
              variant="primary"
            >
              Submit
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};
