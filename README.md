# 博客项目

## 简介
拾壹博客的改版，
登录用户:admin,密码:123456


## 目录结构
前端项目blog-web为前台，blog-admin为后台。

后端项目位于blog下。

SQL文件位于根目录下的 mj-blog.sql

可直接导入该项目于本地，修改后端配置文件中的数据库等连接信息，项目中使用到的关于七牛云功能和第三方授权登录等需要自行开通。

当你克隆项目到本地后可使用账号：admin，密码：123456 进行登录

## 发布部署
1. 刚拉取下来的代码是没有application-prod配置文件的，需要自行创建，内容复制application-dev.yml文件即可

2. 配置数据库连接信息，修改application.yml文件
```yaml
spring:
  profiles:
    active: prod
```
3. 打包项目，将mojian-server下面的target目录下的jar包复制到服务器上，然后执行java -jar xxx.jar启动项目

## 技术栈
- **后端**: Spring Boot, SaToken, Mybatis-plus, MySQL
- **前端**: Vue2.0, Vue3.0, Element-Plus
- **构建工具**: Maven
