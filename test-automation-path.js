// test-automation-path.js - 测试脚本
const path = require('path');
const fs = require('fs');

console.log('=== 测试 Automation 路径配置 ===\n');

// 1. 检查当前工作目录
console.log('1. 当前工作目录:');
console.log('   __dirname:', __dirname);
console.log('   process.cwd():', process.cwd());

// 2. 计算 automation 路径
const automationPath = path.join(__dirname, '../electron_browser/automation');
console.log('\n2. Automation 路径:');
console.log('   计算路径:', automationPath);
console.log('   绝对路径:', path.resolve(automationPath));

// 3. 检查路径是否存在
console.log('\n3. 路径检查:');
console.log('   automation 目录存在:', fs.existsSync(automationPath) ? '✅' : '❌');

if (fs.existsSync(automationPath)) {
    const cliPath = path.join(automationPath, 'cli/automation-cli.js');
    console.log('   CLI 文件存在:', fs.existsSync(cliPath) ? '✅' : '❌');
    console.log('   CLI 路径:', cliPath);

    // 列出 automation 目录内容
    console.log('\n4. Automation 目录内容:');
    try {
        const contents = fs.readdirSync(automationPath);
        contents.forEach(item => {
            const itemPath = path.join(automationPath, item);
            const isDir = fs.statSync(itemPath).isDirectory();
            console.log(`   ${isDir ? '📁' : '📄'} ${item}`);
        });
    } catch (error) {
        console.log('   无法读取目录:', error.message);
    }

    // 检查 CLI 目录
    const cliDir = path.join(automationPath, 'cli');
    if (fs.existsSync(cliDir)) {
        console.log('\n5. CLI 目录内容:');
        const cliContents = fs.readdirSync(cliDir);
        cliContents.forEach(item => {
            console.log(`   📄 ${item}`);
        });
    }
} else {
    console.log('\n❌ Automation 目录不存在!');
    console.log('\n可能的解决方案:');
    console.log('1. 检查项目结构，确保 automation 目录在正确位置');
    console.log('2. 修改 server.js 中的路径配置');
    console.log('3. 确保从正确的目录启动 server.js');
}

// 4. 检查相对路径的其他可能性
console.log('\n6. 其他可能的路径:');
const possiblePaths = [
    '../automation',
    './automation',
    '../../automation',
    '../electron_browser/automation',
    '../../electron_browser/automation'
];

possiblePaths.forEach(relativePath => {
    const fullPath = path.resolve(__dirname, relativePath);
    const exists = fs.existsSync(fullPath);
    console.log(`   ${exists ? '✅' : '❌'} ${relativePath} -> ${fullPath}`);
});

console.log('\n=== 测试完成 ===');

// 导出路径信息供其他模块使用
module.exports = {
    automationPath,
    exists: fs.existsSync(automationPath)
};