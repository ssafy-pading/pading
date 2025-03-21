package site.paircoding.paircoding.controller;

import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import site.paircoding.paircoding.annotaion.GroupRoleCheck;
import site.paircoding.paircoding.annotaion.LoginUser;
import site.paircoding.paircoding.entity.User;
import site.paircoding.paircoding.entity.enums.Role;
import site.paircoding.paircoding.service.OpenviduService;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/openvidu")
public class OpenviduController {

  private final OpenviduService openviduService;

  @GroupRoleCheck(Role.MEMBER)
  @PostMapping(value = "/token/groups/{groupId}/projects/{projectId}")
  public ResponseEntity<Map<String, String>> createToken(
      @LoginUser User user,
      @PathVariable("groupId") Integer groupId, @PathVariable("projectId") String projectId) {
    return ResponseEntity.ok(openviduService.createToken(user, projectId));
  }

  @PostMapping(value = "/livekit/webhook", consumes = "application/webhook+json")
  public ResponseEntity<String> receiveWebhook(@RequestHeader("Authorization") String authHeader,
      @RequestBody String body) {
    return ResponseEntity.ok(openviduService.handleWebhook(authHeader, body));
  }
}