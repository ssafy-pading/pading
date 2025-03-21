// src/pages/UserRoleChangePage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NavigationProvider, useNavigation } from "../context/navigationContext";
import GroupNavigationBar from "../features/navigationbar/components/GroupNavigationBar";
import ProfileNavigationBar from "../features/navigationbar/components/ProfileNavigationBar";
import CustomSelect, { Option } from "../features/groups/widgets/components/CustomSelect";
import "../features/groups/widgets/css/CustomSelect.css";
import useGroupAxios from "../shared/apis/useGroupAxios";
import { GetGroupMembersResponse } from "../shared/types/groupApiResponse";

// css
import "../shared/widgets/ScrollBar.css";

// 토스트
import { Toaster, toast } from 'react-hot-toast';
import { confirmToast } from "../shared/widgets/toastConfirm";

// Redux 관련 import
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../app/redux/store";
import { fetchUserInfo } from "../app/redux/user";

// 타입 정의
interface GroupUser {
  id: number;
  name: string;
  image: string;
  email: string;
  role: string;
}

const roleOptions: Option[] = [
  { value: "OWNER", label: "오너" },
  { value: "MANAGER", label: "매니저" },
  { value: "MEMBER", label: "멤버" },
];

const RoleChangePage: React.FC = () => {
  // Redux를 통해 유저 정보 가져오기
  const dispatch = useDispatch<AppDispatch>();
  const userProfile = useSelector((state: RootState) => state.user.user);
  const userStatus = useSelector((state: RootState) => state.user.status);

  // 유저 정보가 없으면 컴포넌트 마운트 시 fetchUserInfo 디스패치
  useEffect(() => {
    if (!userProfile && userStatus === "idle") {
      dispatch(fetchUserInfo());
    }
  }, [dispatch, userProfile, userStatus]);

  // URL 파라미터에서 groupId 추출
  const { groupId: groupIdParam } = useParams<{ groupId?: string }>();
  const groupId: number | undefined = groupIdParam ? Number(groupIdParam) : undefined;

  const { getGroupMembers, updateMemberRole, expelMember } = useGroupAxios();
  const [groupUsers, setGroupUsers] = useState<GroupUser[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<{ [key: number]: string }>({});
  const { isProfileNavOpen } = useNavigation();

  // 멤버 목록 및 유저 역할 불러오기
  useEffect(() => {
    const fetchGroupUsers = async () => {
      if (!groupId || !userProfile) return;
      try {
        const userData: GetGroupMembersResponse = await getGroupMembers(groupId);
        setGroupUsers(userData.users);
        // 로그인한 유저의 역할 저장
        const user = userData.users.find((member) => member.id === userProfile.id);
        if (user) {
          setSelectedRoles((prev) => ({ ...prev, [user.id]: user.role }));
        }
      } catch (error) {
        console.error("멤버 목록을 불러오는 중 오류 발생:", error);
      }
    };
    fetchGroupUsers();
  }, [groupId, userProfile, getGroupMembers]);
  
  // 로그인한 유저의 역할(예: OWNER) 확인
  const currentUserRole = userProfile
    ? groupUsers.find((user) => user.id === userProfile.id)?.role || ""
    : "";
  
  // 드롭다운 선택값 변경 핸들러
  const handleRoleChange = (userId: number, newRole: string) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [userId]: newRole,
    }));
  };
  // 역할 업데이트
  const handleRoleUpdate = async (userId: number) => {
    const newRole = selectedRoles[userId];
    if (!groupId || !newRole) {
      toast.error("변경할 역할을 선택해 주세요");
      return;
    }
    if (newRole === "OWNER") {
      const confirmOwnerChange = await confirmToast(
        '상대방의 권한을 오너로 변경하면 당신의 권한은 매니저로 변경됩니다. 정말 변경하시겠습니까?'
      );
      if (!confirmOwnerChange) return; // 취소 시 함수 종료
    }
    try {
      await updateMemberRole(groupId, userId, newRole);
      setGroupUsers((users) =>
        users.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
    );
    toast.success("권한 변경에 성공했습니다.");
    window.location.reload();
  } catch (error: any) {
    if (error.response && error.response.status === 403) {
      toast.error("권한이 부족합니다. 그룹 오너에게 문의하세요")};
    if (error.response && error.response.status === 404) {
      toast.error("대상 유저가 그룹에 속해있지 않습니다.");
    } else {
      toast.error("멤버 목록을 불러오는 중 오류가 발생했습니다.");
    }
  }
};

