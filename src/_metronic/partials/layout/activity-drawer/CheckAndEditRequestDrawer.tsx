import React, { FC, useEffect, useState } from "react";
import { KTIcon } from "../../../helpers";
import Flatpickr from "react-flatpickr";
import Select from "react-select";
import axios from "axios";
import Swal from "sweetalert2";
import { RequestProps, RequestData } from "../../../helpers";
const BASE_URL = process.env.VITE_SERVER_URL;
const PRO_BASE_URL = `${BASE_URL}/projects`
const USER_BASE_URL = `${BASE_URL}/users`
const SETTING_BASE_URL = `${BASE_URL}/settings`
interface CheckAndEditRequestDrawerProps {
  requestProps: RequestProps;
  latestEndWorker: any;
  setUpdateData: (data: any) => void;
}

let init_request_data: RequestData = {
  request_id: "",
  project_id: "",
  main_project_name: "",
  sub_project_name: "",
  camera: 0,
  type_id: "",
  type: "",
  terms_of_request: "",
  translated_terms_of_request: "",
  characteristics: "",
  translated_characteristics: "",
  persons_in_charge: [{}],
  checker1: "",
  checker2: "",
  persons_in_charge_complete: null,
  checker1_complete: null,
  checker2_complete: null,
  start_date: "",
  deadline: "",
  work_hours: "",
  predict_work_days: 0,
  data_link: "",
  send_link: "",
  progress: 0,
  status: "",
  taskStatus: null,
  worker_progress: 0,
  checker_progress: 0,
  parent_progress: 0,
  requester: "",
  requester_all: [],
  remark: "",
  sent_to: "",
};
interface PersonsInCharge {
  id: string;
  value: string;
  label: string;
  user_image: string;

}
type UserData = {
  _id: string;
  display_name: string;
  label: string;
  status: string;
};

interface PersonsIncharge {
  id: string;
  value: string;
  label: string;
}

type Task = {
  project_id: string;
  task_name: string;
  category: string | null;
  start: any | null;
  deadline: any | null;
  persons_in_charge: any[];
  status: string;
  task_segment:string;
};

interface DateOption {
  disable: ((date: Date) => boolean)[];
  dateFormat: string;
}

let taskDataObj: Task = {
  project_id: "",
  task_name: "",
  category: "",
  start: null,
  deadline: null,
  persons_in_charge: [],
  status: "on going",
  task_segment:"kumonos"
};

