package com.uploadimg.demo.Controll;

import com.uploadimg.demo.ReqContextUTILS.ReqMessage;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@RestController
public class SubscribController {
    //@Autowired(required = false)
    //ReqMessage reqMessage;
    @RequestMapping("/subscribe")
    public void subscribe(HttpServletRequest res, HttpServletResponse req, @RequestParam("topic") String topic) {
        System.out.println("进入订阅后台");
        ReqMessage.addSubscrib(topic, res, req);
    }

    @RequestMapping("/publish")
    public void publish( String topic, String content) {
        System.out.println("进入发布系统");
        ReqMessage.publishMessage(topic, content);
    }
}
