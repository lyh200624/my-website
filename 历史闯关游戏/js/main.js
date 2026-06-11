// ==================== 游戏主逻辑 ====================

// 全局模式管理
const AppMode = {
    GAME: 'game',
    GRAPH: 'graph',
    BUBBLE: 'bubble',
    current: 'game'
};

// 游戏状态管理
const GameState = {
    currentLevel: null,
    currentQuestion: 0,
    score: 0,
    lives: 3,
    streak: 0,
    maxStreak: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    answers: [],
    timer: null,
    timeLeft: 0,
    isAnswered: false,
    levelProgress: {},
    userStats: {
        totalScore: 0,
        completedLevels: 0,
        maxStreak: 0
    }
};

// ==================== DOM 元素引用 ====================
const DOM = {
    splashScreen: document.getElementById('splash-screen'),
    mainMenu: document.getElementById('main-menu'),
    gameContainer: document.getElementById('game-container'),
    graphView: document.getElementById('graph-view'),
    bubbleView: document.getElementById('bubble-view'),
    documentView: document.getElementById('document-view'),
    resultModal: document.getElementById('result-modal'),
    videoModal: document.getElementById('video-modal'),
    galleryModal: document.getElementById('gallery-modal'),
    
    // 主菜单元素
    levelGrid: document.querySelector('.level-grid'),
    completedCount: document.getElementById('completed-count'),
    totalScore: document.getElementById('total-score'),
    maxStreak: document.getElementById('max-streak'),
    goToGraphBtn: document.getElementById('go-to-graph'),
    
    // 游戏界面元素
    levelNum: document.getElementById('level-num'),
    levelName: document.getElementById('level-name'),
    scoreEl: document.getElementById('score'),
    livesEl: document.getElementById('lives'),
    streakEl: document.getElementById('streak'),
    levelContent: document.getElementById('level-content'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    
    // 结果弹窗元素
    resultTitle: document.getElementById('result-title'),
    resultScore: document.getElementById('result-score'),
    resultAccuracy: document.getElementById('result-accuracy'),
    resultStars: document.getElementById('result-stars'),
    resultMessage: document.getElementById('result-message'),
    retryBtn: document.getElementById('retry-btn'),
    nextBtn: document.getElementById('next-btn'),
    menuBtn: document.getElementById('menu-btn'),
    
    // 视频弹窗元素
    videoFrame: document.getElementById('video-frame'),
    videoClose: document.getElementById('video-close'),
    
    // 图片��窗元素
    galleryGrid: document.getElementById('gallery-grid'),
    galleryClose: document.getElementById('gallery-close'),
    galleryPrev: document.getElementById('gallery-prev'),
    galleryNext: document.getElementById('gallery-next'),
    galleryCounter: document.getElementById('gallery-counter'),
    galleryTitle: document.getElementById('gallery-title'),

    homeLoginPanel: document.getElementById('home-login-panel'),
    homeLoginOpen: document.getElementById('home-login-open'),
    homeLoginForm: document.getElementById('home-student-login-form'),
    homeLoginName: document.getElementById('home-student-name'),
    homeLoginClass: document.getElementById('home-student-class'),
    homeLoginError: document.getElementById('home-login-error'),
    homeLoginStatus: document.getElementById('student-login-status'),
    homeLoginSummary: document.getElementById('home-login-summary'),
    homeLoginSummaryName: document.getElementById('home-login-name'),
    homeLoginSummaryMeta: document.getElementById('home-login-meta'),
    homeStudentLogout: document.getElementById('home-student-logout')
};

// ==================== 后端同步 ====================
const BackendState = {
    student: null,
    available: true
};

let eventListenersReady = false;

function resolveApiBase() {
    if (window.location.protocol === 'file:') return 'http://localhost:3000';
    if (['localhost', '127.0.0.1', '::1'].includes(window.location.hostname) && window.location.port !== '3000') {
        return 'http://localhost:3000';
    }
    return '';
}

const API_BASE = resolveApiBase();

const BackendApi = {
    async request(url, options = {}) {
        const response = await fetch(`${API_BASE}${url}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
    },

    createStudent(name, className) {
        return this.request('/api/students', {
            method: 'POST',
            body: JSON.stringify({ name, className })
        });
    },

    studentLogin(name, className) {
        return this.request('/api/student/login', {
            method: 'POST',
            body: JSON.stringify({ name, className })
        });
    },

    getProgress(studentId) {
        return this.request(`/api/progress?studentId=${encodeURIComponent(studentId)}`);
    },

    saveProgress(payload) {
        return this.request('/api/progress', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    },

    saveResult(payload) {
        return this.request('/api/results', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
    }
};

function getStoredStudent() {
    try {
        return JSON.parse(localStorage.getItem('historyGameStudent') || 'null');
    } catch (error) {
        return null;
    }
}

function setStoredStudent(student) {
    BackendState.student = student || null;
    if (student) {
        localStorage.setItem('historyGameStudent', JSON.stringify(student));
    } else {
        localStorage.removeItem('historyGameStudent');
    }
}

function updateHomeLoginPanel(message = '') {
    if (!DOM.homeLoginStatus) return;

    const student = BackendState.student || getStoredStudent();
    const isLoggedIn = Boolean(student && student.name);

    if (DOM.homeLoginError) {
        DOM.homeLoginError.textContent = message;
    }

    if (DOM.homeLoginStatus) {
        DOM.homeLoginStatus.textContent = isLoggedIn
            ? (student.offline ? '离线登录' : '已登录')
            : '未登录';
        DOM.homeLoginStatus.classList.toggle('is-online', isLoggedIn && !student.offline);
    }

    if (DOM.homeLoginSummary) {
        DOM.homeLoginSummary.classList.toggle('hidden', !isLoggedIn);
    }

    if (DOM.homeLoginSummaryName) {
        DOM.homeLoginSummaryName.textContent = isLoggedIn ? student.name : '';
    }

    if (DOM.homeLoginSummaryMeta) {
        const classText = student?.className ? `班级：${student.className}` : '未填写班级';
        const modeText = student?.offline ? '离线模式' : '后端已记录登录';
        DOM.homeLoginSummaryMeta.textContent = isLoggedIn ? `${classText} · ${modeText}` : '';
    }
}

function getTeacherUrl() {
    return API_BASE ? `${API_BASE}/teacher.html` : 'teacher.html';
}

function showRoleChoiceModal() {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'student-login-overlay';
        overlay.innerHTML = `
            <div class="student-login-card role-choice-card">
                <h2>选择登录身份</h2>
                <p>请选择你的身份，然后填写对应登录信息。</p>
                <div class="role-choice-actions">
                    <button type="button" class="role-choice-btn student-role" data-role="student">
                        <strong>学生登录</strong>
                        <span>填写姓名和班级，记录闯关成绩</span>
                    </button>
                    <button type="button" class="role-choice-btn teacher-role" data-role="teacher">
                        <strong>教师登录</strong>
                        <span>进入教师面板，填写教师密码</span>
                    </button>
                </div>
                <div class="student-login-actions">
                    <button type="button" class="cancel">取消</button>
                </div>
            </div>
        `;

        function close(value) {
            overlay.remove();
            resolve(value);
        }

        overlay.querySelectorAll('[data-role]').forEach((button) => {
            button.addEventListener('click', () => close(button.dataset.role));
        });

        overlay.querySelector('.cancel').addEventListener('click', () => close(null));
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) close(null);
        });

        document.body.appendChild(overlay);
        overlay.querySelector('[data-role="student"]').focus();
    });
}

async function openHomeLoginDialog() {
    const role = await showRoleChoiceModal();
    if (role === 'teacher') {
        window.location.href = getTeacherUrl();
        return null;
    }

    if (role !== 'student') {
        return null;
    }

    const stored = BackendState.student || getStoredStudent() || {};
    const login = await showStudentLoginModal(stored);
    if (!login || !login.name) {
        return null;
    }

    return loginStudentFromHome(login);
}

async function loginStudentFromHome(login) {
    const name = String(login?.name || '').trim();
    const className = String(login?.className || '').trim();

    if (!name) {
        updateHomeLoginPanel('请输入学生姓名。');
        return null;
    }

    if (login.offline) {
        const offlineStudent = {
            id: null,
            name,
            className,
            offline: true
        };
        setStoredStudent(offlineStudent);
        BackendState.available = false;
        updateHomeLoginPanel('已进入离线学生模式。');
        return offlineStudent;
    }

    if (DOM.homeLoginError) {
        DOM.homeLoginError.textContent = '正在登录...';
    }

    try {
        const data = await BackendApi.studentLogin(name, className);
        setStoredStudent(data.student);
        BackendState.available = true;
        await loadUserStats();
        renderLevelGrid();
        updateHomeLoginPanel('登录成功。');
        return data.student;
    } catch (error) {
        BackendState.available = false;
        const offlineStudent = {
            id: null,
            name,
            className,
            offline: true
        };
        setStoredStudent(offlineStudent);
        updateHomeLoginPanel('后端暂不可用，已进入离线模式。');
        return offlineStudent;
    }
}

function logoutStudentFromHome() {
    setStoredStudent(null);
    localStorage.removeItem('historyGameStats');
    GameState.levelProgress = {};
    GameState.userStats = {
        totalScore: 0,
        completedLevels: 0,
        maxStreak: 0
    };
    renderLevelGrid();
    updateStats();
    updateHomeLoginPanel('已退出学生登录。');
}

function showStudentLoginModal(defaults = {}) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'student-login-overlay';
        overlay.innerHTML = `
            <style>
                .student-login-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    background: rgba(36, 27, 18, 0.68);
                }

                .student-login-card {
                    width: min(420px, 100%);
                    padding: 24px;
                    border: 1px solid #c9a962;
                    border-radius: 8px;
                    background: #fffaf0;
                    box-shadow: 0 12px 34px rgba(0, 0, 0, 0.28);
                    color: #2c2416;
                    font-family: "Microsoft YaHei", "Noto Serif SC", serif;
                }

                .student-login-card h2 {
                    margin: 0 0 8px;
                    font-size: 24px;
                }

                .student-login-card p {
                    margin: 0 0 18px;
                    color: #6f4a2d;
                    line-height: 1.6;
                }

                .student-login-card label {
                    display: block;
                    margin: 12px 0 6px;
                    font-weight: 700;
                }

                .student-login-card input {
                    width: 100%;
                    height: 40px;
                    padding: 0 10px;
                    border: 1px solid #d8c7a6;
                    border-radius: 6px;
                    background: #fffdf8;
                    font-size: 16px;
                }

                .student-login-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }

                .student-login-actions button {
                    min-height: 38px;
                    padding: 0 16px;
                    border: 1px solid #b48a3c;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 700;
                }

                .student-login-actions .cancel {
                    color: #5b321d;
                    background: #fff8e8;
                }

                .student-login-actions .submit {
                    color: #fff8e8;
                    background: #6f3d1f;
                }

                .student-login-error {
                    min-height: 20px;
                    margin-top: 10px;
                    color: #a94442;
                    font-size: 14px;
                }
            </style>
            <form class="student-login-card">
                <h2>学生登录</h2>
                <p>请输入姓名和班级，后端会记录你的登录信息和闯关成绩。</p>
                <label for="student-login-name">姓名</label>
                <input id="student-login-name" name="name" value="${escapeAttribute(defaults.name || '')}" autocomplete="name" required>
                <label for="student-login-class">班级</label>
                <input id="student-login-class" name="className" value="${escapeAttribute(defaults.className || '')}" autocomplete="organization">
                <div class="student-login-error"></div>
                <div class="student-login-actions">
                    <button type="button" class="cancel">离线进入</button>
                    <button type="submit" class="submit">登录</button>
                </div>
            </form>
        `;

        const form = overlay.querySelector('form');
        const nameInput = overlay.querySelector('[name="name"]');
        const classInput = overlay.querySelector('[name="className"]');
        const errorEl = overlay.querySelector('.student-login-error');

        function close(value) {
            overlay.remove();
            resolve(value);
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = nameInput.value.trim();
            if (!name) {
                errorEl.textContent = '请输入姓名。';
                nameInput.focus();
                return;
            }
            close({ name, className: classInput.value.trim() });
        });

        overlay.querySelector('.cancel').addEventListener('click', () => {
            const name = nameInput.value.trim();
            close(name ? { name, className: classInput.value.trim(), offline: true } : null);
        });

        document.body.appendChild(overlay);
        nameInput.focus();
    });
}

function escapeAttribute(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[char]));
}

async function ensureStudentProfile() {
    const stored = getStoredStudent();
    if (stored && stored.id) {
        try {
            const data = await BackendApi.studentLogin(stored.name, stored.className || '');
            setStoredStudent(data.student);
            BackendState.available = true;
            updateHomeLoginPanel();
            return data.student;
        } catch (error) {
            BackendState.available = false;
            BackendState.student = stored;
            updateHomeLoginPanel();
            return stored;
        }
    }

    if (stored && stored.name) {
        try {
            const data = await BackendApi.studentLogin(stored.name, stored.className || '');
            setStoredStudent(data.student);
            BackendState.available = true;
            await loadUserStats();
            renderLevelGrid();
            updateHomeLoginPanel();
            return data.student;
        } catch (error) {
            BackendState.available = false;
            BackendState.student = stored;
            updateHomeLoginPanel();
            return stored;
        }
    }

    updateHomeLoginPanel('请先在主页完成学生登录。');
    DOM.homeLoginOpen?.focus();
    return null;
}

// ==================== 初始化 ====================
async function init() {
    await loadUserStats();
    renderLevelGrid();
}

function setupEventListeners() {
    if (eventListenersReady) return;
    eventListenersReady = true;

    // 模式选择按钮
    document.getElementById('mode-game').addEventListener('click', startGame);
    document.getElementById('mode-graph').addEventListener('click', startGraph);
    document.getElementById('mode-bubble').addEventListener('click', startBubble);
    document.getElementById('mode-document').addEventListener('click', startDocument);

    if (DOM.homeLoginOpen) {
        DOM.homeLoginOpen.addEventListener('click', openHomeLoginDialog);
    }

    if (DOM.homeStudentLogout) {
        DOM.homeStudentLogout.addEventListener('click', logoutStudentFromHome);
    }

    // 主菜单知识图谱按钮
    DOM.goToGraphBtn.addEventListener('click', startGraphFromMenu);
    
    // 主菜单气泡导图按钮
    const goToBubbleBtn = document.getElementById('go-to-bubble');
    if (goToBubbleBtn) {
        goToBubbleBtn.addEventListener('click', startBubbleFromMenu);
    }
    
    // 主菜单返回主页按钮
    document.getElementById('menu-back-splash').addEventListener('click', backToSplash);
    
    // 游戏界面返回主页按钮
    document.getElementById('game-back-home').addEventListener('click', exitGame);
    
    // 结果弹窗按钮
    DOM.retryBtn.addEventListener('click', retryLevel);
    DOM.nextBtn.addEventListener('click', nextLevel);
    DOM.menuBtn.addEventListener('click', backToMenu);
    
    // 视频弹窗
    DOM.videoClose.addEventListener('click', closeVideoModal);
    DOM.videoModal.addEventListener('click', (e) => {
        if (e.target === DOM.videoModal) closeVideoModal();
    });
    
    // 图片弹窗
    DOM.galleryClose.addEventListener('click', closeGalleryModal);
    DOM.galleryPrev.addEventListener('click', prevImage);
    DOM.galleryNext.addEventListener('click', nextImage);
    DOM.galleryModal.addEventListener('click', (e) => {
        if (e.target === DOM.galleryModal) closeGalleryModal();
    });
}

// 返回启动画面
function backToSplash() {
    DOM.mainMenu.classList.add('hidden');
    DOM.splashScreen.classList.remove('hidden');
}

// ==================== 游戏流程控制 ====================
async function startGame() {
    const student = await ensureStudentProfile();
    if (!student) return;
    AppMode.current = AppMode.GAME;
    DOM.splashScreen.classList.add('hidden');
    DOM.graphView.classList.add('hidden');
    DOM.mainMenu.classList.remove('hidden');
    await init(); // 初始化游戏
}

function startGraph() {
    AppMode.current = AppMode.GRAPH;
    DOM.splashScreen.classList.add('hidden');
    DOM.mainMenu.classList.add('hidden');
    DOM.graphView.classList.remove('hidden');
    initGraph(); // 初始化图谱
}

function startGraphFromMenu() {
    AppMode.current = AppMode.GRAPH;
    DOM.mainMenu.classList.add('hidden');
    DOM.gameContainer.classList.add('hidden');
    DOM.bubbleView.classList.add('hidden');
    DOM.documentView.classList.add('hidden');
    DOM.graphView.classList.remove('hidden');
    initGraph();
}

function startBubble() {
    AppMode.current = 'bubble';
    DOM.splashScreen.classList.add('hidden');
    DOM.mainMenu.classList.add('hidden');
    DOM.gameContainer.classList.add('hidden');
    DOM.graphView.classList.add('hidden');
    DOM.bubbleView.classList.remove('hidden');
    DOM.documentView.classList.add('hidden');
    if (typeof initBubble === 'function') {
        setTimeout(function() { initBubble(); }, 50);
    }
}

function startBubbleFromMenu() {
    AppMode.current = 'bubble';
    DOM.mainMenu.classList.add('hidden');
    DOM.gameContainer.classList.add('hidden');
    DOM.graphView.classList.add('hidden');
    DOM.bubbleView.classList.add('hidden');
    DOM.documentView.classList.add('hidden');
    
    const bubbleView = document.getElementById('bubble-view');
    if (bubbleView) bubbleView.classList.remove('hidden');
    
    if (typeof initBubble === 'function') {
        setTimeout(function() { initBubble(); }, 50);
    }
}

function startDocument() {
    AppMode.current = 'document';
    DOM.splashScreen.classList.add('hidden');
    DOM.mainMenu.classList.add('hidden');
    DOM.gameContainer.classList.add('hidden');
    DOM.graphView.classList.add('hidden');
    DOM.bubbleView.classList.add('hidden');
    
    const documentView = document.getElementById('document-view');
    if (documentView) documentView.classList.remove('hidden');
    
    if (typeof initDocument === 'function') {
        setTimeout(function() { initDocument(); }, 50);
    }
}

function renderLevelGrid() {
    const progress = GameState.levelProgress;
    
    DOM.levelGrid.innerHTML = LEVELS.map((level) => {
        const levelData = progress[level.id] || { stars: 0 };
        const levelImage = `../图片/${level.id}.png`;
        
        return `
            <div class="level-card level-${level.id}" 
                 data-level="${level.id}">
                <div class="level-card-image">
                    <img src="${levelImage}" alt="${level.name}" onerror="this.style.display='none'">
                </div>
                <div class="level-card-body">
                    <span class="level-number">第 ${toChineseNum(level.id)} 关</span>
                    <h3 class="level-card-title">${level.name}</h3>
                    <p class="level-card-desc">${level.description}</p>
                </div>
                <div class="level-card-footer">
                    <div class="level-stars">
                        ${renderStars(levelData.stars || 0)}
                    </div>
                    <span class="level-status ${levelData.stars > 0 ? 'completed' : ''}">
                        ${levelData.stars > 0 ? '已通关' : '可挑战'}
                    </span>
                </div>
            </div>
        `;
    }).join('');
    
    // 添加点击事件
    document.querySelectorAll('.level-card:not(.locked)').forEach(card => {
        card.addEventListener('click', () => {
            const levelId = parseInt(card.dataset.level);
            startLevel(levelId);
        });
    });
    
    updateStats();
}

function renderStars(count) {
    return [0, 1, 2].map(i => 
        `<span class="${i < count ? 'earned' : ''}">★</span>`
    ).join('');
}

function startLevel(levelId) {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return;
    
    GameState.currentLevel = level;
    GameState.currentQuestion = 0;
    GameState.score = 0;
    GameState.lives = 3;
    GameState.streak = 0;
    GameState.maxStreak = 0;
    GameState.correctAnswers = 0;
    GameState.totalQuestions = level.questions.length;
    GameState.answers = [];
    GameState.isAnswered = false;
    
    // 更新UI
    DOM.levelNum.textContent = toChineseNum(level.id);
    DOM.levelName.textContent = level.name;
    updateGameStats();
    
    // 切换界面
    DOM.mainMenu.classList.add('hidden');
    DOM.gameContainer.classList.remove('hidden');
    
    // 渲染关卡内容
    renderChapterIntro();
}

function renderChapterIntro() {
    const level = GameState.currentLevel;
    const intro = level.intro;
    const prevLevelId = level.id > 1 ? level.id - 1 : null;
    const nextLevelId = level.id < TOTAL_LEVELS ? level.id + 1 : null;
    
    DOM.levelContent.innerHTML = `
        <div class="chapter-intro">
            <div class="level-nav-buttons">
                <button class="btn-secondary" onclick="backToMenu()">
                    ← 返回主页
                </button>
                ${prevLevelId ? `<button class="btn-secondary" onclick="startLevel(${prevLevelId})">← 上一关</button>` : ''}
                ${nextLevelId ? `<button class="btn-secondary" onclick="startLevel(${nextLevelId})">下一关 →</button>` : ''}
            </div>
            
            <h2>
                <span class="icon">📜</span>
                ${intro.title}
            </h2>
            <p>${intro.content}</p>
            
            <blockquote>
                ${intro.quote}
            </blockquote>
            
            <div style="margin: 1rem 0;">
                <strong>主要人物：</strong>${intro.figures.join('、')}
            </div>
            
            <div style="margin: 1rem 0;">
                <strong>主要成就：</strong>
                <ul style="margin: 0.5rem 0 0.5rem 1.5rem;">
                    ${intro.achievements.map(a => `<li>${a}</li>`).join('')}
                </ul>
            </div>
            
            <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(139,69,19,0.1); border-radius: 8px;">
                <strong style="color: #8b4513;">📖 历史影响：</strong>
                <p style="margin-top: 0.5rem;">${intro.impact}</p>
            </div>
            
            <button class="btn-primary" style="width: 100%; margin-top: 1.5rem;" onclick="startQuestions()">
                开始答题挑战
            </button>
        </div>
    `;
    
    updateProgress(0);
}

function startQuestions() {
    renderQuestion();
}

function renderQuestion() {
    const level = GameState.currentLevel;
    const question = level.questions[GameState.currentQuestion];
    
    if (!question) {
        showResult();
        return;
    }
    
    GameState.isAnswered = false;
    GameState.timeLeft = GAME_CONFIG.timeLimit;
    
    const characterImage = level.id <= 5 ? `../图片2/${level.id}.png` : '';
    
    const questionHTML = `
        <div class="question-wrapper">
            <div class="character-container" id="character-container">
                ${characterImage ? `<img src="${characterImage}" alt="角色" class="character-img" id="character-img">` : ''}
                <div class="character-bubble" id="character-bubble">
                    <span id="character-text">加油！你一定能答对的！</span>
                </div>
            </div>
            <div class="question-content">
                <div class="question-card" id="question-card">
                    <span class="question-type">${getQuestionTypeLabel(question.type)}</span>
                    <div class="question-timer" id="timer">
                        ⏱️ 剩余时间：<span id="time-left">${GameState.timeLeft}</span>秒
                    </div>
                    <p class="question-text">${question.question}</p>
                    <div class="options-container" id="options-container">
                        ${renderOptions(question)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    DOM.levelContent.innerHTML = questionHTML;
    
    // 启动计时器
    startTimer();
    
    // 添加选项点击事件
    setupQuestionEvents(question);
    
    updateProgress((GameState.currentQuestion / GameState.totalQuestions) * 100);
}

function renderOptions(question) {
    const types = {
        choice: () => {
            const labels = ['A', 'B', 'C', 'D'];
            return question.options.map((opt, i) => `
                <button class="option-btn" data-index="${i}">
                    <span class="option-label">${labels[i]}</span>
                    ${opt}
                </button>
            `).join('');
        },
        judge: () => `
            <button class="option-btn judge-btn" data-answer="true">
                <span class="icon">✓</span>
                正确
            </button>
            <button class="option-btn judge-btn" data-answer="false">
                <span class="icon">✗</span>
                错误
            </button>
        `,
        fill: () => `
            <input type="text" class="fill-blank-input" id="fill-input" 
                   placeholder="请输入您的答案..." autocomplete="off">
            <button class="btn-primary" style="margin-top: 1rem;" id="fill-submit">
                提交答案
            </button>
        `,
        sort: () => {
            const shuffled = [...question.items].sort(() => Math.random() - 0.5);
            return `
                <ul class="sort-list" id="sort-list">
                    ${shuffled.map((item, i) => `
                        <li class="sort-item" draggable="true" data-original="${question.items.indexOf(item)}">
                            <span class="sort-handle">☰</span>
                            <span class="sort-number">${i + 1}</span>
                            <span class="sort-text">${item}</span>
                        </li>
                    `).join('')}
                </ul>
                <button class="btn-primary" style="margin-top: 1rem;" id="sort-submit">
                    提交答案
                </button>
            `;
        },
        match: () => {
            const leftShuffled = [...question.leftItems].sort(() => Math.random() - 0.5);
            const rightShuffled = [...question.rightItems].sort(() => Math.random() - 0.5);
            return `
                <div class="match-container">
                    <div class="match-column" id="match-left">
                        ${leftShuffled.map((item, i) => `
                            <div class="match-item" data-side="left" data-index="${i}">${item}</div>
                        `).join('')}
                    </div>
                    <div class="match-line">
                        <span>⟷</span>
                    </div>
                    <div class="match-column" id="match-right">
                        ${rightShuffled.map((item, i) => `
                            <div class="match-item" data-side="right" data-index="${i}">${item}</div>
                        `).join('')}
                    </div>
                </div>
                <p class="match-hint">请依次点击左侧和右侧的选项进行配对</p>
                <button class="btn-primary" style="margin-top: 1rem;" id="match-submit">
                    提交答案
                </button>
            `;
        }
    };
    
    return types[question.type] ? types[question.type]() : '';
}

function setupQuestionEvents(question) {
    switch (question.type) {
        case 'choice':
        case 'judge':
            document.querySelectorAll('.option-btn').forEach(btn => {
                btn.addEventListener('click', () => handleChoiceAnswer(btn, question));
            });
            break;
        case 'fill':
            document.getElementById('fill-submit').addEventListener('click', () => handleFillAnswer(question));
            document.getElementById('fill-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleFillAnswer(question);
            });
            break;
        case 'sort':
            setupSortEvents(question);
            break;
        case 'match':
            setupMatchEvents(question);
            break;
    }
}

// ==================== 答案处理 ====================
function handleChoiceAnswer(btn, question) {
    if (GameState.isAnswered) return;
    GameState.isAnswered = true;
    stopTimer();
    
    let isCorrect = false;
    
    if (question.type === 'choice') {
        const selectedIndex = parseInt(btn.dataset.index);
        isCorrect = selectedIndex === question.correct;
    } else if (question.type === 'judge') {
        const selectedAnswer = btn.dataset.answer === 'true';
        isCorrect = selectedAnswer === question.correct;
    }
    
    processAnswer(isCorrect, question, btn);
}

function handleFillAnswer(question) {
    if (GameState.isAnswered) return;
    const input = document.getElementById('fill-input');
    const userAnswer = input.value.trim();
    
    if (!userAnswer) {
        input.style.borderColor = '#a94442';
        return;
    }
    
    GameState.isAnswered = true;
    stopTimer();
    
    const isCorrect = question.answers.some(a => 
        a.toLowerCase() === userAnswer.toLowerCase()
    );
    
    input.disabled = true;
    input.style.borderColor = isCorrect ? '#4a7c4e' : '#a94442';
    
    processAnswer(isCorrect, question, input);
}

function setupSortEvents(question) {
    const list = document.getElementById('sort-list');
    const items = list.querySelectorAll('.sort-item');
    let draggedItem = null;
    
    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedItem = null;
        });
        
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (item !== draggedItem) {
                const rect = item.getBoundingClientRect();
                const midY = rect.top + rect.height / 2;
                if (e.clientY < midY) {
                    list.insertBefore(draggedItem, item);
                } else {
                    list.insertBefore(draggedItem, item.nextSibling);
                }
                updateSortNumbers();
            }
        });
    });
    
    document.getElementById('sort-submit').addEventListener('click', () => {
        if (GameState.isAnswered) return;
        GameState.isAnswered = true;
        stopTimer();
        
        const currentOrder = Array.from(list.querySelectorAll('.sort-item'))
            .map(item => parseInt(item.dataset.original));
        
        const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(question.correctOrder);
        
        // 高亮显示
        list.querySelectorAll('.sort-item').forEach((item, i) => {
            item.style.borderColor = currentOrder[i] === question.correctOrder[i] ? '#4a7c4e' : '#a94442';
            item.style.background = currentOrder[i] === question.correctOrder[i] ? 
                'rgba(74, 124, 78, 0.2)' : 'rgba(169, 68, 66, 0.2)';
        });
        
        processAnswer(isCorrect, question, list);
    });
}

