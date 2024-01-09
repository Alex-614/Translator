package TextService;

import TextService.logic.Entities.Text;
import TextService.logic.Repositories.leader.LeaderTextRepository;
import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

@Configuration(proxyBeanMethods = false)
@EnableJpaRepositories(
        basePackageClasses = LeaderTextRepository.class,
        entityManagerFactoryRef = "leaderTextEntityManager",
        transactionManagerRef = "leaderTextTransactionManager"
)
public class LeaderDataSourceConfig {
    @Primary
    @Bean
    @ConfigurationProperties("spring.datasource.leader")
    public DataSourceProperties leaderDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Primary
    @Bean("leaderTextDataSource")
    @ConfigurationProperties("spring.datasource.leader.configuration")
    public DataSource leaderDataSource(DataSourceProperties leaderDataSourceProperties) {
        return leaderDataSourceProperties
                .initializeDataSourceBuilder()
                .build();
    }

    @Primary
    @Bean("leaderTextEntityManager")
    public LocalContainerEntityManagerFactoryBean leaderTextEntityManager(
            EntityManagerFactoryBuilder builder,
            @Qualifier("leaderTextDataSource") DataSource dataSource) {
        return builder
                .dataSource(dataSource)
                .packages(Text.class)
                .build();
    }

    @Primary
    @Bean("leaderTextTransactionManager")
    public PlatformTransactionManager leaderTextTransactionManager(
            @Qualifier("leaderTextEntityManager") EntityManagerFactory entityManagerFactory) {
        return new JpaTransactionManager(entityManagerFactory);
    }
}
