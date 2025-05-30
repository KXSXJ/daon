'use client'
import type { AffiliationType } from '@/model/types/customer/affiliation/type';
import '@/styles/table-style/category.scss'
import useAffiliation from '@/hooks/customer/affiliation/useAffiliation';


export default function Affiliation({affiliations}: { affiliations: AffiliationType[] }) {
    const {
        addInputRef,
        affiliationState,
        mode,
        setMode,
        setAffiliationState,
        addHandler,
        deleteHandler,
        editHandler
    } = useAffiliation(affiliations)

    return (
        <>
            <table className="category-table">
                <colgroup>
                    <col style={{width: '10%'}}/>
                    <col style={{width: '60%'}}/>
                    <col style={{width: '10%'}}/>
                </colgroup>
                <thead>
                <tr>
                    <td>순번</td>
                    <td>소속명</td>
                    <td>관리</td>
                </tr>
                </thead>
                <tbody>
                {affiliationState.map((affiliation: AffiliationType, index) => (
                    <tr key={affiliation.affiliationId}>
                        <td>{index + 1}</td>
                        <td className="left-align">
                            {mode === 'edit' ?
                                <input type="text"
                                       className="category-input"
                                       placeholder="소속명을 입력해주세요"
                                       required={true}
                                       value={affiliation.affiliationName}
                                       onChange={(e) =>
                                           setAffiliationState((prev)=>prev.map((item: AffiliationType, i: number) =>
                                               i === index ? {
                                                   ...item,
                                                   affiliationName: e.target.value
                                               } : item))}/>
                                :
                                <>{affiliation.affiliationName}</>
                            }
                        </td>
                        <td>
                            <button onClick={deleteHandler.bind(null, affiliation)}>삭제</button>
                        </td>
                    </tr>
                ))}
                {(mode !== 'add' && affiliationState.length===0) &&
                    <tr>
                        <td colSpan={3}>
                            <p>등록된 소속이 없습니다.</p>
                        </td>
                    </tr>
                }
                {mode === 'add' &&
                    <tr>
                        <td>{affiliationState.length + 1}</td>
                        <td className="left-align">
                            <input type="text"
                                   ref={addInputRef}
                                   className="category-input"
                                   placeholder="생성할 소속명을 입력해주세요"/>
                        </td>
                        <td>
                            <button onClick={setMode.bind(null, null)}>삭제</button>
                        </td>
                    </tr>
                }
                </tbody>
            </table>
            <div className='category-button-container'>
                {mode !== "edit" &&
                    <button onClick={addHandler}>
                        {mode === 'add' ? '저장하기' : '추가하기'}
                    </button>
                }
                {mode !== "add" &&
                    <button onClick={editHandler}>
                        {mode === 'edit' ? '수정완료' : '수정하기'}
                    </button>
                }
            </div>
        </>
    )
}