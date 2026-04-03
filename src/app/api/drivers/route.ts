import { NextResponse } from 'next/server';

export async function GET() {
  // 模拟从 nanobot CLI 或 config.json 提取的底层 C 驱动状态
  const drivers = [
    { id: 'modbus_rtu', name: 'MODBUS-RTU', status: 'active', interface: '/dev/ttyS1', version: 'v1.4.2', tx: '1.2 MB', rx: '4.5 MB' },
    { id: 'can_bus', name: 'CAN-BUS', status: 'active', interface: 'can0', version: 'v2.1.0', tx: '840 KB', rx: '2.1 MB' },
    { id: 'opc_ua', name: 'OPC-UA', status: 'inactive', interface: 'eth0', version: 'v3.0.1', tx: '0 B', rx: '0 B' },
    { id: 'mqtt_bridge', name: 'MQTT-BRIDGE', status: 'active', interface: 'wlan0', version: 'v1.0.5', tx: '15.4 MB', rx: '8.2 MB' },
    { id: 's7_comm', name: 'S7-COMM', status: 'inactive', interface: 'eth1', version: 'v0.9.8', tx: '0 B', rx: '0 B' }
  ];
  return NextResponse.json({ drivers });
}

export async function POST(req: Request) {
  const body = await req.json();
  // 模拟执行 nanobot driver start/stop <id> CLI命令
  return NextResponse.json({ success: true, action: body.action, id: body.id });
}
