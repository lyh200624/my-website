// ==================== 图文史料数据 ====================

const DOCUMENT_DATA = [
    // 商鞅变法
    {
        id: 'shangyang-1',
        reform: '商鞅变法',
        reformId: 'shangyang',
        title: '《史记·商君列传》',
        image: '',
        originalText: '孝公曰：善。以卫鞅为左庶长，卒定变法之令。令民为什伍……有军功者各以率……宗室非有军功论不得为属籍。',
        annotation: '商鞅变法主要内容：\n①什五连坐：五家为保，十家相连，互相纠察告发\n②强制分家：民有二男以上不分异者，倍其赋\n③奖励军功：有军功者受上爵，宗室非有军功不得列籍\n④重农抑商：努力耕织致粟帛多者复其身\n⑤废井田：开阡陌封疆，授田于百姓\n⑥推行县制：集小都乡邑聚为县，置令、丞，凡三十一县'
    },
    {
        id: 'shangyang-2',
        reform: '商鞅变法',
        reformId: 'shangyang',
        title: '方升·标准量器',
        image: '../图片3/2.jpg',
        originalText: '方升是秦孝公时期颁布的标准量器，器壁刻有铭文。',
        annotation: '商鞅变法中的"平斗桶"政策，统一了容量单位。方升作为标准量器的代表，确保了全国赋税征收的统一性，有效防止了贵族私藏粮食、偷逃税款的行为，这一措施为秦国的强盛奠定了经济基础。'
    },
    // 孝文帝改革
    {
        id: 'xiaowen-1',
        reform: '孝文帝改革',
        reformId: 'xiaowen',
        title: '《魏书·官氏志》',
        image: '',
        originalText: '皇子及异姓元功上勋者封王，宗室及始蕃王皆降为公，诸公降为侯……丘穆陵氏后改为穆氏，步六孤氏后改为陆氏，贺赖氏后改为贺氏。',
        annotation: '孝文帝改革主要内容：\n①仿照魏晋以来汉族社会的士族阶层制度\n②改汉姓：丘穆陵→穆，步六孤→陆，贺赖→贺等\n③穿汉服、说汉语\n④与汉族通婚\n⑤推行均田制\n⑥迁都洛阳'
    },
    {
        id: 'xiaowen-2',
        reform: '孝文帝改革',
        reformId: 'xiaowen',
        title: '帝后礼佛图',
        image: '../图片3/3.jpg',
        originalText: '《帝后礼佛图》——北魏汉化改革的石刻证据',
        annotation: '这幅浮雕创作于北魏迁都洛阳之后，画面描绘了孝文帝和文昭皇后率领文武百官列队礼佛的宏大场景。浮雕中的人物服饰、发型、仪仗等细节，直观展示了北魏进入中原后接受汉族文化、礼仪规范的巨大变化，是孝文帝汉化改革最有力的实物证据之一。'
    },
    // 王安石变法
    {
        id: 'wanganshi-1',
        reform: '王安石变法',
        reformId: 'wanganshi',
        title: '《宋史·列传卷第八十六》',
        image: '',
        originalText: '安石曰："变风俗，立法度，最方今之所急也。"……农田水利、青苗、均输，保甲、免役，市易、保马、方田诸役相继并兴，号为新法。',
        annotation: '王安石变法主要内容（涉及农业、商业、军事、科举等）：\n①青苗法：春散秋敛，出息二分，低息贷款给农民\n②均输法：徙贵就贱，用近易远，预知所需，蓄买上供之物\n③保甲法：二丁取一，十家为保，保丁授弓弩，教之战阵\n④免役法：据家赀高下出钱雇人充役\n⑤市易法：赊贷官物出息二分，逾期加罚\n⑥农田水利法、方田均税法、保马法等'
    },
    {
        id: 'wanganshi-2',
        reform: '王安石变法',
        reformId: 'wanganshi',
        title: '元丰通宝',
        image: '../图片3/6.jpg',
        originalText: '元丰通宝是王安石变法时期流通的货币。',
        annotation: '青苗法贷款给农民，收获后还钱。对应措施：青苗法，市易法。青黄不接时，政府用常平仓的粮食作本钱，低息借给农民，夏秋收获后连本带息归还，这样农民不用借高利贷，政府也增加了收入。'
    },
    // 张居正改革
    {
        id: 'zhangjuzheng-1',
        reform: '张居正改革',
        reformId: 'zhangjuzheng',
        title: '《明史·列传》',
        image: '',
        originalText: '神宗即位，保以两宫诏旨逐拱，事具拱传。居正遂代拱为首辅。居正为政，以尊主权、课吏职，信赏罚，一号令为主。',
        annotation: '张居正改革主要内容：\n①考成法：部院覆奏行抚按勘者，稽不报者罪之，整顿吏治\n②漕运改革：督艘卒以孟冬月兑运，及岁初毕发，少罹水患\n③清丈土地：针对土地兼并严重\n④一条鞭法：赋税合一，折银征收\n⑤针对明中后期政治腐败、府库空虚、农民反抗等状况\n辅政十年，国家财政收入增加，社会矛盾相对缓和'
    },
    {
        id: 'zhangjuzheng-2',
        reform: '张居正改革',
        reformId: 'zhangjuzheng',
        title: '归户由帖',
        image: '../图片3/5.jpg',
        originalText: '"归户由帖"——张居正"一条鞭法"改革的"土地身份证"',
        annotation: '这是明朝万历八年（1580年）福建汀州府长汀县颁发给农户的"归户由帖"。它标明了农户的土地面积、位置、土地等级和应缴税额，类似于今天的"田产证"和"纳税通知书"合二为一。"归户"意为将土地登记到具体农户名下；"由帖"是官方凭证。这正是张居正推行"一条鞭法"时清丈土地，按亩征税的直接实物证据。'
    },
    // 戊戌变法
    {
        id: 'wuxu-1',
        reform: '戊戌变法',
        reformId: 'wuxu',
        title: '康有为变法理论著作',
        image: '',
        images: ['../图片3/9.jpg', '../图片3/10.jpg'],
        originalText: '《新学伪经考》《孔子改制考》',
        annotation: '遭逢"数千年未有之大变局"，晚清一批读书人逐渐认识到，唯有实行变法才能救亡图存。\n\n康有为撰写的两部重要著作：\n①《新学伪经考》：考证古文经学为伪造，为变法维新提供理论依据\n②《孔子改制考》：论证孔子改制的事实，证明变法有历史先例\n\n这两部著作起到了解放思想的作用，维新思想很快发展成爱国救亡的政治运动。'
    },
    {
        id: 'wuxu-2',
        reform: '戊戌变法',
        reformId: 'wuxu',
        title: '公车上书',
        image: '../图片3/7.jpg',
        originalText: '康有为联合举人上书请求变法。',
        annotation: '甲午战败后，康有为联合在北京赶考的1000多名举人，联名上书光绪皇帝，要求变法图强，这次行动叫"公车上书"，是戊戌变法的起点。他们主张学习西方，改革科举，废除八股文，创办新式学堂。'
    },
    // 改革开放
    {
        id: 'reform-1',
        reform: '改革开放',
        reformId: 'reform',
        title: '小岗村手印',
        image: '../图片3/8.jpg',
        originalText: '包产到户，家庭联产承包责任制',
        annotation: '1978年，安徽小岗村18位农民冒着风险按下红手印，约定分田到户："交够国家的、留足集体的、剩下都是自己的"。这种做法后来被邓小平肯定，推广到全国，极大调动了农民积极性，解决了吃饭问题。'
    }
];

// 按变法分组
const DOCUMENT_BY_REFORM = {
    'shangyang': DOCUMENT_DATA.filter(d => d.reformId === 'shangyang'),
    'xiaowen': DOCUMENT_DATA.filter(d => d.reformId === 'xiaowen'),
    'wanganshi': DOCUMENT_DATA.filter(d => d.reformId === 'wanganshi'),
    'zhangjuzheng': DOCUMENT_DATA.filter(d => d.reformId === 'zhangjuzheng'),
    'wuxu': DOCUMENT_DATA.filter(d => d.reformId === 'wuxu'),
    'reform': DOCUMENT_DATA.filter(d => d.reformId === 'reform')
};

// 变法名称映射
const REFORM_NAMES = {
    'shangyang': '商鞅变法',
    'xiaowen': '孝文帝改革',
    'wanganshi': '王安石变法',
    'zhangjuzheng': '张居正改革',
    'wuxu': '戊戌变法',
    'reform': '改革开放'
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DOCUMENT_DATA, DOCUMENT_BY_REFORM, REFORM_NAMES };
}
