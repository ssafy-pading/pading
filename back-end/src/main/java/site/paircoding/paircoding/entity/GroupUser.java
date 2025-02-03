package site.paircoding.paircoding.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.IdClass;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import site.paircoding.paircoding.entity.enums.Role;

@Entity
@NoArgsConstructor
@Getter
@Table(name = "`group_user`")
public class GroupUser extends BaseEntity{
  @EmbeddedId
  private GroupUserId id;

  @ManyToOne
  @MapsId("userId")
  @JoinColumn(name = "user_id", referencedColumnName = "id")
  private User user;

  @ManyToOne
  @MapsId("groupId")
  @JoinColumn(name = "group_id", referencedColumnName = "id")
  private Group group;

  @Enumerated(EnumType.STRING)
  private Role role;

  @Builder
  public GroupUser(User user, Group group, Role role) {
    this.user = user;
    this.group = group;
    this.role = role;

    // GroupUserId를 생성하여 설정
    this.id = new GroupUserId(user.getId(), group.getId());
  }
}
