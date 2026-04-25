// 文字样式编辑器
const textStyleToolbar = document.getElementById('textStyleToolbar');
const textColorPicker = document.getElementById('textColorPicker');
const fontFamilySelect = document.getElementById('fontFamilySelect');
const fontSizeInput = document.getElementById('fontSizeInput');
const fontWeightSelect = document.getElementById('fontWeightSelect');
const alignButtons = document.querySelectorAll('.align-btn');

let currentEditingElement = null;

// 监听文字元素的选中
function setupTextStyleEditor() {
    const slide = slidePreview.querySelector('.slide');
    if (!slide) return;
    
    const textElements = slide.querySelectorAll('.slide-title, .slide-subtitle, .slide-content');
    
    textElements.forEach(el => {
        // 点击时显示工具栏并加载当前样式
        el.addEventListener('click', (e) => {
            if (!isEditMode) return;
            
            currentEditingElement = el;
            textStyleToolbar.style.display = 'flex';
            loadCurrentStyles(el);
            
            // 添加选中提示
            showTextHint(el, '使用上方工具栏修改样式');
        });
        
        // 失去焦点时隐藏提示
        el.addEventListener('blur', () => {
            hideTextHint(el);
        });
    });
}

// 加载当前元素的样式到工具栏
function loadCurrentStyles(element) {
    const computedStyle = window.getComputedStyle(element);
    
    // 颜色
    const color = rgbToHex(computedStyle.color);
    textColorPicker.value = color;
    
    // 字体
    const fontFamily = computedStyle.fontFamily;
    fontFamilySelect.value = findClosestFontOption(fontFamily);
    
    // 字号（转换为px）
    const fontSize = parseInt(computedStyle.fontSize);
    fontSizeInput.value = fontSize;
    
    // 粗细
    fontWeightSelect.value = computedStyle.fontWeight;
    
    // 对齐
    const textAlign = computedStyle.textAlign || element.style.textAlign || 'left';
    alignButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.align === textAlign);
    });
}

// 颜色选择器
textColorPicker.addEventListener('input', (e) => {
    if (currentEditingElement) {
        currentEditingElement.style.color = e.target.value;
    }
});

// 字体选择
fontFamilySelect.addEventListener('change', (e) => {
    if (currentEditingElement) {
        currentEditingElement.style.fontFamily = e.target.value;
    }
});

// 字号调整
fontSizeInput.addEventListener('input', (e) => {
    if (currentEditingElement) {
        currentEditingElement.style.fontSize = e.target.value + 'px';
    }
});

// 粗细调整
fontWeightSelect.addEventListener('change', (e) => {
    if (currentEditingElement) {
        currentEditingElement.style.fontWeight = e.target.value;
    }
});

// 对齐按钮
alignButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (currentEditingElement) {
            const align = btn.dataset.align;
            currentEditingElement.style.textAlign = align;
            
            alignButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        }
    });
});

// RGB转HEX
function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;
    
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return '#ffffff';
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

// 查找最接近的字体选项
function findClosestFontOption(fontFamily) {
    const options = Array.from(fontFamilySelect.options);
    
    for (let option of options) {
        if (fontFamily.includes(option.value.replace(/['"]/g, ''))) {
            return option.value;
        }
    }
    
    // 默认返回第一个
    return options[0].value;
}

// 显示文字提示
function showTextHint(element, message) {
    hideTextHint(element); // 先移除旧的
    
    const hint = document.createElement('div');
    hint.className = 'text-selected-hint';
    hint.textContent = message;
    element.style.position = 'relative';
    element.appendChild(hint);
    
    setTimeout(() => {
        hint.style.opacity = '0';
        setTimeout(() => hint.remove(), 300);
    }, 2000);
}

// 隐藏文字提示
function hideTextHint(element) {
    const existingHint = element.querySelector('.text-selected-hint');
    if (existingHint) {
        existingHint.remove();
    }
}

// 重置工具栏
function resetTextStyleToolbar() {
    textStyleToolbar.style.display = 'none';
    currentEditingElement = null;
}

// 导出函数供其他模块使用
window.setupTextStyleEditor = setupTextStyleEditor;
window.resetTextStyleToolbar = resetTextStyleToolbar;