function updateSortNumbers() {
    document.querySelectorAll('#sort-list .sort-item').forEach((item, i) => {
        item.querySelector('.sort-number').textContent = i + 1;
    });
}

let matchSelections = { left: null, right: null };

function setupMatchEvents(question) {
    const leftItems = document.querySelectorAll('[data-side="left"]');
    const rightItems = document.querySelectorAll('[data-side="right"]');
    const allItems = [...leftItems, ...rightItems];
    
    matchSelections = { left: null, right: null };
    
    allItems.forEach(item => {
        item.addEventListener('click', () => {
            if (GameState.isAnswered) return;
            
            const side = item.dataset.side;
            const index = item.dataset.index;
            
            // 取消之前的选中
            if (matchSelections[side]) {
                document.querySelector(`[data-side="${side}"][data-index="${matchSelections[side]}"]`)
                    .classList.remove('selected');
            }
            
            matchSelections[side] = index;
            item.classList.add('selected');
        });
    });
    
    document.getElementById('match-submit').addEventListener('click', () => {
        if (GameState.isAnswered) return;
        
        if (matchSelections.left === null || matchSelections.right === null) {
            alert('请先选择配对选项！');
            return;
        }
        
        GameState.isAnswered = true;
        stopTimer();
        
        const isCorrect = question.correctMatches.some(
            ([leftIdx, rightIdx]) => 
                parseInt(matchSelections.left) === leftIdx && 
                parseInt(matchSelections.right) === rightIdx
        );
        
        document.querySelector(`[data-side="left"][data-index="${matchSelections.left}"]`)
            .classList.add(isCorrect ? 'matched' : '');
        document.querySelector(`[data-side="right"][data-index="${matchSelections.right}"]`)
            .classList.add(isCorrect ? 'matched' : '');
        
        processAnswer(isCorrect, question, document.querySelector('.match-container'));
    });
}

