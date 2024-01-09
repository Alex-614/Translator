package TextService;

import TextService.logic.Entities.Text;
import TextService.logic.Repositories.follower.FollowerTextRepository;
import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

@Configuration(proxyBeanMethods = false)
@EnableJpaRepositories(
        basePackageClasses = FollowerTextRepository.class,
        entityManagerFactoryRef = "followerTextEntityManager",
        transactionManagerRef = "followerTextTransactionManager"
)
public class FollowerDataSourceConfig {
    @Bean
    @ConfigurationProperties("spring.datasource.follower")
    public DataSourceProperties followerDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean("followerTextDataSource")
    @ConfigurationProperties("spring.datasource.follower.configuration")
    public DataSource followerDataSource(DataSourceProperties followerDataSourceProperties) {
        return followerDataSourceProperties
                .initializeDataSourceBuilder()
                .build();
    }

    @Bean("followerTextEntityManager")
    public LocalContainerEntityManagerFactoryBean followerTextEntityManager(
            EntityManagerFactoryBuilder builder,
            @Qualifier("followerTextDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages(Text.class)
                .build();
    }

    @Bean("followerTextTransactionManager")
    public PlatformTransactionManager followerTextTransactionManager(
            @Qualifier("followerTextEntityManager") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}

