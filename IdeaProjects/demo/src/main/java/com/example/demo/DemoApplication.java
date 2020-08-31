package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;
import org.springframework.transaction.annotation.EnableTransactionManagement;


//@SpringBootApplication(exclude={DataSourceAutoConfiguration.class},scanBasePackages = {"com.example.*"})
//@EnableTransactionManagement
@SpringBootApplication//(exclude = MongoAutoConfiguration.class)
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

}
