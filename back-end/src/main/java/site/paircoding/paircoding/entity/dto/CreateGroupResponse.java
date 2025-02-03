package site.paircoding.paircoding.entity.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateGroupResponse {
  private int id;
  private String name;
  private int capacity;
}