// 멤버 제외
const handleMemberExpel = async (userId: number) => {
  if (!groupId) return;
  const confirmDelete = await confirmToast("정말 이 멤버를 제외하시겠습니까?");
  if (!confirmDelete) return;
    try {
      const success = await expelMember(groupId, userId);
      if (success) {
        setGroupUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
        toast.success("멤버가 성공적으로 제외되었습니다.");
        window.location.reload();
      }
    } catch (error) {
      console.error(`Error expelling user ${userId}:`, error);
    }
  };


  return (
    <div className={`transition-all duration-1000 ${isProfileNavOpen ? "ml-64" : "ml-0"}`}>
      <div className="mt-20 ml-32">
        <Toaster />

        {/* 내부 컨텐츠: 불필요한 `overflow-y-auto` 제거 */}
        <div className="pl-8 pr-12 pb-6 transition-all duration-1000 z-0">
          <h1 className="text-[#4D4650] text-xl font-bold mb-3">유저 설정</h1> 
          <hr className="mb-5" />

          {/* 스크롤이 필요한 부분을 테이블을 감싸는 div로 조정 */}
          <div className="scroll overflow-y-auto min-h-[300px] max-h-[calc(100vh-200px)]">  
            <table className="w-full table-auto border-collapse border-spacing-0 text-sm">
              <thead className="text-[#888888] bg-[#fff] sticky top-0 z-10 border-b-2 border-[#D4D4D4]">
                <tr>
                  <th className="px-4 py-2 text-left min-w-[120px] w-[30%]">이름</th>
                  <th className="px-4 py-2 text-left min-w-[180px] w-[30%]">이메일</th>
                  <th className="px-4 py-2 text-right min-w-[100px] w-[20%]">권한</th>
                  <th className="px-4 py-2 min-w-[140px] w-[20%]">관리</th>
                </tr>
              </thead>
              <tbody className="text-[#4D4650]">
                {groupUsers.map((groupUser) => (
                  <tr key={groupUser.id} className="border-b border-[#D4D4D4] text-xs">
                    <td className="px-4 py-2 text-left">{groupUser.name}</td>
                    <td className="px-4 py-2 text-left">{groupUser.email}</td>
                    <td className="px-4 py-2 text-right">
                      <CustomSelect
                        options={roleOptions}
                        value={selectedRoles[groupUser.id] || groupUser.role}
                        onChange={(newRole) => handleRoleChange(groupUser.id, newRole)}
                        disabled={currentUserRole !== "OWNER" || groupUser.role === "OWNER"}
                      />
                    </td>
                    <td className="px-4 py-2 flex justify-center gap-2">
                      {currentUserRole === "OWNER" && (
                        <button
                          className={`text-xs font-bold px-2 py-1 rounded border ${
                            groupUser.role === "OWNER" ||
                            (selectedRoles[groupUser.id] || groupUser.role) === groupUser.role
                              ? "text-gray-400 border-gray-300 bg-gray-100"
                              : "text-[#888888] border-[#888888] hover:bg-[#888888] hover:text-white cursor-pointer"
                          }`}
                          onClick={() => handleRoleUpdate(groupUser.id)}
                          disabled={
                            groupUser.role === "OWNER" ||
                            (selectedRoles[groupUser.id] || groupUser.role) === groupUser.role
                          }
                        >
                          변경
                        </button>
                      )}
                      {(currentUserRole === "OWNER" || currentUserRole === "MANAGER") && (
                        <button
                          className={`text-xs font-bold px-2 py-1 rounded border ${
                            groupUser.role === "OWNER" || currentUserRole === groupUser.role
                              ? "text-gray-400 border-gray-300 bg-gray-100"
                              : "text-[#FA060A] border-[#FA060A] hover:bg-[#FA060A] hover:text-white cursor-pointer"
                          }`}
                          onClick={() => handleMemberExpel(groupUser.id)}
                          disabled={groupUser.role === "OWNER" || currentUserRole === groupUser.role}
                        >
                          제외
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
      {/* 네비게이션 바 */}
      <ProfileNavigationBar />
      <GroupNavigationBar />
    </div>
  </div>
  );
};

// 네비게이션 토글 상태를 공유하는 컴포넌트로 감싸기
const WrappedUserRoleChangePage: React.FC = () => {
  return (
    <NavigationProvider>
      <RoleChangePage />
    </NavigationProvider>
  );
};

export default WrappedUserRoleChangePage;
