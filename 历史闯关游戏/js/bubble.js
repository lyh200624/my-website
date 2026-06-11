// ==================== 气泡导图主逻辑 ====================

const BubbleState = {
    currentIndex: 0,
    bubbles: [],
    visibleTypes: ['bgd', 'figures', 'measures', 'impact'],
    expandedBubbles: {},
    mobileDetailType: null,
    isAnimating: false,
    animationTimer: null,
    stepIndex: 0,
    isInitialized: false
};

// ==================== 初始化 ====================
function initBubble() {
    if (!document.getElementById('bubble-view')) return;
    
    if (!BubbleState.isInitialized) {
        loadBubbleData(0);
        renderBubbles();
        setupBubbleEventListeners();
        BubbleState.isInitialized = true;
    } else {
        loadBubbleData(BubbleState.currentIndex);
        renderBubbles();
    }
}

// ==================== 加载数据 ====================
function loadBubbleData(index) {
    BubbleState.currentIndex = index;
    BubbleState.bubbles = BUBBLE_DATA[index];
    BubbleState.stepIndex = 0;
    BubbleState.isAnimating = false;
    BubbleState.visibleTypes = ['bgd', 'figures', 'measures', 'impact'];
    if (index >= 2) {
        BubbleState.visibleTypes.push('limit');
    }
    BubbleState.expandedBubbles = {};
    BubbleState.mobileDetailType = null;
    hideMobileBubbleDetail();
    updateSelectorButtons(index);
    updateSidebarButtons(index);
    updateMobileSelectButtons(index);
}

// ==================== 更新按钮状态 ====================
function updateSelectorButtons(activeIndex) {
    document.querySelectorAll('.selector-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === activeIndex);
    });
}

function updateSidebarButtons(activeIndex) {
    document.querySelectorAll('.sidebar-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === activeIndex);
    });
}

function updateMobileSelectButtons(activeIndex) {
    document.querySelectorAll('.mobile-select-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === activeIndex);
    });
}

// ==================== 事件监听 ====================
function setupBubbleEventListeners() {
    const bubbleView = document.getElementById('bubble-view');
    if (!bubbleView) return;
    
    bubbleView.addEventListener('click', function(e) {
        const target = e.target;
        
        if (target.closest('.bubble-mobile-detail-close')) {
            hideMobileBubbleDetail();
        } else if (target.closest('#bubble-back-menu')) {
            exitBubble();
        } else if (target.closest('#bubble-reset')) {
            resetBubble();
        } else if (target.closest('#bubble-animate')) {
            toggleAnimation();
        } else if (target.closest('#bubble-help-btn')) {
            document.getElementById('bubble-help-modal').classList.remove('hidden');
        } else if (target.closest('#bubble-help-close')) {
            document.getElementById('bubble-help-modal').classList.add('hidden');
        } else if (target.closest('#sidebar-toggle')) {
            // 切换侧边栏
            const sidebar = document.getElementById('bubble-sidebar');
            const canvas = document.getElementById('bubble-canvas');
            sidebar.classList.toggle('expanded');
            if (sidebar.classList.contains('expanded')) {
                canvas.style.left = '180px';
            } else {
                canvas.style.left = '60px';
            }
        } else if (target.closest('.sidebar-btn')) {
            const btn = target.closest('.sidebar-btn');
            const idx = parseInt(btn.dataset.index);
            if (!isNaN(idx)) {
                stopAnimation();
                hideMobileBubbleDetail();
                loadBubbleData(idx);
                renderBubbles();
                updateSidebarButtons(idx);
            }
        } else if (target.closest('.mobile-select-btn')) {
            const btn = target.closest('.mobile-select-btn');
            const idx = parseInt(btn.dataset.index);
            if (!isNaN(idx)) {
                stopAnimation();
                hideMobileBubbleDetail();
                loadBubbleData(idx);
                renderBubbles();
            }
        } else if (target.closest('#step-by-step')) {
            stepByStep();
        } else if (target.closest('#show-all')) {
            showAllBubbles();
        } else if (target.closest('#hide-all')) {
            hideAllBubbles();
        } else if (target.closest('.outer-bubble')) {
            const bubbleEl = target.closest('.outer-bubble');
            const type = bubbleEl.dataset.type;
            if (!type) return;

            if (isMobileBubble()) {
                if (target.closest('.bubble-close-btn') && BubbleState.mobileDetailType === type) {
                    hideMobileBubbleDetail();
                } else {
                    showMobileBubbleDetail(type);
                }
            } else {
                toggleBubbleExpand(type, bubbleEl);
            }
        } else if (target.closest('.bubble-canvas') && !target.closest('.outer-bubble')) {
            // 手机端点击空白处关闭所有展开的气泡
            if (window.innerWidth <= 768) {
                collapseAllBubbles();
                hideMobileBubbleDetail();
            }
        } else if (target.closest('#bubble-backdrop')) {
            // 点击遮罩关闭气泡
            collapseAllBubbles();
            hideMobileBubbleDetail();
        }
    });
    
    const helpModal = document.getElementById('bubble-help-modal');
    if (helpModal) {
        helpModal.addEventListener('click', function(e) {
            if (e.target === helpModal) helpModal.classList.add('hidden');
        });
    }
}