function processAnswer(isCorrect, question, element) {
    // 记录答案
    GameState.answers.push({
        questionIndex: GameState.currentQuestion,
        correct: isCorrect
    });
    
    // 计算得分
    if (isCorrect) {
        GameState.correctAnswers++;
        GameState.streak++;
        if (GameState.streak > GameState.maxStreak) {
            GameState.maxStreak = GameState.streak;
        }
        
        const timeScore = Math.floor(GameState.timeLeft * 2);
        const streakBonus = (GameState.streak - 1) * GAME_CONFIG.streakBonus;
        const totalScore = GAME_CONFIG.baseScore + timeScore + streakBonus;
        GameState.score += totalScore;
        
        showFeedback(true, `+${totalScore}`);
        updateCharacterState('happy');
    } else {
        GameState.streak = 0;
        GameState.lives--;
        
        showFeedback(false, '答错了！');
        updateCharacterState('sad');
    }
    
    updateGameStats();
    
    // 显示正确答案和下一题按钮
    showExplanation(question, isCorrect);
}

function showExplanation(question, wasCorrect) {
    const card = document.getElementById('question-card');
    
    // 添加解释区域
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'question-explanation';
    explanationDiv.style.cssText = `
        margin-top: 1.5rem;
        padding: 1rem;
        background: ${wasCorrect ? 'rgba(74, 124, 78, 0.1)' : 'rgba(169, 68, 66, 0.1)'};
        border-radius: 8px;
        border-left: 4px solid ${wasCorrect ? '#4a7c4e' : '#a94442'};
        animation: fadeIn 0.3s ease;
    `;
    
    explanationDiv.innerHTML = `
        <p style="font-weight: 600; color: ${wasCorrect ? '#4a7c4e' : '#a94442'};">
            ${wasCorrect ? '✓ 回答正确！' : '✗ 回答错误'}
        </p>
        <p style="margin-top: 0.5rem; color: #5c2d0e;">${question.explanation}</p>
        <button class="btn-primary" style="margin-top: 1rem; width: 100%;" id="next-question-btn">
            下一题 →
        </button>
    `;
    
    card.appendChild(explanationDiv);
    
    // 添加下一题按钮事件
    document.getElementById('next-question-btn').addEventListener('click', () => {
        GameState.currentQuestion++;
        if (GameState.currentQuestion < GameState.totalQuestions) {
            renderQuestion();
        } else {
            showResult();
        }
    });
}

