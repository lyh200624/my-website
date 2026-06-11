// ==================== 图文史料主逻辑 ====================

let currentReformFilter = 'all';
let currentCardIndex = 0;
let isCardModalOpen = false;
let activeDocumentData = Array.isArray(DOCUMENT_DATA) ? [...DOCUMENT_DATA] : [];
let activeDocumentByReform = buildDocumentByReform(activeDocumentData);

// 初始化图文史料模块
function initDocument() {
    setupDocumentEventListeners();
    loadDocumentsFromBackend();
    renderDocumentGallery();
}

async function loadDocumentsFromBackend() {
    try {
        const base = typeof API_BASE !== 'undefined' ? API_BASE : (
            window.location.protocol === 'file:' ||
            (['localhost', '127.0.0.1', '::1'].includes(window.location.hostname) && window.location.port !== '3000')
                ? 'http://localhost:3000'
                : ''
        );
        const response = await fetch(`${base}/api/documents`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (Array.isArray(data.documents)) {
            activeDocumentData = data.documents;
            activeDocumentByReform = buildDocumentByReform(activeDocumentData);
            renderDocumentGallery();
        }
    } catch (error) {
        console.warn('Using local documentData.js because backend documents failed:', error);
    }
}

function buildDocumentByReform(documents) {
    return documents.reduce((groups, doc) => {
        if (!groups[doc.reformId]) groups[doc.reformId] = [];
        groups[doc.reformId].push(doc);
        return groups;
    }, {});
}

// 设置事件监听
function setupDocumentEventListeners() {
    // 返回按钮
    document.getElementById('doc-back-menu')?.addEventListener('click', backToMenuFromDocument);
    
    // 帮助按钮
    document.getElementById('doc-help-btn')?.addEventListener('click', showDocHelp);
    document.getElementById('doc-help-close')?.addEventListener('click', hideDocHelp);
    
    // 筛选按钮
    document.querySelectorAll('.doc-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const reform = btn.dataset.reform;
            filterByReform(reform);
        });
    });
    
    // 关闭弹窗
    document.getElementById('doc-card-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'doc-card-modal') {
            closeCardModal();
        }
    });
}

// 渲染图文史料画廊
function renderDocumentGallery() {
    const container = document.getElementById('doc-gallery');
    if (!container) return;

    let documents = activeDocumentData;
    if (currentReformFilter !== 'all') {
        documents = activeDocumentByReform[currentReformFilter] || [];
    }

    // 排序：有图片的排在前面，无图片的排在后面
    documents = [...documents].sort((a, b) => {
        const aHasImage = (a.image && a.image.trim() !== '') || (Array.isArray(a.images) && a.images.length > 0);
        const bHasImage = (b.image && b.image.trim() !== '') || (Array.isArray(b.images) && b.images.length > 0);
        if (aHasImage && !bHasImage) return -1;
        if (!aHasImage && bHasImage) return 1;
        return 0;
    });

    if (documents.length === 0) {
        container.innerHTML = '<p class="doc-empty">暂无史料数据</p>';
        return;
    }

    container.innerHTML = documents.map((doc, index) => {
        const hasImage = doc.image && doc.image.trim() !== '';
        const hasMultipleImages = Array.isArray(doc.images) && doc.images.length > 0;
        return `
        <div class="doc-card ${hasImage || hasMultipleImages ? '' : 'doc-card-no-image'}" data-index="${index}" data-id="${doc.id}">
            ${hasMultipleImages ? `
            <div class="doc-card-image doc-card-multi-image">
                <div class="multi-image-grid">
                    ${doc.images.map((img) => `<img src="${img}" alt="${doc.title}" onerror="this.style.display='none'">`).join('')}
                </div>
                <div class="doc-card-overlay">
                    <span class="doc-view-icon">🔍</span>
                    <span>点击查看详情</span>
                </div>
            </div>
            ` : hasImage ? `
            <div class="doc-card-image">
                <img src="${doc.image}" alt="${doc.title}" onerror="this.src='https://via.placeholder.com/400x300?text=图片加载失败'">
                <div class="doc-card-overlay">
                    <span class="doc-view-icon">🔍</span>
                    <span>点击查看详情</span>
                </div>
            </div>
            ` : ''}
            <div class="doc-card-info">
                <span class="doc-card-reform">${doc.reform}</span>
                <h3 class="doc-card-title">${doc.title}</h3>
                <p class="doc-card-excerpt">${doc.originalText.substring(0, 60)}${doc.originalText.length > 60 ? '...' : ''}</p>
            </div>
        </div>
    `}).join('');
    
    // 添加点击事件
    container.querySelectorAll('.doc-card').forEach(card => {
        card.addEventListener('click', () => {
            const index = parseInt(card.dataset.index);
            openCardModal(index, documents);
        });
    });
}

// 按变法筛选
function filterByReform(reform) {
    currentReformFilter = reform;
    
    // 更新按钮状态
    document.querySelectorAll('.doc-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.reform === reform);
    });
    
    // 重新渲染
    renderDocumentGallery();
}

