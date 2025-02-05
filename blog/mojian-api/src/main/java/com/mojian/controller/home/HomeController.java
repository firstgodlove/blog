package com.mojian.controller.home;

import com.alibaba.fastjson2.JSONObject;
import com.mojian.service.HomeService;
import com.mojian.common.Result;
import com.mojian.entity.SysWebConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;

    @GetMapping("/webConfig")
    @Operation(summary = "获取网站配置")
    public Result<SysWebConfig> getWebConfig() {
        return homeService.getWebConfig();
    }

    @GetMapping("/getHotSearch/{type}")
    @Operation(summary = "获取医院搜索")
    public Result<JSONObject> getHotSearch(@PathVariable String type) {
        return Result.success(homeService.getHotSearch(type));
    }

    @GetMapping("/report")
    @Operation(summary = "添加访问量")
    public Result<Void> report() {
        homeService.report();
        return Result.success();
    }

}