function showFeedback(isCorrect, text) {
    const feedback = document.createElement('div');
    feedback.className = `feedback ${isCorrect ? 'correct' : 'incorrect'}`;
    feedback.textContent = text;
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 800);
}

// ==================== 计时器 ====================
let timeWarningTriggered = false;

function startTimer() {
    stopTimer();
    timeWarningTriggered = false;
    
    const timerEl = document.getElementById('timer');
    const timeLeftEl = document.getElementById('time-left');
    
    GameState.timer = setInterval(() => {
        GameState.timeLeft--;
        timeLeftEl.textContent = GameState.timeLeft;
        
        if (GameState.timeLeft <= 10) {
            timerEl.classList.add('time-warning');
            if (!timeWarningTriggered) {
                timeWarningTriggered = true;
                // 角色时间警告反应
                const characterImg = document.getElementById('character-img');
                if (characterImg) {
                    characterImg.classList.remove('bounce', 'shake', 'jump');
                    void characterImg.offsetWidth;
                    characterImg.classList.add('shake');
                }
                updateCharacterState('timeWarning');
            }
        }
        
        if (GameState.timeLeft <= 0) {
            stopTimer();
            if (!GameState.isAnswered) {
                GameState.isAnswered = true;
                GameState.streak = 0;
                GameState.lives--;
                updateGameStats();
                
                const question = GameState.currentLevel.questions[GameState.currentQuestion];
                showExplanation(question, false);
                showFeedback(false, '时间到！');
                updateCharacterState('sad');
            }
        }
    }, 1000);
}

