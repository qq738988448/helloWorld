package com.puhui.riskbrain.dao;

import com.puhui.riskbrain.model.RiskBrainProduct;

import java.util.List;

/**
 * 产品表
 * 
 * @author wuxinyou
 */

public interface RiskBrainProductMapper {
    int deleteByPrimaryKey(Long id);

    int insert(RiskBrainProduct record);

    int insertSelective(RiskBrainProduct record);

    RiskBrainProduct selectByPrimaryKey(Long id);

    int updateByPrimaryKeySelective(RiskBrainProduct record);

    int updateByPrimaryKey(RiskBrainProduct record);

    List<RiskBrainProduct> selectBrainProductList();
}