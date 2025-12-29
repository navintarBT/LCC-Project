import {FC, useEffect, useState} from 'react'
import { useMutation, useQueryClient } from "react-query";
import {isNotEmpty} from '../../../../../../../_metronic/helpers'
import {initialUser, User} from '../core/_models'
import {useListView} from '../core/ListViewProvider'
import {UsersListLoading} from '../components/loading/UsersListLoading'
import {createUser, updateUser} from '../core/_requests'
import {useQueryResponse, useQueryResponseData} from '../core/QueryResponseProvider'
import { QUERIES } from '../../../../../../../_metronic/helpers';
import { useAuth } from '../../../../../auth';
import Select from 'react-select'
import Swal from 'sweetalert2';
import axios from 'axios'

const BASE_URL = process.env.VITE_SERVER_URL;
const USER_BASE_URL = `${BASE_URL}/users`;

type Props = {
  isUserLoading: boolean
  user: any
  haveBeenUpadtedData: (data:any) => void
}

interface FormValues {
  email: string;
}

type currentUserType = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string | undefined;
  role: string;
}

const UserEditModalForm: FC<Props> = ({user, isUserLoading, haveBeenUpadtedData}) => {
  const users = useQueryResponseData();
  const { currentUser } = useAuth()
  const {setItemIdForUpdate} = useListView()
  const { refetch, query } = useQueryResponse()
  const userId = currentUser?._id ? String(currentUser._id) : undefined
  const [currentUserData, setcurrentUserData] = useState<currentUserType | null | undefined>()
  const [dataEmpty, setDataEmpty] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false)
  const queryClient = useQueryClient();
  const [emailForCheck, setEmailForCheck] = useState<any>();
  const [errorConfirmPassword, setErrorConfirmPassword] = useState<boolean>(true)
  const [confirmPasswordData, setConfirmPasswordData] = useState<string>("")
  const [currentRoleSelected, setCurrentRoleSelected] = useState<any>();
  const [userRoleForWorker, setUserRoleForWorker] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<FormValues>>({});
  const [values, setValues] = useState<FormValues>({ email: '' });
  const [touched, setTouched] = useState<Partial<FormValues>>({});
  const [openChangePass, setOpenChangePass] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>();
  const [samePassword, setSamePassword] = useState<boolean>(false);
  const [previousPassword, setPreviousPassword] = useState<string>();
  const [textColor, setTextColor] = useState("dark");
  
  let userForEditUser = user.data;
  const [color, setColor] = useState<string>(userForEditUser?.color || "#aabbcc");
  let SETCURRENT_USER_FOR_EDIT : currentUserType;
  let intervalId : any;
  const [userForEdit] = useState<User>({
    ...user,
    avatar: user.avatar || initialUser.avatar,
    role: user.role || initialUser.role,
    position: user.position || initialUser.position,
    username: user.username || initialUser.username,
    email: user.email || initialUser.email,
  })

  //userRole options-----------------------------------------------
  const userrole: any[] = [
    { value: 'administrator', label: 'Administrator' },
    { value: 'normal_user', label: 'Normal User' },
  ];

  const inputStyle = {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: 'none',
    overflow : 'hidden',
};

  function changeRole(e : any | null) {
    setcurrentUserData((prev : any) => {
      return {...prev!, "role" : e.value}
    });
    
    setCurrentRoleSelected({ value: e.value, label: e.label })
  }

  const cancel = (event: React.MouseEvent<HTMLInputElement, MouseEvent>,withRefresh?: boolean) => {
    if (withRefresh) {
      refetch()
    }
    setItemIdForUpdate(undefined)
  }

  function inputData(e : any) {
    const { name, value } = e.target;
    setSamePassword(false);
    if ( name == 'confirm_password') {
      setConfirmPasswordData(value)
    }else if ( name == 'password') {
      setNewPassword(value)
    }

    // Validate the field
    if (name === 'email') {
      const error = validateEmail(value);
      setErrors({
        ...errors,
        email: error,
      });
    }
    
    setcurrentUserData((prev : any) => {
       return {...prev, [name] : value}
    });
  }

  async function fetchUserData() {
    return await axios.get(`${USER_BASE_URL}`).then((res) => res.data)
  }

  useEffect(() => {
    if (confirmPasswordData) {
      let match_password = checkPasswordMatch(currentUserData?.password, confirmPasswordData)
      setErrorConfirmPassword(match_password)
    }
  }, [currentUserData])

  function checkPasswordMatch(password : string | undefined, confirmPassword : string) {
    if (password === confirmPassword) {
        return true;
    } else {
        return false;
    }
  }

  useEffect(() => {
    SETCURRENT_USER_FOR_EDIT = {
      "id" : userForEditUser ? userForEditUser._id : "",
      "username" : userForEditUser ? userForEditUser.username : "",
      "first_name" : userForEditUser ? userForEditUser.first_name : "",
      "last_name" : userForEditUser ? userForEditUser.last_name : "",
      "email" : userForEditUser ? userForEditUser.email : "",
      "password" : userForEditUser ? userForEditUser.password : "",
      "role" : userForEditUser ? userForEditUser.role : "normal_user",
    }

    if (currentUser?.role) {
      let setFirstChaTolabel = SETCURRENT_USER_FOR_EDIT.role ? SETCURRENT_USER_FOR_EDIT.role[0].toUpperCase() + SETCURRENT_USER_FOR_EDIT.role.slice(1) : setCurrentRoleSelected({ value: 'normal_user', label: 'Normal User' });
      if (setFirstChaTolabel) {
        setCurrentRoleSelected({ value : SETCURRENT_USER_FOR_EDIT.role?.toLowerCase, label : setFirstChaTolabel})
      } else {
        setCurrentRoleSelected({ value: 'normal_user', label: 'Normal User' })
      }
    }

    if (userForEditUser?.password) {
      setPreviousPassword(userForEditUser?.password)
    }

    if (currentUser?.role === "normal_user") {
      setUserRoleForWorker(true);
    }

    if (userForEditUser?.color) {
      setColor(color);
    }
  }, [])

  useEffect(() => {
    // setConfirmPasswordData(SETCURRENT_USER_FOR_EDIT?.password)
    setEmailForCheck(SETCURRENT_USER_FOR_EDIT?.email)
    setcurrentUserData(SETCURRENT_USER_FOR_EDIT)
  }, [dataEmpty])

  useEffect(() => {
    setcurrentUserData((prev : any) => {
      return {...prev, color : color}
   });
  }, [color])

  const onLoading = () => {
    setSubmitting(false);
    setItemIdForUpdate(undefined)
    clearIntervalHandler()
  }

  const updateItem = useMutation((payload: any) => updateUser(payload), {    
    // 💡 response of the mutation is passed to onSuccess
    onSuccess: () => {
      // ✅ update detail view directly
      queryClient.invalidateQueries([`${QUERIES.USERS_LIST}-${query}`]);
    },
  });

  const createItem = useMutation((payload: any) => createUser(payload), {    
    // 💡 response of the mutation is passed to onSuccess
    onSuccess: () => {
      // ✅ update detail view directly
      queryClient.invalidateQueries([`${QUERIES.USERS_LIST}-${query}`]);
    },
  });

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
  };

  const validateEmail = (email: string | undefined): string | undefined => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email address';
    }
    return undefined;
  };

  const cancelChangePassword = () => {
    setOpenChangePass(false);
    setErrorConfirmPassword(true);
    setNewPassword("");
    setConfirmPasswordData("");
  }


  const onChangePassword = async (e : any) => {
    e.preventDefault();
    
    if (previousPassword && previousPassword === newPassword) {
      setSamePassword(true);
      Swal.fire("Your new password must be different from your current password.");
    } else {
      if (!errorConfirmPassword) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong!",
        });
      } else {
       await axios.put(`${USER_BASE_URL}/update-user-password/${userForEditUser._id}`, {
         password: newPassword,
         ...(userId ? {updatedBy: userId} : {}),
       }).then((res) => res.data) 
  
       await setOpenChangePass(false);
       setNewPassword("");
       setConfirmPasswordData("");
       Swal.fire({
        position: "center",
        icon: "success",
        title: "Your password has been updated",
        showConfirmButton: false,
        timer: 1500
      });
      }
    }
  };

  const onEditSubmit = async (e : any) => {
    e.preventDefault()
    let haveTheSame : any[] =  [] 
    let checkEmail : string | undefined = currentUserData?.email
    const emailError = validateEmail(checkEmail);
    
      if (currentUserData && isNotEmpty(currentUserData.id)) {
        haveTheSame = []
        haveTheSame = users.filter(user => user.email != emailForCheck).filter(checkUser => checkUser.email == currentUserData?.email);
        if (emailError) {
          setErrors({ email: emailError });
        } else {
          if (haveTheSame.length > 0) {
            Swal.fire({
              icon: "question",
              title: "Oops...",
              text: "Your email has already exit!",
            });
          } else {
            const payload = {
              ...(currentUserData || {}),
              ...(userId ? {updatedBy: userId} : {}),
            }
            await updateItem.mutate(payload);
          }
        }
      } else {
        if (!errorConfirmPassword && !openChangePass) {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Something went wrong!",
          });
        } else {
          haveTheSame =  users.filter(user => user.email == currentUserData?.email);
          if (emailError) {
            setErrors({ email: emailError });
          } else {
            if (haveTheSame.length > 0) {
              Swal.fire({
                icon: "question",
                title: "Oops...",
                text: "Your email has already exit!",
              });
            } else {
              const payload = {
                ...(currentUserData || {}),
                ...(userId ? {createdBy: userId, updatedBy: userId} : {}),
              }
              await createItem.mutate(payload);
            }
          }
        }
      }
      if (haveTheSame.length == 0 && emailError == undefined && errorConfirmPassword) {
        setSubmitting(true);
        let UserNewData = await fetchUserData()
        haveBeenUpadtedData(UserNewData)
        intervalId = setInterval(onLoading, 1000)
      }
  }

  // To clear the interval
  const clearIntervalHandler = async () => {
    clearInterval(intervalId);
  };
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
    <>
      <form id='kt_modal_add_user_form' className='form' onSubmit={onEditSubmit} style={{display : openChangePass ? "none" : "flex"}}>
        <div
          className='d-flex flex-column me-n7 pe-7bg-body'
          id='kt_modal_add_user_scroll'
          data-kt-scroll='true'
          data-kt-scroll-activate='{default: false, lg: true}'
          data-kt-scroll-max-height='auto'
          data-kt-scroll-dependencies='#kt_modal_add_user_header'
          data-kt-scroll-wrappers='#kt_modal_add_user_scroll'
          data-kt-scroll-offset='300px'
        >
          <div className="card-body position-relative" id="Adduser_body">
                <div className="row" style={{display : openChangePass ? "none" : "flex"}}>
                    <div className="col-md-6">
                    <div className="form-group">
                        <div className="mb-5">
                        <span className="fw-bold text-gray-700 required">
                            Username
                        </span>
                        <input style={{marginTop: '8px'}} name='username' type="text" defaultValue={userForEditUser ? userForEditUser.username : ""} className="form-control" onChange={inputData} required/>
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="mb-5">
                        <span className="fw-bold text-gray-700 required">
                            First name 
                        </span>
                        <input style={{marginTop: '8px'}} name='first_name' type="text" defaultValue={userForEditUser ? userForEditUser.first_name : ""} className="form-control" onChange={inputData} required/>
                        </div>
                    </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <div className="mb-5">
                            <span className="fw-bold text-gray-700 required">
                                Email 
                            </span>
                            <input style={{marginTop: '8px'}} name='email' type="email" defaultValue={userForEditUser ? userForEditUser.email : ""} className="form-control" onChange={inputData} onBlur={handleBlur} required/>
                            {touched.email && errors.email ? (
                                <div style={{color : "red"}}>{errors.email}</div>
                              ) : null}
                           </div>
                       </div>
                       <div className="form-group">
                        <div className="mb-5">
                        <span className="fw-bold text-gray-700 required">
                            Last name
                        </span>
                        <input style={{marginTop: '8px'}} name='last_name' type="text" defaultValue={userForEditUser ? userForEditUser.last_name : ""} className="form-control" onChange={inputData} required/>
                        </div>
                    </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6" style={{display : userForEditUser ? "none" : "block"}}>
                      <div className="form-group">
                          <div className="mb-5">
                          <span className="fw-bold text-gray-700 required">
                              Password 
                          </span>
                          <input style={{marginTop: '8px'}} name='password' type="password" defaultValue={userForEditUser ? userForEditUser.password : ""} className="form-control" onChange={inputData} required/>
                          </div>
                      </div>
                    </div>
                    <div className="col-md-6" style={{display : userForEditUser ? "none" : "block"}}>
                      <div className="form-group">
                          <div className="mb-5">
                          <span className="fw-bold text-gray-700 required">
                              Confirm password 
                          </span>
                          <input style={{marginTop: '8px'}} name="confirm_password" type="password" defaultValue={userForEditUser ? userForEditUser.password : ""} className="form-control" onChange={inputData} required/>
                          { !errorConfirmPassword && <span style={{color : "red"}}>Must match "password" field value</span>}
                          </div>
                      </div>
                    </div>
                     <div className="col-md-12">
                      <div className="form-group">
                          <div className="mb-5">
                          <span className="fw-bold text-gray-700 required">
                              Role 
                          </span>
                          <Select
                              className='react-select-style' 
                              classNamePrefix='react-select' 
                              options={userrole} 
                              placeholder='Select an option' 
                              value={currentRoleSelected} 
                              onChange={changeRole} 
                              isDisabled={userRoleForWorker}
                          />
                          </div>
                      </div>
                    </div>
                </div>
                <div className='row'>
                  <div className={`col-md-12 ${userForEditUser ? "" : "d-flex flex-end"}`}>
                    <button type="button" 
                      className='btn btn-primary' style={{marginRight: '190px', display : userForEditUser ? "inline-block" : "none"}}
                      onClick={() => setOpenChangePass(!openChangePass)}
                    >
                      Change password
                    </button>
                    <button
                      type='submit'
                      className='btn btn-primary'
                      data-kt-users-modal-action='submit'
                      disabled={isUserLoading}
                    >
                      <span className='indicator-label'>{userForEditUser ? "Save" : "Add"}</span>
                      {(submitting || isUserLoading) && (
                        <span className='indicator-progress'>
                          Please wait...{' '}
                          <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                        </span>
                      )}
                    </button>
                    <input type="button" style={{backgroundColor: '#EFEFEF'}} className="btn ms-3" id="Adduser_close" defaultValue={"Cancel"} onClick={(event) => cancel(event)} />
                  </div>
                </div>
            </div>
          </div>
      </form>

      <form onSubmit={onChangePassword} style={{display : openChangePass ? "flex" : "none"}}>
        <div
          className='d-flex flex-column me-n7 pe-7bg-body'>
              <div className="row" style={{display : !openChangePass ? "none" : "flex"}}>
                  <div className="row">
                      <div className="col-md-12">
                          <div className="form-group">
                              <div className="mb-5">
                              <span className="fw-bold text-gray-700 required">
                                  New password  
                              </span>
                              <input style={{marginTop: '8px', border : samePassword ? "1px solid red" : ""}} name='password' type="password" className="form-control" onChange={inputData} value={newPassword ? newPassword : ""} onBlur={handleBlur} placeholder='Please enter your new password' required/>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="row">
                      <div className="col-md-12">
                          <div className="form-group">
                              <div className="mb-5">
                              <span className="fw-bold text-gray-700 required">
                                  Confirm Password 
                              </span>
                              <input style={{marginTop: '8px'}} name='confirm_password' type="password" className="form-control" onChange={inputData} onBlur={handleBlur} value={confirmPasswordData ? confirmPasswordData : ""} placeholder='Please enter your confirm password' required/>
                              { !errorConfirmPassword && <span style={{color : "red"}}>Must match "password" field value</span>}
                              </div>
                          </div>
                      </div>
                  </div>
                </div>
                <div className='d-flex flex-row flex-end pe-5'>
                  <button
                    type='submit'
                    className='btn btn-primary'
                    data-kt-users-modal-action='submit'
                    disabled={isUserLoading}
                  >
                    <span className='indicator-label'>{userForEditUser ? "Update" : "Add"}</span>
                    {(submitting || isUserLoading) && (
                      <span className='indicator-progress'>
                        Please wait...{' '}
                        <span className='spinner-border spinner-border-sm align-middle ms-2'></span>
                      </span>
                    )}
                  </button>
                  <input type="button" style={{backgroundColor: '#EFEFEF'}} className="btn ms-3" id="Change_password_close" defaultValue={"Cancel"} onClick={cancelChangePassword} />
                </div>
        </div>
      </form>
      
      {(submitting || isUserLoading) && <UsersListLoading />}
    </>
  )
}

export {UserEditModalForm}
