/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

interface ExampleSentence {
  chinese: string;
  pinyin: string;
  english: string;
}

interface HskDataRow {
  hanza: string;
  pinyin: string;
  english: string;
  hsk: string;
  id: number;
  exampleSentences?: ExampleSentence[];
}


// DOM Elements
const flashcardViewer = document.getElementById('flashcardViewer') as HTMLDivElement;
const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
const hskFilterButtons = document.querySelectorAll('.hsk-filter-button') as NodeListOf<HTMLButtonElement>;
const prevButton = document.getElementById('prevButton') as HTMLButtonElement;
const nextButton = document.getElementById('nextButton') as HTMLButtonElement;
const shuffleButton = document.getElementById('shuffleButton') as HTMLButtonElement;
const cardCounter = document.getElementById('cardCounter') as HTMLSpanElement;
const navigationControls = document.getElementById('navigationControls') as HTMLDivElement;
const themeToggleButton = document.getElementById('themeToggleButton') as HTMLButtonElement;


// State
let allHskData: HskDataRow[] = [];
let currentDeck: HskDataRow[] = [];
let currentIndex = 0;
let isAnimating = false; // Prevent multiple navigations during animation
let touchStartX = 0;
let currentTranslateX = 0;
let isDragging = false;
const swipeThreshold = 50; // Min px distance for a swipe

