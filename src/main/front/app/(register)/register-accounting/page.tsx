import AccountingForm from "@/components/main/accounting/accounting-form";
import { getCategorySelectionApi } from "@/features/accounting/api/form-server-api";
import { AccountingDivision } from "@/model/types/accounting/type";
import { notFound } from "next/navigation";

export default async function RegisterAccountingPage({searchParams}:{
    searchParams:Promise<{
        division:string
    }>
}){
    const division = (await searchParams).division
    const categorySelections = await getCategorySelectionApi()

    if(!AccountingDivision[division]){
        notFound()
    }
    return <AccountingForm mode="write" division={division as keyof typeof AccountingDivision} categorySelections={categorySelections}/>
}