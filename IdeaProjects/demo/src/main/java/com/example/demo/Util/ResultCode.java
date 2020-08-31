package com.example.demo.Util;


public enum ResultCode {
    SUCCESS("200", "成功"), ERROR("500", "操作失败");

    private String code;
    private String message;

    ResultCode(String code, String message) {
        this.code = code;
        this.message = message;
    }
}