// Embed the pre-generated data directly in the code.
// In a real-world scenario, you would run a one-time script to generate
// sentences for all words and populate this structure.
const hskData: Omit<HskDataRow, 'id'>[] = [
  // HSK 1 - Examples pre-generated
  {
    hanza: "大",
    pinyin: "dà",
    english: "big",
    hsk: "HSK 1",
    exampleSentences: [
      {
        "chinese": "这个苹果很大。",
        "pinyin": "Zhège píngguǒ hěn dà.",
        "english": "This apple is very big."
      },
      {
        "chinese": "他住在一个大房子里。",
        "pinyin": "Tā zhù zài yīgè dà fángzi lǐ.",
        "english": "He lives in a big house."
      }
    ]
  },
  {
    hanza: "多",
    pinyin: "duō",
    english: "many",
    hsk: "HSK 1",
    exampleSentences: [
        {
            "chinese": "这里有很多人。",
            "pinyin": "Zhèlǐ yǒu hěnduō rén.",
            "english": "There are a lot of people here."
        },
        {
            "chinese": "他有很多书。",
            "pinyin": "Tā yǒu hěnduō shū.",
            "english": "He has many books."
        }
    ]
  },
  {
    hanza: "高兴",
    pinyin: "gāoxìng",
    english: "happy",
    hsk: "HSK 1",
     exampleSentences: [
      {
        "chinese": "见到你我很高兴。",
        "pinyin": "Jiàn dào nǐ wǒ hěn gāoxìng.",
        "english": "I am very happy to see you."
      },
      {
        "chinese": "今天他看起来很高兴。",
        "pinyin": "Jīntiān tā kàn qǐlái hěn gāoxìng.",
        "english": "He looks very happy today."
      }
    ]
  },
  {
    hanza: "好",
    pinyin: "hǎo",
    english: "good",
    hsk: "HSK 1",
    exampleSentences: [
        {
            "chinese": "你是一个好学生。",
            "pinyin": "Nǐ shì yīgè hǎo xuéshēng.",
            "english": "You are a good student."
        },
        {
            "chinese": "这个菜很好吃。",
            "pinyin": "Zhège cài hěn hǎo chī.",
            "english": "This dish is very delicious."
        }
    ]
  },
  {
    hanza: "冷",
    pinyin: "lěng",
    english: "cold",
    hsk: "HSK 1"
  },
  {
    hanza: "漂亮",
    pinyin: "piàoliang",
    english: "pretty",
    hsk: "HSK 1"
  },
  {
    hanza: "热",
    pinyin: "rè",
    english: "hot",
    hsk: "HSK 1"
  },
  {
    hanza: "少",
    pinyin: "shǎo",
    english: "few",
    hsk: "HSK 1"
  },
  {
    hanza: "小",
    pinyin: "xiǎo",
    english: "small",
    hsk: "HSK 1"
  },
  {
    hanza: "不",
    pinyin: "bù",
    english: "no, not",
    hsk: "HSK 1"
  },
  {
    hanza: "没有",
    pinyin: "méiyǒu",
    english: "did not",
    hsk: "HSK 1"
  },
  {
    hanza: "很",
    pinyin: "hěn",
    english: "very",
    hsk: "HSK 1"
  },
  {
    hanza: "太",
    pinyin: "tài",
    english: "too",
    hsk: "HSK 1"
  },
  {
    hanza: "都",
    pinyin: "dōu",
    english: "all",
    hsk: "HSK 1"
  },
  {
    hanza: "会",
    pinyin: "huì",
    english: "can, know to",
    hsk: "HSK 1"
  },
  {
    hanza: "能",
    pinyin: "néng",
    english: "can, be able to",
    hsk: "HSK 1"
  },
  {
    hanza: "想",
    pinyin: "xiǎng",
    english: "would like to",
    hsk: "HSK 1"
  },
  {
    hanza: "和",
    pinyin: "hé",
    english: "and",
    hsk: "HSK 1"
  },
  {
    hanza: "这",
    pinyin: "zhè",
    english: "this",
    hsk: "HSK 1"
  },
  {
    hanza: "那",
    pinyin: "nà",
    english: "that",
    hsk: "HSK 1"
  },
  {
    hanza: "喂",
    pinyin: "wèi",
    english: "hey, hello",
    hsk: "HSK 1"
  },
  {
    hanza: "多少",
    pinyin: "duōshǎo",
    english: "how much",
    hsk: "HSK 1"
  },
  {
    hanza: "几",
    pinyin: "jǐ",
    english: "how many, a few",
    hsk: "HSK 1"
  },
  {
    hanza: "哪",
    pinyin: "nǎ",
    english: "which",
    hsk: "HSK 1"
  },
  {
    hanza: "哪儿",
    pinyin: "nǎr",
    english: "where",
    hsk: "HSK 1"
  },
  {
    hanza: "什么",
    pinyin: "shénme",
    english: "what, why",
    hsk: "HSK 1"
  },
  {
    hanza: "谁",
    pinyin: "shéi",
    english: "who",
    hsk: "HSK 1"
  },
  {
    hanza: "怎么",
    pinyin: "zěnme",
    english: "how",
    hsk: "HSK 1"
  },
  {
    hanza: "怎么样",
    pinyin: "zěnmeyàng",
    english: "how about",
    hsk: "HSK 1"
  },
  {
    hanza: "本",
    pinyin: "běn",
    english: "[measure word for books]",
    hsk: "HSK 1"
  },
  {
    hanza: "个",
    pinyin: "gè",
    english: "[measure word for people]",
    hsk: "HSK 1"
  },
  {
    hanza: "块",
    pinyin: "kuài",
    english: "[measure word for pieces]",
    hsk: "HSK 1"
  },
  {
    hanza: "岁",
    pinyin: "suì",
    english: "years old",
    hsk: "HSK 1"
  },
  {
    hanza: "些",
    pinyin: "xiē",
    english: "some",
    hsk: "HSK 1"
  },
  {
    hanza: "一点儿",
    pinyin: "yīdiǎnr",
    english: "a little",
    hsk: "HSK 1"
  },
  {
    hanza: "爸爸",
    pinyin: "bàba",
    english: "dad",
    hsk: "HSK 1"
  },
  {
    hanza: "北京",
    pinyin: "Běijīng",
    english: "Beijing",
    hsk: "HSK 1"
  },
  {
    hanza: "杯子",
    pinyin: "bēizi",
    english: "cup",
    hsk: "HSK 1"
  },
  {
    hanza: "菜",
    pinyin: "cài",
    english: "vegetable",
    hsk: "HSK 1"
  },
  {
    hanza: "茶",
    pinyin: "chá",
    english: "tea",
    hsk: "HSK 1"
  },
  {
    hanza: "出租车",
    pinyin: "chūzūchē",
    english: "taxi",
    hsk: "HSK 1"
  },
  {
    hanza: "点",
    pinyin: "diǎn",
    english: "point, dot, spot",
    hsk: "HSK 1"
  },
  {
    hanza: "电脑",
    pinyin: "diànnǎo",
    english: "computer",
    hsk: "HSK 1"
  },
  {
    hanza: "电视",
    pinyin: "diànshì",
    english: "television",
    hsk: "HSK 1"
  },
  {
    hanza: "电影",
    pinyin: "diànyǐng",
    english: "movie",
    hsk: "HSK 1"
  },
  {
    hanza: "东西",
    pinyin: "dōngxi",
    english: "thing",
    hsk: "HSK 1"
  },
  {
    hanza: "儿子",
    pinyin: "érzi",
    english: "son",
    hsk: "HSK 1"
  },
  {
    hanza: "饭店",
    pinyin: "fàndiàn",
    english: "restaurant",
    hsk: "HSK 1"
  },
  {
    hanza: "飞机",
    pinyin: "fēijī",
    english: "airplane",
    hsk: "HSK 1"
  },
  {
    hanza: "分钟",
    pinyin: "fēnzhōng",
    english: "minute",
    hsk: "HSK 1"
  },
  {
    hanza: "狗",
    pinyin: "gǒu",
    english: "dog",
    hsk: "HSK 1"
  },
  {
    hanza: "汉语",
    pinyin: "hànyǔ",
    english: "mandarin Chinese",
    hsk: "HSK 1"
  },
  {
    hanza: "后面",
    pinyin: "hòumiàn",
    english: "behind",
    hsk: "HSK 1"
  },
  {
    hanza: "家",
    pinyin: "jiā",
    english: "home",
    hsk: "HSK 1"
  },
  {
    hanza: "今天",
    pinyin: "jīntiān",
    english: "today",
    hsk: "HSK 1"
  },
  {
    hanza: "老师",
    pinyin: "lǎoshī",
    english: "teacher",
    hsk: "HSK 1"
  },
  {
    hanza: "里面",
    pinyin: "lǐmiàn",
    english: "inside",
    hsk: "HSK 1"
  },
  {
    hanza: "妈妈",
    pinyin: "māma",
    english: "mom",
    hsk: "HSK 1"
  },
  {
    hanza: "猫",
    pinyin: "māo",
    english: "cat",
    hsk: "HSK 1"
  },
  {
    hanza: "米饭",
    pinyin: "mǐfàn",
    english: "rice",
    hsk: "HSK 1"
  },
  {
    hanza: "明天",
    pinyin: "míngtiān",
    english: "tomorrow",
    hsk: "HSK 1"
  },
  {
    hanza: "名字",
    pinyin: "míngzi",
    english: "name",
    hsk: "HSK 1"
  },
  {
    hanza: "年",
    pinyin: "nián",
    english: "year",
    hsk: "HSK 1"
  },
  {
    hanza: "女儿",
    pinyin: "nǚ'ér",
    english: "daughter",
    hsk: "HSK 1"
  },
  {
    hanza: "朋友",
    pinyin: "péngyou",
    english: "friend",
    hsk: "HSK 1"
  },
  {
    hanza: "苹果",
    pinyin: "píngguǒ",
    english: "apple",
    hsk: "HSK 1"
  },
  {
    hanza: "钱",
    pinyin: "qián",
    english: "money",
    hsk: "HSK 1"
  },
  {
    hanza: "前面",
    pinyin: "qiánmiàn",
    english: "front",
    hsk: "HSK 1"
  },
  {
    hanza: "人",
    pinyin: "rén",
    english: "person",
    hsk: "HSK 1"
  },
  {
    hanza: "上",
    pinyin: "shàng",
    english: "up",
    hsk: "HSK 1"
  },
  {
    hanza: "商店",
    pinyin: "shāngdiàn",
    english: "store",
    hsk: "HSK 1"
  },
  {
    hanza: "上午",
    pinyin: "shàngwǔ",
    english: "morning",
    hsk: "HSK 1"
  },
  {
    hanza: "时候",
    pinyin: "shíhou",
    english: "time",
    hsk: "HSK 1"
  },
  {
    hanza: "书",
    pinyin: "shū",
    english: "book",
    hsk: "HSK 1"
  },
  {
    hanza: "水",
    pinyin: "shuǐ",
    english: "water",
    hsk: "HSK 1"
  },
  {
    hanza: "水果",
    pinyin: "shuǐguǒ",
    english: "fruit",
    hsk: "HSK 1"
  },
  {
    hanza: "天气",
    pinyin: "tiānqì",
    english: "weather",
    hsk: "HSK 1"
  },
  {
    hanza: "同学",
    pinyin: "tóngxué",
    english: "shoolmate",
    hsk: "HSK 1"
  },
  {
    hanza: "下",
    pinyin: "xià",
    english: "down",
    hsk: "HSK 1"
  },
  {
    hanza: "先生",
    pinyin: "xiānsheng",
    english: "sir",
    hsk: "HSK 1"
  },
  {
    hanza: "现在",
    pinyin: "xiànzài",
    english: "now",
    hsk: "HSK 1"
  },
  {
    hanza: "小姐",
    pinyin: "xiǎojiě",
    english: "Miss",
    hsk: "HSK 1"
  },
  {
    hanza: "下午",
    pinyin: "xiàwǔ",
    english: "afternoon",
    hsk: "HSK 1"
  },
  {
    hanza: "星期",
    pinyin: "xīngqī",
    english: "week",
    hsk: "HSK 1"
  },
  {
    hanza: "学生",
    pinyin: "xuéshēng",
    english: "student",
    hsk: "HSK 1"
  },
  {
    hanza: "学校",
    pinyin: "xuéxiào",
    english: "school",
    hsk: "HSK 1"
  },
  {
    hanza: "衣服",
    pinyin: "yīfu",
    english: "cloth",
    hsk: "HSK 1"
  },
  {
    hanza: "医生",
    pinyin: "yīshēng",
    english: "doctor",
    hsk: "HSK 1"
  },
  {
    hanza: "医院",
    pinyin: "yīyuàn",
    english: "hospital",
    hsk: "HSK 1"
  },
  {
    hanza: "椅子",
    pinyin: "yǐzi",
    english: "chair",
    hsk: "HSK 1"
  },
  {
    hanza: "月",
    pinyin: "yuè",
    english: "month",
    hsk: "HSK 1"
  },
  {
    hanza: "中国",
    pinyin: "Zhōngguó",
    english: "China",
    hsk: "HSK 1"
  },
  {
    hanza: "中午",
    pinyin: "zhōngwǔ",
    english: "noon",
    hsk: "HSK 1"
  },
  {
    hanza: "桌子",
    pinyin: "zhuōzi",
    english: "desk",
    hsk: "HSK 1"
  },
  {
    hanza: "字",
    pinyin: "zì",
    english: "character",
    hsk: "HSK 1"
  },
  {
    hanza: "昨天",
    pinyin: "zuótiān",
    english: "yesterday",
    hsk: "HSK 1"
  },
  {
    hanza: "一",
    pinyin: "yī",
    english: "one",
    hsk: "HSK 1"
  },
  {
    hanza: "二",
    pinyin: "èr",
    english: "two",
    hsk: "HSK 1"
  },
  {
    hanza: "三",
    pinyin: "sān",
    english: "three",
    hsk: "HSK 1"
  },
  {
    hanza: "四",
    pinyin: "sì",
    english: "four",
    hsk: "HSK 1"
  },
  {
    hanza: "五",
    pinyin: "wǔ",
    english: "five",
    hsk: "HSK 1"
  },
  {
    hanza: "六",
    pinyin: "liù",
    english: "six",
    hsk: "HSK 1"
  },
  {
    hanza: "七",
    pinyin: "qī",
    english: "seven",
    hsk: "HSK 1"
  },
  {
    hanza: "八",
    pinyin: "bā",
    english: "eight",
    hsk: "HSK 1"
  },
  {
    hanza: "九",
    pinyin: "jiǔ",
    english: "nine",
    hsk: "HSK 1"
  },
  {
    hanza: "十",
    pinyin: "shí",
    english: "ten",
    hsk: "HSK 1"
  },
  {
    hanza: "号",
    pinyin: "hào",
    english: "[day number in a date], number (in a series)",
    hsk: "HSK 1"
  },
  {
    hanza: "的",
    pinyin: "de",
    english: "[structural particle]",
    hsk: "HSK 1"
  },
  {
    hanza: "了",
    pinyin: "le",
    english: "[aspectual particle]",
    hsk: "HSK 1"
  },
  {
    hanza: "吗",
    pinyin: "ma",
    english: "[question particle]",
    hsk: "HSK 1"
  },
  {
    hanza: "呢",
    pinyin: "ne",
    english: "[question particle]",
    hsk: "HSK 1"
  },
  {
    hanza: "你",
    pinyin: "nǐ",
    english: "you",
    hsk: "HSK 1"
  },
  {
    hanza: "他",
    pinyin: "tā",
    english: "he, him",
    hsk: "HSK 1"
  },
  {
    hanza: "她",
    pinyin: "tā",
    english: "she, her",
    hsk: "HSK 1"
  },
  {
    hanza: "我",
    pinyin: "wǒ",
    english: "I, me",
    hsk: "HSK 1"
  },
  {
    hanza: "我们",
    pinyin: "wǒmen",
    english: "we, us",
    hsk: "HSK 1"
  },
  {
    hanza: "不客气",
    pinyin: "búkèqì",
    english: "you are welcome",
    hsk: "HSK 1"
  },
  {
    hanza: "打电话",
    pinyin: "dǎ diànhuà",
    english: "to call on the phone",
    hsk: "HSK 1"
  },
  {
    hanza: "没关系",
    pinyin: "méi guānxì",
    english: "it doesn’t matter",
    hsk: "HSK 1"
  },
  {
    hanza: "在",
    pinyin: "zài",
    english: "in, at",
    hsk: "HSK 1"
  },
  {
    hanza: "爱",
    pinyin: "ài",
    english: "to love",
    hsk: "HSK 1"
  },
  {
    hanza: "吃",
    pinyin: "chī",
    english: "to eat",
    hsk: "HSK 1"
  },
  {
    hanza: "读",
    pinyin: "dú",
    english: "to read",
    hsk: "HSK 1"
  },
  {
    hanza: "对不起",
    pinyin: "duìbùqǐ",
    english: "sorry",
    hsk: "HSK 1"
  },
  {
    hanza: "工作",
    pinyin: "gōngzuò",
    english: "to work",
    hsk: "HSK 1"
  },
  {
    hanza: "喝",
    pinyin: "hē",
    english: "to drink",
    hsk: "HSK 1"
  },
  {
    hanza: "回",
    pinyin: "huí",
    english: "to return",
    hsk: "HSK 1"
  },
  {
    hanza: "叫",
    pinyin: "jiào",
    english: "to call, to be called",
    hsk: "HSK 1"
  },
  {
    hanza: "开",
    pinyin: "kāi",
    english: "to open",
    hsk: "HSK 1"
  },
  {
    hanza: "看",
    pinyin: "kàn",
    english: "to look (at)",
    hsk: "HSK 1"
  },
  {
    hanza: "看见",
    pinyin: "kànjiàn",
    english: "to see",
    hsk: "HSK 1"
  },
  {
    hanza: "来",
    pinyin: "lái",
    english: "to come",
    hsk: "HSK 1"
  },
  {
    hanza: "没有",
    pinyin: "méiyǒu",
    english: "to not have",
    hsk: "HSK 1"
  },
  {
    hanza: "买",
    pinyin: "mǎi",
    english: "to buy",
    hsk: "HSK 1"
  },
  {
    hanza: "请",
    pinyin: "qǐng",
    english: "please",
    hsk: "HSK 1"
  },
  {
    hanza: "去",
    pinyin: "qù",
    english: "to go",
    hsk: "HSK 1"
  },
  {
    hanza: "认识",
    pinyin: "rènshi",
    english: "to be familiar with",
    hsk: "HSK 1"
  },
  {
    hanza: "是",
    pinyin: "shì",
    english: "to be (am, is, are)",
    hsk: "HSK 1"
  },
  {
    hanza: "睡觉",
    pinyin: "shuìjiào",
    english: "to sleep",
    hsk: "HSK 1"
  },
  {
    hanza: "说",
    pinyin: "shuō",
    english: "to say. to speak",
    hsk: "HSK 1"
  },
  {
    hanza: "听",
    pinyin: "tīng",
    english: "to listen (to)",
    hsk: "HSK 1"
  },
  {
    hanza: "下雨",
    pinyin: "xiàyǔ",
    english: "to rain",
    hsk: "HSK 1"
  },
  {
    hanza: "写",
    pinyin: "xiě",
    english: "to write",
    hsk: "HSK 1"
  },
  {
    hanza: "谢谢",
    pinyin: "xièxie",
    english: "thank you; to thank",
    hsk: "HSK 1"
  },
  {
    hanza: "喜欢",
    pinyin: "xǐhuān",
    english: "to like",
    hsk: "HSK 1"
  },
  {
    hanza: "学习",
    pinyin: "xuéxí",
    english: "to study",
    hsk: "HSK 1"
  },
  {
    hanza: "有",
    pinyin: "yǒu",
    english: "to have",
    hsk: "HSK 1"
  },
  {
    hanza: "再见",
    pinyin: "zàijiàn",
    english: "good-bye",
    hsk: "HSK 1"
  },
  {
    hanza: "住",
    pinyin: "zhù",
    english: "to live (in/at)",
    hsk: "HSK 1"
  },
  {
    hanza: "做",
    pinyin: "zuò",
    english: "to do",
    hsk: "HSK 1"
  },
  {
    hanza: "坐",
    pinyin: "zuò",
    english: "to sit",
    hsk: "HSK 1"
  },
  // HSK 2
  {
    hanza: "白",
    pinyin: "bái",
    english: "white",
    hsk: "HSK 2"
  },
  // ... and so on for all other words
];


