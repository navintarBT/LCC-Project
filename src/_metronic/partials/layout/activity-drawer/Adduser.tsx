import React, { FC } from "react";
import { KTIcon } from "../../../helpers";
import "../ActivityDrawerStyle/Adduser.css";
const AddUser: FC = () => (
  <div
    id="Adduser"
    className="bg-body"
    data-kt-drawer="true"
    data-kt-drawer-name="activities"
    data-kt-drawer-activate="true"
    data-kt-drawer-overlay="true"
    data-kt-drawer-width="{default:'700px', 'lg': '700px'}"
    data-kt-drawer-direction="end"
    data-kt-drawer-toggle="#Adduser_toggle"
    data-kt-drawer-close="#Adduser_close"
  >
    <div className="card shadow-none rounded-0  w-100">
      <div className="card-header" id="Adduser_header">
        <h3 className="card-title fw-bolder text-gray-900">Add User</h3>

        <div className="card-toolbar">
          <button
            type="button"
            className="btn btn-sm btn-icon btn-active-light-primary me-n5"
            id="Adduser_close"
          >
            <KTIcon iconName="cross" className="fs-1" />
          </button>
        </div>
      </div>
      <div className="card-body position-relative" id="Adduser_body">
        <form>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <div className="mb-5">
                  <span className="fw-bold text-gray-700 required">
                    Username
                  </span>
                  <input style={{marginTop: '8px'}} type="text" className="form-control" required/>
                </div>
              </div>
              <div className="form-group">
                <div className="mb-5">
                  <span className="fw-bold text-gray-700 required">
                    First name 
                  </span>
                  <input style={{marginTop: '8px'}} type="text" className="form-control" required/>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <div className="mb-5">
                  <span className="fw-bold text-gray-700 required">
                    Displayname
                  </span>
                  <input style={{marginTop: '8px'}} type="text" className="form-control" required/>
                </div>
              </div>
              <div className="form-group">
                <div className="mb-5">
                  <span className="fw-bold text-gray-700 required">
                    Last name
                  </span>
                  <input style={{marginTop: '8px'}} type="text" className="form-control" required/>
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
                    <input style={{marginTop: '8px'}} type="email" className="form-control" required/>
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
                  <input style={{marginTop: '8px'}} type="password" className="form-control" required/>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <div className="mb-5">
                  <span className="fw-bold text-gray-700 required">
                  Confirm password 
                  </span>
                  <input style={{marginTop: '8px'}} type="password" className="form-control" required/>
                </div>
              </div>
            </div>
          </div>
          <input type="button" style={{backgroundColor: '#EFEFEF'}} className="btn" id="Adduser_close" value={"Cancel"} />
          <input style={{marginLeft: '10px'}} type="submit" className="btn btn-primary" value={"Submit"} />
        </form>
      </div>
    </div>
  </div>
);

export { AddUser };
