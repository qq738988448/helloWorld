/**
 * Copyright(c) 2013-2016 by Puhuifinance Inc.
 * All Rights Reserved
 */
package entry;

import java.util.Date;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.Temporal;
import javax.persistence.TemporalType;

/**
 * @author wanghan
 */
@Entity
@Table(name = "message")
public class Message extends IdEntity {
    private static final long serialVersionUID = 1L;
    private String message;
    private Date creatTime;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "creat_time", length = 10, nullable = false)
    public Date getCreatTime() {
        return creatTime;
    }

    public void setCreatTime(Date creatTime) {
        this.creatTime = creatTime;
    }

    @Column(name = "message")
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
