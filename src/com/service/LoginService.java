/**
 * Copyright(c) 2013-2016 by Puhuifinance Inc.
 * All Rights Reserved
 */
package com.service;

import entry.UserTest;

/**
 * @author wanghan
 */

public interface LoginService {
    void save(UserTest user);

    UserTest selectUserTest(String s);
}
