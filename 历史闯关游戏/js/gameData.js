// ==================== 游戏数据 ====================

const LEVELS = [
    // ==================== 第一关：商鞅变法 ====================
    {
        id: 1,
        name: "商鞅变法",
        era: "战国时期",
        description: "公元前4世纪，秦国掀起了一场深刻的社会变革",
        period: "公元前4世纪",
        intro: {
            title: "商鞅变法",
            content: "战国时期是中国历史上的大变革时期。铁器的使用和牛耕的推广，使社会生产力得到进一步发展，生产关系处于急剧变动之中。各国为了适应社会变动，实现富国强兵，纷纷推行变法。",
            quote: "「治世不一道，便国不法古」——商鞅",
            figures: ["商鞅（约公元前390—前338）", "秦孝公"],
            achievements: [
                "废除井田制，确立土地私有",
                "奖励耕织，重农抑商",
                "废除世卿世禄制，奖励军功",
                "实行什伍连坐制度",
                "建立县制，加强中央集权"
            ],
            impact: "使秦国从西部边陲弱国一跃成为虎视群雄的政治军事强国，为秦成就统一霸业奠定了基础。"
        },
        video: {
            title: "《历史的拐点》商鞅变法",
            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", // 占位URL
            description: "央视纪录片《历史的拐点》完整呈现商鞅变法的历史过程"
        },
        images: [
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Diorama_of_Shang_Yang_at_Zhengzhou_Museum.jpg/440px-Diorama_of_Shang_Yang_at_Zhengzhou_Museum.jpg",
                caption: "商鞅雕像"
            },
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Qin_dynasty_coin.jpg/440px-Qin_dynasty_coin.jpg",
                caption: "秦半两钱（商鞅变法产物）"
            },
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Weituo_Gansu_Museum_2009_04.jpg/440px-Weituo_Gansu_Museum_2009_04.jpg",
                caption: "商鞅方升（度量衡器具）"
            }
        ],
        questions: [
            {
                type: "choice",
                question: "商鞅变法发生在哪个诸侯国？",
                options: ["魏国", "楚国", "齐国", "秦国"],
                correct: 3,
                explanation: "商鞅在秦孝公的支持下，在秦国推行变法，这是战国时期最彻底的改革。"
            },
            {
                type: "judge",
                question: "商鞅变法确立了土地私有制，允许土地自由买卖。",
                correct: true,
                explanation: "商鞅废除井田制，确立了封建土地私有制，允许土地自由买卖，这是中国历史上土地制度的重要变革。"
            },
            {
                type: "choice",
                question: "商鞅变法中，「奖励军功」措施的主要目的是什么？",
                options: ["发展商业", "削弱贵族特权", "增加税收", "对外扩张"],
                correct: 1,
                explanation: "废除世卿世禄制，奖励军功，使得不论出身贵贱，只要在战场上立功就能获得爵位和特权，从而削弱贵族特权。"
            },
            {
                type: "fill",
                question: "商鞅推行什伍连坐制度，其中「伍」指的是以____为单位进行编制。",
                answers: ["五户", "五", "5", "5户"],
                explanation: "什伍连坐是商鞅推行的地方管理制度，十家为一什，五家为一伍，互相监督，连坐处罚。"
            },
            {
                type: "choice",
                question: "商鞅变法中，直接推动秦国从分封制向中央集权制转型，为后世两千多年封建官僚制度奠定基础的核心措施是（ ）",
                options: [
                    "A. 奖励军功，实行二十等爵制",
                    "B. 废井田，开阡陌，承认土地私有",
                    "C. 推行县制，由国君直接派官吏治理",
                    "D. 重农抑商，奖励耕织"
                ],
                correct: 2,
                explanation: "推行县制打破了分封制下贵族世袭统治的格局，将地方权力收归中央，是中央集权制度在地方行政上的开端，直接推动了政治体制转型；A项提升军队战斗力，B项确立封建土地所有制，D项促进农业发展，均不符合「中央集权转型」的核心设问。"
            }
        ]
    },

    // ==================== 第二关：北魏孝文帝改革 ====================
    {
        id: 2,
        name: "北魏孝文帝改革",
        era: "南北朝时期",
        description: "鲜卑族拓跋部推动的民族交融与汉化改革",
        period: "公元439-499年",
        intro: {
            title: "北魏孝文帝改革",
            content: "两晋南北朝时期，由西部和北部内迁的游牧民族纷纷建立政权。439年，鲜卑族拓跋部建立的北魏重新统一北方。在长期的冲突与交往中，民族交融成为历史发展的潮流。",
            quote: "「移风易俗，莫善于乐」——孝文帝",
            figures: ["北魏孝文帝拓跋宏（467-499）", "冯太后"],
            achievements: [
                "推行俸禄制，整顿吏治",
                "实行均田制",
                "建立三长制",
                "迁都洛阳",
                "易服装、改汉姓、说汉话、通婚姻"
            ],
            impact: "加快了北方各族人民的交融，缓和了民族矛盾，缩小了南北差距，为中国统一多民族国家的发展作出了重要贡献。"
        },
        video: {
            title: "《中国通史》北魏孝文帝改革",
            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            description: "央视《中国通史》系列纪录片详细讲述孝文帝汉化改革"
        },
        images: [
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Mogao_Cave_045_%28cropped%29.jpg/440px-Mogao_Cave_045_%28cropped%29.jpg",
                caption: "北魏时期的佛教艺术"
            },
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Beijing_Longquan_Silver_Yuanbao.jpg/440px-Beijing_Longquan_Silver_Yuanbao.jpg",
                caption: "元宝（货币改革的体现）"
            },
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Yongle_Gong_Shu_Dynasty.jpg/440px-Yongle_Gong_Shu_Dynasty.jpg",
                caption: "北魏风格的古建筑"
            }
        ],
        questions: [
            {
                type: "choice",
                question: "北魏孝文帝改革的背景是什么？",
                options: ["农民起义", "佛教传播", "民族交融的历史潮流", "对外战争"],
                correct: 2,
                explanation: "在长期的冲突与交往中，民族交融成为历史发展的潮流，这是孝文帝改革的重要背景。"
            },
            {
                type: "fill",
                question: "孝文帝将鲜卑族姓氏「____」改为「元」姓。",
                answers: ["拓跋", "拓", "tuoba"],
                explanation: "孝文帝下令将鲜卑族的「拓跋」姓改为汉族的「元」姓，这是其汉化政策的重要组成部分。"
            },
            {
                type: "judge",
                question: "均田制是孝文帝改革的核心内容之一。",
                correct: true,
                explanation: "均田制是北魏孝文帝在冯太后支持下推行的重要改革，将无主土地分配给农民，既增加了国家收入，也促进了经济发展。"
            },
            {
                type: "choice",
                question: "孝文帝改革中，哪项措施促进了民族交融？",
                options: ["推行均田制", "建立三长制", "迁都洛阳、易服装、改汉姓", "推行俸禄制"],
                correct: 2,
                explanation: "孝文帝亲政后，采取迁都洛阳、易服装、改汉姓、说汉话、通婚姻等措施，加快了北方各族人民的交融。"
            },
            {
                type: "choice",
                question: "北魏孝文帝改革大大加速了北方民族交融，下列措施中，最有利于打破鲜卑贵族与汉族士族的身份隔阂、推动民族深度认同的是（ ）",
                options: [
                    "A. 禁胡语，说汉话",
                    "B. 通婚姻，与汉族士族联姻",
                    "C. 禁胡服，穿汉服",
                    "D. 改籍贯，迁洛阳者为河南洛阳人"
                ],
                correct: 1,
                explanation: "婚姻是血缘与身份融合的核心纽带，通过与汉族士族联姻，从根本上打破了民族间的身份壁垒，推动鲜卑贵族与汉族地主的利益融合，是民族交融最彻底的措施；A、C、D项均为文化、身份层面的配套措施，融合深度不及婚姻制度。"
            }
        ]
    },

    // ==================== 第三关：王安石变法 ====================
    {
        id: 3,
        name: "王安石变法",
        era: "北宋时期",
        description: "北宋中期力图富国强兵的改革运动",
        period: "公元1069-1076年",
        intro: {
            title: "王安石变法",
            content: "北宋建立后，统治者吸取唐末五代藩镇割据导致分裂的教训，采取了一系列加强中央集权的措施。北宋中期，政治腐败，财政困难，改革呼声越来越强烈。",
            quote: "「天命不足畏，祖宗不足法，人言不足恤」——王安石",
            figures: ["王安石（1021-1086）", "宋神宗", "宋仁宗"],
            achievements: [
                "青苗法：政府放贷农民",
                "募役法：雇人代役",
                "农田水利法：鼓励兴修水利",
                "方田均税法：清查土地",
                "保甲法：维护社会治安"
            ],
            impact: "变法初期取得了显著成效，但由于涉及面广、阻力大，有些措施也欠妥当。王安石被罢职后，变法措施大多被废止。"
        },
        video: {
            title: "《百家讲坛》王安石变法",
            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            description: "著名学者深度解读王安石变法的历史背景与影响"
        },
        images: [
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Wang_Anshi.jpg/440px-Wang_Anshi.jpg",
                caption: "王安石画像"
            },
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Song_Dynasty_coin.jpg/440px-Song_Dynasty_coin.jpg",
                caption: "宋代铜钱"
            },
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Zhang_Zaidong.jpg/440px-Zhang_Zaidong.jpg",
                caption: "王安石相关文物"
            }
        ],
        questions: [
            {
                type: "choice",
                question: "王安石变法的主要目的是什么？",
                options: ["推翻北宋统治", "发展佛教", "富国强兵", "抵御外敌入侵"],
                correct: 2,
                explanation: "王安石针对官僚机构、财政制度、军事体制等方面的弊端，制定和推行了一系列变法措施，以达到富国强兵的目的。"
            },
            {
                type: "judge",
                question: "王安石变法触犯了大官僚大地主的利益。",
                correct: true,
                explanation: "新法触犯了大官僚大地主的利益，这是变法遭到强烈反对的重要原因。"
            },
            {
                type: "choice",
                question: "王安石变法中，旨在「去重敛、宽农民、足国用」，既限制高利贷盘剥、保护农民利益，又增加政府财政收入的措施是（ ）",
                options: [
                    "A. 青苗法",
                    "B. 募役法",
                    "C. 方田均税法",
                    "D. 保甲法"
                ],
                correct: 0,
                explanation: "青苗法规定政府在青黄不接时向农民低息放贷，既避免了地主高利贷的残酷剥削，又为政府开辟了财政来源，完美契合题干「宽农民、足国用」的双重目标；B项针对差役负担，C项针对土地偷税，D项为军事措施，均不符合题意。"
            },
            {
                type: "fill",
                question: "王安石  在宋____（皇帝年号）年间开始主持变法。",
                answers: ["神宗", "神宗时期", "1069"],
                explanation: "1069年，宋神宗起用王安石主持变法。"
            },
            {
                type: "choice",
                question: "与商鞅变法相比，王安石变法的结果有何不同？",
                options: ["都取得了完全成功", "都失败了", "商鞅成功而王安石失败", "王安石成功而商鞅失败"],
                correct: 2,
                explanation: "商鞅变法使秦国走向富强并最终统一六国；而王安石变法最终失败，王安石被罢职后新法大多被废止。"
            },
            {
                type: "judge",
                question: "王安石变法最终取得完全成功。",
                correct: false,
                explanation: "王安石变法实行五六年后，王安石被罢职，变法措施被废止，变法最终失败。"
            },
            {
                type: "fill",
                question: "王安石说：「天命不足畏，祖宗不足法，人言不足____。」",
                answers: ["恤", "恤", "恤"],
                explanation: "这句话体现了王安石大胆改革的精神，不畏惧天命、不拘泥祖宗成法、不怕流言蜚语。"
            }
        ]
    },

    // ==================== 第四关：戊戌变法 ====================
    {
        id: 4,
        name: "戊戌变法",
        era: "晚清时期",
        description: "中国近代维新派推动的改良运动",
        period: "公元1898年",
        intro: {
            title: "戊戌变法",
            content: "甲午中日战争的失败极大地震撼了中国社会。以康有为、梁启超等为代表的一批维新志士，创学会、办报刊、兴学堂，宣传维新思想。1898年，维新变法运动达到高潮。",
            quote: "「能变则全，不变则亡，全变则强，小变仍亡」——康有为",
            figures: ["康有为（1858-1927）", "梁启超（1873-1929）", "谭嗣同（1865-1898）"],
            achievements: [
                "创办《万国公报》等维新报刊",
                "建立强学会、南学会等学会",
                "创办新式学堂",
                "光绪帝颁布变法诏令",
                "冲击封建制度，促进思想启蒙"
            ],
            impact: "戊戌变法虽然在政治上失败了，但在社会上起到了思想启蒙作用，促进了中国人民觉醒。"
        },
        video: {
            title: "《凤凰大视野》回望梁启超",
            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            description: "凤凰卫视纪录片，回顾戊戌变法和梁启超的传奇人生"
        },
        images: [
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Kang_Youwei.jpg/440px-Kang_Youwei.jpg",
                caption: "康有为画像"
            },
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Liang_Qichao.jpg/440px-Liang_Qichao.jpg",
                caption: "梁启超画像"
            },
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Tan_Sitong.jpg/440px-Tan_Sitong.jpg",
                caption: "谭嗣同画像"
            }
        ],
        questions: [
            {
                type: "choice",
                question: "戊戌变法发生在哪一年？",
                options: ["1894年", "1895年", "1898年", "1900年"],
                correct: 2,
                explanation: "1898年是农历戊戌年，这一年发生了著名的戊戌变法，又称百日维新。"
            },
            {
                type: "judge",
                question: "戊戌变法证明了资产阶级改良道路在半殖民地半封建社会的中国是行不通的。",
                correct: true,
                explanation: "戊戌变法的失败证明，在当时的历史条件下，改良道路无法挽救中国。"
            },
            {
                type: "choice",
                question: "戊戌变法失败后，拒绝出走日本、最终就义的维新志士是？",
                options: ["康有为", "梁启超", "谭嗣同", "光绪帝"],
                correct: 2,
                explanation: "谭嗣同在戊戌政变发生后，拒绝出走日本，说：「各国变法无不流血而成，中国变法流血，就从我开始吧。」最终从容就义。"
            },
            {
                type: "fill",
                question: "谭嗣同在狱中写下了「我自横刀向天笑，去留肝胆____」的诗句。",
                answers: ["两昆仑", "两", "两昆仑", "两"],
                explanation: "这句诗出自谭嗣同的《狱中题壁》，表达了他视死如归的豪迈气概。"
            },
            {
                type: "choice",
                question: "戊戌变法是中国近代一次重要的资产阶级改良运动，其最核心的历史意义在于（ ）",
                options: [
                    "A. 挽救了民族危亡，实现了国家富强",
                    "B. 推翻了封建君主专制，建立了民主共和制",
                    "C. 传播了维新思想，起到了思想启蒙的作用",
                    "D. 推动了洋务运动的深入开展，开启了近代化"
                ],
                correct: 2,
                explanation: "戊戌变法最终失败，未能挽救民族危亡、推翻君主专制，也晚于洋务运动；其最大价值在于传播了西方资产阶级政治学说与思想文化，在社会上起到了思想启蒙的作用，为后来的辛亥革命奠定了思想基础。"
            },
            {
                type: "sort",
                question: "请按时间顺序排列戊戌变法的发展过程：",
                items: [
                    "光绪帝颁布变法诏令",
                    "康有为创办《万国公报》",
                    "戊戌政变发生",
                    "建立强学会"
                ],
                correctOrder: [1, 3, 0, 2],
                explanation: "康有为首先创办《万国公报》宣传维新思想，然后建立强学会等组织，推动光绪帝颁布变法诏令，最终变法触怒慈禧太后，戊戌政变发生。"
            },
            {
                type: "choice",
                question: "与前面的变法相比，戊戌变法有什么突出特点？",
                options: ["得到皇帝全力支持", "试图建立君主立宪制", "由农民领导", "成功实现了富国强兵"],
                correct: 1,
                explanation: "戊戌变法是中国近代一次重要的资产阶级改良运动，试图在中国建立君主立宪制度，这是与古代变法不同的新特点。"
            }
        ]
    },

    // ==================== 第五关：张居正改革 ====================
    {
        id: 5,
        name: "张居正改革",
        era: "明朝时期",
        description: "明朝中后期挽救统治危机的改革",
        period: "公元1572-1582年",
        intro: {
            title: "张居正改革",
            content: "明朝中后期，政治日益腐败，统治危机不断加深。1572年，张居正出任内阁首辅，进行了一系列改革措施，被誉为「救时宰相」。",
            quote: "「为政之道在于足国用」——张居正",
            figures: ["张居正（1525-1582）", "明神宗"],
            achievements: [
                "大力整肃吏治，加强官吏考核",
                "裁减开支，节省财政支出",
                "清丈土地，抑制土地兼并",
                "改革税制，推行一条鞭法",
                "整顿军事，加强边防"
            ],
            impact: "张居正辅政十年，国家财政收入增加，社会矛盾相对缓和，严重的封建统治危机得到暂时缓解。"
        },
        video: {
            title: "《百家讲坛》张居正改革",
            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            description: "历史学家深度解读张居正的改革措施与历史评价"
        },
        images: [
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Zhang_Juzheng.jpg/440px-Zhang_Juzheng.jpg",
                caption: "张居正画像"
            },
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Ming_Dynasty.jpg/440px-Ming_Dynasty.jpg",
                caption: "明朝万历年间货币"
            },
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Ming_China_1500.gif/440px-Ming_China_1500.gif",
                caption: "明朝疆域图"
            }
        ],
        questions: [
            {
                type: "choice",
                question: "张居正改革发生在哪位皇帝在位期间？",
                options: ["明成祖", "明英宗", "明神宗", "明熹宗"],
                correct: 2,
                explanation: "1572年，明神宗即位，张居正出任内阁首辅，开始推行改革。"
            },
            {
                type: "judge",
                question: "张居正被称为「救时宰相」，因为他成功挽救了明朝的统治危机。",
                correct: true,
                explanation: "张居正因其在明朝危机时刻推行改革、稳固统治的功绩，被誉为「救时宰相」。"
            },
            {
                type: "fill",
                question: "张居正推行的一条鞭法将各种赋税统一折成____征收。",
                answers: ["银两", "银子", "银", "白银"],
                explanation: "一条鞭法将各种赋税统一折成银两征收，简化了税制，促进了商品经济发展。"
            },
            {
                type: "choice",
                question: "明朝中后期，官场积压公文、政令推行迟缓的现象严重，张居正为扭转这一局面，在吏治方面推行的核心措施是（ ）",
                options: [
                    "A. 行省制度",
                    "B. 内阁制",
                    "C. 考成法",
                    "D. 内阁首辅"
                ],
                correct: 2,
                explanation: "针对当时官场拖延、效率低下的问题，张居正推行考成法，以「立限考事、以事责人」为核心，通过层层考核问责，确保政令畅通。A项是元朝地方行政制度，B项是中央官制的形成过程，D项是张居正的职位身份，均与题干「解决公文积压、提升行政效率」的要求不符。"
            },
            {
                type: "choice",
                question: "张居正改革与商鞅变法在改革成效上有什么共同点？",
                options: ["都取得完全成功并长期延续", "都在改革者去世后被废止", "都遭到贵族反对", "都得到了皇帝的大力支持"],
                correct: 1,
                explanation: "商鞅虽遭车裂而死但新法延续；张居正死后改革措施也大多被废止。这说明改革的艰难性。"
            },
            {
                type: "sort",
                question: "请按时间顺序排列张居正的改革措施：",
                items: [
                    "推行一条鞭法",
                    "出任内阁首辅",
                    "清丈土地",
                    "整顿吏治"
                ],
                correctOrder: [1, 3, 2, 0],
                explanation: "张居正1572年出任首辅后，首先整顿吏治，然后清丈土地，最后推行一条鞭法。"
            },
            {
                type: "judge",
                question: "张居正死后，他推行的所有改革措施都被保留了下来。",
                correct: false,
                explanation: "张居正死后，除一条鞭法外，其他改革几乎全部废止。"
            }
        ]
    },

    // ==================== 第六关：改革开放 ====================
    {
        id: 6,
        name: "改革开放",
        era: "当代中国",
        description: "决定当代中国命运的关键一招",
        period: "1978年至今",
        intro: {
            title: "改革开放",
            content: "1978年12月，中共十一届三中全会召开，作出把全党工作着重点转移到社会主义现代化建设上来、实行改革开放的历史性决策，开启了改革开放和社会主义现代化建设新时期。",
            quote: "「改革开放是党和人民大踏步赶上时代的重要法宝」——习近平",
            figures: ["邓小平", "江泽民", "胡锦涛", "习近平"],
            achievements: [
                "实行家庭联产承包责任制",
                "设立深圳等经济特区",
                "加入世界贸易组织",
                "推进「一带一路」倡议",
                "建立社会主义市场经济体制",
                "全面深化改革，推进国家治理现代化"
            ],
            impact: "改革开放极大改变了中国的面貌、中华民族的面貌、中国人民的面貌、中国共产党的面貌。"
        },
        video: {
            title: "《中国1978》改革开放纪录片",
            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            description: "央视纪录片，回顾1978年以来的改革开放历程"
        },
        images: [
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Deng_Xiaoping.jpg/440px-Deng_Xiaoping.jpg",
                caption: "邓小平"
            },
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/TsinghuaUniversity.jpg/440px-TsinghuaUniversity.jpg",
                caption: "深圳特区 - 改革开放的窗口"
            },
            {
                url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Shanghai_Pudong_Skyline_2011.jpg/440px-Shanghai_Pudong_Skyline_2011.jpg",
                caption: "上海浦东 - 改革开放的见证"
            }
        ],
        questions: [
            {
                type: "choice",
                question: "中共十一届三中全会召开于哪一年？",
                options: ["1976年", "1978年", "1980年", "1982年"],
                correct: 1,
                explanation: "1978年12月，中共十一届三中全会召开，作出改革开放的历史性决策。"
            },
            {
                type: "judge",
                question: "改革开放是决定当代中国命运的关键一招。",
                correct: true,
                explanation: "习近平指出：「改革开放是党和人民大踏步赶上时代的重要法宝，是坚持和发展中国特色社会主义的必由之路，是决定当代中国命运的关键一招。」"
            },
            {
                type: "fill",
                question: "1978年，____省率先实行家庭联产承包责任制，开启了农村改革的序幕。",
                answers: ["安徽", "四川", "凤阳", "小岗村"],
                explanation: "1978年，安徽省凤阳县小岗村18户农民率先实行家庭联产承包责任制，开启了中国农村改革的序幕。"
            },
            {
                type: "choice",
                question: "改革开放是决定当代中国命运的关键一招，其中标志着中国改革开放和社会主义现代化建设进入新阶段的重要事件是（ ）",
                options: [
                    "A. 1978年中共十一届三中全会的召开",
                    "B. 1980年深圳等四个经济特区的设立",
                    "C. 1992年邓小平南方谈话与中共十四大",
                    "D. 2001年中国加入世界贸易组织"
                ],
                correct: 2,
                explanation: "1992年邓小平南方谈话解放了思想，中共十四大明确提出建立社会主义市场经济体制的目标，标志着改革开放进入新阶段；A项是改革开放的起点，B项是对外开放的起步，D项是融入经济全球化的里程碑，均不符合「新阶段」的定义。"
            },
            {
                type: "choice",
                question: "与古代的变法改革相比，改革开放有什么本质区别？",
                options: ["没有皇帝领导", "坚持社会主义方向", "得到了全体人民支持", "没有遇到任何阻力"],
                correct: 1,
                explanation: "改革开放始终坚持社会主义方向，这是与古代变法最本质的区别。"
            },
            {
                type: "judge",
                question: "改革开放过程中，中国选择了社会主义市场经济体制。",
                correct: true,
                explanation: "1992年中共十四大确定建立社会主义市场经济体制的改革目标，这是中国改革的重要创新。"
            },
            {
                type: "fill",
                question: "1980年，中国设立了第一批经济特区，其中最著名的是____。",
                answers: ["深圳", "深圳特区", "经济特区"],
                explanation: "1980年，中国设立深圳、珠海、汕头、厦门四个经济特区，其中深圳的发展最为迅速，成为改革开放的象征。"
            },
            {
                type: "sort",
                question: "请按时间顺序排列改革开放的重要历史节点：",
                items: [
                    "设立经济特区",
                    "中共十一届三中全会",
                    "加入世界贸易组织",
                    "提出一带一路倡议"
                ],
                correctOrder: [1, 0, 2, 3],
                explanation: "1978年十一届三中全会开启改革开放；1980年设立经济特区；2001年加入WTO；2013年提出一带一路倡议，改革开放不断深化。"
            }
        ]
    }
];

// ==================== 导出的常量 ====================
const TOTAL_LEVELS = LEVELS.length;
const QUESTIONS_PER_LEVEL = LEVELS.reduce((sum, level) => sum + level.questions.length, 0);

// 游戏设置
const GAME_CONFIG = {
    baseScore: 100,           // 每题基础分
    timeBonus: 50,            // 时间奖励
    streakBonus: 10,          // 连击奖励
    wrongAnswerPenalty: 0,    // 答错扣分（0表示不扣分）
    timeLimit: 30,            // 每题时间限制（秒）
    starThresholds: [0.6, 0.8, 0.95],  // 获得星星的正确率阈值
};
