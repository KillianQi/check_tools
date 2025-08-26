import asyncio
import paramiko
import re
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
import subprocess
import platform

from .models import (
    InspectionResult, SystemInfo, CPUInfo, MemoryInfo, 
    DiskInfo, NetworkInfo, NetworkInterface, ProcessInfo, ServiceInfo
)

class ServerInspector:
    def __init__(self):
        self.ssh_timeout = 30
        self.command_timeout = 10

    async def inspect_server(
        self,
        host: str,
        username: str,
        password: Optional[str] = None,
        key_path: Optional[str] = None,
        port: int = 22,
        checks: List[str] = None
    ) -> InspectionResult:
        """巡检单台服务器"""
        if checks is None:
            checks = ["system", "cpu", "memory", "disk", "network"]

        result = InspectionResult(
            host=host,
            timestamp=datetime.now()
        )

        try:
            # 建立SSH连接
            ssh_client = await self._connect_ssh(host, username, password, key_path, port)
            
            # 执行巡检
            if "system" in checks:
                result.system = await self._get_system_info(ssh_client)
            
            if "cpu" in checks:
                result.cpu = await self._get_cpu_info(ssh_client)
            
            if "memory" in checks:
                result.memory = await self._get_memory_info(ssh_client)
            
            if "disk" in checks:
                result.disks = await self._get_disk_info(ssh_client)
            
            if "network" in checks:
                result.network = await self._get_network_info(ssh_client)
            
            if "process" in checks:
                result.processes = await self._get_process_info(ssh_client)
            
            if "service" in checks:
                result.services = await self._get_service_info(ssh_client)
            
            ssh_client.close()
            
        except Exception as e:
            result.errors.append(str(e))
        
        return result

    async def _connect_ssh(
        self,
        host: str,
        username: str,
        password: Optional[str] = None,
        key_path: Optional[str] = None,
        port: int = 22
    ) -> paramiko.SSHClient:
        """建立SSH连接"""
        ssh_client = paramiko.SSHClient()
        ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        try:
            if key_path:
                private_key = paramiko.RSAKey.from_private_key_file(key_path)
                ssh_client.connect(
                    hostname=host,
                    port=port,
                    username=username,
                    pkey=private_key,
                    timeout=self.ssh_timeout
                )
            else:
                ssh_client.connect(
                    hostname=host,
                    port=port,
                    username=username,
                    password=password,
                    timeout=self.ssh_timeout
                )
            return ssh_client
        except Exception as e:
            raise Exception(f"SSH连接失败: {str(e)}")

    async def _execute_command(self, ssh_client: paramiko.SSHClient, command: str) -> str:
        """执行SSH命令"""
        try:
            stdin, stdout, stderr = ssh_client.exec_command(command, timeout=self.command_timeout)
            output = stdout.read().decode('utf-8').strip()
            error = stderr.read().decode('utf-8').strip()
            
            if error:
                raise Exception(f"命令执行错误: {error}")
            
            return output
        except Exception as e:
            raise Exception(f"命令执行失败: {str(e)}")

    async def _get_system_info(self, ssh_client: paramiko.SSHClient) -> SystemInfo:
        """获取系统信息"""
        # 获取OS信息
        os_info = await self._execute_command(ssh_client, "cat /etc/os-release")
        os_name = ""
        os_version = ""
        
        for line in os_info.split('\n'):
            if line.startswith('PRETTY_NAME='):
                os_name = line.split('=', 1)[1].strip('"')
            elif line.startswith('VERSION_ID='):
                os_version = line.split('=', 1)[1].strip('"')
        
        # 获取内核版本
        kernel_version = await self._execute_command(ssh_client, "uname -r")
        
        # 获取主机名
        hostname = await self._execute_command(ssh_client, "hostname")
        
        # 获取运行时间
        uptime = await self._execute_command(ssh_client, "uptime -p")
        
        # 获取启动时间
        boot_time = await self._execute_command(ssh_client, "who -b")
        
        return SystemInfo(
            os_name=os_name,
            os_version=os_version,
            kernel_version=kernel_version,
            hostname=hostname,
            uptime=uptime,
            boot_time=boot_time
        )

    async def _get_cpu_info(self, ssh_client: paramiko.SSHClient) -> CPUInfo:
        """获取CPU信息"""
        # CPU核心数
        cpu_count = int(await self._execute_command(ssh_client, "nproc"))
        
        # CPU使用率
        cpu_usage_cmd = "top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1"
        cpu_usage = float(await self._execute_command(ssh_client, cpu_usage_cmd))
        
        # 负载平均值
        load_avg = await self._execute_command(ssh_client, "cat /proc/loadavg")
        load_average = [float(x) for x in load_avg.split()[:3]]
        
        # CPU型号
        cpu_model = (await self._execute_command(
            ssh_client,
            "cat /proc/cpuinfo | grep 'model name' | head -1 | cut -d':' -f2"
        )).strip()
        
        return CPUInfo(
            cpu_count=cpu_count,
            cpu_usage=cpu_usage,
            load_average=load_average,
            cpu_model=cpu_model
        )

    async def _get_memory_info(self, ssh_client: paramiko.SSHClient) -> MemoryInfo:
        """获取内存信息"""
        mem_info = await self._execute_command(ssh_client, "free -b")
        lines = mem_info.split('\n')
        
        # 解析内存信息
        mem_line = lines[1].split()
        swap_line = lines[2].split()
        
        total = int(mem_line[1])
        used = int(mem_line[2])
        free = int(mem_line[3])
        available = int(mem_line[6]) if len(mem_line) > 6 else free
        
        swap_total = int(swap_line[1])
        swap_used = int(swap_line[2])
        swap_free = int(swap_line[3])
        
        usage_percent = (used / total) * 100 if total > 0 else 0
        
        return MemoryInfo(
            total=total,
            available=available,
            used=used,
            free=free,
            usage_percent=usage_percent,
            swap_total=swap_total,
            swap_used=swap_used,
            swap_free=swap_free
        )

    async def _get_disk_info(self, ssh_client: paramiko.SSHClient) -> List[DiskInfo]:
        """获取磁盘信息"""
        # 获取磁盘使用情况
        df_output = await self._execute_command(ssh_client, "df -h")
        lines = df_output.split('\n')[1:]  # 跳过标题行
        
        disks = []
        for line in lines:
            if line.strip():
                parts = line.split()
                if len(parts) >= 6:
                    device = parts[0]
                    mountpoint = parts[5]
                    
                    # 跳过特殊/临时/系统挂载点
                    skip_mountpoints = set([
                        '/dev', '/proc', '/sys', '/run', '/dev/shm', '/sys/fs/cgroup', '/var/run', '/tmp'
                    ])
                    if mountpoint in skip_mountpoints or mountpoint.startswith('/run/') or mountpoint.startswith('/run/user/'):
                        continue
                    
                    # 获取文件系统类型
                    fs_type = await self._execute_command(ssh_client, f"df -T {mountpoint} | tail -1 | awk '{{print $2}}'")

                    # 过滤 tmpfs/devtmpfs 等临时文件系统
                    if fs_type in ['tmpfs', 'devtmpfs', 'overlay', 'squashfs']:
                        continue
                    
                    # 解析大小信息
                    total_str = parts[1]
                    used_str = parts[2]
                    available_str = parts[3]
                    usage_percent = float(parts[4].rstrip('%'))
                    
                    # 转换为字节
                    total = self._parse_size(total_str)
                    used = self._parse_size(used_str)
                    free = self._parse_size(available_str)
                    
                    # 判断磁盘类型，仅保留根盘和常见数据盘挂载
                    if mountpoint == "/":
                        disk_type = "root"
                    elif mountpoint.startswith('/data') or mountpoint.startswith('/storage'):
                        disk_type = "data"
                    else:
                        disk_type = "other"

                    # 仅保留 root/data
                    if disk_type not in ["root", "data"]:
                        continue
                    
                    disks.append(DiskInfo(
                        device=device,
                        mountpoint=mountpoint,
                        filesystem=fs_type,
                        total=total,
                        used=used,
                        free=free,
                        usage_percent=usage_percent,
                        disk_type=disk_type
                    ))
        
        return disks

    def _parse_size(self, size_str: str) -> int:
        """解析大小字符串为字节数"""
        size_str = size_str.upper()
        if 'T' in size_str:
            return int(float(size_str.replace('T', '')) * 1024**4)
        elif 'G' in size_str:
            return int(float(size_str.replace('G', '')) * 1024**3)
        elif 'M' in size_str:
            return int(float(size_str.replace('M', '')) * 1024**2)
        elif 'K' in size_str:
            return int(float(size_str.replace('K', '')) * 1024)
        else:
            return int(size_str)

    async def _get_network_info(self, ssh_client: paramiko.SSHClient) -> NetworkInfo:
        """获取网络信息"""
        interfaces = []
        bonds = []
        vips = []
        
        # 获取网络接口信息
        ip_output = await self._execute_command(ssh_client, "ip addr show")
        lines = [l.rstrip() for l in ip_output.split('\n')]

        current_header = None
        current_block_lines = []

        async def flush_block():
            nonlocal current_header, current_block_lines
            if not current_header:
                return
            header = current_header
            lines_block = current_block_lines

            # 解析接口名称与状态
            try:
                header_parts = header.split(':', 2)
                interface_name = header_parts[1].strip()
            except Exception:
                interface_name = header.split()[1].rstrip(':') if len(header.split()) > 1 else 'unknown'

            if interface_name == 'lo':
                current_header = None
                current_block_lines = []
                return

            ip_address = ""
            netmask = ""
            mac_address = ""
            status = "UP" if (' state UP ' in header or header.strip().endswith('state UP')) else "DOWN"

            for line in lines_block:
                s = line.strip()
                if s.startswith('link/ether'):
                    parts = s.split()
                    if len(parts) >= 2:
                        mac_address = parts[1]
                elif s.startswith('inet '):
                    ip_info = s.split()[1]
                    if '/' in ip_info:
                        ip_address, netmask = ip_info.split('/', 1)

            interface_type = "physical"
            if interface_name.startswith('bond'):
                interface_type = "bond"
            elif interface_name.startswith('veth') or interface_name.startswith('docker'):
                interface_type = "virtual"

            speed = None
            try:
                speed_cmd = f"cat /sys/class/net/{interface_name}/speed 2>/dev/null || echo 'Unknown'"
                speed_val = await self._execute_command(ssh_client, speed_cmd)
                if speed_val and speed_val != "Unknown":
                    speed = speed_val
            except:
                pass

            interfaces.append(NetworkInterface(
                name=interface_name,
                ip_address=ip_address,
                netmask=netmask,
                mac_address=mac_address,
                interface_type=interface_type,
                status=status,
                speed=speed
            ))

            current_header = None
            current_block_lines = []

        for line in lines:
            if not line:
                # 空行结束当前块
                if current_header is not None:
                    await flush_block()
                continue
            if line[0].isdigit() and ':' in line.split(' ', 1)[0]:
                # 新的接口头部
                if current_header is not None:
                    await flush_block()
                current_header = line
                current_block_lines = []
            else:
                if current_header is not None:
                    current_block_lines.append(line)

        # 文件结束后冲刷最后一个块
        if current_header is not None:
            await flush_block()
        
        # 获取bond信息
        try:
            bond_info = await self._execute_command(ssh_client, "cat /proc/net/bonding/bond* 2>/dev/null || echo ''")
            if bond_info and bond_info != '':
                # 解析bond信息
                bond_blocks = bond_info.split('\n\n')
                for block in bond_blocks:
                    if 'Bonding Mode' in block:
                        bond_name = block.split('\n')[0].split(':')[0]
                        mode_match = re.search(r'Bonding Mode: (\d+)', block)
                        mode = mode_match.group(1) if mode_match else "Unknown"
                        bonds.append({
                            "name": bond_name,
                            "mode": mode,
                            "status": "Active" if "Currently Active Slave" in block else "Inactive"
                        })
        except:
            pass
        
        # 获取VIP信息
        try:
            # 检查keepalived
            keepalived_vips = await self._execute_command(ssh_client, "ip addr show | grep -E 'inet.*secondary' | awk '{print $2}'")
            for vip in keepalived_vips.split('\n'):
                if vip.strip():
                    vips.append({
                        "ip": vip.split('/')[0],
                        "type": "keepalived",
                        "interface": "secondary"
                    })
        except:
            pass
        
        # 获取路由表
        routing_table = []
        try:
            route_output = await self._execute_command(ssh_client, "ip route show")
            for line in route_output.split('\n'):
                if line.strip():
                    parts = line.split()
                    if len(parts) >= 3:
                        routing_table.append({
                            "destination": parts[0],
                            "gateway": parts[2] if len(parts) > 2 else "",
                            "interface": parts[-1] if len(parts) > 2 else ""
                        })
        except:
            pass
        
        return NetworkInfo(
            interfaces=interfaces,
            bonds=bonds,
            vips=vips,
            routing_table=routing_table
        )

    async def _get_process_info(self, ssh_client: paramiko.SSHClient) -> List[ProcessInfo]:
        """获取进程信息"""
        processes = []
        
        try:
            # 获取top进程信息
            ps_output = await self._execute_command(ssh_client, "ps aux --sort=-%cpu | head -20")
            lines = ps_output.split('\n')[1:]  # 跳过标题行
            
            for line in lines:
                if line.strip():
                    parts = line.split(None, 10)
                    if len(parts) >= 11:
                        processes.append(ProcessInfo(
                            pid=int(parts[1]),
                            name=parts[10][:50],  # 限制命令长度
                            cpu_percent=float(parts[2]),
                            memory_percent=float(parts[3]),
                            status=parts[7],
                            command=parts[10]
                        ))
        except:
            pass
        
        return processes

    async def _get_service_info(self, ssh_client: paramiko.SSHClient) -> List[ServiceInfo]:
        """获取服务信息"""
        services = []
        
        try:
            # 检查systemd服务
            systemctl_output = await self._execute_command(ssh_client, "systemctl list-units --type=service --state=running | head -20")
            lines = systemctl_output.split('\n')[1:]  # 跳过标题行
            
            for line in lines:
                if line.strip() and not line.startswith('UNIT'):
                    parts = line.split()
                    if len(parts) >= 4:
                        service_name = parts[0]
                        status = parts[2]
                        
                        # 检查服务是否启用
                        enabled_output = await self._execute_command(ssh_client, f"systemctl is-enabled {service_name} 2>/dev/null || echo 'unknown'")
                        enabled = enabled_output.strip() == "enabled"
                        
                        services.append(ServiceInfo(
                            name=service_name,
                            status=status,
                            enabled=enabled,
                            description=" ".join(parts[3:]) if len(parts) > 3 else ""
                        ))
        except:
            pass
        
        return services
