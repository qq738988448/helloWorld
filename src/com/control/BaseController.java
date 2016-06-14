/**
 * Copyright(c) 2013-2013 by Puhuifinance Inc.
 * All Rights Reserved
 */
package com.control;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.propertyeditors.CustomDateEditor;
import org.springframework.beans.propertyeditors.StringTrimmerEditor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.InitBinder;

import entry.ReturnEntity;

/**
 * @author wanghan
 */
public class BaseController {

    /**
     * 处理时间的转换器，默认格式是yyyy-MM-dd HH:mm:ss可以被重载
     * 
     * @param binder
     */
    @InitBinder
    protected void initBinder(WebDataBinder binder) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        dateFormat.setLenient(false);
        binder.registerCustomEditor(Date.class, new CustomDateEditor(dateFormat, true));

        binder.registerCustomEditor(String.class, new StringTrimmerEditor(true));
    }

    protected ResponseEntity<?> responseJsonSuccess(String msg) {
        ReturnEntity obj = new ReturnEntity(true, msg);
        return responseJson(obj, HttpStatus.OK);
    }

    protected ResponseEntity<?> responseJsonSuccess(String msg, Object result) {
        ReturnEntity obj = new ReturnEntity(true, msg, result);
        return responseJson(obj, HttpStatus.OK);
    }

    protected ResponseEntity<?> responseJsonError(String msg) {
        ReturnEntity obj = new ReturnEntity(false, msg);
        return responseJson(obj, HttpStatus.OK);
    }

    /**
     * 重载方法 ，增加一个返回实体
     * 
     * @author wanghan
     * @param msg
     * @param result
     * @return
     */
    protected ResponseEntity<?> responseJsonError(String msg, Object result) {
        ReturnEntity obj = new ReturnEntity(false, msg, result);
        return responseJson(obj, HttpStatus.OK);
    }

    /**
     * 发送Json对象到HTTP,请求并设置Cont-Type,防止IE提示下载对象
     * 
     * @param obj
     * @return
     */
    private ResponseEntity<?> responseJson(ReturnEntity obj, HttpStatus status) {
        String contentType = "text/plain;charset=UTF-8";
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("Content-Type", contentType);
        return new ResponseEntity<ReturnEntity>(obj, responseHeaders, status);
    }

    /**
     * 返回错误信息
     * 
     * @param error
     * @param status
     * @return
     */
    private ResponseEntity<?> responseJsonError(String error, HttpStatus status) {
        String contentType = "text/plain;charset=UTF-8";
        HttpHeaders responseHeaders = new HttpHeaders();
        responseHeaders.set("Content-Type", contentType);
        return new ResponseEntity<String>(error, responseHeaders, status);
    }

    protected String getLoginUrl(HttpServletRequest request, HttpServletResponse response) {
        try {
            response.sendRedirect("main");
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

}