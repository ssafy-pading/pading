import { useState } from 'react';
import { BsFillMicFill, BsFillMicMuteFill } from 'react-icons/bs';

function MuteButton() {
    const [isMute, setIsMute] = useState<boolean>(false);
    const [isClicked, setIsClicked] = useState<boolean>(false);

    return (
        <button onClick={() => setIsMute(!isMute)} className='text-white'> {/* 버튼 클릭 시 상태 변경 */}
            <div
                className={`cursor-pointer transition-transform duration-200 ease-in-out ${isClicked ? "scale-90" : "scale-100"
                    }`}
                onClick={() => setIsMute(!isMute)}
                onMouseDown={() => setIsClicked(true)} // 클릭 시 축소
                onMouseUp={() => setIsClicked(false)} // 마우스 버튼 떼면 원래 크기
                onMouseLeave={() => setIsClicked(false)} // 클릭 중 마우스 벗어나도 원래 크기
            >
                {isMute ? <BsFillMicMuteFill className="text-3xl" /> : <BsFillMicFill className="text-3xl" />}
            </div>
        </button>
    )
}

export default MuteButton;