/**
 * Copyright(c) 2013-2016 by Puhuifinance Inc.
 * All Rights Reserved
 */
package com.control;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.service.MainService;

import entry.Message;

/**
 * @author wanghan
 */
@Controller
@RequestMapping("/user")
public class MainControl extends BaseController {
    @Autowired
    private MainService mianService;

    @RequestMapping(value = "/messageSave")
    @ResponseBody
    public void messageSave(String message) {
        Message mes = new Message();
        mes.setMessage(message);
        mes.setCreatTime(new Date());
        mianService.saveMessage(mes);
    }

    @RequestMapping(value = "/messageSelect")
    @ResponseBody
    public Object messageSelect() {
        Object result = mianService.selectMessage();
        return result;
    }
}
