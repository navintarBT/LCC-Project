import React, { FC,useState,useEffect,ChangeEvent } from "react";
import { KTIcon } from "../../../helpers";
import "../ActivityDrawerStyle/Adduser.css";
  
const SystoryAdduser: FC = () => {

    // *---------------------Get data------------------------------
    const [imageName, setImageName] = useState<string>()
    const [Username, setUsername] = useState()
    const [FirstName, setFirstName] = useState()
    const [LastName, setLastName] = useState()
    const [Email, setEmail] = useState()
    const [Passowrd, setPassowrd] = useState()
    const [ConfirmPassword, setConfirmPassword] = useState()
    // *---------------------Get data------------------------------

    // *--------------------Show image function------------------------------
    const [image, setImage] = useState<string | null>(null);
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
    // *---------------------Show image function------------------------------

    // *--------------------Remove image-----------------------------
    const handleRemoveImage = () => {
      setImage(null);
      const input = document.querySelector('input[name="avatar"]') as HTMLInputElement;
      if (input) {
        input.value = ''; 
      }
    };
    // *--------------------Remove image-----------------------------

    // *------------------Get data function-------------------------
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
    // *------------------Get data function-------------------------

  return(
    <div
      id="SystoryAdduser"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="activities"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'700px', 'lg': '700px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#SystoryAdduser_toggle"
      data-kt-drawer-close="#SystoryAdduser_close"
    >
      <div className="card shadow-none rounded-0  w-100">
        <div className="card-header" id="Adduser_header">
          <h3 className="card-title fw-bolder text-gray-900">Add User</h3>
  
          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
              id="SystoryAdduser_close"
            >
              <KTIcon iconName="cross" className="fs-1" />
            </button>
          </div>
        </div>
        <div className="card-body position-relative" id="Adduser_body">
          <form>
            <div className="row">
                <div className="col-md-4">
                    <div className="form-group">
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
                            <input style={{marginTop: '8px'}} type="text" onChange={inputUsername} className="form-control" required/>
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
                    <input style={{marginTop: '8px'}} type="text" className="form-control" onChange={inputFirstName} required/>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <div className="mb-5">
                    <span className="fw-bold text-gray-700 required">
                      Last name
                    </span>
                    <input style={{marginTop: '8px'}} type="text" className="form-control" onChange={inputLastName} required/>
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
                      <input style={{marginTop: '8px'}} type="email" className="form-control" onChange={inputEmail} required/>
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
                    <input style={{marginTop: '8px'}} type="password" className="form-control" onChange={inputPassowrd} required/>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group">
                  <div className="mb-5">
                    <span className="fw-bold text-gray-700 required">
                    Confirm password 
                    </span>
                    <input style={{marginTop: '8px'}} type="password" className="form-control" onChange={inputConfirmPassword} required/>
                  </div>
                </div>
              </div>
            </div>
            <input type="button" style={{backgroundColor: '#EFEFEF'}} className="btn" id="SystoryAdduser_close" value={"Cancel"} />
            <input style={{marginLeft: '10px'}} type="submit" className="btn btn-primary" value={"Submit"} />
          </form>
        </div>
      </div>
    </div>
  );
}

export { SystoryAdduser };
