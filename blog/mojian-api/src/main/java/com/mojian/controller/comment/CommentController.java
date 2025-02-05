package com.mojian.controller.comment;


import com.baomidou.mybatisplus.core.metadata.IPage;
import com.mojian.service.CommentService;
import com.mojian.vo.comment.CommentListVo;
import com.mojian.common.Result;
import com.mojian.entity.SysComment;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "门户-评论管理", description = "评论管理相关接口")
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/api/comment/list")
    @Operation(summary = "获取文章评论列表")
    public Result<IPage<CommentListVo>> getComments(Integer articleId,String sortType) {
        return Result.success(commentService.getComments(articleId,sortType));
    }

    @PostMapping("/addComment")
    @Operation(summary = "获取文章评论列表")
    public Result<Boolean> add(@RequestBody SysComment sysComment) {
        return Result.success(commentService.add(sysComment));
    }
}
