import StockForm from "@/components/main/stock/stock/form/stock-form";
import { getStockCateApi } from "@/features/stock/category/api/server-api";
import { getStockByIdApi } from "@/features/stock/stock/api/search-server-api";
import { DetailPageProps } from "@/model/types/share/type";

export default async function RegisterStockPage({searchParams}:DetailPageProps){
    const mode = (await searchParams).mode
    const stockId = (await searchParams).target

    const stock = await getStockByIdApi(stockId)
    const InitStockCate = await getStockCateApi()
    return(
       <StockForm mode={mode} stockCate={InitStockCate} stock={stock}/>
    )
}