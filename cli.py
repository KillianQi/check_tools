#!/usr/bin/env python3
"""
服务器批量巡检工具 - 命令行版本
"""

import argparse
import asyncio
import json
import sys
from typing import List, Optional
from pathlib import Path

from server.inspector import ServerInspector
from server.models import ServerInfo

class CLIInspector:
    def __init__(self):
        self.inspector = ServerInspector()

    async def inspect_single_server(
        self,
        host: str,
        username: str,
        password: Optional[str] = None,
        key_path: Optional[str] = None,
        port: int = 22,
        checks: List[str] = None
    ):
        """巡检单台服务器"""
        print(f"正在巡检服务器: {host}")
        
        try:
            result = await self.inspector.inspect_server(
                host=host,
                username=username,
                password=password,
                key_path=key_path,
                port=port,
                checks=checks
            )
            
            self._print_result(result)
            
        except Exception as e:
            print(f"巡检失败: {str(e)}")
            sys.exit(1)

    async def inspect_multiple_servers(
        self,
        hosts_file: str,
        username: str,
        password: Optional[str] = None,
        key_path: Optional[str] = None,
        port: int = 22,
        checks: List[str] = None
    ):
        """批量巡检多台服务器"""
        servers = self._parse_hosts_file(hosts_file)
        
        print(f"开始批量巡检 {len(servers)} 台服务器")
        print("=" * 50)
        
        results = []
        for i, server in enumerate(servers, 1):
            print(f"\n[{i}/{len(servers)}] 正在巡检: {server['host']}")
            
            try:
                result = await self.inspector.inspect_server(
                    host=server['host'],
                    username=server.get('username', username),
                    password=server.get('password', password),
                    key_path=server.get('key_path', key_path),
                    port=server.get('port', port),
                    checks=checks
                )
                results.append(result)
                self._print_result(result, show_header=False)
                
            except Exception as e:
                print(f"  巡检失败: {str(e)}")
                results.append({
                    'host': server['host'],
                    'error': str(e)
                })
        
        # 生成汇总报告
        self._generate_summary_report(results)

    def _parse_hosts_file(self, hosts_file: str) -> List[dict]:
        """解析主机文件"""
        servers = []
        
        try:
            with open(hosts_file, 'r', encoding='utf-8') as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if not line or line.startswith('#'):
                        continue
                    
                    try:
                        # 格式: host:port:username:password_or_key_path
                        parts = line.split(':')
                        if len(parts) < 2:
                            print(f"警告: 第{line_num}行格式错误，跳过: {line}")
                            continue
                        
                        server = {
                            'host': parts[0],
                            'port': int(parts[1]) if len(parts) > 1 else 22,
                            'username': parts[2] if len(parts) > 2 else 'root'
                        }
                        
                        # 处理密码或密钥路径
                        if len(parts) > 3:
                            if parts[3].startswith('/'):
                                server['key_path'] = parts[3]
                            else:
                                server['password'] = parts[3]
                        
                        servers.append(server)
                        
                    except Exception as e:
                        print(f"警告: 第{line_num}行解析失败，跳过: {line} - {str(e)}")
                        continue
                        
        except FileNotFoundError:
            print(f"错误: 主机文件不存在: {hosts_file}")
            sys.exit(1)
        except Exception as e:
            print(f"错误: 读取主机文件失败: {str(e)}")
            sys.exit(1)
        
        return servers

    def _print_result(self, result, show_header: bool = True):
        """打印巡检结果"""
        if show_header:
            print("=" * 50)
            print(f"服务器: {result.host}")
            print(f"巡检时间: {result.timestamp}")
            print("=" * 50)
        
        if result.errors:
            print(f"错误: {', '.join(result.errors)}")
            return
        
        # 系统信息
        if result.system:
            print("\n📋 系统信息:")
            print(f"  操作系统: {result.system.os_name}")
            print(f"  版本: {result.system.os_version}")
            print(f"  内核: {result.system.kernel_version}")
            print(f"  主机名: {result.system.hostname}")
            print(f"  运行时间: {result.system.uptime}")
            print(f"  启动时间: {result.system.boot_time}")
        
        # CPU信息
        if result.cpu:
            print("\n🖥️ CPU信息:")
            print(f"  CPU核心数: {result.cpu.cpu_count}")
            print(f"  CPU使用率: {result.cpu.cpu_usage:.1f}%")
            print(f"  负载平均值: {', '.join([f'{x:.2f}' for x in result.cpu.load_average])}")
            print(f"  CPU型号: {result.cpu.cpu_model}")
        
        # 内存信息
        if result.memory:
            print("\n💾 内存信息:")
            total_gb = result.memory.total / (1024**3)
            used_gb = result.memory.used / (1024**3)
            available_gb = result.memory.available / (1024**3)
            print(f"  总内存: {total_gb:.1f} GB")
            print(f"  已使用: {used_gb:.1f} GB ({result.memory.usage_percent:.1f}%)")
            print(f"  可用内存: {available_gb:.1f} GB")
            
            if result.memory.swap_total > 0:
                swap_total_gb = result.memory.swap_total / (1024**3)
                swap_used_gb = result.memory.swap_used / (1024**3)
                print(f"  交换分区: {swap_total_gb:.1f} GB (已使用: {swap_used_gb:.1f} GB)")
        
        # 磁盘信息
        if result.disks:
            print("\n💿 磁盘信息:")
            for disk in result.disks:
                total_gb = disk.total / (1024**3)
                used_gb = disk.used / (1024**3)
                free_gb = disk.free / (1024**3)
                print(f"  {disk.mountpoint} ({disk.disk_type}):")
                print(f"    设备: {disk.device}")
                print(f"    文件系统: {disk.filesystem}")
                print(f"    总大小: {total_gb:.1f} GB")
                print(f"    已使用: {used_gb:.1f} GB ({disk.usage_percent:.1f}%)")
                print(f"    可用: {free_gb:.1f} GB")
        
        # 网络信息
        if result.network:
            print("\n🌐 网络信息:")
            
            # 网络接口
            if result.network.interfaces:
                print("  网络接口:")
                for iface in result.network.interfaces:
                    status_icon = "🟢" if iface.status == "UP" else "🔴"
                    print(f"    {status_icon} {iface.name} ({iface.interface_type}):")
                    if iface.ip_address:
                        print(f"      IP: {iface.ip_address}/{iface.netmask}")
                    if iface.mac_address:
                        print(f"      MAC: {iface.mac_address}")
                    if iface.speed:
                        print(f"      速度: {iface.speed} Mbps")
            
            # Bond信息
            if result.network.bonds:
                print("  Bond接口:")
                for bond in result.network.bonds:
                    print(f"    {bond['name']}: 模式{bond['mode']}, 状态: {bond['status']}")
            
            # VIP信息
            if result.network.vips:
                print("  虚拟IP:")
                for vip in result.network.vips:
                    print(f"    {vip['ip']} ({vip['type']})")
        
        # 进程信息
        if result.processes:
            print("\n📊 进程信息 (Top 10):")
            for i, proc in enumerate(result.processes[:10], 1):
                print(f"  {i:2d}. {proc.name[:30]:<30} CPU: {proc.cpu_percent:5.1f}% MEM: {proc.memory_percent:5.1f}%")
        
        # 服务信息
        if result.services:
            print("\n🔧 服务信息 (运行中):")
            for service in result.services[:10]:
                status_icon = "🟢" if service.enabled else "🟡"
                print(f"  {status_icon} {service.name}: {service.status}")

    def _generate_summary_report(self, results: List):
        """生成汇总报告"""
        print("\n" + "=" * 50)
        print("📊 巡检汇总报告")
        print("=" * 50)
        
        total_servers = len(results)
        successful = sum(1 for r in results if not hasattr(r, 'error') or not r.get('error'))
        failed = total_servers - successful
        
        print(f"总服务器数: {total_servers}")
        print(f"成功巡检: {successful}")
        print(f"巡检失败: {failed}")
        
        if failed > 0:
            print("\n❌ 巡检失败的服务器:")
            for result in results:
                if hasattr(result, 'error') and result.get('error'):
                    print(f"  - {result['host']}: {result['error']}")
        
        # 保存详细结果到JSON文件
        timestamp = results[0].timestamp.strftime("%Y%m%d_%H%M%S") if results and hasattr(results[0], 'timestamp') else "unknown"
        output_file = f"inspection_report_{timestamp}.json"
        
        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump([self._result_to_dict(r) for r in results], f, indent=2, default=str)
            print(f"\n📄 详细报告已保存到: {output_file}")
        except Exception as e:
            print(f"\n⚠️ 保存报告失败: {str(e)}")

    def _result_to_dict(self, result):
        """将结果转换为字典"""
        if hasattr(result, 'dict'):
            return result.dict()
        elif isinstance(result, dict):
            return result
        else:
            return {"error": "无法序列化结果"}