function stopTimer() {
    if (GameState.timer) {
        clearInterval(GameState.timer);
        GameState.timer = null;
    }
}

// ==================== 结果处理 ====================
function showResult() {
    stopTimer();
    
    const accuracy = GameState.correctAnswers / GameState.totalQuestions;
    const stars = accuracy >= GAME_CONFIG.starThresholds[2] ? 3 :
                  accuracy >= GAME_CONFIG.starThresholds[1] ? 2 :
                  accuracy >= GAME_CONFIG.starThresholds[0] ? 1 : 0;
    
    // 更新关卡进度
    const levelId = GameState.currentLevel.id;
    if (!GameState.levelProgress[levelId] || GameState.levelProgress[levelId].stars < stars) {
        GameState.levelProgress[levelId] = { stars };
    }
    
    // 更新用户统计
    GameState.userStats.totalScore += GameState.score;
    if (GameState.maxStreak > GameState.userStats.maxStreak) {
        GameState.userStats.maxStreak = GameState.maxStreak;
    }
    
    const completedLevels = Object.values(GameState.levelProgress)
        .filter(p => p.stars > 0).length;
    GameState.userStats.completedLevels = completedLevels;
    
    saveUserStats();
    saveLevelResult(stars, accuracy);
    
    // 更新弹窗内容
    DOM.resultScore.textContent = GameState.score;
    DOM.resultAccuracy.textContent = Math.round(accuracy * 100) + '%';
    
    DOM.resultStars.innerHTML = [0, 1, 2].map(i => 
        `<span class="${i < stars ? 'earned' : ''}">★</span>`
    ).join('');
    
    const messages = {
        0: '继续加油，历史知识需要不断积累！',
        1: '不错，已经入门了，继续努力！',
        2: '很好！你对这段历史有了较好的掌握！',
        3: '太棒了！满分通关！历史知识非常扎实！'
    };
    
    if (GameState.lives <= 0) {
        DOM.resultTitle.textContent = '生命耗尽';
        DOM.resultMessage.textContent = '不要气馁，重新挑战吧！';
    } else {
        DOM.resultTitle.textContent = stars > 0 ? '恭喜通关！' : '挑战失败';
        DOM.resultMessage.textContent = messages[stars];
    }
    
    // 控制按钮显示 - 始终显示下一关按钮（无解锁限制）
    DOM.nextBtn.style.display = levelId < TOTAL_LEVELS ? 'inline-flex' : 'none';
    
    DOM.resultModal.classList.remove('hidden');
}

