/**
 * Copyright(c) 2013-2016 by Puhuifinance Inc.
 * All Rights Reserved
 */
package com.dao;

import org.springframework.stereotype.Repository;

import entry.UserTest;

/**
 * @author wanghan
 */
@Repository
public class LoginDao extends BaseDao<UserTest> {
    public void saveOrUpdate(UserTest UserTest) {
        // getSession().saveOrUpdate(UserTest);
        getSession().save(UserTest);

    }

    public UserTest seleUserTest(String s) {
        return (UserTest) getSession().createQuery("from UserTest where user_name ='" + s + "'").uniqueResult();
    }
}
