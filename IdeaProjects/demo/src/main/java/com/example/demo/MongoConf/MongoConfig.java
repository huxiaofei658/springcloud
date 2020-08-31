package com.example.demo.MongoConf;

import org.springframework.beans.factory.annotation.Configurable;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDbFactory;
import org.springframework.data.mongodb.MongoTransactionManager;

@Configuration
public class MongoConfig {

    @Bean
    @ConditionalOnProperty(name="spring.data.mongodb.transactionEnabled",havingValue = "true")
    MongoTransactionManager MongoTransactionManager(MongoDbFactory factory){
        return new MongoTransactionManager(factory);
    }
}