function retryLevel() {
    DOM.resultModal.classList.add('hidden');
    startLevel(GameState.currentLevel.id);
}

function nextLevel() {
    DOM.resultModal.classList.add('hidden');
    if (GameState.currentLevel.id < TOTAL_LEVELS) {
        startLevel(GameState.currentLevel.id + 1);
    } else {
        backToMenu();
    }
}

function backToMenu() {
    DOM.resultModal.classList.add('hidden');
    DOM.gameContainer.classList.add('hidden');
    DOM.mainMenu.classList.remove('hidden');
    renderLevelGrid();
}

// 退出游戏，返回启动画面
function exitGame() {
    // 如果正在答题，弹出确认框
    if (GameState.currentLevel && !GameState.isAnswered && GameState.currentQuestion > 0) {
        if (!confirm('当前正在答题中，确定要退出吗？退出后本次答题进度将不会保存。')) {
            return;
        }
    }
    
    // 停止计时器
    stopTimer();
    
    // 重置游戏状态
    GameState.currentLevel = null;
    GameState.currentQuestion = 0;
    GameState.score = 0;
    GameState.lives = 3;
    GameState.streak = 0;
    GameState.answers = [];
    GameState.isAnswered = false;
    
    // 隐藏游戏界面，显示启动画面
    DOM.gameContainer.classList.add('hidden');
    DOM.resultModal.classList.add('hidden');
    DOM.splashScreen.classList.remove('hidden');
}