/**
 * Uses the browser's SpeechSynthesis API to speak the given text in Chinese.
 * @param text The text to be spoken.
 */
function speak(text: string) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN'; // Specify Chinese (Mandarin, Mainland China)
    utterance.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
  } else {
    console.error('Text-to-Speech is not supported in this browser.');
    // Optionally, alert the user that the feature is unavailable.
  }
}


/**
 * Creates and returns a single flashcard HTML element.
 * @param row The data for the flashcard.
 * @returns The HTMLDivElement for the flashcard.
 */
function createFlashcardElement(row: HskDataRow): HTMLDivElement {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('flashcard');
  cardDiv.dataset['index'] = row.id.toString();

  const cardInner = document.createElement('div');
  cardInner.classList.add('flashcard-inner');

  // --- FRONT OF CARD ---
  const cardFront = document.createElement('div');
  cardFront.classList.add('flashcard-front');

  const termDiv = document.createElement('div');
  termDiv.classList.add('term');
  
  const hanzaSpan = document.createElement('span');
  hanzaSpan.classList.add('hanza-text');
  hanzaSpan.textContent = row.hanza;
  termDiv.appendChild(hanzaSpan);

  if (row.hsk) {
      const hskSpan = document.createElement('span');
      hskSpan.classList.add('hsk-level-text');
      hskSpan.textContent = `(${row.hsk})`;
      termDiv.appendChild(hskSpan);
  }

  cardFront.appendChild(termDiv);

  // --- BACK OF CARD ---
  const cardBack = document.createElement('div');
  cardBack.classList.add('flashcard-back');

  // Definition Section
  const definitionDiv = document.createElement('div');
  definitionDiv.classList.add('definition');
  const pinyinText = row.pinyin ? `[${row.pinyin}]` : '';
  const backText = `${pinyinText}\n${row.english}`.trim();
  definitionDiv.textContent = backText;

  // Example Sentences Section
  const examplesContainer = document.createElement('div');
  examplesContainer.classList.add('examples-container');

  const examplesTitle = document.createElement('h3');
  examplesTitle.classList.add('examples-title');
  examplesTitle.textContent = 'Example Sentences';
  
  const examplesList = document.createElement('ul');
  examplesList.classList.add('examples-list');

  examplesContainer.appendChild(examplesTitle);
  examplesContainer.appendChild(examplesList);

  const sentences = row.exampleSentences || [];
  if (sentences.length > 0) {
      sentences.forEach(sentence => {
          const li = document.createElement('li');
          li.classList.add('example-sentence');

          const chineseSpan = document.createElement('span');
          chineseSpan.classList.add('sentence-chinese');
          chineseSpan.textContent = sentence.chinese;

          const pinyinSpan = document.createElement('span');
          pinyinSpan.classList.add('sentence-pinyin');
          pinyinSpan.textContent = sentence.pinyin;

          const englishSpan = document.createElement('span');
          englishSpan.classList.add('sentence-english');
          englishSpan.textContent = sentence.english;
          
          li.appendChild(chineseSpan);
          li.appendChild(pinyinSpan);
          li.appendChild(englishSpan);
          examplesList.appendChild(li);
      });
  } else {
      const noExamples = document.createElement('li');
      noExamples.textContent = 'No examples available.';
      noExamples.classList.add('no-examples');
      examplesList.appendChild(noExamples);
  }


  // Audio Button
  const audioButton = document.createElement('button');
  audioButton.classList.add('audio-button');
  audioButton.setAttribute('aria-label', 'Play pronunciation');
  audioButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
  audioButton.addEventListener('click', (event) => {
    event.stopPropagation();
    speak(row.hanza);
  });
  
  // Assemble Back
  cardBack.appendChild(definitionDiv);
  cardBack.appendChild(examplesContainer);
  cardBack.appendChild(audioButton);

  // --- ASSEMBLE CARD ---
  cardInner.appendChild(cardFront);
  cardInner.appendChild(cardBack);
  cardDiv.appendChild(cardInner);

  // Add click listener to toggle the 'flipped' class
  cardDiv.addEventListener('click', () => {
    if (!isDragging) {
      cardDiv.classList.toggle('flipped');
    }
  });

  return cardDiv;
}

