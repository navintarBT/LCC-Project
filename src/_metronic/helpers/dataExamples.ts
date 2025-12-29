import axios from "axios"
import moment from "moment"
import { useEffect } from "react"

export interface MessageModel {
  user: number
  type: 'in' | 'out'
  text: string
  time: string
  template?: boolean
}
export type RequestProps = {
  id: string;
  project_id: string;
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
  requester: any;
  requester_all: string[]
};

export type RequestData = {
  request_id: string;
  task_id?: string;
  project_id: string;
  main_project_name: string;
  sub_project_name: string;
  camera: number;
  type_id: string;
  type: any;
  terms_of_request: string;
  translated_terms_of_request: string;
  characteristics: string;
  translated_characteristics: string;
  persons_in_charge: any[];
  checker1: string;
  checker2?: string | null;
  persons_in_charge_complete: string | null;
  checker1_complete: string | null;
  checker2_complete: string | null;
  start_date: any;
  deadline: any;
  work_hours?: any | null;
  predict_work_days: number;
  data_link: string;
  status: string;
  taskStatus: string | null;
  worker_progress: any;
  checker_progress: any;
  requester: any;
  requester_all?: string[],
  progress: number,
  parent_progress:number,
  send_link:string,
  remark: string;
  sent_to: string;
};

export interface PersonsInCharge {
  id: string;
  value: string;
  label: string;
  user_image: string;
}

export type UserData = {
  _id: string;
  display_name: string;
  label: string;
  status: string;
};

export interface PersonsIncharge {
  id: string;
  value: string;
  label: string;
}

export type Task = {
  project_id: string;
  task_name: string;
  category: string | null;
  start: any | null;
  deadline: any | null;
  persons_in_charge: any[];
  status: string;
  task_segment:string;

};

export interface DateOption {
  disable: ((date: Date) => boolean)[];
  dateFormat: string;
}

export interface ProjectNameOption {
  value: string;
  label: string;
}

export interface SetProjectName {
  _id: string;
  business_number: string;
  customer_name: string;
  business_name: string;
}

const defaultMessages: Array<MessageModel> = [
  {
    user: 4,
    type: 'in',
    text: 'How likely are you to recommend our company to your friends and family ?',
    time: '2 mins',
  },
  {
    user: 2,
    type: 'out',
    text: 'Hey there, we’re just writing to let you know that you’ve been subscribed to a repository on GitHub.',
    time: '5 mins',
  },
  {
    user: 4,
    type: 'in',
    text: 'Ok, Understood!',
    time: '1 Hour',
  },
  {
    user: 2,
    type: 'out',
    text: 'You’ll receive notifications for all issues, pull requests!',
    time: '2 Hours',
  },
  {
    user: 4,
    type: 'in',
    text: 'You can unwatch this repository immediately by clicking here: <a href="https://keenthemes.com">Keenthemes.com</a>',
    time: '3 Hours',
  },
  {
    user: 2,
    type: 'out',
    text: 'Most purchased Business courses during this sale!',
    time: '4 Hours',
  },
  {
    user: 4,
    type: 'in',
    text: 'Company BBQ to celebrate the last quater achievements and goals. Food and drinks provided',
    time: '5 Hours',
  },
  {
    template: true,
    user: 2,
    type: 'out',
    text: '',
    time: 'Just now',
  },
  {
    template: true,
    user: 4,
    type: 'in',
    text: 'Right before vacation season we have the next Big Deal for you.',
    time: 'Just now',
  },
]

export interface UserInfoModel {
  id: number
  name: string
  email: string
  fullname?: string
  displayName?: string
}

const defaultUserInfos: Array<UserInfoModel> = [
  {
    "id": 1,
    "name": "A-san",
    "email": "a-san@gmail.com",
    "fullname" : "A san",
    "displayName": "Asa"
  },
  {
    "id": 2,
    "name": "B-san",
    "email": "b-san@gmail.com",
    "fullname" : "B san",
    "displayName": "Bsa"
  }, 
  {
    "id": 3,
    "name": "C-san",
    "email": "c-san@gmail.com",
    "fullname" : "C san",
    "displayName": "Csa"
  }, 
  {
    "id": 4,
    "name": "D-san",
    "email": "d-san@gmail.com",
    "fullname" : "D san",
    "displayName": "Csa"
  }, 
  {
    "id": 5,
    "name": "E-san",
    "email": "e-san@gmail.com",
    "fullname" : "E san",
    "displayName": "Esa"
  }, 
]

export interface RequestInfoModel {
  id: number
  projectName: string
  camera: number
  type?: string
  deadline?: string
  status?: string
}

  const requestData: Array<RequestInfoModel> = [
    {
      id: 1,
      projectName: '2900317/Customer-01/Business-01',
      camera: 212,
      type: 'Removal C',
      deadline: '2024/1/5',
      status: 'pending',
    },
    {
      id: 2,
      projectName: '2900317/Customer-01/Business-01',
      camera: 212,
      type: 'Removal C',
      deadline: '2024/1/5',
      status: 'pending',
    },
   
  ];



export interface UserInfoSystory {
  id: number
  username: string
  image?: string
  fullname?: string
  email: string
  rinking?: string
}

