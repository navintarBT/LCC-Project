import React, {FC, useState, useEffect} from 'react'
import {KTIcon} from '../../../helpers'
import axios from 'axios'
import Swal from "sweetalert2";


const BASE_URL = process.env.VITE_SERVER_URL;
const PRO_BASE_URL = `${BASE_URL}/projects`
const USER_BASE_URL = `${BASE_URL}/users`
const SETTING_BASE_URL = `${BASE_URL}/settings`
type Props = {
    sentAllJobType : (data : any) => void,
    addNewTypeSuccess: (data : any) => void
}

type job_type = {
    type_name : string;
}

const AddJobTypeDrawer: FC<Props> = ({sentAllJobType, addNewTypeSuccess}) => {
    const [jobTypeName, setJobTypeName] = useState<job_type>();
    const [success, setSuccess] = useState(false);
    
    const resetForm = () => {
        setJobTypeName({type_name : ""})
    }

    const addJobType = async (e : any) => {
        e.preventDefault();

        if (jobTypeName) {
          await axios.post(`${SETTING_BASE_URL}/create-job_type`, jobTypeName)
          .then(res => {
            setSuccess(true); 
            addNewTypeSuccess(res.data)
          })

            await axios.get(`${SETTING_BASE_URL}/job_type`)
          .then(res => {
            sentAllJobType(res.data)
          })
          .catch(error => {
            console.log(error);
          });

      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Please enter your type name!",
        });
      }

    }

    const inputData = (e : any) => {
        setJobTypeName({ type_name : e.target.value})
    }

    useEffect(() => {
        if (success) {
          // If success is true, simulate click on Cancel button
          const cancelButton = document.getElementById("new_addJobType_close");
          if (cancelButton) {
            resetForm()
            cancelButton.click();
            setSuccess(false); // Reset success state after click
          }
        }
      }, [success]);
    
return (
  <div
    id='new_addJobType'
    className='bg-body'
    data-kt-drawer='true'
    data-kt-drawer-name='addJobType'
    data-kt-drawer-activate='true'
    data-kt-drawer-overlay='true'
    data-kt-drawer-width="{default:'600px', 'lg': '600px'}"
    data-kt-drawer-direction='end'
    data-kt-drawer-toggle='#new_addJobType_toggle'
    data-kt-drawer-close='#new_addJobType_close'
  >
    <div className='card shadow-none rounded-0'>
      <div className='card-header' id='kt_activities_header'>
        <h3 className='card-title fw-bolder text-gray-900'>Job Type</h3>

        <div className='card-toolbar'>
          <button
            type='button'
            className='btn btn-sm btn-icon btn-active-light-primary me-n5'
            id='new_addJobType_close'
          >
            <KTIcon iconName='cross' className='fs-1' />
          </button>
        </div>
      </div>
      <div className='card-body position-relative' id='kt_activities_body'>
            <div  style={{width: "530px"}}>
                <form onSubmit={addJobType}>
                    <div className="mb-10">
                        <label className="form-label">Type name</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="type name..."
                            onChange={inputData}
                            defaultValue={jobTypeName?.type_name}
                        />
                    </div>
                    <div style={{ display : "flex", width : "100%", justifyContent : "end"}}>
                        <input type="submit" className="btn btn-primary mt-5" value={"Submit"}/>
                        <input type="button" className="btn btn-secondary ms-3 mt-5" value={"Cancel"} id="new_addJobType_close" onClick={resetForm} />
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
)}

export {AddJobTypeDrawer}
