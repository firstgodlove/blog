package com.mojian.service.impl;

import java.util.List;
import org.springframework.stereotype.Service;
import com.mojian.mapper.SysMomentMapper;
import com.mojian.entity.SysMoment;
import com.mojian.service.SysMomentService;
import com.mojian.utils.PageUtils;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import lombok.RequiredArgsConstructor;

/**
 * 说说 服务实现类
 */
@Service
@RequiredArgsConstructor
public class SysMomentServiceImpl extends ServiceImpl<SysMomentMapper, SysMoment> implements SysMomentService {

    /**
     * 查询说说分页列表
     */
    @Override
    public IPage<SysMoment> selectPage(SysMoment sysMoment) {
        LambdaQueryWrapper<SysMoment> wrapper = new LambdaQueryWrapper<>();
        // 构建查询条件
        wrapper.eq(sysMoment.getId() != null, SysMoment::getId, sysMoment.getId());
        wrapper.eq(sysMoment.getUserId() != null, SysMoment::getUserId, sysMoment.getUserId());
        wrapper.eq(sysMoment.getContent() != null, SysMoment::getContent, sysMoment.getContent());
        wrapper.eq(sysMoment.getImages() != null, SysMoment::getImages, sysMoment.getImages());
        wrapper.eq(sysMoment.getCreateTime() != null, SysMoment::getCreateTime, sysMoment.getCreateTime());
        return page(PageUtils.getPage(), wrapper);
    }

    /**
     * 查询说说列表
     */
    @Override
    public List<SysMoment> selectList(SysMoment sysMoment) {
        LambdaQueryWrapper<SysMoment> wrapper = new LambdaQueryWrapper<>();
        // 构建查询条件
        wrapper.eq(sysMoment.getId() != null, SysMoment::getId, sysMoment.getId());
        wrapper.eq(sysMoment.getUserId() != null, SysMoment::getUserId, sysMoment.getUserId());
        wrapper.eq(sysMoment.getContent() != null, SysMoment::getContent, sysMoment.getContent());
        wrapper.eq(sysMoment.getImages() != null, SysMoment::getImages, sysMoment.getImages());
        wrapper.eq(sysMoment.getCreateTime() != null, SysMoment::getCreateTime, sysMoment.getCreateTime());
        return list(wrapper);
    }

    /**
     * 新增说说
     */
    @Override
    public boolean insert(SysMoment sysMoment) {
        return save(sysMoment);
    }

    /**
     * 修改说说
     */
    @Override
    public boolean update(SysMoment sysMoment) {
        return updateById(sysMoment);
    }

    /**
     * 批量删除说说
     */
    @Override
    public boolean deleteByIds(List<Long> ids) {
        return removeByIds(ids);
    }
}
