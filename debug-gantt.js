// 调试甘特图数据处理
const mockData = [
    {"taskName": "设计微服务架构图", "startTime": "2025-10-02 10:00:00", "endTime": "2026-03-31 00:00:00", "status": "DONE"},
    {"taskName": "用户服务开发", "startTime": "2025-10-05 09:30:00", "endTime": "2026-03-31 00:00:00", "status": "DOING"},
    {"taskName": "订单服务联调", "startTime": "2025-11-01 14:00:00", "endTime": "2026-03-31 00:00:00", "status": "TODO"},
    {"taskName": "首页UI设计", "startTime": "2025-11-10 09:00:00", "endTime": "2026-03-31 00:00:00", "status": "DONE"},
    {"taskName": "登录模块开发", "startTime": "2025-11-15 11:00:00", "endTime": "2026-03-31 00:00:00", "status": "DOING"},
    {"taskName": "性能压测", "startTime": "2026-01-30 16:00:00", "endTime": "", "status": "TODO"}
];

const parseDate = (dateStr) => {
    if (!dateStr || dateStr === 'null' || dateStr === 'undefined' || dateStr === null || dateStr === '') {
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

const startDates = mockData.map(item => {
    const date = parseDate(item.startTime);
    return date !== null ? date.getTime() : null;
});

const endDates = mockData.map(item => {
    const date = parseDate(item.endTime);
    return date ? date.getTime() : null;
});

const durations = endDates.map((end, index) => {
    const start = startDates[index];
    if (start === null || end === null) {
        return 0;
    }
    const duration = end - start;
    return duration <= 0 ? 0 : duration;
});

console.log("=== 甘特图数据调试 ===");
console.log("任务名称:", mockData.map(item => item.taskName));
console.log("开始时间戳:", startDates);
console.log("结束时间戳:", endDates);
console.log("持续时间(毫秒):", durations);
console.log("持续时间(天):", durations.map(d => Math.floor(d / (1000 * 60 * 60 * 24))));

// 验证ECharts系列数据
const placeholderData = startDates.map(() => 0);
console.log("占位符数据:", placeholderData);
console.log("任务时长数据:", durations);