# 使用 Python 官方映像作為基礎映像
FROM python:3.9.13-slim

# 設置工作目錄為 /app
WORKDIR /app

# 將依賴文件 requirements.txt 複製到容器中
COPY requirements.txt requirements.txt

# 安裝依賴
RUN pip install --no-cache-dir -r requirements.txt

# 將當前目錄內容複製到容器中的 /app
COPY . .

# 將容器的開放端口設置為 3000
EXPOSE 3000

# 定義容器啟動時執行的命令
CMD ["python", "app.py"]