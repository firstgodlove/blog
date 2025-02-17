package com.mojian.vo.chat;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.mojian.utils.DateUtil;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Schema(description = "聊天消息")
public class ChatSendMsgVo {

    @Schema(description = "消息id")
    private Long id;

    @Schema(description = "消息类型，可选值为'text'、'image'，默认'text'")
    private String type;

    @Schema(description = "内容")
    private String content;

    @Schema(description = "是否自己发送")
    private Integer userId;

    @Schema(description = "发送人名称")
    private String name;

    @Schema(description = "发送人头像")
    private String avatar;

    @Schema(description = "归属地")
    private String location;

    @Schema(description = "是否撤回，默认false")
    private Boolean isRecalled;

    @Schema(description = "发送时间")
    @JsonFormat(pattern = DateUtil.YYYY_MM_DD_HH_MM_SS)
    private LocalDateTime time;
}