const UserSystory: Array<UserInfoSystory> = [
  {
    "id": 1,
    "username": "Aye",
    "image": "avatars\/300-1.jpg",
    "email": "aya@gmail.com",
    "fullname" : "Aya Aya",
    "rinking": "Expert"
  },
  {
    "id": 2,
    "username": "Dang noy",
    "image": "avatars\/300-2.jpg",
    "email": "dangnoy@gmail.com",
    "fullname" : "dangnoy",
    "rinking": "Intermediate"
  }, 
  {
    "id": 3,
    "username": "Ken",
    "image": "avatars\/300-3.jpg",
    "email": "ken@gmail.com",
    "fullname" : "Ken ken",
    "rinking": "Beginner"
  }, 
  {
    "id": 4,
    "username": "Binly",
    "image": "avatars\/300-4.jpg",
    "email": "binly@gmail.com",
    "fullname" : "binly",
    "rinking": "Beginner"
  }, 
  {
    "id": 5,
    "username": "test001",
    "image": "avatars\/300-5.jpg",
    "email": "test001@gmail.com",
    "fullname" : "test001",
    "rinking": "Expert"
  }, 
]

const messageFromClient: MessageModel = {
  user: 4,
  type: 'in',
  text: 'Thank you for your awesome support!',
  time: 'Just now',
}

export interface AlertModel {
  title: string
  description: string
  time: string
  icon: string
  state: 'primary' | 'danger' | 'warning' | 'success' | 'info'
}

const defaultAlerts: Array<AlertModel> = [
  {
    title: 'Project Alice',
    description: 'Phase 1 development',
    time: '1 hr',
    icon: 'technology-2',
    state: 'primary',
  },
  {
    title: 'HR Confidential',
    description: 'Confidential staff documents',
    time: '2 hrs',
    icon: 'information-5',
    state: 'danger',
  },
  {
    title: 'Company HR',
    description: 'Corporeate staff profiles',
    time: '5 hrs',
    icon: 'map001',
    state: 'warning',
  },
  {
    title: 'Project Red',
    description: 'New frontend admin theme',
    time: '2 days',
    icon: 'cloud-change',
    state: 'success',
  },
  {
    title: 'Project Breafing',
    description: 'Product launch status update',
    time: '21 Jan',
    icon: 'compass',
    state: 'primary',
  },
  {
    title: 'Banner Assets',
    description: 'Collection of banner images',
    time: '21 Jan',
    icon: 'graph-3',
    state: 'info',
  },
  {
    title: 'Icon Assets',
    description: 'Collection of SVG icons',
    time: '20 March',
    icon: 'color-swatch',
    state: 'warning',
  },
]
export interface LogModel {
  code: string
  state: 'success' | 'danger' | 'warning'
  message: string
  time: string
}

const defaultLogs: Array<LogModel> = [
  {code: '200 OK', state: 'success', message: 'New order', time: 'Just now'},
  {code: '500 ERR', state: 'danger', message: 'New customer', time: '2 hrs'},
  {code: '200 OK', state: 'success', message: 'Payment process', time: '5 hrs'},
  {code: '300 WRN', state: 'warning', message: 'Search query', time: '2 days'},
  {code: '200 OK', state: 'success', message: 'API connection', time: '1 week'},
  {code: '200 OK', state: 'success', message: 'Database restore', time: 'Mar 5'},
  {code: '300 WRN', state: 'warning', message: 'System update', time: 'May 15'},
  {code: '300 WRN', state: 'warning', message: 'Server OS update', time: 'Apr 3'},
  {code: '300 WRN', state: 'warning', message: 'API rollback', time: 'Jun 30'},
  {code: '500 ERR', state: 'danger', message: 'Refund process', time: 'Jul 10'},
  {code: '500 ERR', state: 'danger', message: 'Withdrawal process', time: 'Sep 10'},
  {code: '500 ERR', state: 'danger', message: 'Mail tasks', time: 'Dec 10'},
]


export interface EventType {
  id: string;
  title: string;
  userImage: string;
  projectName?: string;
  start: string;
  end: string;
  workday?: string;
  person: string;
  task?: string;
  status?: string;
  classNames: string;
  backgroundColor?: string;
  borderColor?: string;
}

//*----------------Custome Date---------------------------------
const todayDate = moment().startOf("day");
const YM = todayDate.format("YYYY-MM");
const TODAY = todayDate.format("YYYY-MM-DD");
//*----------------Custome Date----------------------------------

//*----------------Custome ID fro Events-------------------------
const uid = () => {
  return Date.now().toString() + Math.floor(Math.random() * 1000).toString();
};
//*----------------Custome ID fro Events-------------------------


const DataEvent: Array<EventType> = [
  {
    id: "66276c3ed1fa707c85984923",
    title: "systory",
    userImage: "300-3.jpg",
    projectName: "R-033",
    start: `2024-05-06`,
    end: `2024-05-30`,
    workday: "1",
    person: "systory",
    task: "Removal A",
    status: "Done",
    classNames: "fc-event-danger fc-event-solid-warning",
    backgroundColor: "#1E7ABD",
    borderColor: "#1E7ABD",
  },

  {
    id: "663b44427ba9be6769dd1f80",
    title: "AAA",
    userImage: "300-1.jpg",
    projectName: "R-033",
    start: `2024-04-06`,
    end: `2024-04-08`,
    workday: "1",
    person: "AAA",
    task: "Removal A",
    status: "Done",
    classNames: "fc-event-danger fc-event-solid-warning",
    backgroundColor: "#1E7ABD",
    borderColor: "#1E7ABD",
  },
  {
    id: "663c2fa02b83a71505939147",
    title: "owen",
    userImage: "300-2.jpg",
    projectName: "R-033",
    start: `2024-05-06`,
    end: `2024-05-30`,
    workday: "1",
    person: "owen",
    task: "Removal A",
    status: "Done",
    classNames: "fc-event-danger fc-event-solid-warning",
    backgroundColor: "#1E7ABD",
    borderColor: "#1E7ABD",
  },
]



export {DataEvent, defaultMessages, defaultUserInfos, requestData, UserSystory, defaultAlerts, defaultLogs, messageFromClient}
