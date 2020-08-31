package com.example.demo.Util;


import java.util.List;

public class Result {
    private boolean success;//成功标志
    private  String message;//描述
    private  Integer code;//返回代码
    private  long timestamp = System.currentTimeMillis();//时间戳
    private Object data;//结果对象

    //自定义构造器后面用
    public Result(boolean success, Integer code, String message){
        this.code=code;
        this.message=message;
        this.success=success;
    }

    public Result(boolean success, String message, Integer code, long timestamp, Object data) {
        this.success = success;
        this.message = message;
        this.code = code;
        this.timestamp = timestamp;
        this.data = data;
    }
//成功返回
    public static Result success(){
        return new Result(true,200,"success");
    }

    //失败返回

    public static Result error(){
        return new Result(false,500,"error");
    }
}
