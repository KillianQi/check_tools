import os
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio
import json
from typing import List

# 修复导入问题
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server.inspector import ServerInspector
from server.models import ServerInfo, InspectionRequest, InspectionResult
from server.websocket_manager import WebSocketManager

# 全局变量
websocket_manager = WebSocketManager()
inspector = ServerInspector()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时执行
    print("服务器巡检工具启动中...")
    yield
    # 关闭时执行
    print("服务器巡检工具关闭中...")

app = FastAPI(
    title="服务器批量巡检工具",
    description="支持批量巡检服务器的工具，提供Web界面和API接口",
    version="1.0.0",
    lifespan=lifespan
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket连接管理
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "inspect":
                await handle_inspection_request(websocket, message)
            elif message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
                
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

async def handle_inspection_request(websocket: WebSocket, message: dict):
    """处理巡检请求"""
    try:
        servers = message.get("servers", [])
        checks = message.get("checks", ["system", "cpu", "memory", "disk", "network"])
        
        # 发送开始巡检消息
        await websocket.send_text(json.dumps({
            "type": "inspection_start",
            "message": f"开始巡检 {len(servers)} 台服务器"
        }))
        
        # 并发巡检所有服务器
        tasks = []
        for server_info in servers:
            task = inspect_single_server(websocket, server_info, checks)
            tasks.append(task)
        
        await asyncio.gather(*tasks, return_exceptions=True)
        
        # 发送巡检完成消息
        await websocket.send_text(json.dumps({
            "type": "inspection_complete",
            "message": "所有服务器巡检完成"
        }))
        
    except Exception as e:
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": f"巡检过程中发生错误: {str(e)}"
        }))

async def inspect_single_server(websocket: WebSocket, server_info: dict, checks: List[str]):
    """巡检单台服务器"""
    try:
        host = server_info.get("host")
        username = server_info.get("username")
        password = server_info.get("password")
        key_path = server_info.get("key_path")
        port = server_info.get("port", 22)
        
        # 发送服务器开始巡检消息
        await websocket.send_text(json.dumps({
            "type": "server_start",
            "host": host,
            "message": f"开始巡检服务器 {host}"
        }))
        
        # 执行巡检
        result = await inspector.inspect_server(
            host=host,
            username=username,
            password=password,
            key_path=key_path,
            port=port,
            checks=checks
        )
        
        # 发送巡检结果
        await websocket.send_text(json.dumps({
            "type": "server_result",
            "host": host,
            "result": result
        }))
        
    except Exception as e:
        await websocket.send_text(json.dumps({
            "type": "server_error",
            "host": host,
            "message": f"服务器 {host} 巡检失败: {str(e)}"
        }))

# REST API接口
@app.get("/")
async def root():
    return {"message": "服务器批量巡检工具API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/api/inspect")
async def inspect_servers(request: InspectionRequest):
    """批量巡检API接口"""
    results = []
    
    for server in request.servers:
        try:
            result = await inspector.inspect_server(
                host=server.host,
                username=server.username,
                password=server.password,
                key_path=server.key_path,
                port=server.port,
                checks=request.checks
            )
            results.append({
                "host": server.host,
                "status": "success",
                "result": result
            })
        except Exception as e:
            results.append({
                "host": server.host,
                "status": "error",
                "error": str(e)
            })
    
    return {"results": results}

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    uvicorn.run(
        "server.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
