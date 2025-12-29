import React, {FC, useState, useEffect} from 'react'
import {KTIcon} from '../../../helpers'
import axios from 'axios'

const BASE_URL = process.env.VITE_SERVER_URL;
const PRO_BASE_URL = `${BASE_URL}/projects`
const USER_BASE_URL = `${BASE_URL}/users`
const SETTING_BASE_URL = `${BASE_URL}/settings`

interface Project {
  business_number: string;
  customer_name: string;
  business_name: string;
  complate_date : Date | null;
  createDate : any;
  status : string;
}
let today = new Date();
today.setUTCHours(0, 0, 0, 0);

let projectObj: Project = {
  business_number: "",
  customer_name: "",
  business_name: "",
  complate_date: null,
  createDate: today.toISOString(),
  status: "Ongoing",
};

interface ProDataItem {
  business_name: string; 
  business_number: string; 
  customer_name: string; 
  status: string;
  createDate: Date;
  _id: string; 
}

interface ProductType {
  sendProductDataToParent: (product: any) => void;
}



const NewProjectDrawer: FC<ProductType> = ({sendProductDataToParent}) => {
  const [project , setProject] = useState<Project>(projectObj);
  const [success, setSuccess] = useState(false);
  const [addNewProjectSuccess, setAddNewProjectSuccess] = useState(false);
  const [proData, setProData] = useState<ProDataItem[]>([]);

  function inputData(e : any) {
    const { name, value } = e.target;
    
    setProject((prev) => {
       return {...prev, [name] : value}
    });

  }

  // let items : any[] = [];

  const getProductData = async () => {
    let product_data = axios.get(`${PRO_BASE_URL}`)
      .then((res) => {
        return res.data;
      })
    .catch(error => {
      console.error('Error fetching data:', error);
    });

    return product_data;
  }

  const addProject = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await axios.post(`${PRO_BASE_URL}/create-project`, project)
    .then(res => {
      setSuccess(true);
      setAddNewProjectSuccess(true)
      setProject(projectObj)
    })
    .catch(error => {
      console.log(error);
    });

    let product = await getProductData()
    sendProductDataToParent(product)

  }
  const resetForm = () => {
    setProject(projectObj);
  };
  useEffect(() => {
    if (success) {
      // If success is true, simulate click on Cancel button
      const cancelButton = document.getElementById("new_project_close");
      if (cancelButton) {
        cancelButton.click();
        setSuccess(false); // Reset success state after click
      }
    }
  }, [success]);

  
  return (
    <div

    id='new_project'
    className='bg-body'
    data-kt-drawer='true'
    data-kt-drawer-name='activities'
    data-kt-drawer-activate='true'
    data-kt-drawer-overlay='true'
    data-kt-drawer-width="{default:'720px', 'lg': '720px'}"
    data-kt-drawer-direction='end'
    data-kt-drawer-toggle='#new_project_toggle'
    data-kt-drawer-close='#new_project_close'
  >
    <div className='card shadow-none rounded-0  w-100'>
      <div className='card-header' id='new_project_header'>
        <h3 className='card-title fw-bolder text-gray-900'>New Project</h3>

                <div className='card-toolbar'>
                  <button
                    type='button'
                    className='btn btn-sm btn-icon btn-active-light-primary me-n5'
                    id='new_project_close'
                    onClick={resetForm}
                  >
                    <KTIcon iconName='cross' className='fs-1' />
                  </button>
                </div>
              </div>
              <div className='card-body position-relative' id='new_project_body'>

                  <form onSubmit={addProject}>
                    <div className='mb-5'>
                    <span className='fw-bold text-gray-700'>Business number</span>
                    <input type="text" className="form-control" name='business_number' value={project.business_number} onChange={inputData}  required/>
                    </div>
                    <div className='mb-5'>
                    <span className='fw-bold text-gray-700'>Customer name</span>
                    <input type="text" className="form-control" name='customer_name' value={project.customer_name} onChange={inputData} required/>
                    </div>
                    <div className='mb-5'>
                    <span className='fw-bold text-gray-700'>Business name</span>
                    <input type="text" className="form-control" name='business_name' value={project.business_name} onChange={inputData} required/>
                    </div>
                    <div style={{ display : "flex", width : "100%", justifyContent : "end"}}>
                    <input type="submit" className="btn btn-primary mt-5" value={"Submit"}/>
                    <input type="button" className="btn btn-secondary ms-3 mt-5" value={"Cancel"} id="new_project_close" onClick={resetForm} />
                    </div>
              </form>
              </div>

            </div>
          </div>
  )
}

export {NewProjectDrawer}
