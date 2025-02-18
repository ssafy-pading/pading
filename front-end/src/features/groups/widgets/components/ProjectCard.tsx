import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { GetProjectMemberStatusResponse, ProjectListItem } from "../../../../shared/types/projectApiResponse";
import { RxDotsHorizontal } from "react-icons/rx";
import {
  PencilSquareIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import profileImage from '../../../../assets/profile_image.png';
import { useCallSocket } from "../../../projects/projectpage/components/CallSocket";

interface ProjectCardProps {
  groupId: number;
  project: ProjectListItem; // 전체 item: { project: {...}, users: [...] }
  userRole: string;
  onDelete: (project: ProjectListItem) => void; // Delete 로직 콜백
  onlineMembers?: GetProjectMemberStatusResponse;
  hasCall?: string; 
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  groupId,
  project,
  userRole,
  onDelete,
  onlineMembers = [],
  hasCall,
}) => {
  const { project: projectData } = project;
  const { id, name, projectImage, performance } = projectData;
  const { sendCallInactive } = useCallSocket();

  // 옵션 드롭다운 (기존 메뉴)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = () => setIsDropdownOpen(prev => !prev);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEnterProject = () => {
    if ((userRole === "OWNER" || userRole === "MANAGER") && hasCall === "active") {
      sendCallInactive();
    }
    window.location.href = `/project/${groupId}/${id}`;
  };

  // 온라인 멤버 수 (단순히 onlineMembers의 길이)
  const onlineCount = onlineMembers.length;

  // 참여자 목록 드롭다운 토글 상태 (클릭 시)
  const [showParticipants, setShowParticipants] = useState(false);
  const toggleParticipants = () => setShowParticipants(prev => !prev);

  // 참여자 영역의 ref와 Portal 드롭다운의 ref
  const participantsRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 감지: 참여자 영역과 Portal 영역 모두를 체크
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        participantsRef.current &&
        !participantsRef.current.contains(target) &&
        portalRef.current &&
        !portalRef.current.contains(target)
      ) {
        setShowParticipants(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Portal을 이용해 참여자 목록 드롭다운을 참여자 영역 아래, 오른쪽 끝에 고정하여 렌더링
  const renderParticipantsDropdown = () => {
    if (!participantsRef.current) return null;
    const rect = participantsRef.current.getBoundingClientRect();
    return ReactDOM.createPortal(
      <div
        ref={portalRef}
        style={{
          position: "absolute",
          top: rect.bottom + window.scrollY + 2, // 약간의 오프셋 (2px)
          left: rect.right + window.scrollX, // 참여자 영역의 오른쪽 끝
          transform: "translateX(-100%)", // 드롭다운을 참여자 영역의 오른쪽 끝에 고정
        }}
        className="bg-white border border-gray-300 rounded-md shadow-md p-2 z-[9999] w-auto min-w-[100px]"
      >
        <ul className="text-sm text-gray-700">
          {onlineMembers.map((p) => (
            <li key={p.id} className="py-1 px-2 flex items-center hover:bg-gray-100 rounded">
              <img
                src={p.image || profileImage}
                alt={p.name}
                className="w-4 h-4 rounded-full mr-2"
              />
              {p.name}
            </li>
          ))}
        </ul>
      </div>,
      document.body
    );
  };

  return (
    <div className="w-full h-[200px] bg-white border border-[#d0d0d7] shadow-md rounded-lg p-4 relative transform transition-transform duration-300 hover:scale-105 z-10">
      {/* 알림 */}
      {hasCall==="active" && (
        <div>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full filter blur-lg opacity-30"></span> 
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full opacity-90"></span>
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full opacity-75 animate-ping"></span>
        </div>
      )}
      {/* 프로젝트 제목 및 옵션 드롭다운 */}
      <div className="flex justify-between items-center">
        <p className="font-inter text-base font-semibold text-[#68687b]">{name}</p>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="hover:bg-gray-300 p-1 rounded-full focus:outline-none"
          >
            <RxDotsHorizontal className="w-5 h-5 text-[#68687b]" />
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-20 transition ease-out duration-100">
              <ul className="py-1" role="menu">
                {userRole === 'OWNER' || userRole === 'MANAGER' ? (
                  <>
                    <li role="none">
                      <button
                        className="w-full flex items-center text-left px-4 py-2 text-xs text-gray-500 hover:bg-gray-100"
                        onClick={() => {
                          console.log('Edit clicked');
                          setIsDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        <PencilSquareIcon className="w-4 h-4 mr-2 text-gray-500" />
                        Edit
                      </button>
                    </li>
                    <li role="none">
                      <button
                        className="w-full flex items-center text-left px-4 py-2 text-xs text-[#EF4444] hover:bg-red-500 hover:text-white group"
                        onClick={() => {
                          onDelete(project);
                          setIsDropdownOpen(false);
                        }}
                        role="menuitem"
                      >
                        <TrashIcon className="w-4 h-4 mr-2 text-[#EF4444] group-hover:text-white transition-colors duration-200" />
                        Delete
                      </button>
                    </li>
                  </>
                ) : (
                  <li role="none">
                    <button
                      className="w-full flex items-center text-left px-4 py-2 text-xs text-gray-500 hover:bg-gray-100"
                      onClick={() => setIsDropdownOpen(false)}
                      role="menuitem"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2 text-gray-500" />
                      Exit
                    </button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* 프로젝트 세부 정보 */}
      <p className="font-inter text-sm font-semibold text-[#858595] mt-5">
        {projectImage.language} | {performance.cpuDescription} | {performance.memory}
      </p>

      {/* 참여자 영역: 클릭하면 전체 참여자 목록 드롭다운 토글 */}
      <div
        className={`flex justify-end mt-8 relative ${onlineCount > 0 ? "cursor-pointer" : ""}`}
        ref={participantsRef}
        onClick={onlineCount > 0 ? toggleParticipants : undefined}
      >
        <p className="text-xs text-[#A1A1AF] font-semibold">
          참여중인 멤버 : {onlineCount}
        </p>
      </div>

      {/* 입장하기 버튼 */}
      <button
        onClick={handleEnterProject}
        className="w-full h-10 font-inter text-base font-medium text-[#6893e8] rounded-lg bg-white border border-[#6893e8] hover:bg-[#6893e8] hover:text-white mt-3"
      >
        <span className="flex justify-center font-semibold">입장하기</span>
      </button>

      {/* Portal을 통한 전체 참여자 목록 드롭다운 */}
      {showParticipants && renderParticipantsDropdown()}
    </div>
  );
};

export default ProjectCard;
