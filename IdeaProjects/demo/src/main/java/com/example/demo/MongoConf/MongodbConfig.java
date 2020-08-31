package com.example.demo.MongoConf;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MongodbConfig {

    private   String uri;
    @Value("${mongodb.uri}")
    public void setUri(String uri) {
        this.uri = uri;
    }

    public String getUri() {
        return uri;
    }
}
