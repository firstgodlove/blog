package com.mojian.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import com.alibaba.fastjson.JSON;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mojian.exception.ServiceException;
import com.mojian.utils.IpUtil;
import com.mojian.vo.chat.ChatSendMsgVo;
import com.mojian.entity.ChatMsg;
import com.mojian.mapper.SysChatMsgMapper;
import com.mojian.service.ChatService;
import com.mojian.utils.PageUtil;
import com.mojian.websocket.WebSocketServer;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final WebSocketServer webSocketServer;

    private final SysChatMsgMapper chatMsgMapper;

    @Override
    public IPage<ChatSendMsgVo> getChatMsgList() {
        return chatMsgMapper.getChatMsgList(PageUtil.getPage());
    }

    @Override
    public void sendMsg(ChatSendMsgVo chatSendMsgVo) {
        ChatMsg chatMsg = new ChatMsg();
        chatMsg.setSenderId(StpUtil.getLoginIdAsLong());
        chatMsg.setType(chatSendMsgVo.getType());
        chatMsg.setContent(chatSendMsgVo.getContent());
        chatMsg.setIp(IpUtil.getIp());
        chatMsg.setLocation(IpUtil.getIp2region(chatMsg.getIp()));
        chatMsgMapper.insert(chatMsg);

        chatSendMsgVo.setId(chatMsg.getId());
        chatSendMsgVo.setLocation(chatMsg.getLocation());
        webSocketServer.sendAllMessage(JSON.toJSONString(chatSendMsgVo));
    }

    @Override
    public void recallMsg(ChatSendMsgVo chatSendMsgVo) {
        ChatMsg chatMsg1 = chatMsgMapper.selectById(chatSendMsgVo.getId());
        //判断发送的时间是否超过当前时间俩分钟 LocalDateTime类型
        if (chatMsg1.getCreateTime().plusMinutes(2).isBefore(LocalDateTime.now())) {
            throw new ServiceException("只能撤回俩分钟以内的消息！");
        }

        chatSendMsgVo.setIsRecalled(Boolean.TRUE);
        chatSendMsgVo.setContent("消息已撤回");

        ChatMsg chatMsg = new ChatMsg();
        BeanUtils.copyProperties(chatSendMsgVo, chatMsg);
        chatMsgMapper.updateById(chatMsg);

        webSocketServer.sendAllMessage(JSON.toJSONString(chatSendMsgVo));
    }
}