function backToMainFromGraph() {
    DOM.graphView.classList.add('hidden');
    DOM.mainMenu.classList.remove('hidden');
}

// ==================== 媒体弹窗 ====================
function showVideo(url, title) {
    document.getElementById('video-title').textContent = title;
    DOM.videoFrame.src = url;
    DOM.videoModal.classList.remove('hidden');
}

function closeVideoModal() {
    DOM.videoFrame.src = '';
    DOM.videoModal.classList.add('hidden');
}

let currentGalleryLevel = null;
let currentImageIndex = 0;

function showGallery(levelId) {
    const level = LEVELS.find(l => l.id === levelId);
    if (!level) return;
    
    currentGalleryLevel = level;
    currentImageIndex = 0;
    
    DOM.galleryTitle.textContent = level.intro.title + ' - 历史图片';
    renderGalleryImages();
    DOM.galleryModal.classList.remove('hidden');
}

function renderGalleryImages() {
    const images = currentGalleryLevel.images;
    
    DOM.galleryGrid.innerHTML = images.map((img, i) => `
        <div class="gallery-item ${i === currentImageIndex ? 'active' : ''}" onclick="viewImage(${i})">
            <img src="${img.url}" alt="${img.caption}" onerror="this.src='https://via.placeholder.com/300x200?text=图片加载失败'">
            <span class="caption">${img.caption}</span>
        </div>
    `).join('');
    
    DOM.galleryCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
}

function viewImage(index) {
    currentImageIndex = index;
    renderGalleryImages();
}

function prevImage() {
    if (currentGalleryLevel) {
        currentImageIndex = (currentImageIndex - 1 + currentGalleryLevel.images.length) % currentGalleryLevel.images.length;
        renderGalleryImages();
    }
}

function nextImage() {
    if (currentGalleryLevel) {
        currentImageIndex = (currentImageIndex + 1) % currentGalleryLevel.images.length;
        renderGalleryImages();
    }
}

function closeGalleryModal() {
    DOM.galleryModal.classList.add('hidden');
}

// ==================== UI 更新 ====================
function updateGameStats() {
    DOM.scoreEl.textContent = GameState.score;
    DOM.livesEl.textContent = GameState.lives;
    DOM.streakEl.textContent = GameState.streak;
}

function updateProgress(percent) {
    DOM.progressFill.style.width = percent + '%';
    DOM.progressText.textContent = Math.round(percent) + '%';
}

