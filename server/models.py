from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class ServerInfo(BaseModel):
    """服务器信息模型"""
    host: str = Field(..., description="服务器IP地址")
    username: str = Field(..., description="用户名")
    password: Optional[str] = Field(None, description="密码")
    key_path: Optional[str] = Field(None, description="SSH密钥路径")
    port: int = Field(22, description="SSH端口")

class InspectionRequest(BaseModel):
    """巡检请求模型"""
    servers: List[ServerInfo] = Field(..., description="要巡检的服务器列表")
    checks: List[str] = Field(
        default=["system", "cpu", "memory", "disk", "network"],
        description="巡检项目列表"
    )

class SystemInfo(BaseModel):
    """系统信息模型"""
    os_name: str
    os_version: str
    kernel_version: str
    hostname: str
    uptime: str
    boot_time: str

class CPUInfo(BaseModel):
    """CPU信息模型"""
    cpu_count: int
    cpu_usage: float
    load_average: List[float]
    cpu_model: str

class MemoryInfo(BaseModel):
    """内存信息模型"""
    total: int
    available: int
    used: int
    free: int
    usage_percent: float
    swap_total: int
    swap_used: int
    swap_free: int

class DiskInfo(BaseModel):
    """磁盘信息模型"""
    device: str
    mountpoint: str
    filesystem: str
    total: int
    used: int
    free: int
    usage_percent: float
    disk_type: str  # root, data, other

class NetworkInterface(BaseModel):
    """网络接口信息模型"""
    name: str
    ip_address: str
    netmask: str
    mac_address: str
    interface_type: str  # physical, bond, virtual, loopback
    status: str
    speed: Optional[str] = None

class NetworkInfo(BaseModel):
    """网络信息模型"""
    interfaces: List[NetworkInterface]
    bonds: List[Dict[str, Any]]
    vips: List[Dict[str, Any]]
    routing_table: List[Dict[str, Any]]

class ProcessInfo(BaseModel):
    """进程信息模型"""
    pid: int
    name: str
    cpu_percent: float
    memory_percent: float
    status: str
    command: str

class ServiceInfo(BaseModel):
    """服务信息模型"""
    name: str
    status: str
    enabled: bool
    description: str

class InspectionResult(BaseModel):
    """巡检结果模型"""
    host: str
    timestamp: datetime
    system: Optional[SystemInfo] = None
    cpu: Optional[CPUInfo] = None
    memory: Optional[MemoryInfo] = None
    disks: Optional[List[DiskInfo]] = None
    network: Optional[NetworkInfo] = None
    processes: Optional[List[ProcessInfo]] = None
    services: Optional[List[ServiceInfo]] = None
    errors: List[str] = Field(default_factory=list)
