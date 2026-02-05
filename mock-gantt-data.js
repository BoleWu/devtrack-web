// 模拟甘特图API返回的数据
const mockGanttData = [
    {
        "id": 1,
        "name": "设计微服务架构图",
        "start": "2025-10-02 10:00:00",
        "end": "2026-03-31 00:00:00",
        "status": "DONE"
    },
    {
        "id": 2,
        "name": "用户服务开发",
        "start": "2025-10-05 09:30:00",
        "end": "2026-03-31 00:00:00",
        "status": "DOING"
    },
    {
        "id": 3,
        "name": "订单服务联调",
        "start": "2025-11-01 14:00:00",
        "end": "2026-03-31 00:00:00",
        "status": "TODO"
    },
    {
        "id": 4,
        "name": "首页UI设计",
        "start": "2025-11-10 09:00:00",
        "end": "2026-03-31 00:00:00",
        "status": "DONE"
    },
    {
        "id": 5,
        "name": "登录模块开发",
        "start": "2025-11-15 11:00:00",
        "end": "2026-03-31 00:00:00",
        "status": "DOING"
    },
    {
        "id": 6,
        "name": "性能压测",
        "start": "2026-01-30 16:00:00",
        "end": null,
        "status": "TODO"
    },
    {
        "id": 7,
        "name": "数据源接入",
        "start": "2025-08-15 10:00:00",
        "end": "2026-03-31 00:00:00",
        "status": "DONE"
    },
    {
        "id": 8,
        "name": "大屏可视化开发",
        "start": "2025-09-05 14:00:00",
        "end": "2026-03-31 00:00:00",
        "status": "DONE"
    },
    {
        "id": 9,
        "name": "OAuth2.0集成",
        "start": "2026-01-12 10:30:00",
        "end": "2026-03-31 00:00:00",
        "status": "DOING"
    },
    {
        "id": 10,
        "name": "权限RBAC模型设计",
        "start": "2026-01-18 11:00:00",
        "end": "2026-03-31 00:00:00",
        "status": "TODO"
    },
    {
        "id": 11,
        "name": "部署监控告警规则",
        "start": "2026-02-01 10:00:00",
        "end": "2026-03-31 00:00:00",
        "status": "DOING"
    },
    {
        "id": 12,
        "name": "日志收集方案优化",
        "start": "2026-02-02 09:30:00",
        "end": "2026-03-31 00:00:00",
        "status": "TODO"
    }
];

// 测试修复后的解析逻辑
const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined' || dateStr === null) {
        return null;
    }
    try {
        if (dateStr.includes(' ')) {
            dateStr = dateStr.replace(' ', 'T');
        }
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    } catch (e) {
        return null;
    }
};

console.log("=== 修复后的数据处理结果 ===");
mockGanttData.forEach((item, index) => {
    const startDate = parseDate(item.start);
    const endDate = parseDate(item.end);
    
    const startTimestamp = startDate ? startDate.getTime() : null;
    const endTimestamp = endDate ? endDate.getTime() : null;
    
    let duration = 0;
    if (startTimestamp !== null && endTimestamp !== null) {
        duration = endTimestamp - startTimestamp;
        if (duration <= 0) duration = 0;
    }
    
    console.log(`${index + 1}. ${item.name}`);
    console.log(`   开始: ${startDate ? startDate.toLocaleString() : '未设置'} (${startTimestamp})`);
    console.log(`   结束: ${endDate ? endDate.toLocaleString() : '未设置'} (${endTimestamp})`);
    console.log(`   持续时间: ${duration} 毫秒 (${Math.floor(duration / (1000 * 60 * 60 * 24))} 天)`);
    console.log(`   状态: ${item.status}`);
    console.log('---');
});