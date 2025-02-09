import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance, setupInterceptors } from './axiosInstance';
import { AxiosInstance } from 'axios';
import { AccessProjectResponse, CreateProjectResponse, GetLanguageListResponse, GetMemberListResponse, GetOSListResponse, GetPerformanceListResponse, GetProjectDetailsResponse, GetProjectListResponse } from '../types/projectApiResponse';

/**
 * Custom hook for handling Project-related API requests.
 */
const useProjectAxios = () => {
  const navigate = useNavigate();

  /**
   * Axios 인스턴스를 생성하는 함수
   */
  const projectAxios: AxiosInstance = createAxiosInstance(); // Axios 인스턴스 생성
  
  useEffect(() => {
    // 인터셉터 설정 및 ID 반환
    const { requestInterceptorId, responseInterceptorId } = setupInterceptors(projectAxios, navigate);

    // 클린업: 컴포넌트 언마운트 시 인터셉터 제거
    return () => {
      projectAxios.interceptors.request.eject(requestInterceptorId);
      projectAxios.interceptors.response.eject(responseInterceptorId);
    }; // 인터셉터 설정
  }, [projectAxios, navigate]);


  ////////------------이곳에서 추가------------////////
  // API 메서드 구현
  /**
   * 언어 목록 조회
   */
  const getLanguages = async (): Promise<GetLanguageListResponse> => {
    try {
      const response = await projectAxios.get('/v1/projects/option/language');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching language list:', error);
      throw error;
    }
  };

  /**
   * OS 목록 조회
   */
  const getOSList = async (language: string): Promise<GetOSListResponse> => {
    try {
      const response = await projectAxios.get(`/v1/projects/option/os?language=${language}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching OS list:', error);
      throw error;
    }
  };

  /**
   * 사양 목록 조회
   */
  const getPerformanceList = async (): Promise<GetPerformanceListResponse> => {
    try {
      const response = await projectAxios.get('/v1/projects/option/performance');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching performance list:', error);
      throw error;
    }
  };

  /**
   * 멤버 목록 조회
   */
  const getProjectsMemberList = async (groupId: number): Promise<GetMemberListResponse> => {
    try {
      const response = await projectAxios.get(`/v1/groups/${groupId}/projects/users`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching MemberList for group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 프로젝트 목록 조회
   */
  const getProjects = async (groupId: number): Promise<GetProjectListResponse> => {
    try {
      const response = await projectAxios.get(`/v1/groups/${groupId}/projects`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching projects for group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 프로젝트 생성
   */
  const createProject = async (
    groupId: number,
    projectData: Record<string, unknown>
  ): Promise<CreateProjectResponse> => {
    try {
      const response = await projectAxios.post(`/v1/groups/${groupId}/projects`, projectData);
      return response.data.data;
    } catch (error) {
      console.error(`Error creating project for group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 프로젝트 상세 조회
   */
  const getProjectDetails = async (
    groupId: number,
    projectId: number
  ): Promise<GetProjectDetailsResponse> => {
    try {
      const response = await projectAxios.get(`/v1/groups/${groupId}/projects/${projectId}`);
      return response.data.data;
    } catch (error) {
      console.error(`Error fetching details for project ${projectId} in group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 프로젝트 입장
   */
  const joinProject = async (
    groupId: number,
    projectId: number
  ): Promise<AccessProjectResponse> => {
    try {
      const response = await projectAxios.post(`/v1/groups/${groupId}/projects/${projectId}/join`);
      return response.data.data;
    } catch (error) {
      console.error(`Error joining project ${projectId} in group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 프로젝트 수정
   */
  const updateProject = async (
    groupId: number,
    projectId: number,
    projectData: Record<string, unknown>
  ): Promise<boolean> => {
    try {
      await projectAxios.patch(`/v1/groups/${groupId}/projects/${projectId}`, projectData);
      return true;
    } catch (error) {
      console.error(`Error updating project ${projectId} in group ${groupId}:`, error);
      throw error;
    }
  };

  /**
   * 프로젝트 삭제
   */
  const deleteProject = async (groupId: number, projectId: number): Promise<boolean> => {
    try {
      await projectAxios.delete(`/v1/groups/${groupId}/projects/${projectId}`);
      return true;
    } catch (error) {
      console.error(`Error deleting project ${projectId} in group ${groupId}:`, error);
      throw error;
    }
  };

  return {
    projectAxios,
    getLanguages,
    getOSList,
    getPerformanceList,
    getProjectsMemberList,
    getProjects,
    createProject,
    getProjectDetails,
    joinProject,
    updateProject,
    deleteProject,
  };
};

export default useProjectAxios;
