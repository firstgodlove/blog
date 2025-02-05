package com.mojian.service;

import com.alibaba.fastjson2.JSONObject;
import com.mojian.common.Result;
import com.mojian.entity.SysWebConfig;

public interface HomeService {

    /**
     * 获取网站配置
     * @return
     */
    Result<SysWebConfig> getWebConfig();

    /**
     * 获取热搜
     * @param type
     * @return
     */
    JSONObject getHotSearch(String type);

    /**
     * 添加访问量
     * @return
     */
    void report();


}