/**
 * Displays the current flashcard based on the currentIndex.
 */
function renderCurrentCard() {
  flashcardViewer.innerHTML = '';
  errorMessage.textContent = '';
  isAnimating = false; // Reset animation lock

  if (currentDeck.length === 0) {
    navigationControls.style.visibility = 'hidden';
    // Check if any filter is active before showing the message
    const hasActiveFilter = Array.from(hskFilterButtons).some(btn => btn.getAttribute('aria-checked') === 'true');
    if (hasActiveFilter) {
      errorMessage.textContent = 'No matching entries found for the selected HSK level(s).';
    } else {
      errorMessage.textContent = 'Select an HSK level to begin.';
    }
    return;
  }
  
  navigationControls.style.visibility = 'visible';

  const row = currentDeck[currentIndex];
  const cardElement = createFlashcardElement(row);
  flashcardViewer.appendChild(cardElement);

  // Update counter
  cardCounter.textContent = `${currentIndex + 1} / ${currentDeck.length}`;

  // Update button states
  prevButton.disabled = currentIndex === 0;
  nextButton.disabled = currentIndex === currentDeck.length - 1;
  shuffleButton.disabled = currentDeck.length <= 1;
}

/**
 * Shuffles the current deck of flashcards and displays the first card.
 */
function shuffleDeck() {
  // Fisher-Yates shuffle algorithm
  for (let i = currentDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
  }
  currentIndex = 0;
  renderCurrentCard();
}