def main():
    parser = argparse.ArgumentParser(
        description="服务器批量巡检工具",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
使用示例:
  # 巡检单台服务器
  python cli.py --host 192.168.1.100 --user root --password your_password

  # 批量巡检多台服务器
  python cli.py --hosts hosts.txt --user root --password your_password

  # 自定义巡检项目
  python cli.py --host 192.168.1.100 --checks cpu,memory,disk,network

  # 使用SSH密钥
  python cli.py --host 192.168.1.100 --user root --key-path /path/to/key
        """
    )
    
    # 服务器参数
    server_group = parser.add_mutually_exclusive_group(required=True)
    server_group.add_argument('--host', help='单台服务器IP地址')
    server_group.add_argument('--hosts', help='主机文件路径 (格式: host:port:username:password)')
    
    # 认证参数
    parser.add_argument('--user', required=True, help='SSH用户名')
    parser.add_argument('--password', help='SSH密码')
    parser.add_argument('--key-path', help='SSH私钥路径')
    parser.add_argument('--port', type=int, default=22, help='SSH端口 (默认: 22)')
    
    # 巡检参数
    parser.add_argument('--checks', 
                       default='system,cpu,memory,disk,network',
                       help='巡检项目，用逗号分隔 (默认: system,cpu,memory,disk,network)')
    
    args = parser.parse_args()
    
    # 解析巡检项目
    checks = [check.strip() for check in args.checks.split(',')]
    
    # 创建巡检器
    inspector = CLIInspector()
    
    # 执行巡检
    if args.host:
        # 单台服务器巡检
        asyncio.run(inspector.inspect_single_server(
            host=args.host,
            username=args.user,
            password=args.password,
            key_path=args.key_path,
            port=args.port,
            checks=checks
        ))
    else:
        # 批量巡检
        asyncio.run(inspector.inspect_multiple_servers(
            hosts_file=args.hosts,
            username=args.user,
            password=args.password,
            key_path=args.key_path,
            port=args.port,
            checks=checks
        ))

if __name__ == "__main__":
    main()
