// 获取DOM元素
const titleInput = document.getElementById('titleInput');
const subtitleInput = document.getElementById('subtitleInput');
const contentInput = document.getElementById('contentInput');
const templateSelect = document.getElementById('templateSelect');
const imageSource = document.getElementById('imageSource');
const imageTheme = document.getElementById('imageTheme');
const unsplashThemeGroup = document.getElementById('unsplashThemeGroup');
const aiPromptGroup = document.getElementById('aiPromptGroup');
const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const downloadSvgBtn = document.getElementById('downloadSvgBtn');
const downloadHtmlBtn = document.getElementById('downloadHtmlBtn');
const editModeBtn = document.getElementById('editModeBtn');
const changeBackgroundBtn = document.getElementById('changeBackgroundBtn');
const slidePreview = document.getElementById('slidePreview');

let isEditMode = false;
let currentBackgroundUrl = null;

// 切换图片来源类型
imageSource.addEventListener('change', () => {
    const source = imageSource.value;
    
    if (source === 'unsplash') {
        unsplashThemeGroup.style.display = 'block';
        aiPromptGroup.style.display = 'none';
    } else if (source === 'ai') {
        unsplashThemeGroup.style.display = 'none';
        aiPromptGroup.style.display = 'block';
    } else {
        unsplashThemeGroup.style.display = 'none';
        aiPromptGroup.style.display = 'none';
    }
});

// 获取Unsplash图片（使用Picsum作为替代，更稳定）
async function getUnsplashImage(query) {
    try {
        // 使用Lorem Picsum提供随机高质量图片
        const width = 1920;
        const height = 1080;
        const seed = query + Date.now(); // 使用查询和时间戳作为种子
        const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
        return imageUrl;
    } catch (error) {
        console.error('获取图片失败:', error);
        return null;
    }
}

// AI文生图功能 - 使用多个备用服务
const API_KEY = '12b9c331f7b376f873550b5e34aedc4ac43cb763be346e741cd75176aa31aab5';
const API_BASE_URL = 'https://bytesite.xiaojiaixhs.com';

// 备用方案：使用Pollinations.ai（无CORS限制）
async function generateAIImageFallback(prompt) {
    try {
        console.log('使用备用方案生成图片:', prompt);
        const width = 1792;
        const height = 1024;
        const enhancedPrompt = `${prompt}, high quality, professional, detailed, 4k`;
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&nologo=true&seed=${Date.now()}`;
        
        console.log('生成的图片URL:', imageUrl);
        
        // 预加载图片确保生成完成
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                console.log('图片加载成功');
                resolve(imageUrl);
            };
            img.onerror = () => {
                console.error('图片加载失败');
                reject(new Error('图片加载失败'));
            };
            img.src = imageUrl;
            
            // 30秒超时
            setTimeout(() => {
                reject(new Error('图片生成超时'));
            }, 30000);
        });
    } catch (error) {
        console.error('备用方案失败:', error);
        throw error;
    }
}

async function generateAIImage(prompt) {
    try {
        console.log('开始生成AI图片，提示词:', prompt);
        
        // 方案1：尝试使用即梦API（可能因CORS失败）
        try {
            console.log('尝试使用即梦API...');
            const response = await fetch(`${API_BASE_URL}/v1/images/generations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'image2',
                    prompt: prompt,
                    size: '1792x1024',
                    response_format: 'url'
                }),
                mode: 'cors'
            });

            if (response.ok) {
                const data = await response.json();
                console.log('即梦API返回数据:', data);
                
                if (data.data && data.data.length > 0) {
                    const imageUrl = data.data[0].url || data.data[0];
                    console.log('使用即梦API生成的图片');
                    return imageUrl;
                } else if (data.url) {
                    console.log('使用即梦API生成的图片');
                    return data.url;
                }
            }
        } catch (corsError) {
            console.warn('即梦API失败（可能是CORS问题），切换到备用方案:', corsError.message);
        }
        
        // 方案2：使用备用的免费AI图片生成服务
        console.log('使用备用AI图片生成服务...');
        return await generateAIImageFallback(prompt);
        
    } catch (error) {
        console.error('AI图片生成失败:', error);
        alert(`图片生成失败: ${error.message}\n\n已自动切换到备用服务，请重试`);
        return null;
    }
}

// 生成PPT图片
generateBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    const subtitle = subtitleInput.value.trim();
    const content = contentInput.value.trim();
    const template = templateSelect.value;
    const source = imageSource.value;

    if (!title && !content) {
        alert('请至少输入标题或内容！');
        return;
    }

    // 显示加载状态
    generateBtn.textContent = '⏳ 生成中...';
    generateBtn.disabled = true;

    let backgroundStyle = '';
    let imageUrl = null;
    
    // 根据选择的图片来源生成背景
    if (source !== 'none') {
        try {
            if (source === 'unsplash') {
                // 使用自然风景图片
                const theme = imageTheme.value;
                imageUrl = await getUnsplashImage(theme);
            } else if (source === 'ai') {
                // 使用AI文生图
                const aiPrompt = document.getElementById('aiPrompt').value.trim();
                if (!aiPrompt) {
                    alert('请输入AI图片描述！');
                    generateBtn.textContent = '🎨 生成PPT图片';
                    generateBtn.disabled = false;
                    return;
                }
                
                generateBtn.textContent = '🎨 AI生成图片中（约5-10秒）...';
                imageUrl = await generateAIImage(aiPrompt);
                
                if (!imageUrl) {
                    generateBtn.textContent = '🎨 生成PPT图片';
                    generateBtn.disabled = false;
                    return;
                }
            }
            
            if (imageUrl) {
                backgroundStyle = `
                    background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${imageUrl}');
                    background-size: cover;
                    background-position: center;
                `;
            }
        } catch (error) {
            console.error('获取背景图失败:', error);
            alert('背景图生成失败，将使用默认模板');
        }
    }

    // 生成幻灯片HTML
    const slideHTML = `
        <div class="slide ${source !== 'none' && imageUrl ? 'unsplash-bg' : template}" style="${backgroundStyle}">
            ${title ? `<div class="slide-title">${escapeHtml(title)}</div>` : ''}
            ${subtitle ? `<div class="slide-subtitle">${escapeHtml(subtitle)}</div>` : ''}
            ${content ? `<div class="slide-content">${escapeHtml(content).replace(/\n/g, '<br>')}</div>` : ''}
        </div>
    `;

    slidePreview.innerHTML = slideHTML;
    document.querySelector('.download-buttons').style.display = 'flex';
    editModeBtn.style.display = 'block';
    changeBackgroundBtn.style.display = 'block';
    
    // 保存当前背景URL
    currentBackgroundUrl = imageUrl;
    
    // 自动启用编辑模式
    setTimeout(() => {
        enableEditMode();
    }, 500);

    // 添加生成动画
    slidePreview.style.animation = 'slideIn 0.5s ease-out';

    // 恢复按钮状态
    generateBtn.textContent = '🎨 生成PPT图片';
    generateBtn.disabled = false;
});

