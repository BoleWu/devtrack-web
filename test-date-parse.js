// 测试日期解析逻辑
const testData = [
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
        "id": 6,
        "name": "性能压测",
        "start": "2026-01-30 16:00:00",
        "end": null,
        "status": "TODO"
    }
];

console.log("原始数据:");
testData.forEach(item => {
    console.log(`任务: ${item.name}`);
    console.log(`  开始时间: ${item.start}`);
    console.log(`  结束时间: ${item.end}`);
});

console.log("\n=== 当前解析逻辑测试 ===");
const parseDate = (dateStr) => {
    if (!dateStr) return new Date(0); // 返回 1970-01-01
    try {
        // 处理各种格式
        if (dateStr.includes(' ')) {
            dateStr = dateStr.replace(' ', 'T'); // "2025-10-02 10:00:00" -> "2025-10-02T10:00:00"
        }
        const date = new Date(dateStr);
        return isNaN(date.getTime()) ? new Date(0) : date;
    } catch (e) {
        return new Date(0);
    }
};

testData.forEach(item => {
    const startDate = parseDate(item.start);
    const endDate = parseDate(item.end);
    
    console.log(`\n任务: ${item.name}`);
    console.log(`  解析后开始时间: ${startDate.toString()}`);
    console.log(`  时间戳: ${startDate.getTime()}`);
    console.log(`  格式化: ${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()}`);
    
    console.log(`  解析后结束时间: ${endDate.toString()}`);
    console.log(`  时间戳: ${endDate.getTime()}`);
    console.log(`  格式化: ${endDate.toLocaleDateString()} ${endDate.toLocaleTimeString()}`);
});

console.log("\n=== 改进后的解析逻辑测试 ===");
const parseDateImproved = (dateStr) => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined') {
        return null; // 返回 null 而不是默认日期
    }
    try {
        // 先尝试直接解析
        let date = new Date(dateStr);
        
        // 如果失败，尝试替换空格为 T
        if (isNaN(date.getTime()) && dateStr.includes(' ')) {
            dateStr = dateStr.replace(' ', 'T');
            date = new Date(dateStr);
        }
        
        // 再次检查是否有效
        return isNaN(date.getTime()) ? null : date;
    } catch (e) {
        return null;
    }
};

testData.forEach(item => {
    const startDate = parseDateImproved(item.start);
    const endDate = parseDateImproved(item.end);
    
    console.log(`\n任务: ${item.name}`);
    console.log(`  改进后开始时间: ${startDate ? startDate.toString() : 'null'}`);
    console.log(`  时间戳: ${startDate ? startDate.getTime() : 'null'}`);
    console.log(`  格式化: ${startDate ? startDate.toLocaleDateString() + ' ' + startDate.toLocaleTimeString() : 'null'}`);
    
    console.log(`  改进后结束时间: ${endDate ? endDate.toString() : 'null'}`);
    console.log(`  时间戳: ${endDate ? endDate.getTime() : 'null'}`);
    console.log(`  格式化: ${endDate ? endDate.toLocaleDateString() + ' ' + endDate.toLocaleTimeString() : 'null'}`);
});