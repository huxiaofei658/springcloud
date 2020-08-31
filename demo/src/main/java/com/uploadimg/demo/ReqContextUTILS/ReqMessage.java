package com.uploadimg.demo.ReqContextUTILS;


import javax.servlet.AsyncContext;
import javax.servlet.AsyncEvent;
import javax.servlet.AsyncListener;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.annotation.XmlType;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;

public class ReqMessage {

    private static int timeout = 60 * 60 * 1000;

    //订阅列表，存储所有请求的订阅主题，每个topic对应一个Arraylist,Arraylist里面该topic的所有订阅请求
    private static HashMap<String, ArrayList<AsyncContext>> subscribeArray = new LinkedHashMap<>();

    public static void addSubscrib(String topic, HttpServletRequest request, HttpServletResponse response) {
        if (null == topic || "".equals(topic)) {
            return;
        }
        response.setContentType("text/event-stream");//设置响应头
        response.setCharacterEncoding("utf-8");
        //异步  不是一直等待文件读完，而是让它去读，cpu做其它事情，读完通知cpu来处理即可
        AsyncContext actx = request.startAsync(request, response);
        actx.setTimeout(timeout);//设置过期时间
        //添加监听器函数
        actx.addListener(new AsyncListener() {
            @Override
            public void onComplete(AsyncEvent event) throws IOException {
                System.out.println("推送结束！");
            }

            @Override
            public void onTimeout(AsyncEvent event) throws IOException {
                System.out.println("推送超时！");
            }

            @Override
            public void onError(AsyncEvent event) throws IOException {
                System.out.println("推送错误！");
            }

            @Override
            public void onStartAsync(AsyncEvent event) throws IOException {
                System.out.println("推送开始！");
            }
        });
        //将异步请求存入列表
        ArrayList<AsyncContext> actxlist = subscribeArray.get(topic);
        if (null == actxlist) {
            actxlist = new ArrayList<AsyncContext>();
            subscribeArray.put(topic, actxlist);
        }
        actxlist.add(actx);
    }



    //获取订阅列表
    public static ArrayList<AsyncContext> getSubscibList(String topic) {
        return subscribeArray.get(topic);
    }


    //推送消息
    public static void publishMessage(String topic, String content) {
        ArrayList<AsyncContext> actxList = subscribeArray.get(topic);
        if (null != actxList) {
            for (AsyncContext actx : actxList) {
                try {
                    PrintWriter out = actx.getResponse().getWriter();
                    System.out.println(content+"123");
                    System.out.println(content);
                    actx.getResponse().flushBuffer();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