/**
 * Filters the main data set based on selected HSK levels and renders the first card.
 */
function updateDeckAndRender() {
  const selectedLevels = Array.from(hskFilterButtons)
    .filter(btn => btn.getAttribute('aria-checked') === 'true')
    .map(btn => btn.dataset.hskLevel);

  currentDeck = selectedLevels.length === 0
    ? allHskData
    : allHskData.filter(row => selectedLevels.includes(row.hsk));

  currentIndex = 0;
  renderCurrentCard();
}

/**
 * Handles the logic for animating and changing cards for both buttons and swipes.
 * @param direction 'next' or 'prev'
 */
function changeCard(direction: 'next' | 'prev') {
  if (isAnimating) return; // Prevent multiple navigations

  const canGoNext = currentIndex < currentDeck.length - 1;
  const canGoPrev = currentIndex > 0;
  
  if ((direction === 'next' && !canGoNext) || (direction === 'prev' && !canGoPrev)) {
    return;
  }

  isAnimating = true;
  const card = flashcardViewer.querySelector('.flashcard');
  const cardInner = flashcardViewer.querySelector('.flashcard-inner') as HTMLElement;

  if (!card || !cardInner) {
    isAnimating = false;
    return;
  }
  
  const isFlipped = card.classList.contains('flipped');
  // Set CSS variable for rotation, used by the animation keyframes
  cardInner.style.setProperty('--start-rotate', isFlipped ? '180deg' : '0deg');

  const animationClass = direction === 'next' ? 'is-exiting-left' : 'is-exiting-right';
  cardInner.classList.add(animationClass);

  cardInner.addEventListener('animationend', () => {
    if (direction === 'next') {
      currentIndex++;
    } else {
      currentIndex--;
    }
    renderCurrentCard(); // Creates a fresh card, resetting animations
  }, { once: true });
}


