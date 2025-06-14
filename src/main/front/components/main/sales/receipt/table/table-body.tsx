'use client'
import { useMemo, useRef, useState } from 'react';

import './receipt-table.scss';

import { useItemSelection } from '@/hooks/share/useItemSelection';
import ReceiptOptions from '@/components/main/sales/receipt/options';
import { DisabledStatus } from '@/model/constants/sales/receipt/receipt_constants';
import useReceiptList from '@/hooks/sales/receipt/useReceiptList';
import { ClientMousePosition } from '@/model/types/share/type';
import { ReceiptCategoryEnum, ResponseReceipt } from '@/model/types/sales/receipt/type';
import useSearchCustomer from '@/hooks/customer/search/useSearchCustomer';
import useSearchStock from '@/hooks/stock/search/useSearchStock';
import CustomDateInput from '@/components/share/custom-date-input/custom-date-input';
import useSearchOfficial from '@/hooks/sales/official/useSearchOfficial';


export default function ReceiptTableBody({initialReceiptList, isMobile=false} : {initialReceiptList?:ResponseReceipt[], isMobile?:boolean}){
    const {target,setTarget,itemsRef} = useItemSelection<string>(false) //복사 및 삭제대상 지정
    const [mousePosition, setMousePosition] = useState<ClientMousePosition|null>(null)
    const [isRightClick, setIsRightClick] = useState<boolean>(false)
    const {
            receiptList,
            receiptHandler,
            newReceipt,
            copyReceipt,
            deleteReceipt,
            getMousePosition,
            focusTarget,
            checkCustomerId,
            setCustomerInfo,
            checkStockId,
            setStockInfo,
            checkOfficialId,
            setOfficialInfo,
            saveReceiptList
        } = useReceiptList(initialReceiptList, isMobile)


    const searchCustomerHandler = useSearchCustomer(checkCustomerId,setCustomerInfo)
    const searchStockHandler = useSearchStock(checkStockId,setStockInfo)
    const searchOfficialHandler = useSearchOfficial(checkOfficialId, setOfficialInfo)
    const isEdit = !!initialReceiptList

    const memoizedReceiptCategoryEnum = useMemo(() => {
        return Object.entries(ReceiptCategoryEnum).map(([key,value]) => (
            (value!=='경상손익' && value!=='전체' && value!=='매출대체')&&
            <option key={key} value={key}>
                {value}
            </option>
        ));
    }, [ReceiptCategoryEnum]);

    const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
 
    const handleLongPressStart = (e: React.TouchEvent, receiptId: string) => {
        e.preventDefault();

        const touch = e.touches[0];
        const position = { x: touch.clientX, y: touch.clientY };
        
        pressTimerRef.current = setTimeout(() => {
            setTarget(receiptId);
            setMousePosition(position);
            setIsRightClick(true);
        }, 500); // 500ms 이상 누르면 롱프레스
    };

    const handleTouchMoveOrEnd = () => {
        if (pressTimerRef.current) {
          clearTimeout(pressTimerRef.current);
          pressTimerRef.current = null;
        }
      };


    return(
        <>
        {receiptList.map((receipt, index) => (
            <tbody key={receipt.receiptId} 
                   className={target===receipt.receiptId ? 'focused' : ''} 
                   ref={(el) => {(itemsRef.current[receipt.receiptId] = el)}}
                   onContextMenu={(e)=>{
                       setTarget(receipt.receiptId)
                       setMousePosition(getMousePosition(e))
                       setIsRightClick(true)
                   }}
                   onTouchStart={(e)=>handleLongPressStart.bind(e,receipt.receiptId)}
                   onTouchEnd={handleTouchMoveOrEnd}
                   onTouchMove={handleTouchMoveOrEnd}
                   onFocus={focusTarget.bind(null,receipt.receiptId, setTarget)}
                   onClick={()=>setIsRightClick(false)}>
                <tr>
                    <td rowSpan={2} style={{position:'relative'}}>
                        {(target===receipt.receiptId && isRightClick) && 
                        <ReceiptOptions position={mousePosition} 
                                        copyFn={()=>{copyReceipt(target)}} 
                                        deleteFn={()=>{deleteReceipt(target)}} />}
                        {index+1}
                    </td>
                    <td rowSpan={2} className='register-date'>
                        <div style={{minWidth:'130px', padding:'unset'}}>
                        <CustomDateInput
                            defaultValue={receipt.timeStamp}
                            name='timeStamp'
                            changeEvent={(value)=>receiptHandler({timeStamp:new Date(value)}, receipt.receiptId)}
                        />
                        </div>
                    </td>
                    <td rowSpan={2}>
                        <select value={receipt.category} 
                                style={{minWidth:'60px'}}
                                onChange={(e)=>receiptHandler({category:(e.target.value as ReceiptCategoryEnum)},receipt.receiptId)} required>
                                <option value="disabled" disabled>전표입력</option>
                            {memoizedReceiptCategoryEnum}
                        </select>
                    </td>
                    <td><input type="text"
                            className={DisabledStatus[receipt.category].customerName ? 'disabled' : ''}
                            placeholder='거 래 처' 
                            value={receipt.customerName || ''}
                            readOnly={DisabledStatus[receipt.category].customerName}
                            onChange={(e)=>!(!!receipt.customerId) && receiptHandler({customerName:e.target.value}, receipt.receiptId)}
                            onKeyDown={(e)=>searchCustomerHandler(e, receipt.receiptId)}
                            /></td>
                    <td><input type="text"                                    
                            className={DisabledStatus[receipt.category].memo ? 'disabled' : ''}
                            placeholder='비 고'
                            value={receipt.memo || ''} 
                            readOnly={DisabledStatus[receipt.category].memo}
                            onChange={(e)=>receiptHandler({memo:e.target.value}, receipt.receiptId)}/></td>
                    <td colSpan={2}>
                        <input type="text"
                            className={DisabledStatus[receipt.category].description ? 'disabled' : ''}
                            placeholder='적 요'
                            value={receipt.description ||''}
                            readOnly={DisabledStatus[receipt.category].description}
                            onChange={(e)=>receiptHandler({description:e.target.value}, receipt.receiptId)}/></td>
                    </tr>
                    <tr>
                        <td><input type="text" 
                                placeholder={ReceiptCategoryEnum[receipt.category] ==='관리비' ? '관리비명':'품명'}
                                className={ReceiptCategoryEnum[receipt.category] ==='관리비' ? '' : (DisabledStatus[receipt.category].productName ? 'disabled' : '')}
                                value={ReceiptCategoryEnum[receipt.category] ==='관리비' ? receipt.officialName :(receipt.productName || '') + (receipt.modelName && ` ${receipt.modelName}`)}
                                readOnly={ReceiptCategoryEnum[receipt.category] ==='관리비' ? false : DisabledStatus[receipt.category].productName}
                                onChange={(e)=>{
                                    ReceiptCategoryEnum[receipt.category] ==='관리비' ?
                                      !(!!receipt.officialId) && receiptHandler({officialName:e.target.value}, receipt.receiptId) :
                                      !(!!receipt.stockId) && receiptHandler({productName:e.target.value}, receipt.receiptId)}
                                }
                                onKeyDown={(e)=>{
                                    ReceiptCategoryEnum[receipt.category] ==='관리비' ?
                                    searchOfficialHandler(e, receipt.receiptId) :
                                    searchStockHandler(e, receipt.receiptId)}
                                }/></td>
                        <td><input type="text"
                                className={DisabledStatus[receipt.category].quantity ? 'disabled' : 'number-input'}
                                placeholder='수 량'
                                value={receipt.quantity.toLocaleString('ko-KR')}
                                readOnly={DisabledStatus[receipt.category].quantity}
                                onChange={(e)=>receiptHandler({quantity:Number(e.target.value.replaceAll(',',''))}, receipt.receiptId)}/></td>
                        <td><input type="text"  
                                className={DisabledStatus[receipt.category].unitPrice ? 'disabled' : 'number-input'}
                                placeholder='단 가'
                                value={receipt.unitPrice.toLocaleString('ko-KR')}
                                readOnly={DisabledStatus[receipt.category].unitPrice || !!receipt.stockId}
                                onChange={(e)=>receiptHandler({unitPrice:Number(e.target.value.replaceAll(',',''))}, receipt.receiptId)}/></td>
                        <td><input type="text" 
                                className={'number-input'}
                                placeholder='금 액'
                                value={DisabledStatus[receipt.category].totalPrice ?
                                        (receipt.quantity * receipt.unitPrice).toLocaleString('ko-KR')
                                        :
                                        Number(receipt.totalPrice).toLocaleString('ko-KR')
                                 }
                                 key={receipt.unitPrice + receipt.quantity}
                                readOnly={DisabledStatus[receipt.category].totalPrice}
                                onChange={(e)=>receiptHandler({ totalPrice: Number(e.target.value.replaceAll(',',''))}, receipt.receiptId)}/></td>
                    </tr>
                </tbody>
            ))}
            <tfoot>
                <tr>
                    <td colSpan={7} className='new-receipt-button-container'>
                        {!isEdit &&
                            <button onClick={newReceipt}>
                                새전표 추가
                            </button>
                        }
                        <button onClick={saveReceiptList}>
                            {isEdit? '수정완료' : '저장하기'}
                        </button>
                        {isEdit &&
                            <button onClick={()=>isMobile ? window.history.back() :window.close()}>
                                취소
                            </button>
                        }
                    </td>
                </tr>
            </tfoot>

        </>
    )
}

