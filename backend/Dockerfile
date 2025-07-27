# 多阶段构建的Dockerfile
FROM python:3.11-slim as base

# 设置环境变量
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# 创建应用用户
RUN groupadd -r divine-friend && useradd -r -g divine-friend divine-friend

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 构建阶段
FROM base as builder

WORKDIR /build

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --upgrade pip setuptools wheel && \
    pip install --user -r requirements.txt

# 运行阶段
FROM base as runtime

# 设置工作目录
WORKDIR /app

# 从构建阶段复制Python包
COPY --from=builder /root/.local /home/divine-friend/.local

# 复制应用代码
COPY . .

# 创建必要的目录
RUN mkdir -p /var/log/divine-friend /var/run/divine-friend && \
    chown -R divine-friend:divine-friend /app /var/log/divine-friend /var/run/divine-friend

# 切换到应用用户
USER divine-friend

# 设置PATH
ENV PATH=/home/divine-friend/.local/bin:$PATH

# 健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5001/api/health || exit 1

# 暴露端口
EXPOSE 5001

# 启动命令
CMD ["gunicorn", "--config", "gunicorn.conf.py", "wsgi:app"]