import React, { FC, useEffect, useState } from "react";
import { KTIcon } from "../../../helpers";
import Flatpickr from "react-flatpickr";
import Select, { OptionsOrGroups } from "react-select";
import Swal from "sweetalert2";
// import "flatpickr/dist/themes/airbnb.css";
import axios from "axios";
import { useAuth } from "../../../../app/modules/auth";
const BASE_URL = process.env.VITE_SERVER_URL;
const PRO_BASE_URL = `${BASE_URL}/projects`
const USER_BASE_URL = `${BASE_URL}/users`
const SETTING_BASE_URL = `${BASE_URL}/settings`

interface EditRequestDrawerProps {
  earliestEndDate: string;
  rawRequestData: any;
  requestProps: any;
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
  emailReceiver:string;
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
  emailReceiver:"",
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

interface DateOption {
  disable: ((date: Date) => boolean)[];
  dateFormat: string;
}

const projectNameOptionInit: ProjectNameOption[] = [
  {
    value: "",
    label: "",
  },
];

const EditRequestDrawer: FC<EditRequestDrawerProps> = ({
  earliestEndDate,
  requestProps,
  rawRequestData,
  setUpdateData,
}) => {
  const { currentUser } = useAuth();

  const [emailReceiver, setEmailReceiver] = useState<any>();

  const [requestData, setRequestData] = useState<Request>(init_request_data);
  const [selectedProject, setSelectedProject] = useState<any>("");
  const [mainProjectId, setMainProjectId] = useState<any>("");
  const [cameraNumber, setCameraNumber] = useState<number>(0);
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
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [translated, setTranslated] = useState(false);
  const [proData, setProData] = useState<any>();
  const [camData, setCamData] = useState<any>();
  const [typeOption, setTypeOption] = useState<any>([]);
  const [holidays, setHolidays] = useState({ Holiday: "" });
  const [holidayArray, setHolidayArray] = useState<any>([]);
  const [dateOption, setDateOption] = useState<DateOption>({
    disable: [],
    dateFormat: "Y/m/d",
  });
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
          date.getDay() == 0 ||
          date.getDay() == 6
        );
      },
    ],
    dateFormat: "Y/m/d",
  });
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
        .filter((item: any) => item.for_person == null)
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
  }, []);

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


  const handleTypeChange = (selectedOption: any) => {
    setSelectedType(selectedOption);
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
    if (startDate && deadline) {
      let newDeadline = new Date(
        startDate.getTime() + (predictWorkdays - 1) * 24 * 60 * 60 * 1000
      );
      const { holidayCount } = countHolidays(
        startDate,
        newDeadline,
        holidayArray
      );
      setDayToAdd(predictWorkdays + holidayCount);
    }
  }, [deadline]);

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
  // const parsedStartDate = new Date(startDate.toLocaleString());// Old mun error
  const parsedStartDate = new Date(startDate);
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
  }, [predictWorkdays, selectedType, cameraNumber, dayToAdd]);



  const submitRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (translatedTermsOfRequest === "" || translatedCharacteristics === "") {
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
        { content: requestData }
      );
    } catch (error) {
      console.error("Error request text:", error);
      return null;
    }
  };
  useEffect(() => {
    if (translated) {
      if (startDate && deadline) {
        let dateStartForSave = new Date(startDate);
        dateStartForSave.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00.000 UTC

        let deadlineForSave = new Date(deadline);
        deadlineForSave.setUTCHours(0, 0, 0, 0); // Set time to 00:00:00.000 UTC
        
      setRequestData({
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
      if (submitSuccess) {
        const onConfirm = async () => {
          axios
            .put(
              `${PRO_BASE_URL}/update-request/${requestProps._id}`,
              requestData
            )
            .then((res) => {
              setUpdateData(res.data);
            })
            .catch((err) => {
              console.log(err);
            });
        };
        onConfirm();

        await sendEmail(requestData);
        Swal.fire({
          title: "Success",
          text: "Your request has been successfully sent to Systory's team. Our team is now reviewing it and will respond as soon as possible. Thank you for reaching out to us. We appreciate your patience.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });

        const cancelButton = document.getElementById("edit_request_close");
        setSubmitSuccess(false);
        if (cancelButton) {
          cancelButton.click();
          setTranslated(false);
        }
      }
    };
    sendEmailAndClose();
  }, [requestData, submitSuccess]);

// translate -------------------------------*------------------
const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string
) => {
  try {
    const response = await axios.post(
      `${PRO_BASE_URL}/translate`,
      {
        text: text,
        sourceLang: sourceLang,
        targetLang: targetLang,
      }
    );

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
      await axios.get(`${PRO_BASE_URL}`).then((res) => {
        setProData(res.data);
      });
      await axios
        .get(`${SETTING_BASE_URL}/camPerDay`)
        .then((res) => {
          setCamData(res.data);
        });
        await axios
        .get(`${SETTING_BASE_URL}/request-mail`)
        .then((res) => {
          setEmailReceiver(res.data[0]?.mail);
        });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    const fetchRankingSettings = async () => {
    if (proData) {
      let filteredData = proData.filter(
        (item: { status: string }) => item.status === "Ongoing"
      );
      let setProjectNameOption = filteredData.map((item: SetProjectName) => ({
        id: item._id,
        value: `${item.business_number}/${item.customer_name}/${item.business_name}`,
        label: `${item.business_number}/${item.customer_name}/${item.business_name}`,
      }));
      setProjectNameOptions(setProjectNameOption);
    }
    if (camData) {
      const rankingSettingsResponse = await axios.get(
        `${SETTING_BASE_URL}/ranking`
      );
      camData.forEach((item: any) => {
        if (item.ran_id._id == rankingSettingsResponse.data[0]._id) {
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
  };

  fetchRankingSettings();
  }, [proData, camData]);

  useEffect(() => {
    fetchData();
  }, [earliestEndDate]);

  useEffect(() => {
    if (requestProps) {
      setCameraNumber(requestProps.camera ?? cameraNumber);
      setTermsOfRequest(requestProps.terms_of_request ?? termsOfRequest);
      setTranslatedTermsOfRequest(requestProps.translated_terms_of_request ?? translatedTermsOfRequest);
      setCharacteristics(requestProps.characteristics ?? characteristics );
      setTranslatedCharacteristics(requestProps.translated_characteristics ?? translatedCharacteristics);
      setDataLink(requestProps.data_link ?? dataLink);
      if (requestProps.start_date) {
      let date_start = new Date(requestProps.start_date);
        date_start.setDate(date_start.getDate() );
        setStartDate(date_start ?? startDate?.toISOString());
      }
      setPredictWorkdays(requestProps.predict_work_days ?? predictWorkdays);

      if (requestProps.project_id) {
        let mainProjectName: any = projectNameOptions.find(
          (item: any) => item.id == requestProps.project_id._id
        );
        if (mainProjectName) {
          setSelectedProject(mainProjectName);
          setMainProjectId(mainProjectName);
        }
      }
      if (requestProps.type) {
        
        let typeValue = typeOption.find(
          (item: any) => item.value == requestProps.type
        );
        setSelectedType(typeValue);
      }
    }
  }, [requestProps]);

  return (
    <div
      id="edit_request"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="activities"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'720px', 'lg': '720px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#edit_request_toggle"
      data-kt-drawer-close="#edit_request_close"
    >
      <div className="card shadow-none rounded-0  w-100">
        <div className="card-header" id="edit_request_header">
          <h3 className="card-title fw-bolder text-gray-900">Edit Request</h3>

          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
              id="edit_request_close"
            >
              <KTIcon iconName="cross" className="fs-1" />
            </button>
          </div>
        </div>
        <div className="card-body position-relative" id="edit_request_body">
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
                onKeyDown={(e) => {
                  if (e.key === '+' || e.key === '-') {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value)) {
                    if (value <= 10000000) {
                      setCameraNumber(value);
                    } else {
                      alert("You can input up to 10,000,000.");
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
              <span className="fw-bold text-gray-700 required">Data links</span>
              <input
                type="url"
                className="form-control"
                onChange={(e) => setDataLink(e.target.value)}
                value={dataLink}
                required
              />
            </div>
            <div style={{ display : "flex", width : "100%", justifyContent : "end"}}>
            <input type="submit" className="btn btn-primary" value={"Submit"} />
            <input
              type="button"
              className="btn btn-secondary ms-3"
              value={"Cancel"}
              id="edit_request_close"
            />
            <input type="button" id="new_project_toggle" hidden />
        </div>
        </form>
        </div>
      </div>
    </div>
  );
};
export { EditRequestDrawer };