// ==================== 渲染气泡 ====================
function renderBubbles() {
    const data = BubbleState.bubbles;
    if (!data) return;
    
    const titleEl = document.getElementById('bubble-title');
    const eraEl = document.getElementById('bubble-era');
    if (titleEl) titleEl.textContent = data.name;
    if (eraEl) eraEl.textContent = data.era + ' · ' + data.year;
    
    const outerBubbles = document.getElementById('outer-bubbles');
    if (!outerBubbles) return;
    outerBubbles.innerHTML = '';
    
    const visibleBubbles = data.bubbles.filter(b => BubbleState.visibleTypes.includes(b.type));
    const positions = calculateBubblePositions(visibleBubbles.length);
    
    visibleBubbles.forEach((bubble, index) => {
        const bubbleEl = createBubbleElement(bubble, positions[index], index);
        outerBubbles.appendChild(bubbleEl);
    });
    
    renderBubbleLines(visibleBubbles, positions);
}

// ==================== 计算气泡位置（优化版） ====================
function calculateBubblePositions(count) {
    const positions = [];
    const canvas = document.getElementById('bubble-canvas');
    if (!canvas) return positions;
    
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // 根据气泡数量和屏幕大小计算合适的半径
    let radiusX, radiusY;
    const minDim = Math.min(rect.width, rect.height);
    
    if (count <= 4) {
        radiusX = minDim * 0.35;
        radiusY = minDim * 0.30;
    } else if (count === 5) {
        radiusX = minDim * 0.38;
        radiusY = minDim * 0.32;
    } else {
        radiusX = minDim * 0.40;
        radiusY = minDim * 0.35;
    }
    
    // 起始角度 - 第一个气泡在正上方
    const startAngle = -Math.PI / 2;
    const angleStep = (2 * Math.PI) / count;
    
    for (let i = 0; i < count; i++) {
        const angle = startAngle + i * angleStep;
        positions.push({
            x: centerX + radiusX * Math.cos(angle),
            y: centerY + radiusY * Math.sin(angle)
        });
    }
    
    return positions;
}

// ==================== 创建气泡元素 ====================
function createBubbleElement(bubble, position, index) {
    const el = document.createElement('div');
    el.className = 'outer-bubble';
    el.dataset.type = bubble.type;
    el.dataset.index = index;
    
    const isExpanded = BubbleState.expandedBubbles[bubble.type] || false;
    if (BubbleState.mobileDetailType === bubble.type) {
        el.classList.add('is-selected');
    }
    
    el.innerHTML = `
        <div class="bubble-header" style="border-color: ${bubble.color}; background: ${bubble.color}15;">
            <span class="bubble-icon">${bubble.icon}</span>
            <span class="bubble-title">${bubble.title}</span>
            <span class="bubble-toggle">${isExpanded ? 'v' : '>'}</span>
            <button class="bubble-close-btn">×</button>
        </div>
        <div class="bubble-body ${isExpanded ? 'show' : ''}">
            <ul class="bubble-items">
                ${bubble.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    `;
    
    el.style.left = position.x + 'px';
    el.style.top = position.y + 'px';
    el.style.animationDelay = (index * 0.1) + 's';
    
    return el;
}

// ==================== 渲染连接线 ====================
function renderBubbleLines(bubbles, positions) {
    const linesSvg = document.getElementById('bubble-lines');
    if (!linesSvg) return;
    
    linesSvg.innerHTML = '';
    
    const canvas = document.getElementById('bubble-canvas');
    const centerX = canvas ? canvas.offsetWidth / 2 : 400;
    const centerY = canvas ? canvas.offsetHeight / 2 : 300;
    
    bubbles.forEach((bubble, index) => {
        const pos = positions[index];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', centerX);
        line.setAttribute('y1', centerY);
        line.setAttribute('x2', pos.x);
        line.setAttribute('y2', pos.y);
        line.setAttribute('stroke', bubble.color);
        line.setAttribute('stroke-width', '3');
        line.setAttribute('stroke-opacity', '0.5');
        linesSvg.appendChild(line);
    });
}