function updateStats() {
    DOM.completedCount.textContent = GameState.userStats.completedLevels;
    DOM.totalScore.textContent = GameState.userStats.totalScore;
    DOM.maxStreak.textContent = GameState.userStats.maxStreak;
}

// ==================== 工具函数 ====================
function toChineseNum(num) {
    const chineseNums = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    if (num <= 10) return chineseNums[num - 1];
    return num.toString();
}

function getQuestionTypeLabel(type) {
    const labels = {
        choice: '选择题',
        judge: '判断题',
        fill: '填空题',
        sort: '排序题',
        match: '连线题'
    };
    return labels[type] || type;
}

// ==================== 角色互动系统 ====================
const characterDialogs = {
    waiting: [
        '加油！你一定能答对的！',
        '仔细思考一下哦～',
        '认真审题，答案就在里面！',
        '相信自己，你很棒的！',
        '慢慢来，不要着急～'
    ],
    happy: [
        '太棒了！答对啦！',
        '厉害！继续保持！',
        '哇！完全正确！',
        '太聪明了！',
        '答得真好！'
    ],
    sad: [
        '没关系，再接再厉！',
        '别灰心，继续加油！',
        '这道题有点难，下次一定会！',
        '吸取经验，继续前进！',
        '失败是成功之母哦！'
    ],
    thinking: [
        '让我想想...',
        '这道题要认真看哦！',
        '时间还够，不着急～'
    ],
    timeWarning: [
        '时间不多了！快选！',
        '快快快！要来不及啦！',
        '赶紧选一个！'
    ]
};

function updateCharacterState(state) {
    const characterImg = document.getElementById('character-img');
    const characterText = document.getElementById('character-text');
    
    if (!characterImg || !characterText) return;
    
    // 添加动画效果
    characterImg.classList.remove('bounce', 'shake', 'jump');
    void characterImg.offsetWidth; // 强制重绘
    
    if (state === 'happy') {
        characterImg.classList.add('bounce');
    } else if (state === 'sad') {
        characterImg.classList.add('shake');
    }
    
    // 更新对话
    const dialogs = characterDialogs[state] || characterDialogs.waiting;
    const randomDialog = dialogs[Math.floor(Math.random() * dialogs.length)];
    characterText.textContent = randomDialog;
    
    // 显示气泡
    const bubble = document.getElementById('character-bubble');
    if (bubble) {
        bubble.classList.remove('hidden');
        setTimeout(() => bubble.classList.add('hidden'), 1500);
    }
}

function setCharacterThinking() {
    const characterImg = document.getElementById('character-img');
    const characterText = document.getElementById('character-text');
    
    if (!characterImg || !characterText) return;
    
    characterImg.classList.remove('bounce', 'shake', 'jump');
    void characterImg.offsetWidth;
    characterImg.classList.add('jump');
    
    const dialogs = characterDialogs.thinking;
    const randomDialog = dialogs[Math.floor(Math.random() * dialogs.length)];
    characterText.textContent = randomDialog;
}

// ==================== 数据持久化 ====================
function getDefaultStats() {
    return {
        totalScore: 0,
        completedLevels: 0,
        maxStreak: 0
    };
}

function saveLocalStats() {
    localStorage.setItem('historyGameStats', JSON.stringify({
        levelProgress: GameState.levelProgress,
        userStats: GameState.userStats
    }));
}

function loadLocalStats() {
    const saved = localStorage.getItem('historyGameStats');
    if (!saved) return false;

    try {
        const data = JSON.parse(saved);
        GameState.levelProgress = data.levelProgress || {};
        GameState.userStats = data.userStats || getDefaultStats();
        return true;
    } catch (error) {
        GameState.levelProgress = {};
        GameState.userStats = getDefaultStats();
        return false;
    }
}

function saveUserStats() {
    saveLocalStats();

    const student = BackendState.student || getStoredStudent();
    if (!student || !student.id) {
        return Promise.resolve(false);
    }

    return BackendApi.saveProgress({
        studentId: student.id,
        levelProgress: GameState.levelProgress,
        userStats: GameState.userStats
    }).then(() => {
        BackendState.available = true;
        return true;
    }).catch((error) => {
        BackendState.available = false;
        console.warn('Failed to sync progress with backend:', error);
        return false;
    });
}

async function loadUserStats() {
    const student = BackendState.student || getStoredStudent();

    if (student && student.id) {
        try {
            const data = await BackendApi.getProgress(student.id);
            GameState.levelProgress = data.levelProgress || {};
            GameState.userStats = data.userStats || getDefaultStats();
            BackendState.student = student;
            BackendState.available = true;
            saveLocalStats();
            return true;
        } catch (error) {
            BackendState.available = false;
            console.warn('Failed to load progress from backend:', error);
        }
    }

    if (!loadLocalStats()) {
        GameState.levelProgress = {};
        GameState.userStats = getDefaultStats();
    }
    return false;
}

function saveLevelResult(stars, accuracy) {
    const student = BackendState.student || getStoredStudent();
    if (!student || !student.id || !GameState.currentLevel) {
        return Promise.resolve(false);
    }

    return BackendApi.saveResult({
        studentId: student.id,
        levelId: GameState.currentLevel.id,
        score: GameState.score,
        accuracy,
        stars,
        maxStreak: GameState.maxStreak,
        totalQuestions: GameState.totalQuestions,
        correctAnswers: GameState.correctAnswers,
        answers: GameState.answers
    }).then(() => {
        BackendState.available = true;
        return true;
    }).catch((error) => {
        BackendState.available = false;
        console.warn('Failed to sync level result with backend:', error);
        return false;
    });
}

// ==================== 启动游戏 ====================
document.addEventListener('DOMContentLoaded', async () => {
    BackendState.student = getStoredStudent();
    updateHomeLoginPanel();
    await loadUserStats();
    setupEventListeners();
    renderLevelGrid();
    updateHomeLoginPanel();
});
