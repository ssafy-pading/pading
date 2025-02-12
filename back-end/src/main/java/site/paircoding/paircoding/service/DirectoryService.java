package site.paircoding.paircoding.service;


import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import site.paircoding.paircoding.entity.Project;
import site.paircoding.paircoding.entity.dto.DirectoryChildren;
import site.paircoding.paircoding.entity.dto.DirectoryCreateDto;
import site.paircoding.paircoding.entity.dto.DirectoryDeleteDto;
import site.paircoding.paircoding.entity.dto.DirectoryListDto;
import site.paircoding.paircoding.entity.dto.DirectoryRenameDto;
import site.paircoding.paircoding.entity.enums.DirectoryAction;
import site.paircoding.paircoding.entity.enums.DirectoryType;
import site.paircoding.paircoding.util.KubernetesUtil;

@Service
@RequiredArgsConstructor
public class DirectoryService {

  private final KubernetesUtil kubernetesUtil;
  private final SimpMessagingTemplate messagingTemplate;
  private final ProjectService projectService;

  // todo pod 확인

  public DirectoryListDto get(Integer groupId, Integer projectId, DirectoryListDto dto) {
    // action 확인
    if (DirectoryAction.LIST != dto.getAction()) {
      throw new RuntimeException("Invalid action");
    }

    Project project = projectService.getProject(groupId, projectId);

    String podName = project.getContainerId();
    String command = "ls -al /app" + dto.getPath();

    String[] lines = kubernetesUtil.executeCommand(podName, command).split("\n");
    List<DirectoryChildren> children = new ArrayList<>();

    int cnt = 0;
    for (String line : lines) {

      if (line.isEmpty() || line.startsWith("total")) {
        continue; // 합계 정보는 무시
      }

      String[] parts = line.split("\\s+");
      if (parts.length < 9) {
        continue; // 잘못된 행 방지
      }

      // 첫 번째 문자로 구분, 마지막 컬럼이 파일 또는 폴더 이름
      DirectoryType type = parts[0].startsWith("d") ? DirectoryType.DIRECTORY : DirectoryType.FILE;
      String name = parts[8];

      // . .. 디렉토리 제외
      if (name.equals(".") || name.equals("..")) {
        continue;
      }

      children.add(new DirectoryChildren(++cnt, type, name));
    }

    dto.setChildren(children);

    return dto;
  }

  public DirectoryCreateDto create(Integer groupId, Integer projectId, DirectoryCreateDto dto) {
    if (DirectoryAction.CREATE != dto.getAction()) {
      throw new RuntimeException("Invalid action");
    }

    Project project = projectService.getProject(groupId, projectId);

    String podName = project.getContainerId();
    String command = "ls -al /app" + dto.getPath() + " | grep " + dto.getName();

    // todo 경로 존재 x / ㅍ

    String[] lines = kubernetesUtil.executeCommand(podName, command).split("\n");

    for (String line : lines) {
      String[] parts = line.split("\\s+");
      if (parts.length < 9) {
        continue;
      }

      String name = parts[8];

      if (name.equals(dto.getName())) {
        throw new RuntimeException("Duplicate name");
      }
    }

    String path = "/app" + dto.getPath() + "/" + dto.getName();
    command = dto.getType() == DirectoryType.DIRECTORY ? "mkdir " + path : "touch " + path;

    kubernetesUtil.executeCommand(podName, command);

    return dto;
  }

  public DirectoryDeleteDto delete(Integer groupId, Integer projectId, DirectoryDeleteDto dto) {
    if (DirectoryAction.DELETE != dto.getAction()) {
      throw new RuntimeException("Invalid action");
    }

    Project project = projectService.getProject(groupId, projectId);

    String podName = project.getContainerId();
    String command1 = "ls -al /app" + dto.getPath() + " | grep " + dto.getName();

    String[] lines = kubernetesUtil.executeCommand(podName, command1).split("\n");

    for (String line : lines) {
      String[] parts = line.split("\\s+");
      if (parts.length < 9) {
        continue;
      }

      String name = parts[8];

      if (name.equals(dto.getName())) {
        // todo type 체크

        String path = "/app" + dto.getPath() + "/" + dto.getName();
        String command = "rm -rf " + path;

        kubernetesUtil.executeCommand(podName, command);
        break;
      }
    }

    return dto;
  }

  public DirectoryRenameDto rename(Integer groupId, Integer projectId, DirectoryRenameDto dto) {
    if (DirectoryAction.RENAME != dto.getAction()) {
      throw new RuntimeException("Invalid action");
    }

    Project project = projectService.getProject(groupId, projectId);

    String podName = project.getContainerId();
    String command = "ls -al /app" + dto.getPath() + " | grep " + dto.getOldName();

    String[] lines = kubernetesUtil.executeCommand(podName, command).split("\n");

    for (String line : lines) {
      String[] parts = line.split("\\s+");
      if (parts.length < 9) {
        continue;
      }

      String name = parts[8];

      if (name.equals(dto.getOldName())) {
        // todo type 체크

        String oldPath = "/app" + dto.getPath() + "/" + dto.getOldName();
        String newPath = "/app" + dto.getPath() + "/" + dto.getNewName();
        command = "mv " + oldPath + " " + newPath;

        kubernetesUtil.executeCommand(podName, command);
        break;
      }
    }

    return dto;
  }
}
