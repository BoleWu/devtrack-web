// 测试您提供的数据
const testData = [
    {
        "taskName": "设计微服务架构图",
        "startTime": "2025-10-02 10:00:00",
        "endTime": "2026-03-31 00:00:00",
        "status": "DONE"
    },
    {
        "taskName": "用户服务开发",
        "startTime": "2025-10-05 09:30:00",
        "endTime": "2026-03-31 00:00:00",
        "status": "DOING"
    },
    {
        "taskName": "订单服务联调",
        "startTime": "2025-11-01 14:00:00",
        "endTime": "2026-03-31 00:00:00",
        "status": "TODO"
    },
    {
        "taskName": "首页UI设计",
        "startTime": "2025-11-10 09:00:00",
        "endTime": "2026-03-31 00:00:00",
        "status": "DONE"
    },
    {
        "taskName": "登录模块开发",
        "startTime": "2025-11-15 11:00:00",
        "endTime": "2026-03-31 00:00:00",
        "status": "DOING"
    },
    {
        "taskName": "性能压测",
        "startTime": "2026-01-30 16:00:00",
        "endTime": "",
        "status": "TODO"
    }
];

const parseDate = (dateStr) => {
    // 处理 null、undefined、空字符串或 'null' 字符串
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined' || dateStr === null || dateStr === '') {
        return null;
    }
    try {
        // 处理各种格式
        if (dateStr.includes(' ')) {
            dateStr = dateStr.replace(' ', 'T'); // "2025-10-02 10:00:00" -> "2025-10-02T10:00:00"
        }
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? null : date;
    } catch (e) {
        return null;
    }
};

console.log("=== 您提供数据的处理结果 ===");
testData.forEach((item, index) => {
    const startDate = parseDate(item.startTime);
    const endDate = parseDate(item.endTime);
    
    const startTimestamp = startDate ? startDate.getTime() : null;
    const endTimestamp = endDate ? endDate.getTime() : null;
    
    let duration = 0;
    if (startTimestamp !== null && endTimestamp !== null) {
        duration = endTimestamp - startTimestamp;
        if (duration <= 0) duration = 0;
    }
    
    console.log(`${index + 1}. ${item.taskName}`);
    console.log(`   开始: ${startDate ? startDate.toLocaleString() : '未设置'} (${startTimestamp})`);
    console.log(`   结束: ${endDate ? endDate.toLocaleString() : '未设置'} (${endTimestamp})`);
    console.log(`   持续时间: ${duration} 毫秒 (${Math.floor(duration / (1000 * 60 * 60 * 24))} 天)`);
    console.log(`   状态: ${item.status}`);
    console.log('---');
});