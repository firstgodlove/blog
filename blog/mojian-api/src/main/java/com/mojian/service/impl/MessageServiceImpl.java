package com.mojian.service.impl;

import com.mojian.service.MessageService;
import com.mojian.entity.SysMessage;
import com.mojian.mapper.SysMessageMapper;
import com.mojian.utils.IpUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final SysMessageMapper messageMapper;

    @Override
    public List<SysMessage> getMessageList() {
        return messageMapper.selectList(null);
    }

    @Override
    public Boolean add(SysMessage sysMessage) {
        String ip = IpUtils.getIp();
        sysMessage.setIp(ip);
        sysMessage.setSource(IpUtils.getIp2region(ip));
        messageMapper.insert(sysMessage);
        return true;
    }
}
