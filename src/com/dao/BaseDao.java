package com.dao;

import java.io.Serializable;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.util.List;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.criterion.Example;
import org.hibernate.criterion.Restrictions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;

/**
 * DAO基类
 * 
 * @author wanghan
 */
public class BaseDao<T> {

    private final Class<T> entityClass;

    @Autowired
    @Qualifier("sessionFactory")
    private SessionFactory sessionFactory;

    public SessionFactory getSessionFactory() {
        return sessionFactory;
    }

    public Session getSession() {
        return sessionFactory.getCurrentSession();
    }

    public BaseDao() {
        Type genType = getClass().getGenericSuperclass();
        Type[] params = ((ParameterizedType) genType).getActualTypeArguments();
        entityClass = (Class) params[0];
    }

    public T get(Serializable id) {
        return (T) sessionFactory.getCurrentSession().get(entityClass, id);
    }

    public void add(T entity) {
        sessionFactory.getCurrentSession().persist(entity);
    }

    public void remove(T entity) {
        sessionFactory.getCurrentSession().delete(entity);
    }

    public void update(T entity) {
        sessionFactory.getCurrentSession().update(entity);
    }

    public void refresh(T entity) {
        sessionFactory.getCurrentSession().refresh(entity);
    }

    public List<T> queryListByLendRequest(long requestId) {
        return getSession().createCriteria(entityClass).add(Restrictions.eq("requestId", requestId)).list();
    }

    public T queryOneByObj(T entity) {
        List<T> list = queryListByObj(entity);
        if (list != null && list.size() > 0) {
            return list.get(0);
        }
        return null;
    }

    public List<T> queryListByObj(T entity) {
        return getSession().createCriteria(entity.getClass()).add(Example.create(entity)).list();
    }

}
