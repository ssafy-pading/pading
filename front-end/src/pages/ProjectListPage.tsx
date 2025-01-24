import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

// 컴포넌트 import
import ProjectCard from '../widgets/ProjectCard';
import GroupNavigationBar from '../widgets/GroupNavigationBar';
import ProfileNavigationBar from '../widgets/ProfileNavigationBar';
import DeleteConfirmModal from '../widgets/DeleteComfirmModal';

// API 호출을 위한 커스텀 훅 import
import useGroupAxios from '../shared/apis/useGroupAxios';
import useProjectAxios from '../shared/apis/useProjectAxios';
import { NavigationProvider, useNavigation } from '../context/navigationContext';

// 이미지 import
import group_create_icon from '../assets/group_create_icon.svg';

// 타입 정의
export interface User {
  user_id: number;
  name: string;
  email: string;
  role: string;
  profile_image: string;
  status: boolean;
}

export interface Project {
  id: number;
  os_id: string;
  language_id: string;
  performance_id: string;
  name: string;
  container_id: string;
  status: string;
  users: User[];
}

// 프로젝트 목록 페이지
const ProjectListPage: React.FC = () => {
  const { getGroupDetails } = useGroupAxios();
  const { getProjects, deleteProject } = useProjectAxios(); 
  
  const { groupId } = useParams<{ groupId: string }>();             // URL에서 groupId 추출
  const [groupName, setGroupName] = useState<string | null>(null);  // 그룹 이름 상태
  // const [projects, setProjects] = useState<Project[]>([]);       // 프로젝트 목록 상태
  const { isProfileNavOpen } = useNavigation();                     // 네비게이션 상태 가져오기
  
  // 그룹 이름 가져오는 API 호출
  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!groupId) return;
      try {
        const groupDetails = await getGroupDetails(groupId);
        setGroupName(groupDetails.name as string); 
      } catch (err) {
        console.log(err);
      }
    };

    fetchGroupDetails();
  }, [groupId, getGroupDetails]);

  // 프로젝트 목록 가져오는 API 호출
  useEffect(() => {
    const fetchProjects = async () => {
      if (!groupId) return;
      try {
        const projectData = await getProjects(groupId);
        getProjects(projectData); 
      } catch (err) {
        console.log(err);
      }
    };

    fetchProjects();
  }, [groupId, getProjects]);


  // Delete 확인 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Delete 모달 열기
  const openDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  // Delete 모달 닫기
  const closeDeleteModal = () => {
    setSelectedProject(null);
    setIsModalOpen(false);
  };

  // 실제 Delete 액션 처리
  const handleDelete = async () => {
    if (!selectedProject || !groupId) return;

    try {
      await deleteProject(groupId, selectedProject.id.toString()); // API 호출 (id를 string으로 변환)
      // 삭제 후 프로젝트 목록 업데이트
      getProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
      closeDeleteModal();
      alert('프로젝트가 성공적으로 삭제되었습니다.');
    } catch (err) {
      console.error('프로젝트 삭제 실패:', err);
      alert('프로젝트 삭제에 실패했습니다.');
    }
  };

  // 임시 데이터
  const userRole = 'OWNER'; // 예: 현재 사용자 권한 (예시로 설정, 실제 값은 사용자 상태에서 가져와야 함)

  const [projects] = useState<Project[]>([
    {
      "id": 1,
      "os_id": "ubuntu_20_04_lts",
      "language_id": "java",
      "performance_id": "medium",
      "name": "Project Alpha",
      "container_id": "container_123",
      "status": "active",
      "users": [
          {
              "user_id": 101,
              "name": "John Doe",
              "email": "johndoe@example.com",
              "role": "OWNER",
              "profile_image": "https://example.com/images/johndoe.png",
              "status": true
          },
          {
              "user_id": 102,
              "name": "Jane Smith",
              "email": "janesmith@example.com",
              "role": "MANAGER",
              "profile_image": "https://example.com/images/janesmith.png",
              "status": false
          }
      ]
  },
  {
      "id": 2,
      "os_id": "windows_10",
      "language_id": "python",
      "performance_id": "large",
      "name": "Project Beta",
      "container_id": "container_456",
      "status": "inactive",
      "users": [
          {
              "user_id": 103,
              "name": "Bob Johnson",
              "email": "bobjohnson@example.com",
              "role": "MEMBER",
              "profile_image": "https://example.com/images/bobjohnson.png",
              "status": true
          },
          {
              "user_id": 104,
              "name": "Alice Brown",
              "email": "alicebrown@example.com",
              "role": "MANAGER",
              "profile_image": "https://example.com/images/alicebrown.png",
              "status": false
          }
      ]
  },
  {
    "id": 3,
    "os_id": "windows_10",
    "language_id": "python",
    "performance_id": "large",
    "name": "Project Beta",
    "container_id": "container_456",
    "status": "inactive",
    "users": [
        {
            "user_id": 103,
            "name": "Bob Johnson",
            "email": "bobjohnson@example.com",
            "role": "MEMBER",
            "profile_image": "https://example.com/images/bobjohnson.png",
            "status": true
        },
        {
            "user_id": 104,
            "name": "Alice Brown",
            "email": "alicebrown@example.com",
            "role": "MANAGER",
            "profile_image": "https://example.com/images/alicebrown.png",
            "status": false
        }
    ]
},
{
  "id": 4,
  "os_id": "windows_10",
  "language_id": "python",
  "performance_id": "large",
  "name": "Project Beta",
  "container_id": "container_456",
  "status": "inactive",
  "users": [
      {
          "user_id": 103,
          "name": "Bob Johnson",
          "email": "bobjohnson@example.com",
          "role": "MEMBER",
          "profile_image": "https://example.com/images/bobjohnson.png",
          "status": true
      },
      {
          "user_id": 104,
          "name": "Alice Brown",
          "email": "alicebrown@example.com",
          "role": "MANAGER",
          "profile_image": "https://example.com/images/alicebrown.png",
          "status": false
      }
  ]
},

  ]);

  return (
    <div className={`transition-all duration-1000 ${isProfileNavOpen ? 'ml-64' : 'ml-0'}`}>
      <ProfileNavigationBar />
      <GroupNavigationBar />
      {/* 프로젝트 목록 */}
      <div className={`pl-8 pr-12 pb-6 overflow-y-auto max-h-screen transition-all duration-1000 ml-32`}>
        <p className="text-3xl text-[#4D4650] font-semibold mt-20 mb-10">그룹이름 {groupName}</p>
        <hr className='mb-10'/>
        <div
          className="grid gap-16 grid-cols-[repeat(auto-fill,_minmax(325px,_1fr))]"
        >
          {(userRole === 'OWNER' || userRole === 'MANAGER') && (
            <button
              className="w-full h-[216px] bg-[#e4e8e8] rounded-lg border border-[#d0d0d7] flex items-center justify-center relative group shadow-md transform transition-transform duration-300 hover:scale-110 p-5"
              onClick={() => {
                // 프로젝트 생성 모달 구현하기
              }}
            >
                <img src={group_create_icon} alt="group create icon" />
            </button>
          
          )}
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onDelete={openDeleteModal}
            />
          ))}
        </div>
      </div>

      {/* Delete 확인 모달 */}
      <DeleteConfirmModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        projectName={selectedProject ? selectedProject.name : ''}
      />
    </div>
  );
}

// 네비게이션 토글 상태를 공유하는 컴포넌트로 감싸기
const WrappedProjectListPage: React.FC = () => {
  return (
    <NavigationProvider>
      <ProjectListPage />
    </NavigationProvider>
  );
};

export default WrappedProjectListPage;