// 下载图片
downloadBtn.addEventListener('click', async () => {
    const slide = slidePreview.querySelector('.slide');
    if (!slide) return;

    try {
        downloadBtn.textContent = '⏳ 生成中...';
        downloadBtn.disabled = true;

        // 检查是否有背景图
        const bgImage = slide.style.backgroundImage;
        let canvas;

        if (bgImage && bgImage.includes('url')) {
            // 有背景图的情况，需要特殊处理
            console.log('检测到背景图，使用特殊处理');
            
            // 提取背景图URL
            const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (urlMatch && urlMatch[1]) {
                const imageUrl = urlMatch[1];
                console.log('背景图URL:', imageUrl);
                
                // 创建临时canvas
                const tempCanvas = document.createElement('canvas');
                const ctx = tempCanvas.getContext('2d');
                
                // 设置canvas尺寸
                const width = slide.offsetWidth * 2; // 2倍分辨率
                const height = slide.offsetHeight * 2;
                tempCanvas.width = width;
                tempCanvas.height = height;
                
                // 加载背景图
                const bgImg = new Image();
                bgImg.crossOrigin = 'anonymous';
                
                await new Promise((resolve, reject) => {
                    bgImg.onload = resolve;
                    bgImg.onerror = () => {
                        console.warn('背景图加载失败，使用纯色背景');
                        resolve();
                    };
                    bgImg.src = imageUrl;
                    
                    // 5秒超时
                    setTimeout(() => {
                        console.warn('背景图加载超时');
                        resolve();
                    }, 5000);
                });
                
                // 绘制背景图
                if (bgImg.complete && bgImg.naturalWidth > 0) {
                    ctx.drawImage(bgImg, 0, 0, width, height);
                    
                    // 添加渐变遮罩
                    const gradient = ctx.createLinearGradient(0, 0, 0, height);
                    gradient.addColorStop(0, 'rgba(0,0,0,0.4)');
                    gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, width, height);
                }
                
                // 临时移除背景图样式
                const originalBg = slide.style.backgroundImage;
                slide.style.backgroundImage = 'none';
                
                // 使用html2canvas渲染文字层
                const textCanvas = await html2canvas(slide, {
                    scale: 2,
                    backgroundColor: null,
                    logging: false,
                    useCORS: true,
                    allowTaint: true
                });
                
                // 恢复背景图样式
                slide.style.backgroundImage = originalBg;
                
                // 将文字层绘制到背景上
                ctx.drawImage(textCanvas, 0, 0);
                
                canvas = tempCanvas;
            } else {
                // 无法提取URL，使用普通方式
                canvas = await html2canvas(slide, {
                    scale: 2,
                    backgroundColor: null,
                    logging: false,
                    useCORS: true,
                    allowTaint: true
                });
            }
        } else {
            // 没有背景图，直接使用html2canvas
            canvas = await html2canvas(slide, {
                scale: 2,
                backgroundColor: null,
                logging: false,
                useCORS: true,
                allowTaint: true
            });
        }

        // 转换为图片并下载
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().getTime();
            link.download = `ppt-slide-${timestamp}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);

            downloadBtn.textContent = '💾 下载图片';
            downloadBtn.disabled = false;
        }, 'image/png', 1.0);
    } catch (error) {
        console.error('生成图片失败:', error);
        alert('生成图片失败，请重试！\n\n错误信息: ' + error.message);
        downloadBtn.textContent = '💾 下载图片';
        downloadBtn.disabled = false;
    }
});

// HTML转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// 示例数据（可选）
const examples = [
    {
        title: '创新驱动未来',
        subtitle: '2024年度战略规划',
        content: '• 技术创新是核心竞争力\n• 用户体验至上\n• 持续优化产品服务\n• 打造行业领先品牌',
        template: 'gradient-modern'
    },
    {
        title: '数字化转型',
        subtitle: '拥抱变革，创造价值',
        content: '在数字经济时代，企业需要通过技术创新和业务模式创新，实现全面的数字化转型，提升核心竞争力。',
        template: 'business-pro'
    }
];

// 可以添加快速填充示例的功能
window.fillExample = (index) => {
    const example = examples[index];
    titleInput.value = example.title;
    subtitleInput.value = example.subtitle;
    contentInput.value = example.content;
    templateSelect.value = example.template;
};
