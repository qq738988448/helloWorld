package mybaits.entry;

import java.util.Date;

/**
 * 产品表
 * 
 * @author wanghan
 */
public class RiskBrainProduct {
    /**
     * 自增流水id
     */
    private Long id;
    /**
     * 产品code
     */
    private String productCode;
    /**
     * 产品名称
     */
    private String productName;
    /**
     * 是否可用
     */
    private Byte productVisible;
    /**
     * 创建时间
     */
    private Date createTime;
    /**
     * 系统更新时间
     */
    private Date updateTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductCode() {
        return productCode;
    }

    public void setProductCode(String productCode) {
        this.productCode = productCode == null ? null : productCode.trim();
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName == null ? null : productName.trim();
    }

    public Byte getProductVisible() {
        return productVisible;
    }

    public void setProductVisible(Byte productVisible) {
        this.productVisible = productVisible;
    }

    public Date getCreateTime() {
        return createTime;
    }

    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    public Date getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
    }
}