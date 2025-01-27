package site.paircoding.paircoding.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@NoArgsConstructor
@Getter
@Table(
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"provider", "provider_id"})
    }
)
public class User extends BaseEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(nullable = false)
  private String provider;

  @Column(nullable = false)
  private Integer provider_id;

  @Column(nullable = false)
  private String name;

  private String image;

  private String email;

  @Builder
  public User(Integer id, String provider, Integer provider_id, String name, String image, String email) {
    this.id = id;
    this.provider = provider;
    this.provider_id = provider_id;
    this.name = name;
    this.image = image;
    this.email = email;
  }
}
