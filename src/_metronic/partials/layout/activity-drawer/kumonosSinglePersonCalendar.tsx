import React, { FC, useEffect, useState } from "react";
import { KTIcon } from "../../../helpers";
import "../ActivityDrawerStyle/Adduser.css";
import Flatpickr from "react-flatpickr";
import moment from "moment";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../../../../app/modules/auth";




const BASE_URL = process.env.VITE_SERVER_URL;
const PRO_BASE_URL = `${BASE_URL}/projects`
const USER_BASE_URL = `${BASE_URL}/users`
const SETTING_BASE_URL = `${BASE_URL}/settings`



interface KumonosSinglePersonCalendarProps {
    taskData: singleCalendarTask[]; // Assuming taskDataToModel is of type singleCalendarTask
    sendPropToSingleCaledar : (data : any) => void;
    personId: string;
}

interface singleCalendarTask {
    id: string;
  ProjecTitle: string;
  projectName?: string;
  category?: string;
  personInCharge?: string;
  personInChargeForCheck?: string;
  task_segment?: string;
  task?: string;
  workDay?: string;
  status?: string;
  start: string;
  end: string;
  actualDate: string;
  classNames: string;
  backgroundColor?: string;
  borderColor?: string;
}

type actualType = {
    task_id: string;
    person_id: string;
    actualDate?: string[];
}

const initailActualDate : actualType = {
    task_id : "",
    person_id: "",
    actualDate : []
}

const todayDate = moment().startOf("day");
const YM = todayDate.format("YYYY-MM");

