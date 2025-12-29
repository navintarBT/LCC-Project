import React, { FC, useEffect, useState } from "react";
import { KTIcon } from "../../../helpers";
import "../ActivityDrawerStyle/DetailsRequestDrawer.css";
interface DetailsRequestDrawerProps {
  requestProps: Request;
  contractorIsLogin: any;
}
type Request = {
  id: string;
  main_project_name: string;
  camera: number;
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
};
const DetailsRequestDrawer: FC<DetailsRequestDrawerProps> = ({
  requestProps,
  contractorIsLogin,
}) => {
  const [editMode, setEditMode] = useState(false);
  const toggleEditMode = () => {
    setEditMode(true);
  };

  useEffect(() => {
    const cancelButton = document.getElementById("details_request_close");
    if (cancelButton) {
      cancelButton.click();
      setEditMode(false);
    }
  }, [editMode]);
  return (
    <div
      id="details_request"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="activities"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'720px', 'lg': '720px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#details_request_toggle"
      data-kt-drawer-close="#details_request_close"
    >
      <div className="card shadow-none rounded-0  w-100">
        <div className="card-header" id="details_request_header">
          <h3 className="card-title fw-bolder text-gray-900">
            Details Request
          </h3>

          <div className="card-toolbar">
            {contractorIsLogin ? (
              <button
                type="button"
                className="btn btn-sm btn-icon btn-active-light-primary me-7"
                id="checkAndEdit_request_toggle"
                onClick={toggleEditMode}
              >
                <KTIcon iconName="pencil" className="fs-1" />
              </button>
            ) : requestProps.status != "Approved" ? (
              <button
                type="button"
                className="btn btn-sm btn-icon btn-active-light-primary me-7"
                id="edit_request_toggle"
                onClick={toggleEditMode}
              >
                <KTIcon iconName="pencil" className="fs-1" />
              </button>
            ) : null}

            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
              id="details_request_close"
            >
              <KTIcon iconName="cross" className="fs-1" />
            </button>
          </div>
        </div>
        <div className="card-body position-relative" id="details_request_body">
          <form>
            <div className="mb-5">
              <span className="fw-bold text-gray-700">Main project name</span>
              <input
                type="text"
                className="form-control details"
                value={requestProps.main_project_name}
                disabled
              />
            </div>
            <div className="mb-5">
              <span className="fw-bold text-gray-700">Camera</span>
              <input
                type="number"
                className="form-control details"
                value={requestProps.camera}
                disabled
              />
            </div>
            <div className="mb-5">
              <span className="fw-bold text-gray-700">Type</span>
              <input
                type="text"
                className="form-control details"
                value={requestProps.type}
                disabled
              />
            </div>
            <div className="mb-5">
              <label className="mb-4 fw-bold text-gray-700">
                Terms of request
                <span className="text-muted"> (Japanese language)</span>
              </label>
              <textarea
                className="form-control details"
                value={requestProps.terms_of_request}
                disabled
              />
              <textarea
                className="form-control details mt-3"
                value={requestProps.translated_terms_of_request}
                disabled
              />
            </div>
            <div className="mb-5">
              <label className="mb-4 fw-bold text-gray-700">
                Characteristics
                <span className="text-muted"> (Japanese language)</span>
              </label>
              <textarea
                className="form-control details"
                value={requestProps.characteristics}
                disabled
              ></textarea>
              <textarea
                className="form-control details mt-3"
                value={requestProps.translated_characteristics}
                disabled
              ></textarea>
            </div>
            <div
              className="mb-5"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <div>
                <span className="fw-bold text-gray-700">Start date</span>
                <input
                  type="text"
                  className="form-control details"
                  style={{ width: "250px" }}
                  value={requestProps.start_date
                    .substring(0, 10)
                    .replace(/-/g, "/")}
                  disabled
                />
              </div>

              <div>
                <span className="fw-bold text-gray-700">Deadline</span>
                <input
                  type="text"
                  className="form-control details"
                  style={{ width: "250px" }}
                  value={requestProps.deadline
                    .substring(0, 10)
                    .replace(/-/g, "/")}
                  disabled
                />
              </div>
              <div>
                <span className="fw-bold text-gray-700">
                  Predict working days
                </span>
                <input
                  type="number"
                  value={requestProps.predict_work_days}
                  className="form-control details"
                  style={{ width: "130px" }}
                  disabled
                />
              </div>
            </div>
            <div className="mb-5">
              <span className="fw-bold text-gray-700">Data links</span> <br />
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
          </form>
        </div>
      </div>
    </div>
  );
};
export { DetailsRequestDrawer };
