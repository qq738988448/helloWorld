/**
 * Copyright(c) 2013-2016 by Puhuifinance Inc.
 * All Rights Reserved
 */
package com.dao;

import java.util.List;

import org.springframework.stereotype.Repository;

import entry.Message;

/**
 * @author wanghan
 */
@Repository
public class MainDao extends BaseDao<Message> {
    /**
     * 保存留言
     * 
     * @author wanghan
     * @param message
     */
    public void saveMessage(Message message) {
        getSession().save(message);
    }

    /**
     * 查询所有留言
     * 
     * @author wanghan
     * @return
     */
    public List<Message> selectAllMessages() {
        return getSession().createQuery(" from Message").list();
    }

    /**
     * 查询最新的一天留言
     * 
     * @author wanghan
     * @return
     */
    public Message selectMessage() {
        return (Message) getSession().createQuery("from Message order by creatTime desc").setMaxResults(1)
                .uniqueResult();
    }

}
