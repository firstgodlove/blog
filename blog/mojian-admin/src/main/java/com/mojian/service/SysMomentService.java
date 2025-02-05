package com.mojian.service;

import com.mojian.entity.SysMoment;
import com.baomidou.mybatisplus.extension.service.IService;
import com.baomidou.mybatisplus.core.metadata.IPage;
import java.util.List;

/**
 * 说说 服务接口
 */
public interface SysMomentService extends IService<SysMoment> {
    /**
     * 查询说说分页列表
     */
    IPage<SysMoment> selectPage(SysMoment sysMoment);

    /**
     * 查询说说列表
     */
    List<SysMoment> selectList(SysMoment sysMoment);

    /**
     * 新增说说
     */
    boolean insert(SysMoment sysMoment);

    /**
     * 修改说说
     */
    boolean update(SysMoment sysMoment);

    /**
     * 批量删除说说
     */
    boolean deleteByIds(List<Long> ids);
}
