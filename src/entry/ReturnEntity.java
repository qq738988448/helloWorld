/**
 * Copyright(c) 2013-2013 by Puhuifinance Inc.
 * All Rights Reserved
 */
package entry;

import java.io.Serializable;


/**
 * Ajax返回对象, 异常时也可用此对象返回
 * 
 * @author little
 */
public class ReturnEntity implements Serializable {

    private static final long serialVersionUID = 1793851489072875024L;
    /**
     * 是否成功
     */
    private boolean success;
    /**
     * 消息
     */
    private String msg;
    /**
     * 返回结果
     */
    private Object result;

    public ReturnEntity() {
    }

    public ReturnEntity(String msg) {
        this.success = true;
        this.msg = msg;
    }

    public ReturnEntity(boolean success, String msg) {
        this.success = success;
        this.msg = msg;
    }

    public ReturnEntity(boolean success, String msg, Object result) {
        this.success = success;
        this.msg = msg;
        this.result = result;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMsg() {
        return msg;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }

    public Object getResult() {
        return result;
    }

    public void setResult(Object result) {
        this.result = result;
    }

}
