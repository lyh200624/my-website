/**
 * 知识图谱数据 - 变法风云
 * 中国历代改革关系图谱
 */

// 节点数据定义
const nodes = [
    // ==================== 战国 - 商鞅变法 ====================
    { 
        id: "shangyang", 
        name: "商鞅变法", 
        category: "success", 
        dynasty: "战国", 
        year: "公元前356年",
        x: 200, 
        y: 200,
        description: "商鞅在秦孝公支持下推行变法，使秦国富强",
        result: "商鞅虽死，秦法未败，为秦统一六国奠定基础"
    },
    { 
        id: "shangyang_measures", 
        name: "废井田开阡陌", 
        category: "measure", 
        parent: "shangyang", 
        relation: "措施", 
        x: 440, 
        y: 140,
        description: "废除井田制，承认土地私有"
    },
    { 
        id: "shangyang_measure2", 
        name: "奖励耕战", 
        category: "measure", 
        parent: "shangyang", 
        relation: "措施", 
        x: 440, 
        y: 200,
        description: "奖励农耕和军功，激发生产积极性"
    },
    { 
        id: "shangyang_measure3", 
        name: "连坐法", 
        category: "measure", 
        parent: "shangyang", 
        relation: "措施", 
        x: 440, 
        y: 260,
        description: "什伍连坐，加强基层控制"
    },
    
    // ==================== 北魏 - 孝文帝改革 ====================
    { 
        id: "xiaowen", 
        name: "孝文帝改革", 
        category: "success", 
        dynasty: "北魏", 
        year: "公元494年",
        x: 200, 
        y: 520,
        description: "冯太后和孝文帝推行汉化改革，促进民族融合",
        result: "加速了北方民族融合进程"
    },
    { 
        id: "xiaowen_measures", 
        name: "迁都洛阳", 
        category: "measure", 
        parent: "xiaowen", 
        relation: "措施", 
        x: 440, 
        y: 460,
        description: "从平城迁都洛阳，加强对中原控制"
    },
    { 
        id: "xiaowen_measure2", 
        name: "汉化政策", 
        category: "measure", 
        parent: "xiaowen", 
        relation: "措施", 
        x: 440, 
        y: 520,
        description: "改汉姓、穿汉服、说汉语"
    },
    { 
        id: "xiaowen_measure3", 
        name: "均田制", 
        category: "measure", 
        parent: "xiaowen", 
        relation: "措施", 
        x: 440, 
        y: 580,
        description: "政府将土地分配给农民耕种"
    },
    
    // ==================== 北宋 - 王安石变法 ====================
    { 
        id: "wanganshi", 
        name: "王安石变法", 
        category: "partial", 
        dynasty: "北宋", 
        year: "公元1069年",
        x: 880, 
        y: 200,
        description: "宋神宗支持下王安石推行新法，以富国强兵",
        result: "变法触动既得利益集团，神宗死后新法被废"
    },
    { 
        id: "wanganshi_measures", 
        name: "青苗法", 
        category: "measure", 
        parent: "wanganshi", 
        relation: "措施", 
        x: 1120, 
        y: 140,
        description: "政府在青黄不接时贷款给农民"
    },
    { 
        id: "wanganshi_measure2", 
        name: "市易法", 
        category: "measure", 
        parent: "wanganshi", 
        relation: "措施", 
        x: 1120, 
        y: 200,
        description: "政府调控市场，稳定物价"
    },
    { 
        id: "wanganshi_measure3", 
        name: "方田均税法", 
        category: "measure", 
        parent: "wanganshi", 
        relation: "措施", 
        x: 1120, 
        y: 260,
        description: "丈量土地，按实际面积征税"
    },
    
    // ==================== 明朝 - 张居正改革 ====================
    { 
        id: "zhangjuzheng", 
        name: "张居正改革", 
        category: "partial", 
        dynasty: "明朝", 
        year: "公元1570年",
        x: 880, 
        y: 520,
        description: "张居正推行万历新政，挽救明朝统治危机",
        result: "张居正死后，改革成果大多被废除"
    },
    { 
        id: "zhangjuzheng_measures", 
        name: "考成法", 
        category: "measure", 
        parent: "zhangjuzheng", 
        relation: "措施", 
        x: 1120, 
        y: 470,
        description: "考核官员政绩，提高行政效率"
    },
    { 
        id: "zhangjuzheng_measure2", 
        name: "一条鞭法", 
        category: "measure", 
        parent: "zhangjuzheng", 
        relation: "措施", 
        x: 1120, 
        y: 540,
        description: "简化税制，合并征收"
    },
    
    // ==================== 晚清 - 戊戌变法（与张居正右侧对齐，X=880） ====================
    { 
        id: "wuxu", 
        name: "戊戌变法", 
        category: "fail", 
        dynasty: "晚清", 
        year: "公元1898年",
        x: 880,  // 改到右边
        y: 800,
        description: "康有为、梁启超辅助光绪帝推行变法",
        result: "戊戌六君子殉难，变法仅持续103天"
    },
    { 
        id: "wuxu_measures", 
        name: "废除八股", 
        category: "measure", 
        parent: "wuxu", 
        relation: "措施", 
        x: 1120, 
        y: 740,
        description: "改革科举制度，废除八股文"
    },
    { 
        id: "wuxu_measure2", 
        name: "设立学堂", 
        category: "measure", 
        parent: "wuxu", 
        relation: "措施", 
        x: 1120, 
        y: 800,
        description: "创办新式学堂，学习西方知识"
    },
    { 
        id: "wuxu_measure3", 
        name: "裁撤冗官", 
        category: "measure", 
        parent: "wuxu", 
        relation: "措施", 
        x: 1120, 
        y: 860,
        description: "精简机构，裁汰冗员"
    },
    
    // ==================== 现代 - 改革开放（与孝文帝左侧对齐，X=200） ====================
    { 
        id: "reform", 
        name: "改革开放", 
        category: "success", 
        dynasty: "现代", 
        year: "公元1978年",
        x: 200,  // 改到左边
        y: 800,
        description: "邓小平领导下开启改革开放的伟大征程",
        result: "中国经济腾飞，人民生活显著改善"
    },
    { 
        id: "reform_measures", 
        name: "家庭联产承包责任制", 
        category: "measure", 
        parent: "reform", 
        relation: "措施", 
        x: 440, 
        y: 750,
        description: "土地承包到户，调动农民积极性"
    },
    { 
        id: "reform_measure2", 
        name: "经济特区", 
        category: "measure", 
        parent: "reform", 
        relation: "措施", 
        x: 440, 
        y: 830,
        description: "设立深圳等经济特区，引进外资"
    }
];

