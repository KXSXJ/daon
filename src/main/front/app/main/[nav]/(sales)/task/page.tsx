import TaskSearch from "@/components/main/sales/task/search";
import {getTasksApi} from "@/features/sales/task/api/server-api";

import { AffiliationType } from "@/model/types/customer/affiliation/type";
import { PageByProps } from "@/model/types/share/type";
import { ResponseEmployee } from "@/model/types/staff/employee/type";
import { ResponseTask } from "@/model/types/sales/task/type";
import { getAffiliation } from "@/features/customer/affiliation/api/server-api";
import { getEmployeeApi } from "@/features/staff/employee/api/server-api";

export default async function TaskPage({searchParams}:PageByProps){
    const page = (await searchParams).page || 1;

 
    const initialTask:ResponseTask[] =await getTasksApi()
    const affiliations:AffiliationType[] = await getAffiliation()
    const employees: ResponseEmployee[] = await getEmployeeApi()

    
    return(
           <TaskSearch
                affiliations={affiliations}
                initialTask={initialTask}
                employees={employees}
                page={page}/>
    )
}