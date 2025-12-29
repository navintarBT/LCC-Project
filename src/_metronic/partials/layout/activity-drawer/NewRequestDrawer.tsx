import React, { FC, useEffect, useState } from "react";
import { KTIcon } from "../../../helpers";
import Flatpickr from "react-flatpickr";
import Select, { OptionsOrGroups } from "react-select";
import Swal from "sweetalert2";
// import "flatpickr/dist/themes/airbnb.css";
import axios from "axios";
import { useAuth } from "../../../../app/modules/auth";
import { NewProjectDrawer } from "./NewProjectDrawer";

interface NewRequestDrawerProps {
  earliestEndDate: string;
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
};

let init_request_data: Request = {
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
};

interface ProjectNameOption {
  value: string;
  label: string;
}

interface SetProjectName {
  _id: string;
  business_number: string;
  customer_name: string;
  business_name: string;
}

const projectNameOptionInit: ProjectNameOption[] = [
  {
    value: "",
    label: "",
  },
];

const NewRequestDrawer: FC<NewRequestDrawerProps> = ({
  earliestEndDate,
  setUpdateData,
}) => {
  const { currentUser } = useAuth();
  const [requestData, setRequestData] = useState<Request>(init_request_data);
  const [selectedProject, setSelectedProject] = useState<any>("");
  const [mainProjectId, setMainProjectId] = useState<any>("");
  const [cameraNumber, setCameraNumber] = useState(0);
  const [selectedType, setSelectedType] = useState<any>("");
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
  const [dayToAdd, setDayToAdd] = useState(0);
  const [dataLink, setDataLink] = useState("");
  const [productDataFromChild, setProductDataFromChild] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [translated, setTranslated] = useState(false);
  const [nextMonday, setNextMonday] = useState<any>();
  const [proData, setProData] = useState<any>();
  const [typeData, setTypeData] = useState<any>();
  const [camData, setCamData] = useState<any>();
  const [typeOption, setTypeOption] = useState<any>();
  const [minDeadline, setMinDeadline] = useState<Date | null>(
    earliestEndDate ? new Date(earliestEndDate) : null
  );
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
  const holidays = {
    Holiday:
      "2024/04/29, 2024/05/02, 2024/05/12, 2024/05/31, 2024/06/26",
  };

  const holidayArray = holidays.Holiday.split(",").map((date) =>
    date.trim().replace(/\//g, "-")
  );
  // console.log(holidayArray);

  let type_data: any = [];

  const handleProjectChange = (selectedOption: any) => {
    setSelectedProject(selectedOption);
    setMainProjectId(selectedOption);
    if (selectedOption && selectedOption.value === "new") {
      const newProjectDrawer = document.getElementById("new_project_toggle");
      if (newProjectDrawer) {
        newProjectDrawer.click();
        setSelectedProject("");
      }
    }
  };

  function getNextMonday(today: Date, holidays: string[]): Date {
    let nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7));

    // Skip over holidays
    const holidayDates: Date[] = holidays.map((holiday) => new Date(holiday));
    while (
      holidayDates.some(
        (holiday) =>
          holiday.toISOString().split("T")[0] ===
          nextMonday.toISOString().split("T")[0]
      )
    ) {
      nextMonday.setDate(nextMonday.getDate() + 1); // Move to the next day
    }
    return nextMonday;
  }

  const handleTypeChange = (selectedOption: any) => {
    setSelectedType(selectedOption);
  };

  const countHolidays = (
    startDate: Date,
    endDate: Date,
    holidays: string[]
  ): { holidayCount: number } => {
    const holidayArray: Date[] = holidays.map((date) => new Date(date));
    const holidayCount: any = holidayArray.filter(
      (holiday) =>
        holiday >= new Date(startDate) && holiday <= new Date(endDate)
    ).length;
    return { holidayCount };
  };

  useEffect(() => {
    if (startDate && deadline) {
      const { holidayCount } = countHolidays(startDate, deadline, holidayArray);
      setDayToAdd(predictWorkdays + holidayCount);
      console.log(holidayCount);
    }
  }, [deadline]);
  useEffect(() => {
    if (selectedType) {
      setPredictWorkdays(
        cameraNumber !== 0
          ? Math.ceil(cameraNumber / selectedType.cameraPerDays)
          : 0
      );

      const parsedDate = new Date(earliestEndDate);
      if (new Date() < parsedDate || parsedDate.getDay() !== 0 && parsedDate.getDay() !== 6) {
        console.log(parsedDate);
        console.log(dayToAdd);
        
        const minDeadlineDate = addBusinessDays(parsedDate, dayToAdd);
        console.log(minDeadline);
        setDeadlineOption((prev) => ({ ...prev, minDate: minDeadlineDate }));
        console.log("now is less");
        setDeadline(minDeadlineDate);
      } else {
        console.log("no long time free but weekend");
        const minDeadlineDate = addBusinessDays(nextMonday, dayToAdd);
        setDeadlineOption((prev) => ({ ...prev, minDate: minDeadlineDate }));
        setDeadline(minDeadlineDate);
      }
    }
  }, [predictWorkdays, selectedType, cameraNumber, dayToAdd]);

  const translateText = async (
    text: string,
    sourceLang: string,
    targetLang: string
  ) => {
    try {
      const response = await axios.post(
        "http://localhost:4000/projects/translate",
        {
          text: text,
          sourceLang: sourceLang,
          targetLang: targetLang,
        }
      );
      return response.data.translations[0].text;
    } catch (error) {
      console.error("Error translating text:", error);
      return null;
    }
  };

  const resetForm = () => {
    // setStartDate(undefined);
    setDeadline(undefined);
    setSelectedProject("");
    setMainProjectId("");
    setCameraNumber(0);
    setTermsOfRequest("");
    setCharacteristics("");
    setTranslatedTermsOfRequest("");
    setTranslatedCharacteristics("");
    setDataLink("");
    setSelectedType("");
    setPredictWorkdays(0);
  };

  const submitRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // if (translatedTermsOfRequest === "" || translatedCharacteristics === "") {
    //   await handleTranslateClick("TermsOfRequest");
    //   await handleTranslateClick("Characteristics");
    //   setTranslated(true);
    // } else {
    setTranslated(true);
    // }
    Swal.fire({
      title: "Are you sure?",
      text: "Are you sure to submit this request.",
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
        "http://localhost:4000/projects/send-request",
        { content: requestData }
      );
      console.log(response);
    } catch (error) {
      console.error("Error request text:", error);
      return null;
    }
  };
  useEffect(() => {
    if (translated) {
      setRequestData({
        project_id: mainProjectId.id,
        camera: cameraNumber,
        type_id: selectedType.id,
        type: selectedType.value,
        terms_of_request: termsOfRequest,
        translated_terms_of_request: translatedTermsOfRequest,
        characteristics: characteristics,
        translated_characteristics: translatedCharacteristics,
        start_date: startDate,
        deadline: deadline,
        predict_work_days: predictWorkdays,
        data_link: dataLink,
        status: "Pending",
        requester: currentUser,
        progress: 0,
        sent_to: "systoryForRequested",
      });
    }
  }, [translated]);

  useEffect(() => {
    const sendEmailAndClose = async () => {
      if (submitSuccess) {
        console.log(requestData);
        const onConfirm = async () => {
          axios
            .post("http://localhost:4000/projects/create-request", requestData)
            .then((res) => {
              console.log("create-request successfully");
              setUpdateData(res.data);
            })
            .catch((err) => {
              console.log(err);
            });
        };
        onConfirm();

        // await sendEmail(requestData);
        Swal.fire({
          title: "Success",
          text: "Your request has been successfully sent to Systory's team. Our team is now reviewing it and will respond as soon as possible. Thank you for reaching out to us. We appreciate your patience.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });

        const cancelButton = document.getElementById("new_request_close");
        setSubmitSuccess(false);
        if (cancelButton) {
          cancelButton.click();
          setTranslated(false);
          resetForm();
        }
      }
    };
    sendEmailAndClose();
  }, [requestData, submitSuccess]);

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
        textToTranslate,
        sourceLang,
        targetLang
      );
      setTranslatedTextFunction(translatedText);
    } catch (error) {
      console.error("Error translating text:", error);
    }
  };

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

  const fetchData = async () => {
    try {
      await axios.get("http://localhost:4000/projects").then((res) => {
        setProData(res.data);
      });
      await axios
        .get("http://localhost:4000/settings/camPerDay")
        .then((res) => {
          setCamData(res.data);
        });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleProductDataFromChild = (data: any) => {
    setProductDataFromChild(data);
  };

  useEffect(() => {
    if (proData) {
      let filteredData = proData.filter(
        (item: { status: string }) => item.status === "Ongoing"
      );
      let setProjectNameOption = filteredData.map((item: SetProjectName) => ({
        id: item._id,
        value: `${item.business_number}/${item.customer_name}/${item.business_name}`,
        label: `${item.business_number}/${item.customer_name}/${item.business_name}`,
      }));
      setProjectNameOption.push({
        id: 0,
        value: "new",
        label: "+ New Project Name",
      });
      setProjectNameOptions(setProjectNameOption);
    }
    if (camData) {
      camData.forEach((item: any) => {
        if (item.ran_id._id == "66306c43e860e5ef297359e5") {
          type_data.push({
            id: item.type_id._id,
            value: item.type_id.type_name,
            label: item.type_id.type_name,
            cameraPerDays: item.cam_amount,
          });
        }
      });
      setTypeOption(type_data);
    }
  }, [proData, camData]);

  useEffect(() => {
    fetchData();
    setNextMonday(getNextMonday(new Date(), holidayArray));
  }, [earliestEndDate, productDataFromChild]);

  useEffect(() => {
    console.log(earliestEndDate);
    
    if (earliestEndDate) {
      const parsedDate = new Date(earliestEndDate);
      if (new Date() < parsedDate || parsedDate.getDay() !== 0 && parsedDate.getDay() !== 6) {
        setStartDateOption((prev) => ({ ...prev, minDate: parsedDate }));
        setDeadlineOption((prev) => ({ ...prev, minDate: parsedDate }));
        setStartDate(parsedDate);
        // console.log("no long time not free");
      } else {
        // All employees are out of work for a long time
        setStartDateOption((prev) => ({ ...prev, minDate: nextMonday }));
        setDeadlineOption((prev) => ({ ...prev, minDate: nextMonday }));
        setStartDate(nextMonday);
        // console.log("no long time free");
      }
    }
  }, [earliestEndDate]);

  return (
    <div
      id="new_request"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="activities"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'720px', 'lg': '720px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#new_request_toggle"
      data-kt-drawer-close="#new_request_close"
    >
      <div className="card shadow-none rounded-0  w-100">
        <div className="card-header" id="new_request_header">
          <h3 className="card-title fw-bolder text-gray-900">New Request</h3>

          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
              id="new_request_close"
              onClick={resetForm}
            >
              <KTIcon iconName="cross" className="fs-1" />
            </button>
          </div>
        </div>
        <div className="card-body position-relative" id="new_request_body">
          <form onSubmit={submitRequest}>
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
                onChange={(e) =>
                  setCameraNumber(
                    parseInt(e.target.value) > 10000000
                      ? cameraNumber
                      : parseInt(e.target.value)
                  )
                }
                value={isNaN(cameraNumber) ? "" : cameraNumber}
                placeholder="Enter number of camera"
                max={10000000}
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
                onChange={handleTypeChange}
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
                placeholder="Enter Terms of request"
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
                placeholder="Enter Characteristics"
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
                  onChange={([date]) => {
                    setMinDeadline(date);
                  }}
                  value={startDate}
                  options={startDateOption}
                  className="form-control"
                  placeholder="Pick date"
                  data-date-format="Y/m/d"
                  style={{ width: "250px" }}
                  disabled
                />
              </div>

              <div>
                <span className="fw-bold text-gray-700">Deadline</span>
                <Flatpickr
                  onChange={([date]) => {
                    setDeadline(date);
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
              <span className="fw-bold text-gray-700 required">Data links</span>
              <input
                type="url"
                className="form-control"
                onChange={(e) => setDataLink(e.target.value)}
                value={dataLink}
                required
              />
            </div>

            <input
              type="button"
              className="btn btn-secondary me-3"
              value={"Cancel"}
              onClick={resetForm}
              id="new_request_close"
            />
            <input type="button" id="new_project_toggle" hidden />
            <input type="submit" className="btn btn-primary" value={"Submit"} />
          </form>
        </div>
      </div>
      <NewProjectDrawer sendProductDataToParent={handleProductDataFromChild} />
    </div>
  );
};
export { NewRequestDrawer };
