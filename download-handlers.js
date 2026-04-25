// 下载SVG矢量图（可编辑）
downloadSvgBtn.addEventListener('click', async () => {
    const slide = slidePreview.querySelector('.slide');
    if (!slide) return;

    try {
        downloadSvgBtn.textContent = '生成中...';
        downloadSvgBtn.disabled = true;

        // 获取幻灯片的样式和内容
        const title = slide.querySelector('.slide-title')?.textContent || '';
        const subtitle = slide.querySelector('.slide-subtitle')?.textContent || '';
        const content = slide.querySelector('.slide-content')?.innerHTML || '';
        
        // 获取计算后的样式
        const slideStyle = window.getComputedStyle(slide);
        const titleEl = slide.querySelector('.slide-title');
        const subtitleEl = slide.querySelector('.slide-subtitle');
        const contentEl = slide.querySelector('.slide-content');
        
        const width = 1920;
        const height = 1080;
        
        // 创建SVG
        let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&amp;display=swap');
            text { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; }
        </style>
    </defs>
    
    <!-- 背景 -->
    <rect width="${width}" height="${height}" fill="${slideStyle.background || slideStyle.backgroundColor}"/>
    
    <!-- 背景图片 -->`;

        // 如果有背景图
        const bgImage = slide.style.backgroundImage;
        if (bgImage && bgImage.includes('url')) {
            const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (urlMatch && urlMatch[1]) {
                svgContent += `
    <image href="${urlMatch[1]}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid slice"/>
    <rect width="${width}" height="${height}" fill="rgba(0,0,0,0.4)"/>`;
            }
        }

        let yPos = 400; // 起始Y位置

        // 添加标题
        if (titleEl) {
            const titleStyle = window.getComputedStyle(titleEl);
            const fontSize = parseInt(titleStyle.fontSize) * 1.5; // 转换为SVG尺寸
            svgContent += `
    <text x="150" y="${yPos}" 
          font-size="${fontSize}" 
          font-weight="${titleStyle.fontWeight}" 
          fill="${titleStyle.color}"
          letter-spacing="${titleStyle.letterSpacing}"
          text-transform="${titleStyle.textTransform}">
        ${escapeXml(title)}
    </text>`;
            yPos += fontSize + 40;
        }

        // 添加副标题
        if (subtitleEl) {
            const subtitleStyle = window.getComputedStyle(subtitleEl);
            const fontSize = parseInt(subtitleStyle.fontSize) * 1.5;
            svgContent += `
    <text x="150" y="${yPos}" 
          font-size="${fontSize}" 
          font-weight="${subtitleStyle.fontWeight}" 
          fill="${subtitleStyle.color}"
          opacity="${subtitleStyle.opacity}"
          letter-spacing="${subtitleStyle.letterSpacing}">
        ${escapeXml(subtitle)}
    </text>`;
            yPos += fontSize + 60;
        }

        // 添加正文（分行处理）
        if (contentEl) {
            const contentStyle = window.getComputedStyle(contentEl);
            const fontSize = parseInt(contentStyle.fontSize) * 1.5;
            const lineHeight = fontSize * 1.5;
            const lines = content.replace(/<br>/g, '\n').split('\n');
            
            lines.forEach((line, index) => {
                if (line.trim()) {
                    svgContent += `
    <text x="150" y="${yPos + (index * lineHeight)}" 
          font-size="${fontSize}" 
          font-weight="${contentStyle.fontWeight}" 
          fill="${contentStyle.color}"
          opacity="${contentStyle.opacity}">
        ${escapeXml(line.trim())}
    </text>`;
                }
            });
        }

        svgContent += `
</svg>`;

        // 下载SVG
        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().getTime();
        link.download = `ppt-slide-${timestamp}.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        downloadSvgBtn.textContent = '下载矢量图 (SVG)';
        downloadSvgBtn.disabled = false;
    } catch (error) {
        console.error('生成SVG失败:', error);
        alert('生成SVG失败: ' + error.message);
        downloadSvgBtn.textContent = '下载矢量图 (SVG)';
        downloadSvgBtn.disabled = false;
    }
});

// 下载HTML可编辑版
downloadHtmlBtn.addEventListener('click', () => {
    const slide = slidePreview.querySelector('.slide');
    if (!slide) return;

    try {
        downloadHtmlBtn.textContent = '生成中...';
        downloadHtmlBtn.disabled = true;

        // 获取完整的样式
        const slideClone = slide.cloneNode(true);
        const slideHTML = slideClone.outerHTML;
        
        // 创建完整的HTML文档
        const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>可编辑PPT - 双击文字即可编辑</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Helvetica Neue', Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif;
            background: #1a1a1a;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 40px;
        }
        
        .container {
            width: 1920px;
            height: 1080px;
            max-width: 100%;
            max-height: 90vh;
            box-shadow: 0 10px 50px rgba(0,0,0,0.5);
        }
        
        ${getSlideStyles()}
        
        /* 可编辑样式 */
        [contenteditable="true"] {
            outline: 2px dashed transparent;
            transition: outline 0.2s;
            cursor: text;
        }
        
        [contenteditable="true"]:hover {
            outline-color: rgba(255,255,255,0.3);
        }
        
        [contenteditable="true"]:focus {
            outline-color: rgba(255,255,255,0.6);
        }
        
        .edit-hint {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div class="edit-hint">💡 双击任意文字即可编辑</div>
    <div class="container">
        ${slideHTML}
    </div>
    
    <script>
        // 使所有文字可编辑
        document.addEventListener('DOMContentLoaded', () => {
            const slide = document.querySelector('.slide');
            const textElements = slide.querySelectorAll('.slide-title, .slide-subtitle, .slide-content');
            
            textElements.forEach(el => {
                el.setAttribute('contenteditable', 'true');
                el.addEventListener('dblclick', () => {
                    el.focus();
                });
            });
            
            // 3秒后隐藏提示
            setTimeout(() => {
                document.querySelector('.edit-hint').style.opacity = '0';
                setTimeout(() => {
                    document.querySelector('.edit-hint').remove();
                }, 300);
            }, 3000);
        });
    </script>
</body>
</html>`;

        // 下载HTML
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const timestamp = new Date().getTime();
        link.download = `ppt-slide-editable-${timestamp}.html`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        downloadHtmlBtn.textContent = '下载可编辑版 (HTML)';
        downloadHtmlBtn.disabled = false;
    } catch (error) {
        console.error('生成HTML失败:', error);
        alert('生成HTML失败: ' + error.message);
        downloadHtmlBtn.textContent = '下载可编辑版 (HTML)';
        downloadHtmlBtn.disabled = false;
    }
});

// 辅助函数：获取所有幻灯片样式
function getSlideStyles() {
    // 从style.css中提取幻灯片相关样式
    const styleSheets = document.styleSheets;
    let styles = '';
    
    for (let sheet of styleSheets) {
        try {
            const rules = sheet.cssRules || sheet.rules;
            for (let rule of rules) {
                if (rule.selectorText && rule.selectorText.includes('.slide')) {
                    styles += rule.cssText + '\n';
                }
            }
        } catch (e) {
            // 跨域样式表可能无法访问
        }
    }
    
    return styles;
}

// XML转义函数
function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}
