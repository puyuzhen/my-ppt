// 编辑模式功能
function enableEditMode() {
    const slide = slidePreview.querySelector('.slide');
    if (!slide) return;
    
    isEditMode = true;
    slidePreview.classList.add('edit-mode');
    editModeBtn.classList.add('active');
    editModeBtn.innerHTML = '<span class="edit-icon">✓</span> 编辑中';
    
    // 使所有文字可编辑
    const textElements = slide.querySelectorAll('.slide-title, .slide-subtitle, .slide-content');
    textElements.forEach(el => {
        el.setAttribute('contenteditable', 'true');
    });
    
    // 设置文字样式编辑器
    if (typeof setupTextStyleEditor === 'function') {
        setupTextStyleEditor();
    }
    
    // 显示提示
    showEditHint('双击文字编辑内容，点击文字修改样式');
}

function disableEditMode() {
    const slide = slidePreview.querySelector('.slide');
    if (!slide) return;
    
    isEditMode = false;
    slidePreview.classList.remove('edit-mode');
    editModeBtn.classList.remove('active');
    editModeBtn.innerHTML = '<span class="edit-icon">✏️</span> 编辑模式';
    
    // 禁用编辑
    const textElements = slide.querySelectorAll('.slide-title, .slide-subtitle, .slide-content');
    textElements.forEach(el => {
        el.setAttribute('contenteditable', 'false');
        el.blur();
    });
    
    // 重置工具栏
    if (typeof resetTextStyleToolbar === 'function') {
        resetTextStyleToolbar();
    }
}

function showEditHint(message) {
    let hint = slidePreview.querySelector('.edit-hint');
    if (!hint) {
        hint = document.createElement('div');
        hint.className = 'edit-hint';
        slidePreview.appendChild(hint);
    }
    
    hint.textContent = message;
    hint.classList.add('show');
    
    setTimeout(() => {
        hint.classList.remove('show');
    }, 2000);
}

// 编辑模式按钮
editModeBtn.addEventListener('click', () => {
    if (isEditMode) {
        disableEditMode();
    } else {
        enableEditMode();
    }
});

// 更换底图功能
changeBackgroundBtn.addEventListener('click', async () => {
    const slide = slidePreview.querySelector('.slide');
    if (!slide) return;
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.className = 'background-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>更换底图</h3>
                <button class="modal-close">×</button>
            </div>
            <div class="modal-body">
                <div class="bg-option-group">
                    <label>选择方式</label>
                    <div class="bg-options">
                        <button class="bg-option-btn active" data-type="none">无背景</button>
                        <button class="bg-option-btn" data-type="unsplash">自然风景</button>
                        <button class="bg-option-btn" data-type="ai">AI生成</button>
                        <button class="bg-option-btn" data-type="upload">上传图片</button>
                    </div>
                </div>
                
                <div class="bg-settings" id="unsplashSettings" style="display: none;">
                    <label>图片主题</label>
                    <select id="modalImageTheme">
                        <option value="nature">自然风光</option>
                        <option value="mountain">山脉</option>
                        <option value="ocean">海洋</option>
                        <option value="forest">森林</option>
                        <option value="sunset">日落</option>
                        <option value="sky">天空</option>
                        <option value="landscape">风景</option>
                        <option value="beach">海滩</option>
                    </select>
                </div>
                
                <div class="bg-settings" id="aiSettings" style="display: none;">
                    <label>AI图片描述</label>
                    <input type="text" id="modalAiPrompt" placeholder="描述你想要的背景图片">
                </div>
                
                <div class="bg-settings" id="uploadSettings" style="display: none;">
                    <label>选择图片文件</label>
                    <input type="file" id="modalUploadFile" accept="image/*">
                    <small>支持 JPG, PNG, WebP 格式</small>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-cancel">取消</button>
                <button class="btn-confirm">确认更换</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 模态框交互
    const optionBtns = modal.querySelectorAll('.bg-option-btn');
    const unsplashSettings = modal.querySelector('#unsplashSettings');
    const aiSettings = modal.querySelector('#aiSettings');
    const uploadSettings = modal.querySelector('#uploadSettings');
    
    let selectedType = 'none';
    
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            optionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedType = btn.dataset.type;
            
            unsplashSettings.style.display = 'none';
            aiSettings.style.display = 'none';
            uploadSettings.style.display = 'none';
            
            if (selectedType === 'unsplash') {
                unsplashSettings.style.display = 'block';
            } else if (selectedType === 'ai') {
                aiSettings.style.display = 'block';
            } else if (selectedType === 'upload') {
                uploadSettings.style.display = 'block';
            }
        });
    });
    
    // 关闭模态框
    const closeModal = () => {
        modal.remove();
    };
    
    modal.querySelector('.modal-close').addEventListener('click', closeModal);
    modal.querySelector('.btn-cancel').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // 确认更换
    modal.querySelector('.btn-confirm').addEventListener('click', async () => {
        const confirmBtn = modal.querySelector('.btn-confirm');
        confirmBtn.textContent = '处理中...';
        confirmBtn.disabled = true;
        
        try {
            let newBackgroundUrl = null;
            
            if (selectedType === 'unsplash') {
                const theme = modal.querySelector('#modalImageTheme').value;
                newBackgroundUrl = await getUnsplashImage(theme);
            } else if (selectedType === 'ai') {
                const prompt = modal.querySelector('#modalAiPrompt').value.trim();
                if (!prompt) {
                    alert('请输入AI图片描述');
                    confirmBtn.textContent = '确认更换';
                    confirmBtn.disabled = false;
                    return;
                }
                newBackgroundUrl = await generateAIImage(prompt);
            } else if (selectedType === 'upload') {
                const file = modal.querySelector('#modalUploadFile').files[0];
                if (!file) {
                    alert('请选择图片文件');
                    confirmBtn.textContent = '确认更换';
                    confirmBtn.disabled = false;
                    return;
                }
                newBackgroundUrl = await readFileAsDataURL(file);
            }
            
            // 应用新背景
            if (selectedType === 'none') {
                slide.style.backgroundImage = '';
                slide.classList.remove('unsplash-bg');
                currentBackgroundUrl = null;
            } else if (newBackgroundUrl) {
                slide.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('${newBackgroundUrl}')`;
                slide.style.backgroundSize = 'cover';
                slide.style.backgroundPosition = 'center';
                slide.classList.add('unsplash-bg');
                currentBackgroundUrl = newBackgroundUrl;
            }
            
            closeModal();
            showEditHint('底图已更换');
        } catch (error) {
            console.error('更换底图失败:', error);
            alert('更换底图失败: ' + error.message);
            confirmBtn.textContent = '确认更换';
            confirmBtn.disabled = false;
        }
    });
});

// 读取文件为DataURL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}