const CheckAndEditRequestDrawer: FC<CheckAndEditRequestDrawerProps> = ({
  requestProps,
  latestEndWorker,
  setUpdateData,
}) => {
  const [taskData, setTaskData] = useState<Task>(taskDataObj);
  const [getUserData, setGetUserData] = useState<UserData[]>([]);
  const [getRequestData, setGetRequestData] = useState<any[]>([]);
  const [selectedSubProject, setSelectedSubProject] = useState<any>("");
  const [subProjectNameForSave, setSubProjectNameForSave] = useState<any>("");
  const [subProjectName, setSubProjectName] = useState("");
  const [selectedType, setSelectedType] = useState<any>("");
  const [selectedPersonInCharge, setSelectedPersonInCharge] = useState<any>("");
  const [selectedChecker1, setSelectedChecker1] = useState<any>("");
  const [selectedChecker2, setSelectedChecker2] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<any>("");
  const [typeOption, setTypeOption] = useState<any>([]);
  const [initTypeOption, setInitTypeOption] = useState<any>([]);
  const [requestData, setRequestData] =
    useState<RequestData>(init_request_data);
  const [remark, setRemark] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [predictWorkdays, setPredictWorkdays] = useState(0);
  const [dayToAdd, setDayToAdd] = useState(0);
  const [holidays, setHolidays] = useState({ Holiday: "" });
  const [holidayArray, setHolidayArray] = useState<any>([]);
  const [dateOption, setDateOption] = useState<DateOption>({
    disable: [],
    dateFormat: "Y/m/d",
  });
  const [deadlineOption, setDeadlineOption] = useState({
    disable: [
      function (date: Date) {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const formattedDate = `${year}-${month
          .toString()
          .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
        return (
          holidayArray.includes(formattedDate) ||
          date.getDay() === 0 ||
          date.getDay() === 6
        );
      },
    ],
    dateFormat: "Y/m/d",
  });
  const [deadline, setDeadline] = useState<Date>(requestProps.deadline);
  const [dateStart, setDateStart] = useState<Date>(requestProps.start_date);

  useEffect(() => {
    const holidayArray = holidays.Holiday.split(",").map((date) =>
      date.trim().replace(/\//g, "-")
    );
    setHolidayArray(holidayArray);
  }, [holidays]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const res = await axios.get(`${SETTING_BASE_URL}/holiday`);
        const holidayDates = res.data
        .filter((item: any) => item.for_person === null || item.for_person === selectedPersonInCharge.id)
        .map((item: any) =>
          new Date(item.holiday_date)
            .toISOString()
            .split("T")[0]
            .replace(/-/g, "/")
        );
        setHolidays({ Holiday: holidayDates.join(", ") });
      } catch (error) {
        console.error("Error fetching holiday data:", error);
      }
    };

    fetchHolidays();
  }, [selectedPersonInCharge]);

  useEffect(() => {
    if (holidays.Holiday) {
      const formattedArray = holidays.Holiday.split(",").map((date) =>
        date.trim().replace(/\//g, "-")
      );
      setHolidayArray(formattedArray);
    }
  }, [holidays]);

  useEffect(() => {
    if (holidayArray.length > 0) {
      setDateOption({
        disable: [
          (date) => {
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
            return (
              holidayArray.includes(formattedDate) ||
              date.getDay() == 0 ||
              date.getDay() == 6
            );
          },
        ],
        dateFormat: "Y/m/d",
      });
      setDeadlineOption({
        disable: [
          (date) => {
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
              .toString()
              .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
            return (
              holidayArray.includes(formattedDate) ||
              date.getDay() == 0 ||
              date.getDay() == 6
            );
          },
        ],
        dateFormat: "Y/m/d",
      });
    }
  }, [holidayArray]);

  const handleInputSubProjectName = (e: any) => {
    setSubProjectName(e.target.value);
  };

  const handleSubProjectNameChange = (selectedOption: any) => {
    setSelectedSubProject(selectedOption);
  };

  const fetchData = async () => {
    try {
      const typeAndUserOnHold = await axios.get(`${PRO_BASE_URL}/request-task`).then((res) => res.data);
  
      const userResponse = await axios.get(`${USER_BASE_URL}/get-all-user`);
     
      const camSettingsResponse = await axios.get(`${SETTING_BASE_URL}/camPerDay`);
     
      const rankingSettingsResponse = await axios.get(`${SETTING_BASE_URL}/ranking`);
      let userData = userResponse.data;
      const workers = userData;

      
      const UserOnHold = typeAndUserOnHold.filter(
        (user: any) => user.status == "onHold"
      );
      const UserForCombine = typeAndUserOnHold.filter(
        (user: any) => user.status !== "complete" && user.status !== "waitingDelivery" 
      );
      let combinedData :any[]= [];

      UserForCombine.forEach((task:any) => {
          task.worker_progress.forEach((worker:any) => {
              const userId = worker.user._id;
              const status = task.status;
              let dataObject = {
                  worker: userId,
                  status: status
              };
              combinedData.push(dataObject);
          });
      });

      const workerStatusMap = combinedData.reduce((acc, { worker, status }) => {
        if (status === "removal") {
            acc[worker] = false;
        } else if (acc[worker] !== false) {
            acc[worker] = true;
        }
        return acc;
      }, {});

      if (UserOnHold.length > 0) {
        const userMap = new Map(userData.map((item: any) => [item._id, item]));
        const allWorkers = typeAndUserOnHold.flatMap((person: any) =>
            person.worker_progress ? person.worker_progress : []
        ).filter((worker: any) => worker && userMap.has(worker.user?._id));
    
        const uniqueWorkers = new Set();
    
    allWorkers.forEach((worker: any) => {
      const userId = worker.user?._id;
      if (userId && workerStatusMap[userId] == true) {
          const filteredUser: any = userMap.get(userId);
          if (filteredUser && !uniqueWorkers.has(filteredUser._id)) {
              filteredUser.status = "onHold";
              uniqueWorkers.add(filteredUser._id);
              workers.push(filteredUser);
          }
      }
  });
    }

      setGetUserData(workers);
      setGetRequestData(typeAndUserOnHold);


      const type_data = camSettingsResponse.data
        .filter((item: any) => item.ran_id._id === rankingSettingsResponse.data[0]._id)
        .map((item: any) => ({
          id: item.type_id._id,
          value: item.type_id.type_name,
          label: item.type_id.type_name,
          cameraPerDays: item.cam_amount,
        }));

      setInitTypeOption(type_data);

      if (requestProps.project_id) {
        const projectRequestResponse = await axios.get(
          `${PRO_BASE_URL}/get-project-request/${requestProps.project_id}`
        );
        
        const RequestTasksData = projectRequestResponse.data;
        let  filteredRemarkAndStatus= RequestTasksData.filter((id:any)=>id._id == requestProps?.id);
        if (filteredRemarkAndStatus) {
          setRemark(filteredRemarkAndStatus[0]?.remark);
        }
        if (filteredRemarkAndStatus[0]?.status !== "Pending") {
          setSelectedStatus({value: filteredRemarkAndStatus[0]?.status, label:filteredRemarkAndStatus[0]?.status});
        }
        if (RequestTasksData.length > 0) {
          const requestInTaskResponse = await axios.post(
            `${PRO_BASE_URL}/get-request-in-task/${requestProps?.id}`
          );
          const requestInTaskResponseForSub = await axios.post(
            `${PRO_BASE_URL}/get-request-in-task/${RequestTasksData[0]._id}`
          );
          const requestInTaskData = requestInTaskResponse.data;
          if (requestInTaskData) {
            setSelectedSubProject({id:requestInTaskData.sub_project_name?._id, label:requestInTaskData.sub_project_name?.sub_project_name, value:requestInTaskData.sub_project_name?.sub_project_name})
          }
          if (requestInTaskResponseForSub) {
              let PersonsInCharge = requestInTaskData?.worker_progress[0];
              let filteredPerson :any = personOptions.filter((item:any) => item.value == PersonsInCharge?.user);
    
              if (filteredPerson.length > 0) {
                  PersonsInCharge = {
                      label: filteredPerson[0]?.label,
                      value: filteredPerson[0]?.value,
                      id: filteredPerson[0]?.value,
                      user_image: filteredPerson[0]?.user_image
                  };
                  setSelectedPersonInCharge(PersonsInCharge);
              }
    
              let checker1 = requestInTaskData?.checker_progress[0];
              let filteredChecker1 :any = checkerOptions.filter((item:any) => item.value == checker1?.user);
    
              if (filteredChecker1.length > 0) {
                  checker1 = {
                      label: filteredChecker1[0]?.label,
                      value: filteredChecker1[0]?.value,
                      id: filteredChecker1[0]?.value
                  };
                  setSelectedChecker1(checker1);
              }
    
              let checker2 = requestInTaskData?.checker_progress[1];
              let filteredChecker2 :any = checkerOptions.filter((item:any) => item.value == checker2?.user);
              
              if (filteredChecker2.length > 0) {
                  checker2 = {
                      label: filteredChecker2[0]?.label,
                      value: filteredChecker2[0]?.value,
                      id: filteredChecker2[0]?.value
                  };
                  setSelectedChecker2(checker2);
              }
            }else{
              null
            }
          }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };


  const [subNameOptions, setSubNameOptions] = useState<any[]>([]);
  const [personOptions, setPersonOptions] = useState<PersonsInCharge[]>([]);
  const [checkerOptions, setCheckerOptions] = useState<PersonsInCharge[]>([]);
  let userOnHoldId: string = "";

  useEffect(() => {
    if (!selectedSubProject?.id) return;
      
    let subProName: any = {};
    if (selectedSubProject.value !== "new") {
      subProName.sub_project_name = selectedSubProject.id;
  } else {
      document.getElementById("manual_sub_project_name")?.focus();
      subProName.sub_project_name = subProjectName;
  }
    const checkSubNameData = async () => {

    const filteredSubID = getRequestData.filter((subID: any) => subID.sub_project_name?._id === selectedSubProject.id);
    if (filteredSubID.length > 0) {
      const { data: subProjects } = await axios.post(`${PRO_BASE_URL}/edit-project/${filteredSubID[0]?.request_id?.project_id}`);
      if (filteredSubID.length > 0 && filteredSubID[0]?.request_id?.project_id !== undefined && requestProps.project_id && requestProps.project_id !== filteredSubID[0]?.request_id?.project_id) {
        let subInUse = `${subProjects?.business_number}/${subProjects?.customer_name}/${subProjects?.business_name}`;
        Swal.fire({
          title: "Sub Project Name in Use!",
          text: `This sub project name is already being used. ${subInUse}`,
          icon: "info",
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        });
        setSelectedSubProject("");
      }
    }
    setSubProjectNameForSave(subProName);
  }
  checkSubNameData()
}, [selectedSubProject, subProjectName]);

  useEffect(() => {
    const createWorkerOption = async () =>{
  let newPersonOptions:any = {};

    if (requestProps?.id) {
      const requestInTaskResponse = await axios.post(
        `${PRO_BASE_URL}/get-request-in-task/${requestProps?.id}`
      );
      const requestInTaskData = requestInTaskResponse.data;

      let PersonsInCharge = requestInTaskData?.worker_progress[0];
      newPersonOptions.id= PersonsInCharge?.user;
      newPersonOptions.value= PersonsInCharge?.user;
      newPersonOptions.label= PersonsInCharge?.user_name;
      newPersonOptions.user_image= PersonsInCharge?.user_image;
    
    }
      const workerSet = new Set(latestEndWorker);
      const usersOnHold = getUserData.filter((user) => user.status === "onHold");
      let updatedPersonOptions: any[] = [];
      let updatedCheckerOptions: PersonsInCharge[] = [];
  
      usersOnHold.forEach((userData: any) => {
        userData.status === "onHold" ? (userOnHoldId = userData._id) : null;
        if (!updatedPersonOptions.some((option) => option.id === userData._id)) {
          updatedPersonOptions.push({
            id: userData._id,
            value: userData._id,
            label: userData.display_name,
            user_image: userData.img,
            status: userData.status === "onHold" ? "onHold" : undefined,
          });
        }
      });
      getUserData.forEach((userData: any) => {
        if (workerSet.has(userData._id) || userData.role == "administrator") {
          if (!updatedPersonOptions.some((option) => option.id === userData._id)) {
            updatedPersonOptions.push({
              id: userData._id,
              value: userData._id,
              label: userData.display_name,
              user_image: userData.img,
            });
          }
        }
      });
      getUserData.forEach((userData: any) => {
        if (!updatedCheckerOptions.some((option) => option.id === userData._id)) {
        updatedCheckerOptions.push({
          id: userData._id,
          value: userData._id,
          label: userData.display_name,
          user_image: userData.img,
        });
      }
      });
      if (!updatedPersonOptions.some((option) => option.id === newPersonOptions.id)) {
        
        if (newPersonOptions.id) {
          updatedPersonOptions.push(newPersonOptions)
        }
      }
      setPersonOptions(updatedCheckerOptions);
      setCheckerOptions(updatedCheckerOptions);
    }
    createWorkerOption();
  }, [ latestEndWorker]);

  const StatusOptions = [
    { value: "Edited", label: "Edited" },
    { value: "Approved", label: "Approved" },
  ];
  const addBusinessDays = (date: Date, daysToAdd: number): Date => {
    const resultDate = new Date(date);
    let businessDaysAdded = 1;

    while (businessDaysAdded < daysToAdd) {
      resultDate.setDate(resultDate.getDate() + 1);
      const dayOfWeek = resultDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDaysAdded++;
      }
    }
    return resultDate;
  };
  const countHolidays = (startDate: Date, endDate: Date, holidays: string[]): { holidayCount: number } => {
    const holiday_Array: Date[] = holidays.map((date) => new Date(date));
    const holidayCount: any = holiday_Array.filter((holiday) => holiday >= new Date(startDate) && holiday <= new Date(endDate)).length;
    return { holidayCount };
  };
  const round2CountHolidays = (startDate: Date, endDate: Date, holidays: string[]): { holidayCount: number } => {
    const holiday_Array: Date[] = holidays.map((date) => new Date(date));
    const holidayCount: any = holiday_Array.filter((holiday) => holiday > new Date(startDate) && holiday <= new Date(endDate)).length;
    return { holidayCount };
  };

  useEffect(() => {
    const { holidayCount } = countHolidays(dateStart, deadline, holidayArray);
    setDayToAdd(predictWorkdays + holidayCount);
  }, [deadline]);

  useEffect(() => {
    if (!selectedType || !dateStart) return;
    if (selectedType.cameraPerDays == 0) {
      Swal.fire({
        title: "Invalid Type",
        text: "This type is not available. Please contact the systory team for assistance.",
        icon: "info",
        confirmButtonColor: "#3085d6",
      })
      setSelectedType("")
      return;
    }
    const predictWorkdays = requestProps.camera !== 0 ? Math.ceil(requestProps.camera / selectedType.cameraPerDays) : 0;
    setPredictWorkdays(predictWorkdays);
  
    const addNonWeekendDays = (date:any, days:any) => {
      while (days > 0) {
        date.setUTCDate(date.getUTCDate() + 1);
        if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) {
          days--;
        }
      }
      return date;
    };
  
    const findNextNonHoliday = (date:any) => {
      while (
        holidayArray.includes(date.toISOString().slice(0, 10)) ||
        date.getUTCDay() === 0 ||
        date.getUTCDay() === 6
      ) {
        date.setUTCDate(date.getUTCDate() + 1);
      }
      return date;
    };  
    const parsedStartDate = new Date(dateStart.toLocaleString());
    parsedStartDate.setUTCHours(0, 0, 0, 0);
  
    const rawMinDeadlineDate = addBusinessDays(parsedStartDate, predictWorkdays);
    let minDeadlineDate = new Date(rawMinDeadlineDate);

    let { holidayCount } = countHolidays(parsedStartDate, minDeadlineDate, holidayArray);
    minDeadlineDate = addNonWeekendDays(minDeadlineDate, holidayCount);

    ({ holidayCount } = round2CountHolidays(rawMinDeadlineDate, minDeadlineDate, holidayArray));
    minDeadlineDate = addNonWeekendDays(minDeadlineDate, holidayCount);
    
    minDeadlineDate = findNextNonHoliday(minDeadlineDate);
    minDeadlineDate.setUTCHours(0, 0, 0, 0);
  
    setDeadlineOption((prev) => ({ ...prev, minDate: minDeadlineDate }));
    setDeadline(minDeadlineDate);
  }, [selectedType, selectedPersonInCharge, holidayArray, dateStart]);

  useEffect(()=>{
    if (selectedPersonInCharge) {
      if(holidayArray.includes(new Date(dateStart).toISOString().slice(0, 10))){
        Swal.fire({
          title: "Attention!",
          text: `Date ${new Date(dateStart).toISOString().slice(0, 10).toString().replace(/-/g, "/")} 
          is a rest day for ${selectedPersonInCharge.label}. Unable to start work. Please select a new start date.`,
          icon: "warning",
          confirmButtonColor: "#3085d6",
        });
        setSelectedPersonInCharge("");
        return
      } 
    }
  },[holidayArray])

  const submitRequest = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if(selectedType?.value == undefined){
      Swal.fire({
        title: "Attention!",
        text: "Please check the ranking of your selected person in user management.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return
    }
    const updatedStatus =
      selectedStatus.value == "Edited" ? "Approved" : "Approved";

        const filteredRequests = getRequestData.filter((item: any) => 
          item.sub_project_name?._id == subProjectNameForSave.sub_project_name && 
          item.status !== "waitingDelivery" && 
          item.status !== "complete"
        );
        
        const updatedTaskStatus = filteredRequests.length <= 0 ? "notStart" : filteredRequests[0].status;
      const checkerProgress = [{ user: selectedChecker1.id, progress: 0, user_name:selectedChecker1.label, user_image: selectedChecker1.user_image }];
      if (selectedChecker2?.id)
        checkerProgress.push({ user: selectedChecker2.id, progress: 0, user_name:selectedChecker2.label, user_image: selectedChecker2.user_image  });

      let dateStartForSave = new Date(dateStart);

        let deadlineForSave = new Date(deadline);
        deadlineForSave.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00.000 UTC

    if (dateStartForSave > deadlineForSave) {
      Swal.fire({
        title: `Invalid Date Range`,
        text: `The start date must be earlier than the deadline. Please adjust your dates accordingly.`,
        icon: "info",
        confirmButtonColor: "#1E7ABD",
        confirmButtonText: "OK",
      })
      return;
    }

     //calculateWorkHours
     function calculateWorkHours(
      startDate: Date,
      endDate: Date,
      dailyBreakHours: number // Fixed daily break duration in hours
    ): number {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setDate(deadlineForSave.getDate() + 1);
      end.setHours(0, 0, 0, 0)
    
      // Define working hours (e.g., 8:30 AM to 5:00 PM)
      const workStartHour = 8 + 30 / 60; // 8:30 AM as decimal
      const workEndHour = 17; // 5:00 PM
    
      let totalHours = 0;
    
      // Loop through each day in the range
      for (let current = new Date(start); current < end; current.setDate(current.getDate() + 1)) {
        const dayOfWeek = current.getDay(); // 0 = Sunday, 6 = Saturday
    
        // Skip weekends (Saturday and Sunday)
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          continue;
        }
    
        let workingHoursForDay = 0;
    
        if (current.toDateString() === start.toDateString()) {
          // Start day: Calculate partial hours
          const startHour = Math.max(
            current.getHours() + current.getMinutes() / 60,
            workStartHour
          );
          workingHoursForDay = Math.max(0, workEndHour - startHour);
        } else if (current.toDateString() === end.toDateString()) {
          // End day: Calculate partial hours
          const endHour = Math.min(
            end.getHours() + end.getMinutes() / 60,
            workEndHour
          );
          workingHoursForDay = Math.max(0, endHour - workStartHour);
        } else {
          // Full working day
          workingHoursForDay = workEndHour - workStartHour;
        }
    
        // Subtract daily break time only if it's a full working day or partial day after noon
        if (current.toDateString() !== end.toDateString() || end.getHours() >= 12) {
          workingHoursForDay = Math.max(0, workingHoursForDay - dailyBreakHours);
        }
    
        // Add to total hours
        totalHours += workingHoursForDay;
      }
    
      return totalHours;
    }
    
    const actualWorkHours = calculateWorkHours(new Date(dateStart), new Date(deadlineForSave), 1.5);
    
    setTaskData({
      project_id: requestProps.project_id,
      task_name: selectedType.value,
      category: null,
      start: dateStartForSave.toISOString(),
      deadline: deadlineForSave.toISOString(),
      persons_in_charge: [{user: selectedPersonInCharge.id, user_name_done:{user:null, user_name:null}}],
      status: "on going",
      task_segment: "kumonos"
    });
    
    setRequestData({
      request_id: requestProps.id,
      project_id: requestProps.project_id,
      main_project_name: requestProps.main_project_name,
      sub_project_name: subProjectNameForSave.sub_project_name,
      camera: requestProps.camera,
      type_id: selectedType.id,
      type: selectedType.value,
      terms_of_request: requestProps.terms_of_request,
      translated_terms_of_request: requestProps.translated_terms_of_request,
      characteristics: requestProps.characteristics,
      translated_characteristics: requestProps.translated_characteristics,
      persons_in_charge: selectedPersonInCharge.id,
      checker1: selectedChecker1.id,
      checker2: selectedChecker2?.id,
      persons_in_charge_complete: null,
      checker1_complete: null,
      checker2_complete: null,
      start_date: dateStartForSave.toISOString(),
      deadline: deadlineForSave.toISOString(),
      work_hours: actualWorkHours,

      predict_work_days: predictWorkdays,
      data_link: requestProps.data_link,
      send_link: "",
      status: updatedStatus,
      taskStatus: updatedTaskStatus,
      progress: 0,
      worker_progress: [{ user: selectedPersonInCharge.id, progress: 0, user_name:selectedPersonInCharge.label , user_image: selectedPersonInCharge.user_image}],
      checker_progress: checkerProgress,
      requester: requestProps.requester,
      requester_all: requestProps.requester_all,
      parent_progress: 0,
      remark: remark,
      sent_to:
        selectedStatus.value === "Edited"
          ? "kumonosForEdited"
          : "kumonosForSuccessRequest",
    });

    Swal.fire({
      title: "Request Submission",
      text: "Are you sure you want to submit this request?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Yes, submit",
    }).then((result) => {
      if (result.isConfirmed) {
        setSubmitSuccess(true);
      }
    });
  };
  const sendEmail = async (requestData: any) => {
    try {
      const response = await axios.post(
        `${PRO_BASE_URL}/send-request`,
        {
          content: requestData,
        }
      );
    } catch (error) {
      console.error("Error request text:", error);
      return null;
    }
  };

  const resetForm = () => {
    setSubProjectName("")
    setSelectedSubProject("")
    setSelectedPersonInCharge("");
    setSelectedChecker1("");
    setSelectedChecker2("");
    setSelectedStatus("");
    setRemark("");
    setSelectedType("");
  };

  const setDefaultSubProject = () => {
    setSelectedSubProject("")
    setSubProjectName("")
  }

  useEffect(() => {
    const sendEmailAndClose = async () => {
      if (submitSuccess) {
        const onConfirm = async () => {
          try {
            if (selectedSubProject.id == "0") {
              let checkDuplicate = subNameOptions.find((element) => element.value == subProjectNameForSave.sub_project_name);
              if (!checkDuplicate?.id) {
                const responseNewId = await axios.post(
                  `${PRO_BASE_URL}/create-sub-project`,
                  subProjectNameForSave
                );
                requestData.sub_project_name = responseNewId.data?._id;
              } else {
                Swal.fire({
                  title: "Duplicate Sub project name!",
                  text: "Please select a new Sub project name",
                  icon: "error",
                  confirmButtonColor: "#3085d6",
                });
                setSubmitSuccess(false);
                return;
              }
            }

            if (requestProps.status != "Approved") {
              const createTaskResponse = await axios.post(
                `${PRO_BASE_URL}/create-task`,
                taskData
              );
              requestData.task_id = createTaskResponse.data._id;

              await axios.post(
                `${PRO_BASE_URL}/create-request-task`,
                requestData
              );
            }
            const getReqTaskResponse = await axios.post(`${PRO_BASE_URL}/get-request-in-task/${requestProps.id}`).then(res => res.data);
            const getReqResponse = await axios.post(`${PRO_BASE_URL}/edit-request/${requestProps.id}`).then(res => res.data);
       
            await axios.put(`${PRO_BASE_URL}/update-request/${requestData.request_id}`,requestData).then((res) => { setUpdateData(res.data);});

            if (getReqResponse.task_id != undefined) {
              const getTaskResponse = await axios.post(`${PRO_BASE_URL}/edit-task/${getReqResponse.task_id}`).then(res => res.data);
              getTaskResponse.start = requestData.start_date;
              getTaskResponse.deadline = requestData.deadline;

              await axios.put(`${PRO_BASE_URL}/update-task/${getReqResponse.task_id}`, getTaskResponse)
            }

            if (getReqTaskResponse?._id) {
              const getReqTaskForEdit: any = await axios
                .post(
                  `${PRO_BASE_URL}/edit-request-task/${getReqTaskResponse?._id}`
                )
                .then((res) => res.data);
              let newWorker_progress = getReqTaskForEdit.worker_progress;
              newWorker_progress[0] = {
                user: selectedPersonInCharge.id,
                progress: getReqTaskForEdit?.worker_progress[0].progress,
                user_name: selectedPersonInCharge.label,
                user_image: selectedPersonInCharge.user_image,
              };
              let newChecker_progress = getReqTaskForEdit.checker_progress;
              newChecker_progress[0] = {
                user: selectedChecker1.id,
                progress: getReqTaskForEdit?.checker_progress[0].progress,
                user_name: selectedChecker1.label,
                user_image: selectedChecker1.user_image,
              };

              if (
                selectedChecker2?.id != undefined &&
                getReqTaskForEdit?.checker_progress.length < 2
              ) {
                newChecker_progress.push({
                  user: selectedChecker2.id,
                  progress: 0,
                  user_name: selectedChecker2.label,
                  user_image: selectedChecker2.user_image,
                });
              } else if (
                getReqTaskForEdit?.checker_progress[1]?.progress != undefined
              ) {
                newChecker_progress[1] = {
                  user: selectedChecker2.id,
                  progress: getReqTaskForEdit?.checker_progress[1]?.progress,
                  user_name: selectedChecker2.label,
                  user_image: selectedChecker2.user_image,
                };
              }

              getReqTaskForEdit.sub_project_name =
              requestData?.sub_project_name;
              getReqTaskForEdit.type_id = requestData?.type_id;
              getReqTaskForEdit.persons_in_charge =
              requestData?.persons_in_charge;
              getReqTaskForEdit.checker1 = requestData?.checker1;
              getReqTaskForEdit.checker2 = requestData?.checker2;
              getReqTaskForEdit.worker_progress = newWorker_progress;
              getReqTaskForEdit.checker_progress = newChecker_progress;

              await axios.put(
                `${PRO_BASE_URL}/update-request-task/${getReqTaskResponse?._id}`,
                getReqTaskForEdit
              );
            }
            
            await sendEmail(requestData);
            Swal.fire({
              title: "Success",
              text: "Your editing request has been successfully sent to requester.",
              icon: "success",
              confirmButtonColor: "#3085d6",
            });

            const cancelButton = document.getElementById(
              "checkAndEdit_request_close"
            );
            setSubmitSuccess(false);

            if (cancelButton) {
              cancelButton.click();
              resetForm();
            }
          } catch (error) {
            console.error("Error save data:", error);
            return;
          }
        };
        onConfirm();
      }
    };
    sendEmailAndClose();
  }, [requestData, submitSuccess]);

  const handleSelectChange = (
    selectedOption: any,
    setSelectedFunction: Function
  ) => {
    setSelectedFunction(selectedOption);
  };

  const fetchTypeData = async () => {
    try {
      if (selectedPersonInCharge.id) {
        let typeAndUser = await axios
          .get(
            `${SETTING_BASE_URL}/edit-rankiing-detail/${selectedPersonInCharge.id}`
          )
          .then((res) => {
            return res.data;
          });
  
        let getTypesOptions = [];
  
        for (const obj of typeAndUser) {
          const { type_id, ran_id } = obj;
          let camForSetOption = await axios
            .post(
              `${SETTING_BASE_URL}/camPerDays/${type_id._id}/${ran_id._id}`
            )
            .then((res) => {
              return res.data;
            });
  
          let option = {
            id: type_id._id,
            value: type_id.type_name,
            label: type_id.type_name,
            cameraPerDays: camForSetOption[0].cam_amount,
          };
          getTypesOptions.push(option);
        }
        setTypeOption(getTypesOptions);
      }
    } catch (error) {
      console.error("Error fetching type data:", error);
    }
  };

  useEffect(() => {
    setSelectedType(
      typeOption.find((option: any) => option.value == requestProps.type)
    );
  }, [typeOption]);

  useEffect(() => {
    if (selectedPersonInCharge) {
      fetchTypeData();
      if (typeOption) {
        setSelectedType(
          typeOption.find((option: any) => option.value == requestProps.type)
        );
      }
    }
  }, [selectedPersonInCharge]);

  useEffect(() => {
    const setData = async () => {
        try {
            const { data: subProjects } = await axios.get(`${PRO_BASE_URL}/sub-project`);
            const updatedSubNameOptions = subProjects?.map((subProject:any) => ({
                id: subProject._id,
                value: subProject.sub_project_name,
                label: subProject.sub_project_name,
            })).concat({
              id: "0",
              value: "new",
              label: "+ New sub project name",
          });

            setSubNameOptions(updatedSubNameOptions);
            resetForm();
            fetchData();
            setDateStart(requestProps.start_date.substring(0, 10));
            setDeadline(requestProps.deadline);
            setPredictWorkdays(requestProps.predict_work_days);
        } catch (error) {
            console.error("Failed to fetch sub-project data", error);
        }
    };
    setData();
}, [requestProps, personOptions]);


  useEffect(() => {

    if (initTypeOption) {
      setTypeOption(initTypeOption);

      setSelectedType(
        initTypeOption.find((option: any) => option.value == requestProps.type)
      );
    }
  }, [initTypeOption]);
  return (
    <div
      id="checkAndEdit_request"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="activities"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'720px', 'lg': '720px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#checkAndEdit_request_toggle"
      data-kt-drawer-close="#checkAndEdit_request_close"
    >
      <div className="card shadow-none border-0 rounded-0  w-100">
        <div className="card-header" id="checkAndEdit_request_header">
          <h3 className="card-title fw-bolder text-gray-900">Edit Request</h3>

          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
              id="checkAndEdit_request_close"
              onClick={resetForm}
            >
              <KTIcon iconName="cross" className="fs-1" />
            </button>
          </div>
        </div>
        <div
          className="card-body position-relative"
          id="checkAndEdit_request_body"
        >
          <form onSubmit={submitRequest}>
            <div
              className="mb-5"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <div style={{ width: "310px" }}>
                <label className="fw-bold text-gray-700">
                  Main project name
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={requestProps.main_project_name}
                  disabled
                />
              </div>

              <div style={{ width: "310px" }}>
                <label className="fw-bold text-gray-700">
                  Sub project name
                </label>
                   {selectedSubProject.value == "new" ? (
                    <div className="d-flex">
                  <input
                    type="text"
                    className="form-control"
                    id="manual_sub_project_name"
                    value={subProjectName}
                    onChange={handleInputSubProjectName}
                    required
                  />
                  <button className="btn btn-secondary ms-3" onClick={setDefaultSubProject}>Cancel</button>
                  </div>
                ):(
                  <Select
                      className="react-select-style"
                      classNamePrefix="react-select"
                      options={subNameOptions}
                      value={selectedSubProject}
                      onChange={handleSubProjectNameChange}
                      required
                    />
                )}
              </div>
            </div>
            <div
              className="mb-5"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <div style={{ width: "310px" }}>
                <label className="fw-bold text-gray-700">Camera</label>
                <input
                  type="number"
                  className="form-control"
                  value={requestProps.camera}
                  disabled
                />
              </div>

              <div style={{ width: "310px" }}>
                <label className="fw-bold text-gray-700">Type</label>
                <Select
                  className="react-select-style"
                  classNamePrefix="react-select"
                  options={typeOption}
                  value={selectedType}
                  onChange={(selectedOption) =>
                    handleSelectChange(selectedOption, setSelectedType)
                  }
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="mb-4 fw-bold text-gray-700">
                Terms of request
              </label>
              <textarea
                className="form-control"
                value={requestProps.terms_of_request}
                disabled
              />
              <textarea
                className="form-control mt-2"
                value={requestProps.translated_terms_of_request}
                disabled
              />
            </div>
            <div className="mb-5">
              <label className="mb-4 fw-bold text-gray-700">
                Characteristics
              </label>
              <textarea
                className="form-control"
                value={requestProps.characteristics}
                disabled
              />
              <textarea
                className="form-control mt-2"
                value={requestProps.translated_characteristics}
                disabled
              />
            </div>
            <div
              className="mb-5"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <div style={{ width: "310px" }}>
                <label className="fw-bold text-gray-700">
                  Person in charge
                </label>
                <Select
                  className="react-select-style"
                  classNamePrefix="react-select"
                  options={personOptions}
                  onChange={(selectedOption) =>
                    handleSelectChange(
                      selectedOption,
                      setSelectedPersonInCharge
                    )
                  }
                  value={selectedPersonInCharge}
                  required
                />
              </div>

              <div style={{ width: "150px" }}>
                <label className="fw-bold text-gray-700">Checker</label>
                <Select
                  className="react-select-style"
                  classNamePrefix="react-select"
                  options={checkerOptions}
                  onChange={(selectedOption) =>
                    handleSelectChange(selectedOption, setSelectedChecker1)
                  }
                  value={selectedChecker1}
                  required
                />
              </div>
              <div style={{ width: "150px" }}>
                <label className="fw-bold text-gray-700 required">
                Reviewer 
                </label>
                <Select
                  className="react-select-style"
                  classNamePrefix="react-select"
                  onChange={(selectedOption) =>
                    handleSelectChange(selectedOption, setSelectedChecker2)
                  }
                  value={selectedChecker2}
                  options={checkerOptions}
                  required
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
                  onChange={([date1]) => {
                    const nextDay = new Date(date1);
                    nextDay.setUTCHours(0, 0, 0, 0);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setDateStart(nextDay);
                  }}
                  options={dateOption}
                  className="form-control"
                  placeholder="Pick date"
                  data-date-format="Y/m/d"
                  style={{ width: "250px" }}
                />
              </div>

              <div>
                <span className="fw-bold text-gray-700">Predict Deadline</span>
                <Flatpickr
                  value={deadline}
                  onChange={([date1]) => {
                    const nextDay = new Date(date1);
                    nextDay.setUTCHours(0, 0, 0, 0);
                    nextDay.setDate(nextDay.getDate() + 1);
                    setDeadline(nextDay);
                  }}
                  options={deadlineOption}
                  className="form-control"
                  placeholder="Pick date"
                  data-date-format="Y/m/d"
                  style={{ width: "250px" }}
                />
              </div>
              <div>
                <span className="fw-bold text-gray-700">
                  Predict working days
                </span>
                <input
                  type="number"
                  value={predictWorkdays}
                  className="form-control"
                  style={{ width: "130px" }}
                  disabled
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="form-label">Status</label>
              <Select
                className="react-select-style"
                classNamePrefix="react-select"
                options={StatusOptions}
                value={selectedStatus}
                onChange={(selectedOption) =>
                  handleSelectChange(selectedOption, setSelectedStatus)
                }
                required
              />
            </div>
            <div className="mb-5">
              <label className="fw-bold text-gray-700 mb-3">Data links</label>
              <br />
              <a
                className="fw-bold ms-5 fs-6"
                href={requestProps.data_link}
                target="_blank"
                style={{
                  cursor: "pointer",
                  color: "blue",
                  textDecoration: "underline",
                }}
              >
                {requestProps.data_link}
              </a>
            </div>
            <div className="mb-5">
              <label className="form-label required">Remark</label>
              <textarea
                className="form-control"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                required
              ></textarea>
            </div>
            <div style={{ display : "flex", width : "100%", justifyContent : "end"}}>
            <input
              type="submit"
              className="btn btn-primary"
              defaultValue={"Submit"}
            />
           <input
              type="button"
              className="btn btn-secondary ms-3"
              onClick={resetForm}
              id="checkAndEdit_request_close"
              defaultValue={"Cancel"}
            />
            </div>
            </form>
        </div>
      </div>
    </div>
  );
};
export { CheckAndEditRequestDrawer };
