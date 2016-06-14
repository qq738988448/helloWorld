/**
 * Copyright(c) 2013-2016 by Puhuifinance Inc.
 * All Rights Reserved
 */
package com.service;

import java.util.List;

import entry.Message;

/**
 * @author wanghan
 */

public interface MainService {
    /**
     * 查询所有记录
     * 
     * @author wanghan
     * @return
     */
    List<Message> selectAllMessage();

    /**
     * 查询最新一条记录
     * 
     * @author wanghan
     * @return
     */
    Message selectMessage();

    /**
     * 保存记录
     * 
     * @author wanghan
     */
    void saveMessage(Message message);
}
