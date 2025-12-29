import { createContext } from "react";

export interface ProjectData {
    business_number?: string;
    business_name?: string;
    buiness_name?: string;
    status?: string;
    _id?: string;
}

const DataContext = createContext<ProjectData[]>([]);

export default DataContext;