const KumonosSinglePersonCalendar: FC<KumonosSinglePersonCalendarProps> = ({taskData, sendPropToSingleCaledar, personId}) => {
    const { currentUser } = useAuth();
    const [actualDate, setactualDate] = useState<string[]>([]);
    const [getTaskId, setGetTaskId] = useState<singleCalendarTask[]>(taskData);
    const [taskDataToEdit, setTaskDataToEdit] = useState<singleCalendarTask>();
    const [endCurrentDate, setEndCurrentDate] = useState<string>();
    const [startCurrentDate, setStartCurrentDate] = useState<string>();
    const [actureDateData, setActualDateData] = useState<actualType>(initailActualDate);
    const [success, setSuccess] = useState(false);
    const [controlsPath, setControlsPath] = useState(false);
    const [getActualId , setGetActualId] = useState();
    const [theSameActualDate , setTheSameActualDate] = useState();
    const [endDateForActual , setEndDateForActual] = useState<string>();
    const [oldActualDate , setOldActualDate] = useState<string[]>([]);
    const [allActaulDate , setAllActaulDate] = useState<string[]>([]);
    
    let SETENDDATE : string = "";
    let SETSTARTDATE : string = "";
    let SETENDDATEFORAC : string = "";
    const inputActualDate = (selectedDates: Date[]) => {
        const formattedDates = selectedDates.map(date => formatDateForActual(date));
        setactualDate(formattedDates)
    }

    function getLastDayOfMonth(year : number, month : number) {
        let date = new Date(year, month - 1, 0);
        return date.getDate();
      }

    function formatDate(date: Date, type: string) {
        let defaultDate = new Date(date)
        let year = date.getFullYear();
        let month = String(date.getMonth() + 1).padStart(2, "0");
        let day = String(date.getDate()).padStart(2, "0");
        let dayforCheck = Number(day);
        let monthForCal = String(date.getMonth()).padStart(2, "0");
        let lastDay = getLastDayOfMonth(year, Number(monthForCal));
        if (type == "start") {
          day = String(date.getDate()).padStart(2, "0");
        } else if (dayforCheck == lastDay) {
          let getNewMonth = defaultDate.setDate(date.getDate() + 1);
          year = new Date(getNewMonth).getFullYear();
          month = String(new Date(getNewMonth).getMonth() + 1).padStart(2, "0")
          day = String(new Date(getNewMonth).getDate()).padStart(2, "0");
        } else { 
          day = String(date.getDate() + 1).padStart(2, "0");
        }
        return `${year}-${month}-${day}`;
    }

    function formatDateforDetail(date: Date) {
        let defaultDate = new Date(date)
        let year = date.getFullYear();
        let month = String(date.getMonth() + 1).padStart(2, "0");
        let day = String(date.getDate()).padStart(2, "0");
        if (Number(day) == 1) {
          let getNewMonth = defaultDate.setDate(date.getDate() - 1);
          year = new Date(getNewMonth).getFullYear();
          month = String(new Date(getNewMonth).getMonth() + 1).padStart(2, "0")
          day = String(new Date(getNewMonth).getDate()).padStart(2, "0");
        } else if (Number(day) >= 2) {
          day = String(date.getDate() - 1).padStart(2, "0");
        }
        return `${year}-${month}-${day}`;
      }

    function formatDateActual(date: Date, type: string) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        let day;
        if (type == "start") {
          day = String(date.getDate()).padStart(2, '0');
        } else {
          day = String(date.getDate()).padStart(2, '0');
        }
        return `${year}-${month}-${day}`;
    }

    function formatDateForActual(date: Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        let day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const validate = () => {
            if (controlsPath) {
                axios.put(`${PRO_BASE_URL}/update-actual/${getActualId}`, actureDateData)
                .then(response => {
                    setSuccess(true)
                });
            } else {
                axios.post(`${PRO_BASE_URL}/create-actual_date`, actureDateData)
                .then(res => {
                    setSuccess(true)
                })
                .catch(error => {
                    console.log(error);
                });
            }
            sendPropToSingleCaledar(actureDateData);
            setactualDate([""])
            setActualDateData(initailActualDate);
    }

    const onSubmitActualDate = (e : any) => {
        e.preventDefault();
        
        setActualDateData({
            task_id : taskDataToEdit?.id ?? '',
            person_id : personId,
            actualDate : actualDate
        });
    }


    useEffect(() => {
        if (actureDateData.task_id && actureDateData.actualDate) {
            let uniqueArray : string[];
            let checkAcual = false;
            let ValidateResult = false;

            if (oldActualDate.length > actualDate.length) {
                uniqueArray = oldActualDate.filter((item: string) => !actualDate.includes(item));
                uniqueArray.forEach((item: string) => {
                    checkAcual = allActaulDate.includes(item)
                    if (!checkAcual) {
                        Swal.fire({
                            icon: "error",
                            title: "Something went wrong!",
                            text: "Have the same actual date ",
                          });
                          ValidateResult = true
                        return
                    }
                });

                if(!ValidateResult) {
                    validate()
                }
                
            } else {
                uniqueArray = actualDate.filter((item: string) => !oldActualDate.includes(item));
                uniqueArray.forEach((item: string) => {
                    checkAcual = allActaulDate.includes(item)
                    if (checkAcual) {
                        Swal.fire({
                            icon: "error",
                            title: "Something went wrong!",
                            text: "Have the same actual date ",
                          });
                          ValidateResult = true
                        return
                    }
                });
                if(!ValidateResult) {
                    validate()
                }
            }
        }
        
    }, [actureDateData])

    useEffect(() => {
        if (success) {
            const cancelButton = document.getElementById("KumonosSinglePersonCalendar_close");
            if (cancelButton) {
                cancelButton.click();
                setSuccess(false); // Reset success state after click
            }
        }
    }, [success])


    useEffect(() => {
        const useAsyncDebounce = async () => {
            try {
                let GETTASKDATA = taskData[0];
                    setTaskDataToEdit(GETTASKDATA); 
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        }
            useAsyncDebounce();
    }, [taskData] );

    useEffect(() => {

    }, [actualDate]);


    useEffect(() => {
        const getTaskFromID = async () => {
            if (taskDataToEdit) {
                const actual = await axios.post(`${PRO_BASE_URL}/task-calendar-single/${taskDataToEdit?.id}/${personId}`).then((response) => {
                    return response.data;
                });

                const person_actual = await axios.post(`${PRO_BASE_URL}/person-actual/${personId}`).then((response) => {
                    return response.data;
                });
                let getAllActualDate = person_actual.map((actual : any) => actual.actualDate);
                let joineActual = [].concat(...getAllActualDate)
                
                setAllActaulDate(joineActual)

                if (actual) {
                    setOldActualDate(actual.actualDate);
                    setControlsPath(true);
                    setGetActualId(actual._id)
                } else {
                    setControlsPath(false);
                }
            }
            
        }

        if (taskDataToEdit && taskDataToEdit.end) {
            if (taskDataToEdit.actualDate) {
                let GETTASKARRAY = taskDataToEdit.actualDate.split(",")
                setactualDate(GETTASKARRAY);
            } else {
                setactualDate([""]);
            }
            const endDate = new Date(taskDataToEdit.end);
            SETSTARTDATE = formatDate(new Date(taskDataToEdit?.start), "start")
            SETENDDATE = formatDateforDetail(new Date(taskDataToEdit?.end))
            SETENDDATEFORAC = formatDateActual(new Date(taskDataToEdit?.end), "end")
            setEndCurrentDate(SETENDDATE);
            setEndDateForActual(SETENDDATEFORAC);
            setStartCurrentDate(SETSTARTDATE)
        }

        getTaskFromID();
    }, [taskDataToEdit]);
    
    return(
        <>
          <div
            style={{zIndex: '900'}}
            id="KumonosSinglePersonCalendar"
            className="bg-body"
            data-kt-drawer="true"
            data-kt-drawer-name="activities"
            data-kt-drawer-activate="true"
            data-kt-drawer-overlay="true"
            data-kt-drawer-width="{default:'700px', 'lg': '700px'}"
            data-kt-drawer-direction="end"
            data-kt-drawer-toggle="#KumonosSinglePersonCalendar_toggle"
            data-kt-drawer-close="#KumonosSinglePersonCalendar_close"
        >
            <div className="card shadow-none rounded-0  w-100">
            <div className="card-header" id="Adduser_header">
                <h3 className="card-title fw-bolder text-gray-900">Task Details</h3>
                <div className="card-toolbar">
                <button
                    type="button"
                    className="btn btn-sm btn-icon btn-active-light-primary me-n5"
                    id="KumonosSinglePersonCalendar_close"
                >
                    <KTIcon iconName="cross" className="fs-1" />
                </button>
                </div>
            </div>
            <div className="card-body position-relative" id="Adduser_body">
                <form onSubmit={onSubmitActualDate}>
                <div className="row">
                    <div className="col-md-6">
                    <div className="form-group">
                        <div className="mb-5">
                        <span className="fw-bold text-gray-700">
                        Project name
                        </span>
                        <input type="text" className="form-control mt-2" defaultValue={taskDataToEdit?.ProjecTitle} required disabled/>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="mb-5">
                        <span className="fw-bold text-gray-700">
                        Category 
                        </span>
                        <input type="text" className="form-control mt-2" defaultValue={taskDataToEdit?.category} required disabled/>
                        </div>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <div className="mb-5">
                        <span className="fw-bold text-gray-700">
                        Person in charge
                        </span>
                        <input type="text" className="form-control mt-2" defaultValue={taskDataToEdit?.personInCharge} required disabled/>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="mb-5">
                        <span className="fw-bold text-gray-700">
                        Task
                        </span>
                        <input type="text" className="form-control mt-2" defaultValue={taskDataToEdit?.task} required disabled/>
                        </div>
                    </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group">
                            <div className="mb-5">
                            <span className="fw-bold text-gray-700">
                            Start Date 
                            </span>
                            <input type="text" className="form-control mt-2" defaultValue={taskDataToEdit?.start} required disabled/>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <div className="mb-5">
                            <span className="fw-bold text-gray-700">
                            End Date
                            </span>
                            <input type="text" className="form-control mt-2" defaultValue={endCurrentDate} required disabled/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                    <div className="form-group">
                        <div className="mb-5">
                        <span className="fw-bold text-gray-700">
                        Work Day
                        </span>
                        <input type="text" className="form-control mt-2" defaultValue={taskDataToEdit?.workDay} required disabled/>
                        </div>
                    </div>
                    </div>
                    <div className="col-md-6">
                    <div className="form-group">
                        <div className="mb-5">
                        <span className="fw-bold text-gray-700">
                        Status
                        </span>
                        <input type="text" className="form-control mt-2" defaultValue={taskDataToEdit?.status} required disabled/>
                        </div>
                    </div>
                    </div>
                </div>

                { ((currentUser?._id == taskDataToEdit?.personInChargeForCheck || currentUser?.role == "administrator") && taskDataToEdit?.task_segment == "kumonos") && (
                    <div className="row">
                        <h2>Actual Date</h2>
                            <div className="col-md-12">
                                <div className="form-group">
                                <div className="mb-5">
                                <span className="fw-bold text-gray-700">
                                select date
                                </span>
                                <div className="datepicker-container mt-3">
                                    <Flatpickr
                                    className="form-control"
                                    placeholder="Pick date"
                                    data-date-format="Y/m/d"
                                    value={actualDate}
                                    style={{ width: "100%" }}
                                    options={{
                                        mode: 'multiple', // Set mode to "multiple"
                                        disable: [
                                            date => {
                                                const currentDate = new Date(date);
                                                const endDate = new Date(endDateForActual ?? '');
                                                const startDate = new Date(startCurrentDate ?? '');
                                                const tureDate = new Date(currentDate);
                                                tureDate.setDate(tureDate.getDate() + 1);
                                                return tureDate <= startDate || tureDate >= endDate;
                                            }
                                        ],
                                    }}
                                    onChange={inputActualDate}
                                    />
                                </div>
                                </div>
                                </div>
                            </div>
                    </div>
                )}
                <div style={{ display : "flex", width : "100%", justifyContent : "end"}}>
                {((currentUser?._id == taskDataToEdit?.personInChargeForCheck || currentUser?.role == "administrator") && taskDataToEdit?.task_segment == "kumonos") && 
                    <input style={{marginLeft: '10px'}} type="submit" className="btn btn-primary me-3" value={"Submit"} />
                }
                <input type="button" style={{backgroundColor: '#EFEFEF'}} className="btn" id="KumonosSinglePersonCalendar_close" value={((currentUser?._id == taskDataToEdit?.personInChargeForCheck || currentUser?.role == "administrator") && taskDataToEdit?.task_segment == "kumonos") ? "Cancel" : "Close"} />
            </div>
            </form>
            </div>
            </div>
        </div>
        </>
    )
}

export { KumonosSinglePersonCalendar };