// --- Theme Management ---
/**
 * Applies the selected theme and saves it to localStorage.
 * @param theme The theme to apply ('light' or 'dark').
 */
function setTheme(theme: 'light' | 'dark') {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark-mode', isDark);
  localStorage.setItem('theme', theme);
  themeToggleButton.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
}

/**
 * Initializes the theme based on user preference or system settings.
 */
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || savedTheme === 'light') {
    setTheme(savedTheme);
  } else {
    setTheme(prefersDark ? 'dark' : 'light');
  }
}

// --- Event Listeners ---

// Theme toggle
themeToggleButton.addEventListener('click', () => {
  const isDarkMode = document.documentElement.classList.contains('dark-mode');
  setTheme(isDarkMode ? 'light' : 'dark');
});


// HSK filter buttons
hskFilterButtons.forEach(button => {
  button.addEventListener('click', () => {
    const isChecked = button.getAttribute('aria-checked') === 'true';
    button.setAttribute('aria-checked', isChecked ? 'false' : 'true');
    updateDeckAndRender();
  });
});

// Navigation
prevButton.addEventListener('click', () => changeCard('prev'));
nextButton.addEventListener('click', () => changeCard('next'));
shuffleButton.addEventListener('click', shuffleDeck);

// Swipe Gesture Logic
flashcardViewer.addEventListener('touchstart', (e) => {
  if (isAnimating || currentDeck.length === 0) return;
  const target = e.target as HTMLElement;
  if (!target.closest('.flashcard-inner')) return;

  isDragging = true;
  touchStartX = e.touches[0].clientX;
  currentTranslateX = 0;

  const cardInner = flashcardViewer.querySelector('.flashcard-inner');
  if (cardInner) {
    cardInner.classList.add('is-dragging');
  }
}, { passive: true });

