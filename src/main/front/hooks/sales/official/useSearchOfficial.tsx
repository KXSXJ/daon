import { selectConfrim } from "@/hooks/share/selectConfrim";
import useRouterPath from "@/hooks/share/useRouterPath";
import { ResponseOfficial } from "@/model/types/sales/official/type";
import { useModalState } from "@/store/zustand/modal";
import { useEffect, useId, useState } from "react";

export default function useSearchOfficial(
    checkOfficialName : (id? : string) => boolean,
    changeHandler : (officialInfo : Partial<Pick<ResponseOfficial, 'officialId' | 'officialName'>>,uuid?: string) => void
) {
    const searchKey = useId()
    const redirect = useRouterPath()
    const [target, setTarget] = useState('') 
    const {setModalState, official,modalKey} = useModalState()

    useEffect(()=>{
        const {officialName, officialId} = official
        if(officialName && officialId && modalKey===searchKey){
            changeHandler({...official} , target)
            setModalState({searchKeyword:'',official:{},modalPage:1})
        }
    },[official])


    //검색을 위한 이벤트등록
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data) {
                const { officialName, officialId } = event.data;
                if(officialName && officialId){
                    changeHandler({officialName, officialId} , target)
                }
            }
        };
        window.removeEventListener("message", handleMessage);
        window.addEventListener("message", handleMessage);  

        return () => window.removeEventListener("message", handleMessage);
    }, [target]);




    const searchOfficialHandler = (e, id?:string)=>{
        //거래처를 찾고나서 수정 시도 시
        if(checkOfficialName(id) && (e.key ==='Backspace' || e.key==='Delete' || e.key==='Process')){
            e.preventDefault();
            const deleteOfficial = ()=>{
                changeHandler({officialName:'', officialId:''}, id)
            }
            selectConfrim('관리비를 다시 선택하시겠습니까?',deleteOfficial)
        }
        setTimeout(()=>{
            const value =e.target.value

            //Enter 외의 다른 키 입력 시
            if(!value || e.key !=='Enter') return
            if(id) setTarget(id)
            e.preventDefault();
            //pc
            if(window.innerWidth>620){
                const url = `/search-official-items?searchName=${value}`; // 열고 싶은 링크
                const popupOptions = "width=500,height=700,scrollbars=yes,resizable=yes"; // 팝업 창 옵션
                window.open(url, "searchOfficial", popupOptions);
            }else{
                setModalState({searchKeyword:value, modalPage:1,modalKey:searchKey})
                redirect('search-official')
            }
        },100)

    }

    return searchOfficialHandler
}