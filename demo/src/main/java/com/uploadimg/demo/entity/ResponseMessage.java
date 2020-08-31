package com.uploadimg.demo.entity;

//自定义help class
public class ResponseMessage<T> {
    private static final String CODE_SUCCESS = "200";
    private static final String CODE_FILE = "400";
    private static final String MSG_SUCCESS = "success";
    private static final String MSG_FAIL = "failed";

    private String code;
    private String msg;
    private T entity;

    public ResponseMessage() {
    }

    public String getCode() {
        return code;
    }


    public void setCode(String code) {
        this.code = code;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public T getEntity() {
        return entity;
    }

    public void setEntity(T entity) {
        this.entity = entity;
    }

    //构造器重载
    public ResponseMessage(String code) {
        this.code = code;
    }

    public ResponseMessage(String code, String msg) {
        this.code = code;
        this.msg = msg;
    }

    public ResponseMessage(String code, String msg, T entity) {
        this.code = code;
        this.msg = msg;
        this.entity = entity;
    }

    public static ResponseMessage success() {
        return new ResponseMessage(CODE_SUCCESS, MSG_SUCCESS);
    }

    public static ResponseMessage file() {
        return new ResponseMessage(CODE_FILE, MSG_FAIL);
    }

    public static ResponseMessage file(Object o){
        return new ResponseMessage(CODE_FILE,MSG_FAIL,o);
    }

    public static ResponseMessage success(Object o) {
        return new ResponseMessage(CODE_SUCCESS, MSG_SUCCESS, o);
    }
}
