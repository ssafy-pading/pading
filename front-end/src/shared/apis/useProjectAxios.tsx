import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAxiosInstance, setupInterceptors } from './axiosInstance';
import { AxiosInstance } from 'axios';

/**
 * Custom hook for handling Project-related API requests.
 */
const useProjectAxios = () => {
  const navigate = useNavigate();

  /**
   * Axios 인스턴스를 생성하는 함수
   */
  const projectAxios : AxiosInstance = createAxiosInstance(); // Axios 인스턴스 생성
  
    useEffect(() => {
      
      // 인터셉터 설정 및 ID 반환
      const { requestInterceptorId, responseInterceptorId } = setupInterceptors(projectAxios, navigate);
  
      // 클린업: 컴포넌트 언마운트 시 인터셉터 제거
      return () => {
        projectAxios.interceptors.request.eject(requestInterceptorId);
        projectAxios.interceptors.response.eject(responseInterceptorId);
      };// 인터셉터 설정
    }, [projectAxios, navigate]);

  // API 메서드 구현

  /**
   * 언어 목록 조회
   */
  const getLanguages = async (): Promise<Record<string, unknown>> => {
    return projectAxios.get('/v1/projects/language').then((response) => response.data);
  };

  /**
   * OS 목록 조회
   */
  const getOSList = async (): Promise<Record<string, unknown>> => {
    return projectAxios.get('/v1/projects/os').then((response) => response.data);
  };

  /**
   * 사양 목록 조회
   */
  const getPerformanceList = async (): Promise<Record<string, unknown>> => {
    return projectAxios.get('/v1/projects/performance').then((response) => response.data);
  };

  /**
   * 프로젝트 목록 조회
   */
  const getProjects = async (groupId: string): Promise<Record<string, unknown>> => {
    return projectAxios.get(`/v1/groups/${groupId}/projects`).then((response) => response.data);
  };

  /**
   * 프로젝트 생성
   */
  const createProject = async (groupId: string, projectData: Record<string, unknown>): Promise<Record<string, unknown>> => {
    return projectAxios.post(`/v1/groups/${groupId}/projects`, projectData).then((response) => response.data);
  };

  /**
   * 프로젝트 상세 조회
   */
  const getProjectDetails = async (
    groupId: string,
    projectId: string
  ): Promise<Record<string, unknown>> => {
    return projectAxios.get(`/v1/groups/${groupId}/projects/${projectId}`).then((response) => response.data);
  };

  /**
   * 프로젝트 입장
   */
  const joinProject = async (
    groupId: string,
    projectId: string
  ): Promise<Record<string, unknown>> => {
    return projectAxios.post(`/v1/groups/${groupId}/projects/${projectId}/join`).then((response) => response.data);
  };

  /**
   * 프로젝트 수정
   */
  const updateProject = async (
    groupId: string,
    projectId: string,
    projectData: Record<string, unknown>
  ): Promise<Record<string, unknown>> => {
    return projectAxios.patch(`/v1/groups/${groupId}/projects/${projectId}`, projectData).then((response) => response.data);
  };

  /**
   * 프로젝트 삭제
   */
  const deleteProject = async (groupId: string, projectId: string): Promise<void> => {
    return projectAxios.delete(`/v1/groups/${groupId}/projects/${projectId}`).then((response) => response.data);
  };

  return {
    projectAxios,
    getLanguages,
    getOSList,
    getPerformanceList,
    getProjects,
    createProject,
    getProjectDetails,
    joinProject,
    updateProject,
    deleteProject,
  };
};

export default useProjectAxios;
