package site.paircoding.paircoding;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableJpaAuditing
@EnableMongoAuditing
public class PairCodingApplication {

  public static void main(String[] args) {
    SpringApplication.run(PairCodingApplication.class, args);
  }

}
