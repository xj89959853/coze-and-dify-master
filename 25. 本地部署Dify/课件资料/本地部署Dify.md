# 本地部署Dify

**安装 Docker**

Docker 是一种容器技术，用于将“代码 + 环境 + 系统依赖”打包为一个镜像，假设你写了一个 Node.js 项目，在你电脑上能运行，但换到别人电脑上报错：

- 他没装 Node.js；
- 数据库版本不一样；
- 系统依赖缺失……

这时如果你用 Docker 打包成一个镜像，别人只需要运行你打包好的这个镜像，就能**一模一样**地启动你的应用，不用再配置环境。

首先第一步，下载 [Docker Desktop](https://docs.docker.com/desktop/)

![image-20251021101938016](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2025-10-21-021938.png)

设置 Docker 镜像源，用于加速镜像文件下载。

```json
"registry-mirrors": [
  "https://03gf6khc.mirror.aliyuncs.com",
  "https://docker-0.unsee.tech",
  "https://docker-cf.registry.cyou",
  "https://docker.lpanel.live"
]
```

配置完成后，记得重启 Docker.

在【Resources】可以设置分配给 Docker 的 CPU、内存等资源的大小。

>Windows 操作系统的同学，会额外麻烦一些，涉及到：
>
>1. 启用 Windows 系统的虚拟机
>2. 启用 Windows 系统的 Hyper-V 功能
>3. 安装 Windows 系统的WSL
>
>另外 Windows10 和 Windows11 可能还不太一样，这个大家下去自己研究



**下载 Dify**

可以在 gitee 上下载 [Dify](https://gitee.com/dify_ai/dify) 。

复制一份 .env.example 作为副本，将 .env.example 改名为 .env

切换至 docker 目录，执行：

```bash
docker compose up -d
```

- **`docker compose`**：使用 Docker Compose 工具；
- **`up`**：启动（或创建）`docker-compose.yml` 文件中定义的所有服务；
- **`-d`**：后台运行（detached 模式，不会占据当前终端）。

效果如下图所示：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2025-10-21-023755.png" alt="image-20251021103755616" style="zoom:50%;" />

docker 会自动从远程仓库拉取镜像。每一行对应一个容器服务，比如 `redis`、`db`、`nginx`、`api`、`web` 等；

接下来会下载这些容器镜像；`xxMB / yyMB Pulling` 表示已下载与总大小；有些显示 `worker Pulling`、`api Pulling` 说明这些镜像还没开始下载。如下图所示：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2025-10-21-023913.png" alt="image-20251021103912673" style="zoom:50%;" />

之后，镜像拉取完成，并且所有容器都已经成功启动（状态显示为 Started / Healthy）

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2025-10-21-024340.png" alt="image-20251021104340019" style="zoom:50%;" />

这一行：

```bash
[+] Running 13/13
```

表示：

- 已经成功启动了 13 个容器；
- 所有核心服务（api、web、db、redis、nginx 等）都在运行；
- 网络也已经自动创建完毕。

访问 `http://127.0.0.1` 即可打开 Dify 的前端管理界面。



停止服务

在 docker 目录下执行

```bash
docker compose down
```

说明：

- 这个命令会**停止并删除容器**，但不会删除镜像、网络、卷；
- 下次启动会自动用之前的镜像重新启动；
- 所以数据（数据库、配置等）仍然保存在卷中，不会丢失。



启动服务

在 docker 目录下执行：

```bash
docker compose up -d
```

- `-d` 表示后台运行

- Docker 会自动使用上次的镜像、配置、卷



有时只是想暂时停一下，而不想重建容器。可以使用：

```bash
docker compose stop
```

区别在于：

| 命令                  | 行为                      | 下次启动方式           |
| --------------------- | ------------------------- | ---------------------- |
| `docker compose stop` | 仅暂停容器运行，保留状态  | `docker compose start` |
| `docker compose down` | 删除容器（但保留镜像/卷） | `docker compose up -d` |

镜像和容器的区别：

- 镜像：一份配置清单 + 模板，它记录了：

  - 要安装哪些软件
  - 要拷贝哪些文件
  - 要执行哪些命令
  - 要用哪个系统（如 Ubuntu、Alpine）

  就像一本“**制作环境的食谱**”：

  ```
  FROM python:3.10
  RUN pip install flask
  COPY ./app /app
  CMD ["python", "app/main.py"]
  ```

  这就是镜像的“说明书”。Docker 会根据它，打包出一个完整的运行环境。

- 容器：运行中的实例。Docker 根据拿到的镜像，创建一个隔离的运行环境，按清单内容启动应用。

因此暂停容器与删除容器的区别在于：

- 暂停容器：容器仍存在，可随时恢复，容器内的数据（临时文件）也仍然存在（类比：不关闭操作系统，只是睡眠）
- 删除容器：容器内的数据会丢失，下次启动又是一个全新的容器（类比：关闭了操作系统，下一次启动又是重新启动操作系统）



如果希望 Dify **长期作为在线服务**运行，可以：

1. 在云服务器（如阿里云、腾讯云、Vultr、AWS）上部署；
2. 使用 `docker compose up -d` 启动；
3. 在安全组中开放 **80 和 443 端口**；
4. 用 Nginx + 域名 + HTTPS 反代。

这样别人就能通过：

```bash
https://yourdomain.com
```

访问你的 Dify 平台。

---

-EOF-