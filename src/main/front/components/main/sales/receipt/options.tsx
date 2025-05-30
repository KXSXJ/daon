import './options.scss';

type OptionProps = {
    position:{x:number, y:number},
    copyFn:()=>void,
    deleteFn:()=>void,
}

export default function ReceiptOptions({position, copyFn, deleteFn}:OptionProps){
    
    return(
        <menu className='options-container' style={{top:`${position.y}px`, left:`${position.x}px`}}>
            <li style={{fontSize:'14px'}} className='delete-option' onClick={deleteFn}>삭제하기</li>
            <li style={{fontSize:'14px'}} className='copy' onClick={copyFn}>복사하기</li>
        </menu>    
    )
}