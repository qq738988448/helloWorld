/**
 * Copyright(c) 2013-2016 by Puhuifinance Inc.
 * All Rights Reserved
 */
package com.service.serviceImpl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dao.MainDao;
import com.service.MainService;

import entry.Message;

/**
 * @author wanghan
 */
@Service
public class MainServiceImpl implements MainService {
    @Autowired
    private MainDao mainDao;

    /*
     * (non-Javadoc)
     * 
     * @author jhgjj
     * 
     * @see com.service.MainService#selectAllMessage()
     */
    @Override
    public List<Message> selectAllMessage() {
        // TODO Auto-generated method stub
        return mainDao.selectAllMessages();
    }

    /*
     * (non-Javadoc)
     * 
     * @author jhgjj
     * 
     * @see com.service.MainService#selectMessage()
     */
    @Override
    public Message selectMessage() {
        // TODO Auto-generated method stub
        return mainDao.selectMessage();
    }

    /*
     * (non-Javadoc)
     * 
     * @author jhgjj
     * 
     * @see com.service.MainService#saveMessage()
     */
    @Override
    public void saveMessage(Message message) {
        // TODO Auto-generated method stub
        mainDao.saveMessage(message);
    }

}
