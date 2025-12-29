import React, { FC,useState,useEffect,ChangeEvent } from "react";
import { KTIcon } from "../../../helpers";
import "../ActivityDrawerStyle/Adduser.css";
import {toAbsoluteUrl} from '../../../helpers'
import Select from 'react-select'
  
const SystoryEdituser: FC = () => {
    //*---------------Optiopn for select---------------------
    const options = [
        { value: 'Beginer', label: 'Beginer' },
        { value: 'Intermediate', label: 'Intermediate' },
        { value: 'Expert', label: 'Expert' },
    ]
    //*---------------Optiopn for select---------------------

    //*---------------Examples data-------------------------
    const dataFormDatabses = {
      "id": 4,
      "username": "Binly",
      "firstName": "Binly",
      "lastName": "Binly",
      "image": "300-1.jpg",
      "email": "binly@gmail.com",
      "RemovalNoise": options[0],
      "Merge": options[0],
      "Measure": options[0],
      "Classification": options[0],
      "password": "125555",
      "confimPassword": "125555"
    }
    //*---------------Examples data-------------------------

    // *--------------Get data------------------------------
    const [imageName, setImageName] = useState<string | undefined>(dataFormDatabses.image)
    const [Username, setUsername] = useState(dataFormDatabses.username)
    const [FirstName, setFirstName] = useState(dataFormDatabses.firstName)
    const [LastName, setLastName] = useState(dataFormDatabses.lastName)
    const [Email, setEmail] = useState(dataFormDatabses.email)
    const [Passowrd, setPassowrd] = useState(dataFormDatabses.password)
    const [ConfirmPassword, setConfirmPassword] = useState(dataFormDatabses.password)
    const [RemovalNoise, setRemovalNoise] = useState(dataFormDatabses.RemovalNoise)
    const [Merge, setMerge] = useState(dataFormDatabses.Merge)
    const [Measure, setMeasure] = useState(dataFormDatabses.Measure)
    const [Classification, setClassification] = useState(dataFormDatabses.Classification)
    
    // *--------------Get data------------------------------

    // *--------------Show image----------------------------
    const [image, setImage] = useState<string | null>(`../../../../../public/media/avatars\/${dataFormDatabses.image}`);
    const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      const fileName = file?.name
      setImageName(fileName)
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    // *--------------Show image----------------------------

    // *--------------Remove image--------------------------
    const handleRemoveImage = () => {
      setImage(null);
      const input = document.querySelector('input[name="avatar"]') as HTMLInputElement;
      if (input) {
        input.value = ''; 
      }
    };
    // *--------------Remove image--------------------------

    // *--------------Get data function--------------------
    const inputUsername = (data: any) => {
      setUsername(data.target.value)
    }
    const inputFirstName = (data: any) => {
      setFirstName(data.target.value)
    }
    const inputLastName = (data: any) => {
      setLastName(data.target.value)
    }
    const inputEmail= (data: any) => {
      setEmail(data.target.value)
    }    
    const inputPassowrd= (data: any) => {
      setPassowrd(data.target.value)
    }
    const inputConfirmPassword= (data: any) => {
      setConfirmPassword(data.target.value)
    }
    // *--------------Get data function--------------------

  return(
    <div
      id="SystoryEdituser"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="activities"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'700px', 'lg': '700px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#SystoryEdituser_toggle"
      data-kt-drawer-close="#SystoryEdituser_close"
    >
      <div className="card shadow-none rounded-0  w-100">
        <div className="card-header" id="Adduser_header">
          <h3 className="card-title fw-bolder text-gray-900">Edit User</h3>
          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
              id="SystoryEdituser_close"
            >
              <KTIcon iconName="cross" className="fs-1" />
            </button>
          </div>
        </div>
        <div className="card-body position-relative" id="Adduser_body">
          <form>
            <div className="row">
                <div className="col-md-4">
                    <div className="form-grouo">
                    <label className="fw-bold text-gray-700 required">Image</label>
                        <div className="fv-row mb-7 mt-3">
                            <div className="image-input image-input-outline image-input-placeholder" data-kt-image-input="true">
                                <div className="image-input-wrapper w-125px h-125px" style={{ backgroundImage: `url(${image})` }}></div>
                                <label className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow" data-kt-image-input-action="change" data-bs-toggle="tooltip" title="Change avatar">
                                    <i className="ki-duotone ki-pencil fs-7">
                                    <span className="path1"></span>
                                    <span className="path2"></span>
                                    </i>
                                    <input type="file" name="avatar" accept=".png, .jpg, .jpeg" onChange={handleImageChange}  required/>
                                    <input type="hidden" name="avatar_remove" />
                                </label>
                                {image && (
                                    <span className="btn btn-icon btn-circle btn-active-color-primary w-25px h-25px bg-body shadow" data-kt-image-input-action="remove" data-bs-toggle="tooltip" title="Remove avatar" onClick={handleRemoveImage}>
                                        <i className="ki-duotone ki-cross fs-2">
                                        <span className="path1"></span>
                                        <span className="path2"></span>
                                        </i>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <div className="form-group">
                        <div className="mb-5">
                            <span className="fw-bold text-gray-700 required">
                            Username
                            </span>
                            <input style={{marginTop: '8px'}} type="text" defaultValue={Username} onChange={inputUsername} className="form-control" required/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <div className="mb-5">
                    <span className="fw-bold text-gray-700 required">
                      First name 
                    </span>
                    <input style={{marginTop: '8px'}} type="text" defaultValue={FirstName} onChange={inputFirstName} className="form-control" required/>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <div className="mb-5">
                    <span className="fw-bold text-gray-700 required">
                      Last name
                    </span>
                    <input style={{marginTop: '8px'}} type="text" defaultValue={LastName} onChange={inputLastName} className="form-control" required/>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                  <div className="form-group">
                      <div className="mb-5">
                      <span className="fw-bold text-gray-700 required">
                          Email 
                      </span>
                      <input style={{marginTop: '8px'}} type="email" defaultValue={Email} onChange={inputEmail} className="form-control" required/>
                      </div>
                  </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <div className="mb-5">
                    <span className="fw-bold text-gray-700 required">
                      Passowrd 
                    </span>
                    <input style={{marginTop: '8px'}} type="password" defaultValue={Passowrd} onChange={inputPassowrd} className="form-control" required/>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <div className="mb-5">
                    <span className="fw-bold text-gray-700 required">
                    Confirm password 
                    </span>
                    <input style={{marginTop: '8px'}} type="password" defaultValue={ConfirmPassword} onChange={inputConfirmPassword} className="form-control" required/>
                  </div>
                </div>
              </div>
            </div>
            <h3>Ranking</h3>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <div className="mb-5">
                    <span className="fw-bold text-gray-700 required">
                        Removal noise 
                    </span>
                    <div className='mb-10 mt-3'>
                        <Select
                            className='react-select-style' 
                            classNamePrefix='react-select' 
                            options={options} 
                            placeholder='Select an option' 
                            value={RemovalNoise}
                            onChange={(data:any) => {
                              setRemovalNoise(data);
                            }}
                        />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <div className="mb-5">
                    <span className="fw-bold text-gray-700 required">
                    Merge
                    </span>
                    <div className='mb-10 mt-3'>
                        <Select
                            className='react-select-style' 
                            classNamePrefix='react-select' 
                            options={options} 
                            placeholder='Select an option' 
                            value={Merge}
                            onChange={(data:any) => {
                              setMerge(data);
                            }}
                        />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className="form-group">
                  <div className="mb-5">
                    <span className="fw-bold text-gray-700 required">
                    `   Measure 
                    </span>
                    <div className='mb-10 mt-3'>
                        <Select
                            className='react-select-style' 
                            classNamePrefix='react-select' 
                            options={options} 
                            placeholder='Select an option' 
                            value={Measure}
                            onChange={(data:any) => {
                              setMeasure(data);
                            }}
                        />
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <div className="mb-5">
                    <span className="fw-bold text-gray-700 required">
                    Classification
                    </span>
                    <div className='mb-10 mt-3'>
                        <Select
                            className='react-select-style' 
                            classNamePrefix='react-select' 
                            options={options} 
                            placeholder='Select an option' 
                            value={Classification}
                            onChange={(data:any) => {
                              setClassification(data);
                            }}
                        />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <input type="button" style={{backgroundColor: '#EFEFEF'}} className="btn" id="SystoryEdituser_close" value={"Cancel"} />
            <input style={{marginLeft: '10px'}} type="submit" className="btn btn-primary" value={"Submit"} />
          </form>
        </div>
      </div>
    </div>
  );
}

export { SystoryEdituser };
