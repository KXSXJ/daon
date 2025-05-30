import '@/styles/form-style/form.scss'

import CustomerForm from "@/components/main/customer/form/customer-form";
import {ResponseCustomer} from "@/model/types/customer/customer/type";
import {DetailPageProps} from "@/model/types/share/type";
import {ResponseEmployee} from "@/model/types/staff/employee/type";
import { getEmployeeApi } from "@/features/staff/employee/api/server-api";
import { getAffiliation } from "@/features/customer/affiliation/api/server-api";
import { getCustomerAPi } from "@/features/customer/customer/api/server-api";


export default async function CustomerDetailPage({searchParams}: DetailPageProps) {
    const customerId = (await searchParams).target || ''
    const mode = (await searchParams).mode || 'detail';

    const customer: ResponseCustomer = await getCustomerAPi(customerId)

    
    const affiliation = await getAffiliation()
    const employees: ResponseEmployee[] = await getEmployeeApi()


    return  <CustomerForm affiliation={affiliation} customer={customer} employees={employees} mode={mode}/>

}