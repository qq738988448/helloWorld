/**
 * Copyright(c) 2013-2016 by Puhuifinance Inc.
 * All Rights Reserved
 */
package com.control;

import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestMapping;

import com.service.LoginService;
import com.service.MainService;

import entry.Message;
import entry.UserTest;

/**
 * @author wanghan
 */
@Controller
@RequestMapping("/user")
public class LoginControl {
    @Autowired
    private LoginService loginService;
    @Autowired
    private MainService mainService;

    @RequestMapping(value = "/login")
    public String login(HttpServletRequest request, HttpServletResponse response, UserTest user) {

        UserTest UserTest = loginService.selectUserTest(user.getUserName());
        if (UserTest == null) {
        	return user.getUserName();
        } else {
            return null;
        }
    }

    @RequestMapping(value = "/main")
    public String loginmain(ModelMap model) {
        List<Message> messageList = mainService.selectAllMessage();
        model.addAttribute("messageList", messageList);
        return "main";
    }
}