// 打开史料卡片弹窗
function openCardModal(index, documents) {
    const doc = documents[index];
    if (!doc) return;
    
    currentCardIndex = index;
    isCardModalOpen = true;
    
    const modal = document.getElementById('doc-card-modal');
    const content = document.getElementById('doc-card-content');
    
    if (!modal || !content) return;
    
    const hasImage = doc.image && doc.image.trim() !== '';
    const hasMultipleImages = Array.isArray(doc.images) && doc.images.length > 0;
    const hasAnyImage = hasImage || hasMultipleImages;
    
    let imageHtml = '';
    if (hasMultipleImages) {
        imageHtml = `
        <div class="doc-modal-image doc-modal-multi-image">
            ${doc.images.map((img, i) => `
                <div class="modal-image-item">
                    <img src="${img}" alt="${doc.title}" class="modal-multi-img">
                    <div class="modal-image-caption">图${i + 1}</div>
                </div>
            `).join('')}
        </div>
        `;
    } else if (hasImage) {
        imageHtml = `
        <div class="doc-modal-image">
            <img src="${doc.image}" alt="${doc.title}" id="doc-modal-img">
        </div>
        `;
    }
    
    content.innerHTML = `
        <button class="doc-modal-close" id="doc-modal-close">×</button>
        
        <!-- 图片区域 -->
        ${imageHtml}
        
        <!-- 文字内容区域 -->
        <div class="doc-modal-text ${hasAnyImage ? '' : 'doc-modal-text-full'}">
            <!-- 标题头 -->
            <div class="doc-modal-header">
                <span class="doc-modal-reform">${doc.reform}</span>
                <h2 class="doc-modal-title">${doc.title}</h2>
            </div>
            
            <!-- 内容主体 -->
            <div class="doc-modal-body">
                <!-- 原文史料卡片 -->
                <div class="doc-card doc-original-card">
                    <div class="doc-card-header">
                        <span class="doc-section-icon">📜</span>
                        <h3 class="doc-card-title">原文史料</h3>
                    </div>
                    <div class="doc-card-content">
                        <p class="doc-original-text">${doc.originalText}</p>
                    </div>
                </div>
                
                <!-- 白话注解卡片 -->
                <div class="doc-card doc-annotation-card">
                    <div class="doc-card-header">
                        <span class="doc-section-icon">💬</span>
                        <h3 class="doc-card-title">白话注解</h3>
                    </div>
                    <div class="doc-card-content">
                        <p class="doc-annotation-text">${doc.annotation.replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 导航按钮 -->
        <button class="doc-modal-nav doc-modal-prev" id="doc-modal-prev">‹</button>
        <button class="doc-modal-nav doc-modal-next" id="doc-modal-next">›</button>
        <div class="doc-modal-counter">${index + 1} / ${documents.length}</div>
    `;
    
    // 添加事件
    document.getElementById('doc-modal-close')?.addEventListener('click', closeCardModal);
    document.getElementById('doc-modal-prev')?.addEventListener('click', () => navigateCard(-1, documents));
    document.getElementById('doc-modal-next')?.addEventListener('click', () => navigateCard(1, documents));
    document.addEventListener('keydown', handleDocKeydown);
    
    modal.classList.remove('hidden');
}

// 处理键盘导航
function handleDocKeydown(e) {
    if (!isCardModalOpen) {
        document.removeEventListener('keydown', handleDocKeydown);
        return;
    }
    
    let documents = activeDocumentData;
    if (currentReformFilter !== 'all') {
        documents = activeDocumentByReform[currentReformFilter] || [];
    }
    
    if (e.key === 'Escape') {
        closeCardModal();
    } else if (e.key === 'ArrowLeft') {
        navigateCard(-1, documents);
    } else if (e.key === 'ArrowRight') {
        navigateCard(1, documents);
    }
}

// 导航卡片
function navigateCard(direction, documents) {
    let newIndex = currentCardIndex + direction;
    
    if (newIndex < 0) newIndex = documents.length - 1;
    if (newIndex >= documents.length) newIndex = 0;
    
    openCardModal(newIndex, documents);
}

// 关闭弹窗
function closeCardModal() {
    const modal = document.getElementById('doc-card-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
    isCardModalOpen = false;
    document.removeEventListener('keydown', handleDocKeydown);
}

// 显示帮助
function showDocHelp() {
    document.getElementById('doc-help-modal')?.classList.remove('hidden');
}

// 隐藏帮助
function hideDocHelp() {
    document.getElementById('doc-help-modal')?.classList.add('hidden');
}

// 从图文史料返回主页（启动画面）
function backToMenuFromDocument() {
    const docView = document.getElementById('document-view');
    if (docView) {
        docView.classList.add('hidden');
    }
    // 返回到启动画面（四个功能选择首页）
    document.getElementById('main-menu')?.classList.add('hidden');
    document.getElementById('splash-screen')?.classList.remove('hidden');
}