flashcardViewer.addEventListener('touchmove', (e) => {
  if (!isDragging) return;

  const currentX = e.touches[0].clientX;
  currentTranslateX = currentX - touchStartX;
  const card = flashcardViewer.querySelector('.flashcard');
  const cardInner = flashcardViewer.querySelector('.flashcard-inner') as HTMLElement;
  
  if (card && cardInner) {
    const isFlipped = card.classList.contains('flipped');
    const rotateValue = isFlipped ? 180 : 0;
    // Move card with finger, preserving flip state
    cardInner.style.transform = `translateX(${currentTranslateX}px) rotateY(${rotateValue}deg)`;
  }
}, { passive: true });

flashcardViewer.addEventListener('touchend', () => {
  if (!isDragging) return;

  isDragging = false;
  const cardInner = flashcardViewer.querySelector('.flashcard-inner') as HTMLElement;
  if (!cardInner) return;

  cardInner.classList.remove('is-dragging');
  // Clear inline transform to allow CSS transitions/animations to take over
  cardInner.style.transform = ''; 

  if (Math.abs(currentTranslateX) > swipeThreshold) {
    // Successful swipe
    if (currentTranslateX < 0) {
      changeCard('next'); // Swipe left
    } else {
      changeCard('prev'); // Swipe right
    }
  }
  // If not a successful swipe, the card snaps back automatically
  // because the inline transform is removed and the default CSS takes over.
});

// Initial setup when the script loads
function main() {
  initializeTheme();
  // Process the raw data into the structured format with unique IDs
  allHskData = hskData.map((row, index) => ({
      ...row,
      id: index
  }));
  // Initially, no deck is loaded until a user selects a filter.
  currentDeck = [];
  renderCurrentCard();
}

main();
