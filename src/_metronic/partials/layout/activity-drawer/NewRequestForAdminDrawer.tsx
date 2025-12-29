import React, { FC, useEffect, useState } from "react";
import { KTIcon, RequestProps, RequestData, PersonsInCharge, Task, DateOption, ProjectNameOption, SetProjectName, UserData,} from "../../../helpers";
import Flatpickr from "react-flatpickr";
import Select from "react-select";
import axios from "axios";
import Swal from "sweetalert2";
import { NewProjectDrawer } from "./NewProjectDrawer";
import { useAuth } from "../../../../app/modules/auth";

const BASE_URL = process.env.VITE_SERVER_URL;
const PRO_BASE_URL = `${BASE_URL}/projects`;
const USER_BASE_URL = `${BASE_URL}/users`;
const SETTING_BASE_URL = `${BASE_URL}/settings`;

interface NewRequestForAdminDrawerProps {
  requestFor?: string;
  earliestEndDate: string;
  requestProps: RequestProps;
  latestEndWorker: any;
  setUpdateData: (data: any) => void;
}
type Request = {
  project_id: string;
  camera: number;
  type_id: string;
  type: string;
  terms_of_request: string;
  translated_terms_of_request: string;
  characteristics: string;
  translated_characteristics: string;
  start_date: any;
  deadline: any;
  predict_work_days: number;
  data_link: string;
  status: string;
  requester: any;
  sent_to: string;
  progress: number;
  emailReceiver: string;
};

let init_new_request_data: Request = {
  project_id: "",
  camera: 0,
  type_id: "",
  type: "",
  terms_of_request: "",
  translated_terms_of_request: "",
  characteristics: "",
  translated_characteristics: "",
  start_date: "",
  deadline: "",
  predict_work_days: 0,
  data_link: "",
  status: "Pending",
  requester: "",
  sent_to: "",
  progress: 0,
  emailReceiver: "",
};

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
  persons_in_charge: [{ user: "", user_name_done: {user:null, user_name:null} }],
  checker1: "",
  checker2: "",
  persons_in_charge_complete: null,
  checker1_complete: null,
  checker2_complete: null,
  start_date: "",
  deadline: "",
  work_hours: 0,
  predict_work_days: 0,
  data_link: "",
  send_link: "",
  status: "",
  taskStatus: null,
  worker_progress: 0,
  checker_progress: 0,
  requester: "",
  requester_all: [], 
  progress: 0,
  parent_progress: 0,
  remark: "",
  sent_to: "",
};

let taskDataObj: Task = {
  project_id: "",
  task_name: "",
  category: "",
  start: null,
  deadline: null,
  persons_in_charge: [],
  status: "on going",
  task_segment: "systory",
};

const projectNameOptionInit: ProjectNameOption[] = [
  {
    value: "",
    label: "",
  },
];

