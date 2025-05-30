import { CustomerCateEnum, ResponseCustomer } from "../customer/customer/type";
import { ReceiptCategoryEnum } from "../sales/receipt/type";
import { StockCate } from "../stock/cate/type";
import { TaxationCate } from "../stock/stock/types";

export type LedgerSearchCondition ={
    searchSDate: Date;  //검색 날짜 시작일
    searchEDate: Date;  //검색 날짜 종료일
    customerCate?: CustomerCateEnum;//구분
    affiliationId?:string;//소속
    customerId?: string; //거래처아이디
    stockId?: string;//품명
    customerIds?:string[];
    officialId?:string//관리비분류
    stockCateId?:string;
    //-----------------
    sales?: boolean;//매출
    purchase?: boolean;// 매입
    deposit?: boolean;// 입금
    withdrawal?: boolean;// 출금
    salesDiscount?: boolean;// 매출할인
    purchaseDiscount?: boolean;// 매입할인
    returnOut?: boolean;// 반품출고
    returnIn?: boolean;// 반품입고
}

export enum FormCategory{
    EX ="그외",//전체
    ESTIMATE ="견적서",//전체
    SALES="매출부가세",              // 매출
    CARD="카드지출",     // 매출할인
    EXPENSE="지출증빙"  // 반품입고
}


export interface ResponseLedger{
    receiptId:string
    timeStamp:Date
    category?:ReceiptCategoryEnum
    customerName?:string
    productName?:string
    modelName?:string
    officialId: string
    officialName: string
    outPrice?:number
    quantity?:number
    totalPrice?:number
    memo?:string
    description?:string
}

export interface ResponseLedgerStock{
    category: StockCate
    compatibleModel:string
    stockId:string
    inPrice:number
    outPrice:number
    quantity:number
    modelName:string
    productName:string
    note:string
    stockUseEa:boolean
    taxation:TaxationCate
}

export interface ResponseStockCountResult{
    stockLedgerResponses : ResponseLedgerStock[]
    totalAmount:number
    totalQuantity:number
}