// 连线数据定义
const links = [
    // 商鞅变法连线
    { source: "shangyang", target: "shangyang_measures", type: "measure" },
    { source: "shangyang", target: "shangyang_measure2", type: "measure" },
    { source: "shangyang", target: "shangyang_measure3", type: "measure" },
    
    // 孝文帝改革连线
    { source: "xiaowen", target: "xiaowen_measures", type: "measure" },
    { source: "xiaowen", target: "xiaowen_measure2", type: "measure" },
    { source: "xiaowen", target: "xiaowen_measure3", type: "measure" },
    
    // 王安石变法连线
    { source: "wanganshi", target: "wanganshi_measures", type: "measure" },
    { source: "wanganshi", target: "wanganshi_measure2", type: "measure" },
    { source: "wanganshi", target: "wanganshi_measure3", type: "measure" },
    
    // 张居正改革连线
    { source: "zhangjuzheng", target: "zhangjuzheng_measures", type: "measure" },
    { source: "zhangjuzheng", target: "zhangjuzheng_measure2", type: "measure" },
    
    // 戊戌变法连线
    { source: "wuxu", target: "wuxu_measures", type: "measure" },
    { source: "wuxu", target: "wuxu_measure2", type: "measure" },
    { source: "wuxu", target: "wuxu_measure3", type: "measure" },
    
    // 改革开放连线
    { source: "reform", target: "reform_measures", type: "measure" },
    { source: "reform", target: "reform_measure2", type: "measure" },
    
    // 跨变法关系连线
    { source: "shangyang", target: "xiaowen", type: "inherit", description: "郡县制对后世影响深远" },
    { source: "wanganshi", target: "zhangjuzheng", type: "similar", description: "张居正吸取王安石变法教训，更注重效率和渐进性" },
    { source: "zhangjuzheng", target: "wuxu", type: "contrast", description: "张居正手握实权，光绪帝无实权" },
    { source: "reform", target: "wuxu", type: "inherit", description: "维新思想启蒙后世，为改革开放提供思想基础" },
    { source: "shangyang", target: "wanganshi", type: "inherit", description: "商鞅变法为后世改革提供范例" },
    { source: "xiaowen", target: "reform", type: "inherit", description: "民族融合政策影响深远" }
];

// 节点分类颜色配置
const categoryColors = {
    success: { fill: "#7cb342", stroke: "#5a8a3a", name: "成功改革" },
    partial: { fill: "#d4883a", stroke: "#b86e2a", name: "部分成功" },
    fail: { fill: "#c97a5e", stroke: "#a85e42", name: "失败改革" },
    measure: { fill: "#5a8a6c", stroke: "#4a7058", name: "改革措施" }
};

// 连线类型颜色配置
const linkColors = {
    inherit: { stroke: "#d4a017", name: "传承", dash: "6,3" },
    similar: { stroke: "#7d9e5a", name: "相似", dash: null },
    contrast: { stroke: "#c97a5e", name: "对比", dash: "8,4" },
    measure: { stroke: "#4a7c9e", name: "措施", dash: null }
};

// 将数据挂载到全局
window.nodes = nodes;
window.links = links;
window.categoryColors = categoryColors;
window.linkColors = linkColors;

console.log('graphData.js 已加载，节点数量：', nodes.length, '连线数量：', links.length);