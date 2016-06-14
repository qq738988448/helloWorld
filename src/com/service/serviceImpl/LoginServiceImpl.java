/**
 * Copyright(c) 2013-2016 by Puhuifinance Inc.
 * All Rights Reserved
 */
package com.service.serviceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dao.LoginDao;
import com.service.LoginService;

import entry.UserTest;

/**
 * @author wanghan
 */
@Service
public class LoginServiceImpl implements LoginService {
    @Autowired
    private LoginDao loginDao;

    /*
     * (non-Javadoc)
     * 
     * @author wanghan
     * 
     * @see com.service.LoginService#save(entry.UserTest)
     */
    @Override
    public void save(UserTest user) {
        loginDao.saveOrUpdate(user);
    }

    /*
     * (non-Javadoc)
     * 
     * @author wanghan
     * 
     * @see com.service.LoginService#selectUserTest(java.lang.Long)
     */
    @Override
    public UserTest selectUserTest(String s) {

        return loginDao.seleUserTest(s);
    }

}