// ==================== 展开/收起气泡 ====================
function isMobileBubble() {
    return window.innerWidth <= 768;
}

function getCurrentBubbleByType(type) {
    const data = BubbleState.bubbles;
    if (!data || !Array.isArray(data.bubbles)) return null;
    return data.bubbles.find(bubble => bubble.type === type) || null;
}

function showMobileBubbleDetail(type) {
    const bubble = getCurrentBubbleByType(type);
    const bubbleView = document.getElementById('bubble-view');
    if (!bubble || !bubbleView) return;

    BubbleState.mobileDetailType = type;
    document.querySelectorAll('.outer-bubble').forEach(el => {
        el.classList.toggle('is-selected', el.dataset.type === type);
        el.classList.remove('expanded');
        const body = el.querySelector('.bubble-body');
        if (body) body.classList.remove('show');
    });

    let detail = document.getElementById('bubble-mobile-detail');
    if (!detail) {
        detail = document.createElement('section');
        detail.id = 'bubble-mobile-detail';
        detail.className = 'bubble-mobile-detail';
        detail.setAttribute('aria-live', 'polite');
        bubbleView.appendChild(detail);
    }

    detail.innerHTML = `
        <div class="bubble-mobile-detail-head" style="border-color: ${bubble.color};">
            <span class="bubble-mobile-detail-icon">${bubble.icon}</span>
            <h3>${escapeHtml(bubble.title)}</h3>
            <button type="button" class="bubble-mobile-detail-close" aria-label="关闭详情">×</button>
        </div>
        <div class="bubble-mobile-detail-body">
            <ul>
                ${bubble.items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
        </div>
    `;

    bubbleView.classList.add('has-mobile-detail');
    const backdrop = document.getElementById('bubble-backdrop');
    if (backdrop) backdrop.classList.remove('show');
}