const NewRequestForAdminDrawer: FC<NewRequestForAdminDrawerProps> = ({
  requestFor,
  earliestEndDate,
  requestProps,
  latestEndWorker,
  setUpdateData,
}) => {
  const { currentUser } = useAuth();
  const [newRequestData, setNewRequestData] = useState<Request>(
    init_new_request_data
  );
  const [newSubmitSuccess, setNewSubmitSuccess] = useState(false);

  const [adminRequestData, setAdminRequestData] =
    useState<RequestData>(init_request_data);
  const [adminSubmitSuccess, setAdminSubmitSuccess] = useState(false);

  const [selectedProject, setSelectedProject] = useState<any>("");
  const [mainProjectId, setMainProjectId] = useState<any>("");
  const [cameraNumber, setCameraNumber] = useState(0);
  const [selectedType, setSelectedType] = useState<any>([]);
  const [projectNameOptions, setProjectNameOptions] = useState<
    ProjectNameOption[]
  >(projectNameOptionInit);
  const [termsOfRequest, setTermsOfRequest] = useState("");
  const [characteristics, setCharacteristics] = useState("");
  const [translatedTermsOfRequest, setTranslatedTermsOfRequest] = useState("");
  const [translatedCharacteristics, setTranslatedCharacteristics] =
    useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [predictWorkdays, setPredictWorkdays] = useState(0);
  // const [dayToAdd, setDayToAdd] = useState(0);
  const [dataLink, setDataLink] = useState("");
  const [productDataFromChild, setProductDataFromChild] = useState("");
  const [translated, setTranslated] = useState(false);
  const [adminTranslated, setAdminTranslated] = useState(false);
  const [firstSubmit, setFirstSubmit] = useState(true);
  const [nextMonday, setNextMonday] = useState<any>();
  const [proData, setProData] = useState<any>();
  const [camData, setCamData] = useState<any>();
  const [emailReceiver, setEmailReceiver] = useState<any>();
  const [typeOption, setTypeOption] = useState<any>([]);
  const [holidays, setHolidays] = useState({ Holiday: "" });
  const [holidayArray, setHolidayArray] = useState<any>([]);
  const [subProjectNameOfMain, setSubProjectNameOfMain] = useState<
    string | null
  >(null);

  const [dateOption, setDateOption] = useState<DateOption>({
    disable: [],
    dateFormat: "Y/m/d",
  });

  const [startDateOption, setStartDateOption] = useState({
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
  //-----------------------

  const [checkUserRole, setCheckUserRole] = useState<boolean>(false);

  const [taskData, setTaskData] = useState<Task>(taskDataObj);
  const [getUserData, setGetUserData] = useState<UserData[]>([]);
  const [getRequestData, setGetRequestData] = useState<any[]>([]);
  const [subProjectName, setSubProjectName] = useState("");
  const [selectedSubProject, setSelectedSubProject] = useState<any>("");
  const [subProjectNameForSave, setSubProjectNameForSave] = useState<any>("");
  const [selectedPersonInCharge, setSelectedPersonInCharge] = useState<any>("");
  const [selectedChecker1, setSelectedChecker1] = useState<any>("");
  const [selectedChecker2, setSelectedChecker2] = useState<any>(null);
  const [initTypeOption, setInitTypeOption] = useState<any>([]);

  const [remark, setRemark] = useState("");
  // update to parent----------------------------------------------
  const handleProductDataFromChild = (data: any) => {
    setProductDataFromChild(data);
  };
  //end update to parent----------------------------------------------

  // send email----------------------------------------------------------
  const sendEmail = async (requestData: any) => {
    try {
      const response = await axios.post(`${PRO_BASE_URL}/send-request`, {
        content: requestData,
      });
    } catch (error) {
      console.error("Error request text:", error);
      return null;
    }
  };
  // end send email----------------------------------------------------------

  // submit for new request********************************************************
  const submitNewRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
      if (emailReceiver.trim() == "") {
        Swal.fire({
            title: "Missing Receiver Email!",
            text: "Please report to the Systory team to add the Contact Person's Email.",
            icon: "warning",
            confirmButtonColor: "#3085d6",
            confirmButtonText: "OK",
          })
          return
      }
    setFirstSubmit(false);
    if (
      translatedTermsOfRequest.trim() == "" ||
      translatedCharacteristics.trim() == ""
    ) {
      await handleTranslateClick("TermsOfRequest");
      await handleTranslateClick("Characteristics");
      setTranslated(true);
    } else {
      setTranslated(true);
    }
    Swal.fire({
      title: "Are you sure?",
      text: "Are you sure to submit this request.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Yes, submit",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        setNewSubmitSuccess(true);
      } else {
        setFirstSubmit(true);
        setTranslated(false);
      }
    });
  };

  useEffect(() => {
    if (translated) {
      if (startDate && deadline) {
        let dateStartForSave = new Date(startDate);
        dateStartForSave.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00.000 UTC
        let deadlineForSave = new Date(deadline);
        deadlineForSave.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00.000 UTC
        
        setNewRequestData({
          project_id: mainProjectId.id,
          camera: cameraNumber,
          type_id: selectedType.id,
          type: selectedType.value,
          terms_of_request: termsOfRequest,
          translated_terms_of_request: translatedTermsOfRequest,
          characteristics: characteristics,
          translated_characteristics: translatedCharacteristics,
          start_date: dateStartForSave.toISOString(),
          deadline: deadlineForSave.toISOString(),
          predict_work_days: predictWorkdays,
          data_link: dataLink,
          status: "Pending",
          requester: currentUser,
          progress: 0,
          sent_to: "systoryForRequested",
          emailReceiver: emailReceiver,
        });
      }
    }
  }, [translated]);

  useEffect(() => {
    const sendEmailAndClose = async () => {
      if (!newSubmitSuccess) return;
      try {
        await axios
          .post(`${PRO_BASE_URL}/create-request`, newRequestData)
          .then((res) => {
            setUpdateData(res.data);
          })
          .catch((err) => {
            console.error(err);
          });
      } catch (error) {
        console.error("Error save data:", error);
      }

      await sendEmail(newRequestData);
      Swal.fire({
        title: "Success",
        text: "Your request has been successfully sent to Systory's team. Our team is now reviewing it and will respond as soon as possible. Thank you for reaching out to us. We appreciate your patience.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });

      const cancelButton = document.getElementById(
        "new_request_for_admin_close"
      );
      setNewSubmitSuccess(false);
      if (cancelButton) {
        cancelButton.click();
        setTranslated(false);
        resetForm();
      }
    };
    sendEmailAndClose();
  }, [newRequestData, newSubmitSuccess]);
  // end submit for new request***************************************************

  // new request for Admin**********************************************************************
  const adminSubmitRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFirstSubmit(false);
    if(selectedType?.value == undefined){
      Swal.fire({
        title: "Attention!",
        text: "Please check the ranking of your selected person in user management.",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
        setFirstSubmit(true);
        setAdminTranslated(false);
      return
    }
    if (startDate && deadline) {
    if (startDate.setHours(0,0,0,0) > deadline.setHours(0,0,0,0)) {
      Swal.fire({
        title: `Invalid Date Range`,
        text: `The start date must be earlier than the deadline. Please adjust your dates accordingly.`,
        icon: "info",
        confirmButtonColor: "#1E7ABD",
        confirmButtonText: "OK",
      })
      setFirstSubmit(true);
      setAdminTranslated(false);
      return;
    }
  }

    if (
      translatedTermsOfRequest.trim() == "" ||
      translatedCharacteristics.trim() == ""
    ) {
      await handleTranslateClick("TermsOfRequest");
      await handleTranslateClick("Characteristics");
      setAdminTranslated(true);
    } else {
      setAdminTranslated(true);
    }

    Swal.fire({
      title: "Are you sure?",
      text: "Are you sure to submit this request.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "Yes, submit",
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        setAdminSubmitSuccess(true);
      }else {
        setFirstSubmit(true);
        setAdminTranslated(false);
      }
    });
  };

  useEffect(() => {
    if (adminTranslated) {
      if (startDate && deadline) {
        let dateStartForSave = new Date(startDate);
        dateStartForSave.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00.000 UTC
        dateStartForSave.setUTCDate(dateStartForSave.getUTCDate() + 1); // Add one day

        let deadlineForSave = new Date(deadline);
        deadlineForSave.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00.000 UTC

        const updatedStatus = "Approved";

        const filteredRequests = getRequestData.filter(
          (item: any) =>
            item.sub_project_name?._id == subProjectNameForSave.sub_project_name &&
            item.status !== "waitingDelivery" &&
            item.status !== "complete"
        );

        const updatedTaskStatus =
          filteredRequests.length <= 0
            ? "notStart"
            : filteredRequests[0].status;
        const checkerProgress = [
          {
            user: selectedChecker1.id,
            progress: 0,
            user_name: selectedChecker1.label,
            user_name_complete: null,
            user_image: selectedChecker1.user_image,
          },
        ];
        if (selectedChecker2?.id)
          checkerProgress.push({
            user: selectedChecker2.id,
            progress: 0,
            user_name: selectedChecker2.label,
            user_name_complete: null,
            user_image: selectedChecker2.user_image,
          });
        setTaskData({
          project_id: selectedProject.id,
          task_name: selectedType.value,
          category: null,
          start: dateStartForSave.toISOString(),
          deadline: deadlineForSave.toISOString(),
          persons_in_charge: [
            { user: selectedPersonInCharge.id, user_name_done: {user:null, user_name:null} },
          ],
          status: "on going",
          task_segment: "systory",
        });

        setAdminRequestData({
          request_id: "",
          project_id: selectedProject.id,
          main_project_name: selectedProject.value,
          sub_project_name: subProjectNameForSave.sub_project_name,
          camera: cameraNumber,
          type_id: selectedType.id,
          type: selectedType.value,
          terms_of_request: termsOfRequest,
          translated_terms_of_request: translatedTermsOfRequest,
          characteristics: characteristics,
          translated_characteristics: translatedCharacteristics,
          persons_in_charge: selectedPersonInCharge.id,
          checker1: selectedChecker1.id,
          checker2: selectedChecker2?.id,
          persons_in_charge_complete: null,
          checker1_complete: null,
          checker2_complete: null,
          start_date: dateStartForSave.toISOString(),
          deadline: deadlineForSave.toISOString(),
          predict_work_days: predictWorkdays,
          data_link: dataLink,
          send_link: "",
          progress: 0,
          status: updatedStatus,
          taskStatus: updatedTaskStatus,
          worker_progress: [
            {
              user: selectedPersonInCharge.id,
              progress: 0,
              user_name: selectedPersonInCharge.label,
              user_name_complete: null,
              user_image: selectedPersonInCharge.user_image,
            },
          ],
          checker_progress: checkerProgress,
          requester: currentUser,
          parent_progress: 0,
          remark: remark,
          sent_to: "notToSend",
        });
      }
    }
  }, [adminTranslated]);

  useEffect(() => {
    const sendEmailAndClose = async () => {
      if (!adminSubmitSuccess) return;

      let createTaskResponse: any = "";
      try {

        if (selectedSubProject.id == "0") {
          let checkDuplicate = subNameOptions.find((element) => element.value == subProjectNameForSave.sub_project_name);
         
          if (!checkDuplicate?.id) {
            const responseNewId = await axios.post(
              `${PRO_BASE_URL}/create-sub-project`,
              subProjectNameForSave
            );
            adminRequestData.sub_project_name = responseNewId.data?._id;
          } else {
            Swal.fire({
              title: "Duplicate Sub project name!",
              text: "Please select a new Sub project name",
              icon: "error",
              confirmButtonColor: "#3085d6",
            });
            setFirstSubmit(true);
            setAdminSubmitSuccess(false);
            return;
          }
        }

        createTaskResponse = await axios.post(
          `${PRO_BASE_URL}/create-task`,
          taskData
        );

        adminRequestData.task_id = createTaskResponse.data._id;

        const newRequestResponse = await axios.post(
          `${PRO_BASE_URL}/create-request`,
          adminRequestData
        );

        setUpdateData(newRequestResponse.data);
        adminRequestData.request_id = newRequestResponse.data._id;
        await axios.post(
          `${PRO_BASE_URL}/create-request-task`,
          adminRequestData
        );

      } catch (error) {
        console.error("Error save data:", error);
      }

      Swal.fire({
        title: "Success",
        text: "Your request has been successfully",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });

      const cancelButton = document.getElementById(
        "new_request_for_admin_close"
      );

      setAdminSubmitSuccess(false);
      if (cancelButton) {
        cancelButton.click();
        setAdminTranslated(false);
        resetForm();
      }
    };

    sendEmailAndClose();
  }, [adminRequestData, adminSubmitSuccess]);
  // ,end new request for Admin**************************************************************

  // change select main project name---------------------------------------------
  const handleProjectChange = (selectedOption: any) => {
    setSelectedProject(selectedOption);
    setMainProjectId(selectedOption);
    if (selectedOption && selectedOption.value === "new") {
      const newProjectDrawerButton = document.getElementById(
        "new_project_toggle_click"
      );
      newProjectDrawerButton?.click();
      const newProjectDrawer = document.getElementById("new_project_toggle");
      newProjectDrawer?.click();
      setSelectedProject("");
    }
  };
  // end change select main project name---------------------------------------------

  // translate -------------------------------*------------------
  const translateText = async (
    text: string,
    sourceLang: string,
    targetLang: string
  ) => {
    try {
      const response = await axios.post(`${PRO_BASE_URL}/translate`, {
        text: text,
        sourceLang: sourceLang,
        targetLang: targetLang,
      });

      return response.data.translations[0].text;
    } catch (error: any) {
      if (error.response.status == 456) {
        Swal.fire({
          title: "Quota for translations has been exceeded",
          text: "Please check your usage and consider upgrading your plan.",
          icon: "info",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          confirmButtonText: "Yes, submit",
        });
      }
      console.error("Error translating text:", error);
      return null;
    }
  };
  const handleTranslateClick = async (type: string) => {
    const sourceLang = "JA";
    const targetLang = "EN";
    const textToTranslate =
      type == "TermsOfRequest" ? termsOfRequest : characteristics;
    const setTranslatedTextFunction =
      type == "TermsOfRequest"
        ? setTranslatedTermsOfRequest
        : setTranslatedCharacteristics;
    try {

      const translatedText = await translateText(
        textToTranslate.replace(/#/g, "%23"),
        sourceLang,
        targetLang
      );
      setTranslatedTextFunction(translatedText);
    } catch (error) {
      console.error("Error translating text:", error);
    }
  };
  //end translate-------------------*-------------

  const handleInputSubProjectName = (e: any) => {
    setSubProjectName(e.target.value);
  };

  const handleSubProjectNameChange = (selectedOption: any) => {
    setSelectedSubProject(selectedOption);
  };
  
  useEffect(() => {
    if (currentUser?.role !== "administrator") {
      setCheckUserRole(true);
    }
  }, [currentUser]);

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
        .filter((item: any) => item.for_person === null || item.for_person == selectedPersonInCharge.id)
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

  const fetchData = async () => {
    try {
      const typeAndUserOnHold = await axios
        .get(`${PRO_BASE_URL}/request-task`)
        .then((res) => res.data);

      const userResponse = await axios.get(
        `${USER_BASE_URL}/get-all-user`
      );
      let userData = userResponse.data;
      const workers = userData;
      const UserOnHold = typeAndUserOnHold.filter(
        (user: any) => user.status == "onHold"
      );
      let combinedData :any[]= [];

      typeAndUserOnHold.forEach((task:any) => {
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
            acc[worker] = false; // Set to false only if status is "removal"
        } else if (acc[worker] !== false) {
            acc[worker] = true; // Set to true if not already set to false
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

      const camSettingsResponse = await axios.get(
        `${SETTING_BASE_URL}/camPerDay`
      );
      const rankingSettingsResponse = await axios.get(
        `${SETTING_BASE_URL}/ranking`
      );
      const type_data = camSettingsResponse.data
        .filter(
          (item: any) => item.ran_id._id == rankingSettingsResponse.data[0]._id
        )
        .map((item: any) => ({
          id: item.type_id._id,
          value: item.type_id.type_name,
          label: item.type_id.type_name,
          cameraPerDays: item.cam_amount,
        }));

      setInitTypeOption(type_data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(()=>{
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
      } catch (error) {
          console.error("Failed to fetch sub-project data", error);
      }
  };
  setData();
  },[])

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
    if (filteredSubID.length > 0 && filteredSubID[0]?.request_id?.project_id !== undefined && selectedProject?.id && selectedProject?.id !== filteredSubID[0]?.request_id?.project_id) {
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
}, [selectedSubProject, selectedProject, getRequestData, subProjectName]);



  
  useEffect(() => {
    const workerSet = new Set(latestEndWorker);
    const usersOnHold = getUserData.filter((user) => user.status === "onHold");
    let updatedPersonOptions: any[] = [];
    let updatedCheckerOptions: PersonsInCharge[] = [];
    usersOnHold.forEach((userData: any) => {
      userData.status === "onHold" ? (userData._id) : null;
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
            user_role: userData.role,
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

    setPersonOptions(updatedCheckerOptions);
    setCheckerOptions(updatedCheckerOptions);
  }, [latestEndWorker]);

  const addBusinessDays = (date: Date, daysToAdd: number): Date => {
    const resultDate = new Date(date);
    let businessDaysAdded = 1;

    while (businessDaysAdded < daysToAdd) {
      resultDate.setUTCDate(resultDate.getUTCDate() + 1);
      const dayOfWeek = resultDate.getUTCDay();
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
  if (!selectedType || !startDate) return;
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
  const predictWorkdays = cameraNumber !== 0 ? Math.ceil(cameraNumber / selectedType.cameraPerDays) : 0;
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

  console.log("startDate", startDate);
  
  // const parsedStartDate = new Date(startDate.toLocaleString()); // Old mun error
  const parsedStartDate = new Date(startDate);
  parsedStartDate.setUTCHours(0, 0, 0, 0);

  console.log("parsedStartDate",parsedStartDate);
  console.log("predictWorkdays",predictWorkdays);
  

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
}, [cameraNumber, selectedType, selectedPersonInCharge, holidayArray, startDate]);

  const resetForm = () => {
    setSelectedSubProject("")
    setSubProjectName("")
    setSelectedPersonInCharge("");
    setSelectedChecker1("");
    setSelectedChecker2("");
    setRemark("");
    setSelectedType("");
    setDeadline(undefined);
    setSelectedProject("");
    setMainProjectId("");
    setCameraNumber(0);
    setTermsOfRequest("");
    setCharacteristics("");
    setTranslatedTermsOfRequest("");
    setTranslatedCharacteristics("");
    setDataLink("");
    setPredictWorkdays(0);
    setFirstSubmit(true);
  };

  const setDefaultSubProject = () => {
    setSelectedSubProject("")
    setSubProjectName("")
  }
  // change selected-------------------------------------------------------------------
  const handleSelectChange = (
    selectedOption: any,
    setSelectedFunction: Function
  ) => {
    setSelectedFunction(selectedOption);
  };

  const fetchTypeData = async () => {
    try {
      const { data: typeAndUser } = await axios.get(
        `${SETTING_BASE_URL}/edit-rankiing-detail/${selectedPersonInCharge.id}`
      );

      const getTypesOptions = await Promise.all(
        typeAndUser.map(async (obj: { type_id: any; ran_id: any }) => {
          const { type_id, ran_id } = obj;
          const { data: camForSetOption } = await axios.post(
            `${SETTING_BASE_URL}/camPerDays/${type_id._id}/${ran_id._id}`
          );

          return {
            id: type_id._id,
            value: type_id.type_name,
            label: type_id.type_name,
            cameraPerDays: camForSetOption[0].cam_amount,
          };
        })
      );
      setTypeOption(getTypesOptions);
    } catch (error) {
      console.error("Error fetching type data:", error);
    }
  };
  // end change selecterd-------------------------------------------------------------------

  //************************************************************************ */

  useEffect(() => {
    if (selectedPersonInCharge) {
      fetchTypeData();
    }
    if (!selectedPersonInCharge) {
      setTypeOption(initTypeOption);
    }
  }, [selectedPersonInCharge]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (initTypeOption) {
      setTypeOption(initTypeOption);
    }
  }, [initTypeOption]);

  useEffect(() => {
    if (selectedType) {
      setSelectedType(
        typeOption.find((option: any) => option.value == selectedType.value)
      );
    }
  }, [typeOption]);
  //************************************************************************ */

  function getNextMonday(today: Date, holidays: string[]): Date {
    let nextMonday = new Date(today);
    const day = today.getDay();
    const daysUntilNextMonday = (8 - day) % 7;

    nextMonday.setDate(today.getDate() + daysUntilNextMonday);

    if (holidays.length > 1) {
      // Convert holidays to a Set of formatted date strings for faster lookup
      const holidaySet = new Set(
        holidays.map((date) => new Date(date).toISOString().split("T")[0])
      );
  
      // Skip over holidays
      while (holidaySet.has(nextMonday.toISOString().split("T")[0])) {
        nextMonday.setDate(nextMonday.getDate() + 1);
      }
    }

    return nextMonday;
  }

  //  fetch pro data -------------------------------------------------------
  const fetchProData = async () => {
    try {
      await axios.get(`${PRO_BASE_URL}`).then((res) => {
        setProData(res.data);
      });
      await axios.get(`${SETTING_BASE_URL}/camPerDay`).then((res) => {
        setCamData(res.data);
      });
      await axios.get(`${SETTING_BASE_URL}/request-mail`).then((res) => {
        setEmailReceiver(res.data[0]?.mail);
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchProData();

    setNextMonday(getNextMonday(new Date(), holidayArray));
  }, [productDataFromChild]);

  useEffect(() => {
    const fetchRankingSettings = async () => {
      if (proData) {
        const ongoingProjects = proData.filter(
          (item: { status: string }) => item.status === "Ongoing"
        );
        const projectOptions = ongoingProjects.map((item: SetProjectName) => ({
          id: item._id,
          value: `${item.business_number}/${item.customer_name}/${item.business_name}`,
          label: `${item.business_number}/${item.customer_name}/${item.business_name}`,
        }));

        projectOptions.push({
          id: 0,
          value: "new",
          label: "+ New Project Name",
        });

        setProjectNameOptions(projectOptions);
      }
      const rankingSettingsResponse = await axios.get(
        `${SETTING_BASE_URL}/ranking`
      );

      if (camData) {
        const typeData = camData
          .filter(
            (item: any) =>
              item.ran_id._id === rankingSettingsResponse.data[0]._id
          )
          .map((item: any) => ({
            id: item.type_id._id,
            value: item.type_id.type_name,
            label: item.type_id.type_name,
            cameraPerDays: item.cam_amount,
          }));

        setTypeOption(typeData);
      }
    };

    fetchRankingSettings();
  }, [proData, camData]);
  // end fetch pro data -------------------------------------------------------
  
  useEffect(() => {
    if (earliestEndDate) {
      const setFirstStartDate = async () =>{
      const parsedDate = new Date(earliestEndDate);
      let dateForStart = new Date(parsedDate);
      dateForStart.setUTCHours(0, 0, 0, 0);
      // if (selectedPersonInCharge.status == "onHold" || selectedPersonInCharge.user_role == "administrator") {
      //   dateForStart = new Date();
      //   dateForStart.setUTCHours(0, 0, 0, 0);
      //   dateForStart.setUTCDate(dateForStart.getDate() + 1);
      // }

      if (!isNaN(dateForStart.getTime())) {
        while (
          holidayArray.includes(dateForStart.toISOString().slice(0, 10)) ||
          dateForStart.getUTCDay() === 0 ||
          dateForStart.getUTCDay() === 6
        ) {
          parsedDate.setUTCDate(parsedDate.getDate() + 1);
          dateForStart.setUTCDate(dateForStart.getDate() + 1);
        }
      }

      if (new Date() < dateForStart || (dateForStart.getDay() !== 0 && dateForStart.getDay() !== 6)) {
        dateForStart.setUTCHours(0, 0, 0, 0);
        setStartDateOption((prev) => ({ ...prev, minDate: dateForStart }));
        setDeadlineOption((prev) => ({ ...prev, minDate: dateForStart }));
        console.log("dateForStart",dateForStart);
        
        setStartDate(dateForStart);
      } else {
        // All employees are out of work for a long time
        setStartDateOption((prev) => ({ ...prev, minDate: nextMonday }));
        setDeadlineOption((prev) => ({ ...prev, minDate: nextMonday }));
        setStartDate(nextMonday);
      }
    }
    setFirstStartDate()
  }
  }, [earliestEndDate, selectedPersonInCharge, holidayArray]);
  return (
    <div
      id="new_request_for_admin"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="activities"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'720px', 'lg': '720px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#new_request_for_admin_toggle"
      data-kt-drawer-close="#new_request_for_admin_close"
    >
      <div className="card shadow-none border-0 rounded-0  w-100">
        <div className="card-header" id="new_request_for_admin_header">
          <h3 className="card-title fw-bolder text-gray-900">New Request</h3>

          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
              id="new_request_for_admin_close"
              onClick={resetForm}
            >
              <KTIcon iconName="cross" className="fs-1" />
            </button>
          </div>
        </div>
        <div
          className="card-body position-relative"
          id="new_request_for_admin_body"
        >
          {requestFor == "kumonos" ? (
            <form onSubmit={submitNewRequest}>
              <div className="mb-5">
                <span className="fw-bold text-gray-700">Main project name</span>
                {selectedProject && selectedProject.value === "new" ? (
                  <Select
                    className="react-select-style"
                    classNamePrefix="react-select"
                    options={projectNameOptions}
                    value={projectNameOptionInit}
                    onChange={handleProjectChange}
                    required
                  />
                ) : (
                  <Select
                    className="react-select-style"
                    classNamePrefix="react-select"
                    options={projectNameOptions}
                    value={selectedProject}
                    onChange={handleProjectChange}
                    required
                  />
                )}
              </div>
              <div className="mb-5">
                <span className="fw-bold text-gray-700">Camera</span>
                <input
                  type="number"
                  className="form-control"
                  onKeyDown={(e) => {
                    if (e.key === "+" || e.key === "-") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      if (value <= 10000000) {
                        setCameraNumber(value);
                      } else {
                        Swal.fire({
                          title: "Maximum Input Capacity!",
                          text: "You can enter camera up to 10,000,000.",
                          icon: "warning",
                          confirmButtonColor: "#3085d6",
                          confirmButtonText: "OK",
                        })
                        setCameraNumber(0);
                      }
                    } else {
                      setCameraNumber(0);
                    }
                  }}
                  value={
                    isNaN(cameraNumber) || cameraNumber == 0 ? "" : cameraNumber
                  }
                  max={10000000}
                  min={0}
                  required
                />
              </div>
              <div className="mb-5">
                <span className="fw-bold text-gray-700">Type</span>
                <Select
                  className="react-select-style"
                  classNamePrefix="react-select"
                  options={typeOption}
                  value={selectedType}
                  onChange={(selectedOption) =>
                    handleSelectChange(selectedOption, setSelectedType)
                  }
                  required
                />
              </div>
              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-baseline">
                  <label className="mb-4 fw-bold text-gray-700">
                    Terms of request
                    <span className="text-muted"> (Japanese language)</span>
                  </label>
                  <input
                    type="button"
                    className="btn btn-sm btn-secondary translate_btn"
                    value={"translate"}
                    onClick={() => handleTranslateClick("TermsOfRequest")}
                    disabled={!termsOfRequest}
                  />
                </div>
                <textarea
                  className="form-control"
                  onChange={(e) => setTermsOfRequest(e.target.value)}
                  value={termsOfRequest}
                  required
                />
                <textarea
                  className="form-control mt-3"
                  value={translatedTermsOfRequest}
                  disabled
                ></textarea>
              </div>
              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-baseline">
                  <label className="mb-4 fw-bold text-gray-700">
                    Characteristics
                    <span className="text-muted"> (Japanese language)</span>
                  </label>
                  <input
                    type="button"
                    className="btn btn-sm btn-secondary translate_btn"
                    value={"translate"}
                    onClick={() => handleTranslateClick("Characteristics")}
                    disabled={!characteristics}
                  />
                </div>
                <textarea
                  className="form-control"
                  onChange={(e) => setCharacteristics(e.target.value)}
                  value={characteristics}
                  required
                ></textarea>
                <textarea
                  className="form-control mt-3"
                  value={translatedCharacteristics}
                  disabled
                ></textarea>
              </div>

              <div
                className="mb-5"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <div>
                  <span className="fw-bold text-gray-700">Start date</span>
                  <Flatpickr
                    value={startDate}
                    onChange={([date]) => {
                      setStartDate(date);
                    }}
                    options={startDateOption}
                    className="form-control"
                    placeholder="Pick date"
                    data-date-format="Y/m/d"
                    style={{ width: "250px" }}
                    disabled
                  />
                </div>

                <div>
                  <span className="fw-bold text-gray-700">Predict Deadline</span>
                  <Flatpickr
                    onChange={([date]) => {
                      const nextDay = new Date(date);
                      nextDay.setUTCHours(0, 0, 0, 0);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setDeadline(nextDay);
                    }}
                    value={deadline}
                    options={deadlineOption}
                    className="form-control"
                    placeholder="Pick date"
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
                <span className="fw-bold text-gray-700 required">
                  Data links
                </span>
                <input
                  type="url"
                  className="form-control"
                  onChange={(e) => setDataLink(e.target.value)}
                  value={dataLink}
                  required
                />
              </div>
              <div style={{ display : "flex", width : "100%", justifyContent : "end"}}>

              <input type="button" id="new_project_toggle_click" hidden />
              <button type="submit" className="btn btn-primary" value={"Submit"} disabled={!firstSubmit}>
                {firstSubmit && (<span className="indicator-label">Submit</span>)}
                {!firstSubmit && (
                  <span
                    className="indicator-progress"
                    style={{ display: "block" }}
                  >
                    Please wait...
                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                )}
              </button>
              <input
                type="button"
                className="btn btn-secondary ms-3"
                value={"Cancel"}
                onClick={resetForm}
                id="new_request_for_admin_close"
              />
              </div>
            </form>
          ) : requestFor == "systory" ? (
            <form onSubmit={adminSubmitRequest}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {selectedProject && selectedProject.value === "new" ? (
                  <div style={{ width: "310px" }}>
                    <label className="fw-bold text-gray-700">
                      Main project name
                    </label>
                    <Select
                      className="react-select-style"
                      classNamePrefix="react-select"
                      options={projectNameOptions}
                      value={projectNameOptionInit}
                      onChange={handleProjectChange}
                      required
                    />
                  </div>
                ) : (
                  <div style={{ width: "310px" }}>
                    <label className="fw-bold text-gray-700">
                      Main project name
                    </label>
                    <Select
                      className="react-select-style"
                      classNamePrefix="react-select"
                      options={projectNameOptions}
                      value={selectedProject}
                      onChange={handleProjectChange}
                      required
                    />
                  </div>
                )}

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
                className="mb-5 mt-5"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <div style={{ width: "310px" }}>
                  <label className="fw-bold text-gray-700">Camera</label>
                  <input
                    type="number"
                    className="form-control"
                    onKeyDown={(e) => {
                      if (e.key === "+" || e.key === "-") {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        if (value <= 10000000) {
                          setCameraNumber(value);
                        } else {
                          Swal.fire({
                            title: "Maximum Input Capacity!",
                            text: "You can enter camera up to 10,000,000.",
                            icon: "warning",
                            confirmButtonColor: "#3085d6",
                            confirmButtonText: "OK",
                          })
                          setCameraNumber(0);
                        }
                      } else {
                        setCameraNumber(0);
                      }
                    }}
                    value={
                      isNaN(cameraNumber) || cameraNumber == 0
                        ? ""
                        : cameraNumber
                    }
                    max={10000000}
                    min={0}
                    required
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
                    required
                  />
                </div>
              </div>

              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-baseline">
                  <label className="mb-4 fw-bold text-gray-700">
                    Terms of request
                    <span className="text-muted"> (Japanese language)</span>
                  </label>
                  <input
                    type="button"
                    className="btn btn-sm btn-secondary translate_btn"
                    value={"translate"}
                    onClick={() => handleTranslateClick("TermsOfRequest")}
                    disabled={!termsOfRequest}
                  />
                </div>
                <textarea
                  className="form-control"
                  onChange={(e) => setTermsOfRequest(e.target.value)}
                  value={termsOfRequest}
                  required
                />
                <textarea
                  className="form-control mt-3"
                  value={translatedTermsOfRequest}
                  disabled
                ></textarea>
              </div>
              <div className="mb-5">
                <div className="d-flex justify-content-between align-items-baseline">
                  <label className="mb-4 fw-bold text-gray-700">
                    Characteristics
                    <span className="text-muted"> (Japanese language)</span>
                  </label>
                  <input
                    type="button"
                    className="btn btn-sm btn-secondary translate_btn"
                    value={"translate"}
                    onClick={() => handleTranslateClick("Characteristics")}
                    disabled={!characteristics}
                  />
                </div>
                <textarea
                  className="form-control"
                  onChange={(e) => setCharacteristics(e.target.value)}
                  value={characteristics}
                  required
                ></textarea>
                <textarea
                  className="form-control mt-3"
                  value={translatedCharacteristics}
                  disabled
                ></textarea>
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
                    value={startDate}
                    onChange={([date1]) => {
                      const nextDay = new Date(date1);
                      nextDay.setUTCHours(0, 0, 0, 0);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setStartDate(nextDay);
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
                <span className="fw-bold text-gray-700 required">
                  Data links
                </span>
                <input
                  type="url"
                  className="form-control"
                  onChange={(e) => setDataLink(e.target.value)}
                  value={dataLink}
                  required
                />
              </div>
              <div className="mb-5">
                <label className="form-label">Remark</label>
                <textarea
                  className="form-control"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                ></textarea>
              </div>
              <div style={{ display : "flex", width : "100%", justifyContent : "end"}}>
              <button
                type="submit"
                className="btn btn-primary"
                value={"Submit"}
                disabled={!firstSubmit}
              >
                {firstSubmit && (<span className="indicator-label">Submit</span>)}
                {!firstSubmit && (
                  <span
                    className="indicator-progress"
                    style={{ display: "block" }}
                  >
                    Please wait...
                    <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
                  </span>
                )}
              </button>
              <input
                type="button"
                className="btn btn-secondary ms-3"
                onClick={resetForm}
                id="new_request_for_admin_close"
                defaultValue={"Cancel"}
              />
              </div>
            </form>
          ) : null}
        </div>
      </div>
      <NewProjectDrawer sendProductDataToParent={handleProductDataFromChild} />
    </div>
  );
};
export { NewRequestForAdminDrawer };
