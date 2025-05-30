import Affiliation from "@/components/main/customer/affiliation/affiliation";
import { getAffiliation } from "@/features/customer/affiliation/api/server-api";


export default async function AffiliationPage() {
    const affiliations = await getAffiliation()

    return <Affiliation affiliations={affiliations}/>

}