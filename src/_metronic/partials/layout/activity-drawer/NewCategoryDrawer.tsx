import React, { FC, useEffect, useState } from "react";
import { KTIcon } from "../../../helpers";
import { HexColorPicker } from "react-colorful";
import axios from "axios";
import Swal from "sweetalert2";
const BASE_URL = process.env.VITE_SERVER_URL;
const PRO_BASE_URL = `${BASE_URL}/projects`
const USER_BASE_URL = `${BASE_URL}/users`
const SETTING_BASE_URL = `${BASE_URL}/settings`
interface CategoryType {
  sendCategoryDataToParent: (category: any) => void;
  categoryDataToparent: (data: any) => void;
}

const NewCategoryDrawer: FC<CategoryType> = ({ sendCategoryDataToParent, categoryDataToparent }) => {
  const [success, setSuccess] = useState(false)
  const [color, setColor] = useState("#aabbcc");
  const [textColor, setTextColor] = useState("dark");
  const [categoryName, setCategoryName] = useState("");
  const [categoryData, setCategoryData] = useState([]);

  const inputCategoryName = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length <= 30) {
     setCategoryName(e.target.value);
  }else{
    Swal.fire({
      title: `Attention`,
      text: `Category names should not be more than 30 characters.`,
      icon: "info",
      confirmButtonColor: "#1E7ABD",
      confirmButtonText: "OK",
    })
  }
}

function getCategoryData() {
  let cate_data = axios.get(`${PRO_BASE_URL}/category`)
    .then(res => { 
      return res.data; // Return the data from the promise chain
    })
    .catch(error => {
      console.error("Error fetching category data:", error);
      return null; // or handle the error appropriately
    });

  return cate_data;
}


async function insertCategory(e: any) {
  e.preventDefault();
  let categoryDate = {
    category_name : categoryName,
    category_color : color
  }
  let categorys = await getCategoryData()
  const categoryNames = categorys.map((category: { category_name: any; }) => category.category_name.toLowerCase());
  if (categoryNames.includes(categoryDate.category_name.toLowerCase())) {
    Swal.fire({
      title: `The category name "${categoryDate.category_name}" exists`,
      icon: "info",
      confirmButtonColor: "#1E7ABD",
      confirmButtonText: "OK",
    })
  } else {
    setColor("#aabbcc");
    setCategoryName("");
  
    await axios.post(`${PRO_BASE_URL}/create-category`, categoryDate)
    .then(res => {
      setSuccess(true); 
    })
    .catch(error => {
      console.log(error);
    });
  }

  let category = await getCategoryData()
  sendCategoryDataToParent(category)

}
const resetForm = ()=>{
  setColor("#aabbcc");
  setCategoryName("");
}
  useEffect(() => {
    if (success) {
      // If success is true, simulate click on Cancel button
      const cancelButton = document.getElementById("new_category_close");
      if (cancelButton) {
        cancelButton.click();
        setSuccess(false); // Reset success state after click
      }
    }
  }, [success]);

  useEffect(() => {
    // Function to calculate the brightness of the color
    const calculateBrightness = (hexColor: string) => {
      const hex = hexColor.substring(1);
      const r = parseInt(hex.substring(0, 2), 16); // Extract Red value
      const g = parseInt(hex.substring(2, 4), 16); // Extract Green value
      const b = parseInt(hex.substring(4, 6), 16); // Extract Blue value
      return (r * 299 + g * 587 + b * 114) / 1000; // Formula to calculate brightness
    };
    // Check if color is light or dark
    const isLightColor = calculateBrightness(color) > 128;
    // Set text color based on brightness
    setTextColor(isLightColor ? "dark" : "light");
  }, [color]);

  return (
    <div
      id="new_category"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="activities"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'700px', 'lg': '700px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#new_category_toggle"
      data-kt-drawer-close="#new_category_close"
    >
      <div className="card shadow-none rounded-0  w-100">
        <div className="card-header" id="new_category_header">
          <h3 className="card-title fw-bolder text-gray-900">New Category</h3>

          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-active-light-primary me-n5"
              id="new_category_close"
              onClick={resetForm}
            >
              <KTIcon iconName="cross" className="fs-1" />
            </button>
          </div>
        </div>
        <div className="card-body position-relative" id="new_category_body">
          <form onSubmit={insertCategory}>
            <div className="mb-5">
              <span className="fw-bold text-gray-700 required">Category name</span>
              <input
                type="text"
                className="form-control"
                onChange={inputCategoryName}
                value={categoryName}
                maxLength={41}
                required
              />
            </div>
            <div className="d-flex justify-content-between mb-5">
              <div>
                <span className="fw-bold text-gray-700">Category color</span>
                <HexColorPicker color={color} onChange={setColor} />
              </div>
              <div className="mb-5 ms-5">
                <span className="fw-bold text-gray-700">Preview style</span>

                <div className="card mb-5 w-350px">
                  <div className="ribbon ribbon ribbon-start ribbon-clip mt-4">
                    <div className={`ribbon-label text-${textColor}`}>
                      {categoryName}
                      <span
                        className={`ribbon-inner`}
                        style={{ backgroundColor: `${color}` }}
                      ></span>
                    </div>
                  </div>

                  <div
                    className="card-header d-flex align-items p-4 parent-hover"
                    style={{ justifyContent: "space-between" }}
                  >
                    <span
                      className="m-1"
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <span>
                        <input
                          type="radio"
                          name="radioButton"
                          style={{
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                          }}
                          disabled
                        />
                      </span>
                      <span className="text-gray-700 ms-2">
                        task **********
                      </span>
                    </span>
                  </div>
                  <div
                    className="card-footer bg-secondary p-2"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <KTIcon iconName="calendar" className="ms-3 fs-2" />
                      <span>date</span>
                    </div>
                    <div style={{ display: "flex" }}>
                      <a style={{ marginRight: "5px" }}>
                        <div
                          style={{
                            width: "25px",
                            height: "25px",
                            backgroundColor: "#ddd",
                            borderRadius: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <span className="" style={{ color: "#888" }}>
                            San
                          </span>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display : "flex", width : "100%", justifyContent : "end"}}>
            <input type="submit" className="btn btn-primary mt-5" value={"Submit"} />
            <input type="button" className="btn btn-secondary ms-3 mt-5" value={"Cancel"} id="new_category_close" onClick={resetForm}/>
        </div>
        </form>
        </div>
      </div>
    </div>
  );
};

export { NewCategoryDrawer };
  function setSuccess(arg0: boolean) {
    throw new Error("Function not implemented.");
  }

