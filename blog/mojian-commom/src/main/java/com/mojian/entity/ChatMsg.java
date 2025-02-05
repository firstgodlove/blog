package com.mojian.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@TableName("chat_msg")
@Schema(description = "聊天消息对象")
public class ChatMsg implements Serializable {

    @TableId(type = IdType.AUTO)
    @Schema(description = "消息ID")
    private Long id;

    @Schema(description = "聊天ID")
    private Long chatId;

    @Schema(description = "发送人ID")
    private Long senderId;

    @Schema(description = "消息类型，可选值为'text'、'image'，默认'text'")
    private String type;

    @Schema(description = "内容")
    private String content;

    @Schema(description = "ip")
    private String ip;

    @Schema(description = "ip归属地")
    private String location;

    @Schema(description = "是否撤回，默认false")
    private Boolean isRecalled;

    @Schema(description = "发送时间")
    private LocalDateTime createTime;
}