function hideMobileBubbleDetail() {
    BubbleState.mobileDetailType = null;
    const detail = document.getElementById('bubble-mobile-detail');
    const bubbleView = document.getElementById('bubble-view');
    if (detail) detail.remove();
    if (bubbleView) bubbleView.classList.remove('has-mobile-detail');
    document.querySelectorAll('.outer-bubble.is-selected').forEach(el => el.classList.remove('is-selected'));
    const backdrop = document.getElementById('bubble-backdrop');
    if (backdrop) backdrop.classList.remove('show');
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

function toggleBubbleExpand(type, element) {
    const currentState = BubbleState.expandedBubbles[type] || false;
    BubbleState.expandedBubbles[type] = !currentState;
    
    const body = element.querySelector('.bubble-body');
    const toggle = element.querySelector('.bubble-toggle');

    if (isMobileBubble()) {
        if (BubbleState.expandedBubbles[type]) {
            showMobileBubbleDetail(type);
        } else {
            hideMobileBubbleDetail();
        }
        BubbleState.expandedBubbles[type] = false;
        if (body) body.classList.remove('show');
        if (toggle) toggle.textContent = '>';
        element.classList.remove('expanded');
        return;
    }
    
    if (BubbleState.expandedBubbles[type]) {
        body.classList.add('show');
        if (toggle) toggle.textContent = '▼';
        element.classList.add('expanded');
        if (window.innerWidth <= 768) {
            document.getElementById('bubble-backdrop').classList.add('show');
        }
    } else {
        body.classList.remove('show');
        if (toggle) toggle.textContent = '▶';
        element.classList.remove('expanded');
        if (window.innerWidth <= 768) {
            document.getElementById('bubble-backdrop').classList.remove('show');
        }
    }
}

// ==================== 全部显示/隐藏 ====================
function showAllBubbles() {
    const data = BubbleState.bubbles;
    if (!data) return;

    if (isMobileBubble()) {
        data.bubbles.forEach(bubble => {
            if (!BubbleState.visibleTypes.includes(bubble.type)) {
                BubbleState.visibleTypes.push(bubble.type);
            }
            BubbleState.expandedBubbles[bubble.type] = false;
        });
        hideMobileBubbleDetail();
        renderBubbles();
        showBubbleHint('已显示全部板块');
        return;
    }
    
    data.bubbles.forEach(bubble => {
        if (!BubbleState.visibleTypes.includes(bubble.type)) {
            BubbleState.visibleTypes.push(bubble.type);
        }
        BubbleState.expandedBubbles[bubble.type] = true;
    });
    
    renderBubbles();
    showBubbleHint('已全部展开');
}

function hideAllBubbles() {
    hideMobileBubbleDetail();
    Object.keys(BubbleState.expandedBubbles).forEach(key => {
        BubbleState.expandedBubbles[key] = false;
    });
    renderBubbles();
    showBubbleHint('已全部收起');
}

function collapseAllBubbles() {
    hideMobileBubbleDetail();
    Object.keys(BubbleState.expandedBubbles).forEach(key => {
        BubbleState.expandedBubbles[key] = false;
    });
    renderBubbles();
    if (window.innerWidth <= 768) {
        document.getElementById('bubble-backdrop').classList.remove('show');
    }
}

// ==================== 动画控制 ====================
function toggleAnimation() {
    if (BubbleState.isAnimating) {
        stopAnimation();
    } else {
        startAnimation();
    }
}

function startAnimation() {
    BubbleState.isAnimating = true;
    hideMobileBubbleDetail();
    const animateBtn = document.getElementById('bubble-animate');
    if (animateBtn) animateBtn.innerHTML = '⏸';
    
    Object.keys(BubbleState.expandedBubbles).forEach(key => {
        BubbleState.expandedBubbles[key] = false;
    });
    BubbleState.stepIndex = 0;
    renderBubbles();
    
    setTimeout(function() {
        stepByStepShow();
    }, 500);
}

function stopAnimation() {
    BubbleState.isAnimating = false;
    hideMobileBubbleDetail();
    if (BubbleState.animationTimer) {
        clearTimeout(BubbleState.animationTimer);
        BubbleState.animationTimer = null;
    }
    const animateBtn = document.getElementById('bubble-animate');
    if (animateBtn) animateBtn.innerHTML = '▶';
}

function stepByStep() {
    hideMobileBubbleDetail();
    Object.keys(BubbleState.expandedBubbles).forEach(key => {
        BubbleState.expandedBubbles[key] = false;
    });
    BubbleState.stepIndex = 0;
    BubbleState.isAnimating = true;
    
    const animateBtn = document.getElementById('bubble-animate');
    if (animateBtn) animateBtn.innerHTML = '⏸';
    
    renderBubbles();
    setTimeout(function() {
        stepByStepShow();
    }, 300);
}

function stepByStepShow() {
    if (!BubbleState.isAnimating) return;
    
    const data = BubbleState.bubbles;
    if (!data) return;
    
    const visibleBubbles = data.bubbles.filter(b => BubbleState.visibleTypes.includes(b.type));
    
    if (BubbleState.stepIndex < visibleBubbles.length) {
        const bubble = visibleBubbles[BubbleState.stepIndex];

        if (isMobileBubble()) {
            showMobileBubbleDetail(bubble.type);
            BubbleState.stepIndex++;
            BubbleState.animationTimer = setTimeout(function() {
                stepByStepShow();
            }, 2000);
            return;
        }

        BubbleState.expandedBubbles[bubble.type] = true;
        
        const bubbleEl = document.querySelector('.outer-bubble[data-type="' + bubble.type + '"]');
        if (bubbleEl) {
            const body = bubbleEl.querySelector('.bubble-body');
            const toggle = bubbleEl.querySelector('.bubble-toggle');
            if (body) body.classList.add('show');
            if (toggle) toggle.textContent = '▼';
            bubbleEl.classList.add('expanded');
        }
        
        BubbleState.stepIndex++;
        BubbleState.animationTimer = setTimeout(function() {
            stepByStepShow();
        }, 2000);
    } else {
        stopAnimation();
        showBubbleHint('展示完毕');
    }
}

// ==================== 重置 ====================
function resetBubble() {
    stopAnimation();
    hideMobileBubbleDetail();
    loadBubbleData(BubbleState.currentIndex);
    renderBubbles();
    showBubbleHint('已重置');
}

function showBubbleHint(text) {
    const hintToast = document.getElementById('bubble-hint-toast');
    const hintText = document.getElementById('bubble-hint-text');
    if (!hintToast || !hintText) return;
    
    hintText.textContent = text;
    hintToast.classList.add('show');
    
    setTimeout(function() {
        hintToast.classList.remove('show');
    }, 2500);
}

function exitBubble() {
    stopAnimation();
    hideMobileBubbleDetail();
    const bubbleView = document.getElementById('bubble-view');
    const splashScreen = document.getElementById('splash-screen');
    if (bubbleView) bubbleView.classList.add('hidden');
    if (splashScreen) splashScreen.classList.remove('hidden');
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        if (document.getElementById('bubble-view')) {
            initBubble();
        }
    }, 100);
});

window.addEventListener('resize', function() {
    const bubbleView = document.getElementById('bubble-view');
    if (bubbleView && !bubbleView.classList.contains('hidden')) {
        if (!isMobileBubble()) {
            hideMobileBubbleDetail();
        }
        renderBubbles();
    }
});

// ==================== 暴露全局函数 ====================
window.exitBubble = exitBubble;
window.initBubble = initBubble;

