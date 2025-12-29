import React, { FC,useState,useEffect,ChangeEvent } from "react";
import { KTIcon } from "../../../helpers";
import "../ActivityDrawerStyle/Adduser.css";
import axios from "axios";
const BASE_URL = process.env.VITE_SERVER_URL;
const PRO_BASE_URL = `${BASE_URL}/projects`
const USER_BASE_URL = `${BASE_URL}/users`
const SETTING_BASE_URL = `${BASE_URL}/settings`
type Props = {
  idToEditFromParent: string;
  handleUpdateData: (data: any) => void;
}

type rankType = {
  camId: string;
  id: string;
  title : string;
  camAmount : number;
}

type JobTypeData = {
    id : string;
    title : string;
    rank : rankType[]
}

interface FormDataItem {
  typeid: string;
  camId: string;
  rankid: string;
  amount: string;
}
  
const EditJobTypeDrawer: FC<Props> = ({idToEditFromParent, handleUpdateData}) => {
    const [typeData, setTypeData] = useState<any>()
    const [rankingData, setRankingData] = useState<any>()
    const [forJobTypeData, setForJobTypeData] = useState<any>()
    const [jobTypeDataToCreateList, setJobTypeDataToCreateList] = useState<JobTypeData>()
    const [formData, setFormData] = useState<FormDataItem[]>([]);
    const [success, setSuccess] = useState<boolean>(false);
    const [jobEditId, setJobEditId] = useState<string>(idToEditFromParent);
    const [typeNameToEdit, setTypeNameToEdit] = useState<any>();

    let jobTypeDataFormat: JobTypeData = {id:"",title : "", rank: []};
  const inputData = (e : any) => {
    e.preventDefault();

    setTypeNameToEdit({"type_name" : e.target.value})
  }

  const handleInputChange = (index: number, id: string, camId: string, value: string) => {
    // Create a copy of formData
    
    const updatedFormData = [...formData];
    // Update the specific item in the array
    updatedFormData[index] = { ...updatedFormData[index],typeid: idToEditFromParent, camId: camId, amount: value, rankid: id };
    // Update the state
    setFormData(updatedFormData);
  };
  

  const fetchTypeById = async () => {
    try {
      await axios.post(`${SETTING_BASE_URL}/job_type/${idToEditFromParent}`)
        .then(res => {
          setTypeData(res.data)
        })

        await axios.get(`${SETTING_BASE_URL}/ranking`)
        .then(res => {
          setRankingData(res.data)
        })

        await axios.get(`${SETTING_BASE_URL}/camPerDay`)
        .then(res => {
          setForJobTypeData(res.data)
        })
    } catch (error) {
      console.log(error);
    }
  }

  const createList = async () => {

    let rankingForJob: any[] = [];
    let camCheck : any[] = [];
      if (typeData) {
          rankingForJob = []
          
          rankingData.forEach((rank : any) => {
            if (forJobTypeData) {
              camCheck = forJobTypeData.filter((cam : any) => cam.type_id._id == typeData._id && cam.ran_id._id == rank._id)
            }
            let rankTitle = rank.rank_name
            if (camCheck.length > 0) {
              rankingForJob.push({
                camId: camCheck[0]._id,
                id: rank._id,
                ranktitle: rankTitle, // Set ranktitle property to rankTitle
                camAmount: camCheck[0].cam_amount 
              })
            } else {
              rankingForJob.push({
                camId: "",
                id: rank._id,
                ranktitle: rankTitle, // Set ranktitle property to rankTitle
                camAmount: "0" 
              })
            }
          })

          jobTypeDataFormat = {
            "id": typeData._id,
            "title": typeData.type_name,
            "rank" : rankingForJob
          }
      }
      setJobTypeDataToCreateList(jobTypeDataFormat)
     
  }

  const handleSubmit = async (event : any) => {
    event.preventDefault();

    if (typeNameToEdit && typeNameToEdit.type_name) {
      await axios.post(`${SETTING_BASE_URL}/update-job_Type/${idToEditFromParent}`, typeNameToEdit)
      .then((res) => {
        handleUpdateData(res.data)
        })
    }


    // Construct the final array of objects
    const finalData = formData.map( async (item) => {
      let rankData = {
        type_id: item.typeid,
        ran_id: item.rankid,
        cam_amount: item.amount
    }

    if (item.camId) {
      let rankDataToupdate = {
        type_id: item.typeid,
        ran_id: item.rankid,
        cam_amount: item.amount
      }

      await axios.post(`${SETTING_BASE_URL}/update-camPerDay/${item.camId}`, rankDataToupdate)
        .then(res => {
          handleUpdateData(res.data)
          
        })
      
    } else {
      await axios.post(`${SETTING_BASE_URL}/create-camPerDay`, rankData)
        .then(res => {
          handleUpdateData(res.data)
        })
    }
  
  });

  setSuccess(true);
    setFormData([])
    // Submit or further process finalData
  };

  const onCloseModal = () => {
    setSuccess(true);
  }

  useEffect(() => {
    if (success) {
      setFormData([])
      setJobEditId("")
      const cancelButton = document.getElementById("Edit_Job_Type_toggle");
      if (cancelButton) {
        cancelButton.click();
        setSuccess(false); // Reset success state after click
      }
    }
  }, [success]);


  useEffect(() => {
    setJobTypeDataToCreateList({id:"",title : "", rank: []})
    if (idToEditFromParent) {
      const asyncFunc = async () => {
        await fetchTypeById();
      }
      asyncFunc()
    }
  }, [idToEditFromParent])

  useEffect(() => {
    createList();
    
  }, [forJobTypeData])

  useEffect(() => {
    
  }, [typeData])

  return(
    <>
      <div
      id="edit_job_type"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="activities"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'600px', 'lg': '600px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#Edit_Job_Type_toggle"
      data-kt-drawer-close="#Edit_Job_Type_close"
    >
      <div className="card shadow-none rounded-0  w-100">
        <div className="card-header" id="Adduser_header">
          <h3 className="card-title fw-bolder text-gray-900">Edit Job Type</h3>
          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
              id="Edit_Job_Type_close"
              onClick={onCloseModal}
            >
              <KTIcon iconName="cross" className="fs-1" />
            </button>
          </div>
        </div>
        <div className="card-body position-relative" id="Adduser_body">
          <form onSubmit={handleSubmit}>
            <div className="row">
                <div className="col-md-12">
                    <div className="form-group">
                        <div className="mb-5">
                            <span className="fw-bold text-gray-700 required">
                              Type name
                            </span>
                            <input style={{marginTop: '8px'}} type="text" defaultValue={jobTypeDataToCreateList?.title} onChange={inputData} className="form-control" required/>
                        </div>
                    </div>
                </div>
            </div>
            {jobTypeDataToCreateList && jobTypeDataToCreateList.rank.map((item : any, index) => (
              <div key={index} className="row">
              <div className="col-md-12">
                <div className="form-group">
                  <div className="mb-5">
                    <span className="fw-bold text-gray-700 required">
                      {item.ranktitle}
                    </span>
                    <input style={{marginTop: '8px', width: '160px'}} type="text" defaultValue={item?.camAmount} onChange={(e) => handleInputChange(index,item.id, item.camId, e.target.value)} className="form-control" required/>
                    <input hidden style={{marginTop: '8px', width: '160px'}} type="text" defaultValue={item?.id} className="form-control" required/>
                  </div>
                </div>
              </div>
            </div>
            ))}
            <div style={{ display : "flex", width : "100%", justifyContent : "end"}}>
            <input style={{marginLeft: '10px'}} type="submit" className="btn btn-primary me-3" value={"Submit"} />
            <input type="button" style={{backgroundColor: '#EFEFEF'}} className="btn btn-secondary" onClick={onCloseModal} id="SystoryEdituser_close" value={"Cancel"} />
            </div>
            </form>
        </div>
      </div>
    </div>
    </>
  );
}

export { EditJobTypeDrawer };
