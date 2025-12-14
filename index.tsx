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
  hanzi: string;
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

   {
    "hanzi": "爱",
    "pinyin": "ài",
    "english": "to love",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我爱我的家人。",
        "pinyin": "Wǒ ài wǒ de jiārén.",
        "english": "I love my family."
      }
    ]
  },
  {
    "hanzi": "八",
    "pinyin": "bā",
    "english": "8",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "今天商店八点开门。",
        "pinyin": "Jīntiān shāngdiàn bā diǎn kāimén.",
        "english": "The store opens at eight o'clock today."
      }
    ]
  },
  {
    "hanzi": "爸爸",
    "pinyin": "bà ba",
    "english": "dad",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我的爸爸是医生。",
        "pinyin": "Wǒ de bàba shì yīshēng.",
        "english": "My dad is a doctor."
      }
    ]
  },
  {
    "hanzi": "北京",
    "pinyin": "Běi jīng",
    "english": "Beijing",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我住在北京。",
        "pinyin": "Wǒ zhù zài Běijīng.",
        "english": "I live in Beijing."
      }
    ]
  },
  {
    "hanzi": "杯子",
    "pinyin": "bēi zi",
    "english": " cup, glass",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你有干净的杯子吗？",
        "pinyin": "Nǐ yǒu gānjìng de bēizi ma?",
        "english": "Do you have a clean cup?"
      }
    ]
  },
  {
    "hanzi": "本",
    "pinyin": "běn",
    "english": " root, basis; MW for books",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我有一本书。",
        "pinyin": "Wǒ yǒu yī běn shū.",
        "english": "I have a book."
      }
    ]
  },
  {
    "hanzi": "不",
    "pinyin": "bù",
    "english": " no, not",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我不要。",
        "pinyin": "Wǒ bú yào.",
        "english": "I don't want it."
      }
    ]
  },
  {
    "hanzi": "菜",
    "pinyin": "cài",
    "english": " dish, vegetable",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你喜欢中国菜吗？",
        "pinyin": "Nǐ xǐhuān Zhōngguó cài ma?",
        "english": "Do you like Chinese food?"
      }
    ]
  },
  {
    "hanzi": "茶",
    "pinyin": "chá",
    "english": "tea",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我每天早上都喝一杯茶。",
        "pinyin": "Wǒ měitiān zǎoshang dōu hē yī bēi chá.",
        "english": "I drink a cup of tea every morning."
      }
    ]
  },
  {
    "hanzi": "吃",
    "pinyin": "chī",
    "english": "to eat",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我们吃饭吧。",
        "pinyin": "Wǒmen chī fàn ba.",
        "english": "Let's eat a meal."
      }
    ]
  },
  {
    "hanzi": "出租车",
    "pinyin": "chū zū chē",
    "english": "taxi",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我们坐出租车去机场。",
        "pinyin": "Wǒmen zuò chūzūchē qù jīchǎng.",
        "english": "We will take a taxi to the airport."
      }
    ]
  },
  {
    "hanzi": "大",
    "pinyin": "dà",
    "english": " big, great",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "他买了一栋大房子。",
        "pinyin": "Tā mǎi le yī dòng dà fángzi.",
        "english": "He bought a big house."
      }
    ]
  },
  {
    "hanzi": "打电话",
    "pinyin": "dǎ diàn huà",
    "english": "to make a phone call",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你到了就给我打电话。",
        "pinyin": "Nǐ dào le jiù gěi wǒ dǎ diànhuà.",
        "english": "Call me as soon as you arrive."
      }
    ]
  },
  {
    "hanzi": "的",
    "pinyin": "de",
    "english": "particle: to form an attribute",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这是我的书。",
        "pinyin": "Zhè shì wǒ de shū.",
        "english": "This is my book."
      }
    ]
  },
  {
    "hanzi": "点",
    "pinyin": "diǎn",
    "english": " point, dot; MW: a little",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "现在是三点整。",
        "pinyin": "Xiànzài shì sān diǎn zhěng.",
        "english": "It is exactly three o'clock now."
      }
    ]
  },
  {
    "hanzi": "电脑",
    "pinyin": "diàn nǎo",
    "english": "computer",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这台电脑多少钱？",
        "pinyin": "Zhè tái diànnǎo duōshao qián?",
        "english": "How much is this computer?"
      }
    ]
  },
  {
    "hanzi": "电视",
    "pinyin": "diàn shì",
    "english": "TV",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我喜欢看电视。",
        "pinyin": "Wǒ xǐhuān kàn diànshì.",
        "english": "I like watching TV."
      }
    ]
  },
  {
    "hanzi": "电影",
    "pinyin": "diàn yǐng",
    "english": " movie, film",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这部电影很好看。",
        "pinyin": "Zhè bù diànyǐng hěn hǎokàn.",
        "english": "This movie is very good (to watch)."
      }
    ]
  },
  {
    "hanzi": "东西",
    "pinyin": "dōng xi",
    "english": "thing",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我要买一些东西。",
        "pinyin": "Wǒ yào mǎi yīxiē dōngxi.",
        "english": "I need to buy some things."
      }
    ]
  },
  {
    "hanzi": "都",
    "pinyin": "dōu",
    "english": " all, both",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "他们都是学生。",
        "pinyin": "Tāmen dōu shì xuésheng.",
        "english": "They are all students."
      }
    ]
  },
  {
    "hanzi": "读",
    "pinyin": "dú",
    "english": "to read aloud",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我喜欢读书。",
        "pinyin": "Wǒ xǐhuān dú shū.",
        "english": "I like to read books."
      }
    ]
  },
  {
    "hanzi": "对不起",
    "pinyin": "duì bu qǐ",
    "english": "sorry",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "对不起，我迟到了。",
        "pinyin": "Duì bu qǐ, wǒ chí dào le.",
        "english": "Sorry, I am late."
      }
    ]
  },
  {
    "hanzi": "多",
    "pinyin": "duō",
    "english": " much, many",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "请多喝水。",
        "pinyin": "Qǐng duō hē shuǐ.",
        "english": "Please drink more water."
      }
    ]
  },
  {
    "hanzi": "多少",
    "pinyin": "duō shao",
    "english": " how many, how much",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你家有多少人？",
        "pinyin": "Nǐ jiā yǒu duōshǎo rén?",
        "english": "How many people are there in your family?"
      }
    ]
  },
  {
    "hanzi": "二",
    "pinyin": "èr",
    "english": "2",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "今天是星期二。",
        "pinyin": "Jīntiān shì xīngqī'èr.",
        "english": "Today is Tuesday."
      }
    ]
  },
  {
    "hanzi": "儿子",
    "pinyin": "ér zi",
    "english": "son",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我的儿子五岁了。",
        "pinyin": "Wǒ de érzi wǔ suì le.",
        "english": "My son is five years old."
      }
    ]
  },
  {
    "hanzi": "飞机",
    "pinyin": "fēi jī",
    "english": "airplane",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我们坐飞机去旅行。",
        "pinyin": "Wǒmen zuò fēijī qù lǚxíng.",
        "english": "We are taking an airplane to travel."
      }
    ]
  },
  {
    "hanzi": "分钟",
    "pinyin": "fēn zhōng",
    "english": "minute",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这需要十分钟。",
        "pinyin": "Zhè xūyào shí fēnzhōng.",
        "english": "This takes ten minutes."
      }
    ]
  },
  {
    "hanzi": "高兴",
    "pinyin": "gāo xìng",
    "english": " happy, glad",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我今天很高兴。",
        "pinyin": "Wǒ jīntiān hěn gāoxīng.",
        "english": "I am very happy today."
      }
    ]
  },
  {
    "hanzi": "个",
    "pinyin": "gè",
    "english": "MW: for almost everything",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我买了一个苹果。",
        "pinyin": "Wǒ mǎi le yī gè píngguǒ.",
        "english": "I bought an apple."
      }
    ]
  },
  {
    "hanzi": "工作",
    "pinyin": "gōng zuò",
    "english": "job; to work",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你明天工作吗？",
        "pinyin": "Nǐ míngtiān gōngzuò ma?",
        "english": "Are you working tomorrow?"
      }
    ]
  },
  {
    "hanzi": "汉语",
    "pinyin": "hàn yǔ",
    "english": "Chinese language",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我在学汉语。",
        "pinyin": "Wǒ zài xué Hànyǔ.",
        "english": "I am learning Chinese."
      }
    ]
  },
  {
    "hanzi": "好",
    "pinyin": "hǎo",
    "english": " good, nice",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "她是一个好学生。",
        "pinyin": "Tā shì yīgè hǎo xuésheng.",
        "english": "She is a good student."
      }
    ]
  },
  {
    "hanzi": "和",
    "pinyin": "hé",
    "english": "and; with",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我喜欢咖啡和茶。",
        "pinyin": "Wǒ xǐhuān kāfēi hé chá.",
        "english": "I like coffee and tea."
      }
    ]
  },
  {
    "hanzi": "很",
    "pinyin": "hěn",
    "english": " very, quite",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "他很高。",
        "pinyin": "Tā hěn gāo.",
        "english": "He is very tall."
      }
    ]
  },
  {
    "hanzi": "后面",
    "pinyin": "hòu miàn",
    "english": " rear, back, behind",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "厕所在商店后面。",
        "pinyin": "Cèsuǒ zài shāngdiàn hòumiàn.",
        "english": "The restroom is behind the store."
      }
    ]
  },
  {
    "hanzi": "回",
    "pinyin": "huí",
    "english": "to return",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我想回家。",
        "pinyin": "Wǒ xiǎng huí jiā.",
        "english": "I want to go home."
      }
    ]
  },
  {
    "hanzi": "几",
    "pinyin": "jǐ",
    "english": "how many; several",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "现在几点了？",
        "pinyin": "Xiànzài jǐ diǎn le?",
        "english": "What time is it now?"
      }
    ]
  },
  {
    "hanzi": "家",
    "pinyin": "jiā",
    "english": " family, home",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我想回家。",
        "pinyin": "Wǒ xiǎng huí jiā.",
        "english": "I want to go home."
      }
    ]
  },
  {
    "hanzi": "今天",
    "pinyin": "jīn tiān",
    "english": "today",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "今天天气很好。",
        "pinyin": "Jīntiān tiānqì hěn hǎo.",
        "english": "Today the weather is very good."
      }
    ]
  },
  {
    "hanzi": "九",
    "pinyin": "jiǔ",
    "english": "9",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "现在是九点。",
        "pinyin": "Xiànzài shì jiǔ diǎn.",
        "english": "It is nine o'clock now."
      }
    ]
  },
  {
    "hanzi": "开",
    "pinyin": "kāi",
    "english": " to open, to start",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我会开车。",
        "pinyin": "Wǒ huì kāi chē.",
        "english": "I can drive a car."
      }
    ]
  },
  {
    "hanzi": "看",
    "pinyin": "kàn",
    "english": " to see, to watch",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我在看书。",
        "pinyin": "Wǒ zài kàn shū.",
        "english": "I am reading a book."
      }
    ]
  },
  {
    "hanzi": "看见",
    "pinyin": "kàn jiàn",
    "english": "to see",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你看见我的手机了吗？",
        "pinyin": "Nǐ kànjiàn wǒ de shǒujīle ma?",
        "english": "Did you see my phone?"
      }
    ]
  },
  {
    "hanzi": "块",
    "pinyin": "kuài",
    "english": "MW: for a piece",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我要一块蛋糕。",
        "pinyin": "Wǒ yào yí kuài dàn'gāo.",
        "english": "I want a piece of cake."
      }
    ]
  },
  {
    "hanzi": "来",
    "pinyin": "lái",
    "english": "to come",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你什么时候来?",
        "pinyin": "Nǐ shénme shíhou lái?",
        "english": "When will you come?"
      }
    ]
  },
  {
    "hanzi": "老师",
    "pinyin": "lǎo shī",
    "english": "teacher",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我喜欢我的中文老师。",
        "pinyin": "Wǒ xǐhuān wǒ de Zhōngwén lǎoshī.",
        "english": "I like my Chinese teacher."
      }
    ]
  },
  {
    "hanzi": "了",
    "pinyin": "le",
    "english": "particle: indicating past",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我吃了午饭。",
        "pinyin": "Wǒ chīle wǔfàn.",
        "english": "I ate lunch."
      }
    ]
  },
  {
    "hanzi": "冷",
    "pinyin": "lěng",
    "english": "cold",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "今天很冷。",
        "pinyin": "Jīntiān hěn lěng.",
        "english": "It is very cold today."
      }
    ]
  },
  {
    "hanzi": "六",
    "pinyin": "liù",
    "english": "6",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "现在六点了。",
        "pinyin": "Xiànzài liù diǎn le.",
        "english": "It is six o'clock now."
      }
    ]
  },
  {
    "hanzi": "吗",
    "pinyin": "ma",
    "english": "particle: to form a question",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你是学生吗？",
        "pinyin": "Nǐ shì xuésheng ma?",
        "english": "Are you a student?"
      }
    ]
  },
  {
    "hanzi": "妈妈",
    "pinyin": "mā ma",
    "english": "mother",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "妈妈爱我。",
        "pinyin": "Māma ài wǒ.",
        "english": "Mom loves me."
      }
    ]
  },
  {
    "hanzi": "买",
    "pinyin": "mǎi",
    "english": "to buy",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我想买一本书。",
        "pinyin": "Wǒ xiǎng mǎi yī běn shū.",
        "english": "I want to buy a book."
      }
    ]
  },
  {
    "hanzi": "猫",
    "pinyin": "māo",
    "english": "cat",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "猫在睡觉。",
        "pinyin": "Māo zài shuìjiào.",
        "english": "The cat is sleeping."
      }
    ]
  },
  {
    "hanzi": "米饭",
    "pinyin": "mǐ fàn",
    "english": "cooked rice",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我喜欢吃米饭。",
        "pinyin": "Wǒ xǐhuān chī mǐfàn.",
        "english": "I like to eat rice."
      }
    ]
  },
  {
    "hanzi": "明天",
    "pinyin": "míng tiān",
    "english": "tomorrow",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你明天做什么？",
        "pinyin": "Nǐ míngtiān zuò shénme?",
        "english": "What are you doing tomorrow?"
      }
    ]
  },
  {
    "hanzi": "那",
    "pinyin": "nà",
    "english": "that",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "那是我的书。",
        "pinyin": "Nà shì wǒ de shū.",
        "english": "That is my book."
      }
    ]
  },
  {
    "hanzi": "哪",
    "pinyin": "nǎ",
    "english": "which",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你喜欢哪本书？",
        "pinyin": "Nǐ xǐhuan nǎ běn shū?",
        "english": "Which book do you like?"
      }
    ]
  },
  {
    "hanzi": "呢",
    "pinyin": "ne",
    "english": "particle: to build a question",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我很忙，你呢？",
        "pinyin": "Wǒ hěn máng, nǐ ne?",
        "english": "I am busy, what about you?"
      }
    ]
  },
  {
    "hanzi": "能",
    "pinyin": "néng",
    "english": "to be able to",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你能帮我吗？",
        "pinyin": "Nǐ néng bāng wǒ ma?",
        "english": "Can you help me?"
      }
    ]
  },
  {
    "hanzi": "你",
    "pinyin": "nǐ",
    "english": "you singular",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你去哪里？",
        "pinyin": "Nǐ qù nǎli?",
        "english": "Where are you going?"
      }
    ]
  },
  {
    "hanzi": "年",
    "pinyin": "nián",
    "english": "year",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我明年要去北京。",
        "pinyin": "Wǒ míngnián yào qù Běijīng.",
        "english": "I will go to Beijing next year."
      }
    ]
  },
  {
    "hanzi": "女儿",
    "pinyin": "nǚ ér",
    "english": "daughter",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "她有一个女儿。",
        "pinyin": "Tā yǒu yīgè nǚ'ér.",
        "english": "She has one daughter."
      }
    ]
  },
  {
    "hanzi": "朋友",
    "pinyin": "péng you",
    "english": "friend",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "他是我的朋友。",
        "pinyin": "Tā shì wǒ de péngyǒu.",
        "english": "He is my friend."
      }
    ]
  },
  {
    "hanzi": "漂亮",
    "pinyin": "piào liang",
    "english": " pretty, beautiful",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这件衣服很漂亮。",
        "pinyin": "Zhè jiàn yīfu hěn piàoliang.",
        "english": "This piece of clothing is very beautiful."
      }
    ]
  },
  {
    "hanzi": "苹果",
    "pinyin": "píng guǒ",
    "english": "apple",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我每天吃一个苹果。",
        "pinyin": "Wǒ měitiān chī yīgè píngguǒ.",
        "english": "I eat one apple every day."
      }
    ]
  },
  {
    "hanzi": "七",
    "pinyin": "qī",
    "english": "7",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "现在是七点。",
        "pinyin": "Xiànzài shì qī diǎn.",
        "english": "It is seven o'clock now."
      }
    ]
  },
  {
    "hanzi": "钱",
    "pinyin": "qián",
    "english": "money",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这件衣服多少钱？",
        "pinyin": "Zhè jiàn yīfu duōshao qián?",
        "english": "How much is this piece of clothing?"
      }
    ]
  },
  {
    "hanzi": "前面",
    "pinyin": "qián miàn",
    "english": " ahead, in front",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "图书馆就在前面。",
        "pinyin": "Túshūguǎn jiù zài qiánmiàn.",
        "english": "The library is right up ahead."
      }
    ]
  },
  {
    "hanzi": "请",
    "pinyin": "qǐng",
    "english": "to ask; please",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "请等一下。",
        "pinyin": "Qǐng děng yīxià.",
        "english": "Please wait a moment."
      }
    ]
  },
  {
    "hanzi": "去",
    "pinyin": "qù",
    "english": "to go",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我去学校。",
        "pinyin": "Wǒ qù xuéxiào.",
        "english": "I go to school."
      }
    ]
  },
  {
    "hanzi": "热",
    "pinyin": "rè",
    "english": " hot, warm",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "今天天气很热。",
        "pinyin": "Jīntiān tiānqì hěn rè.",
        "english": "The weather is very hot today."
      }
    ]
  },
  {
    "hanzi": "人",
    "pinyin": "rén",
    "english": " person, people",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "他是一个好人。",
        "pinyin": "Tā shì yīgè hǎo rén.",
        "english": "He is a good person."
      }
    ]
  },
  {
    "hanzi": "上",
    "pinyin": "shàng",
    "english": " to go up; on, upon",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我们九点上课。",
        "pinyin": "Wǒmen jiǔ diǎn shàng kè.",
        "english": "We start class at nine o'clock."
      }
    ]
  },
  {
    "hanzi": "上午",
    "pinyin": "shàng wǔ",
    "english": "morning",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我上午有课。",
        "pinyin": "Wǒ shàngwǔ yǒu kè.",
        "english": "I have class this morning."
      }
    ]
  },
  {
    "hanzi": "少",
    "pinyin": "shǎo",
    "english": " few, little",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "少吃点糖。",
        "pinyin": "Shǎo chī diǎn táng.",
        "english": "Eat less sugar."
      }
    ]
  },
  {
    "hanzi": "谁",
    "pinyin": "shéi",
    "english": "who",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这个人是谁？",
        "pinyin": "Zhège rén shì shéi?",
        "english": "Who is this person?"
      }
    ]
  },
  {
    "hanzi": "什么",
    "pinyin": "shén me",
    "english": "what",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这是什么?",
        "pinyin": "Zhè shì shénme?",
        "english": "What is this?"
      }
    ]
  },
  {
    "hanzi": "十",
    "pinyin": "shí",
    "english": "10",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "现在十点。",
        "pinyin": "Xiànzài shí diǎn.",
        "english": "It is ten o'clock now."
      }
    ]
  },
  {
    "hanzi": "是",
    "pinyin": "shì",
    "english": " is, to be",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "她是我的朋友。",
        "pinyin": "Tā shì wǒ de péngyǒu.",
        "english": "She is my friend."
      }
    ]
  },
  {
    "hanzi": "时候",
    "pinyin": "shí hou",
    "english": " time, moment",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你什么时候有空？",
        "pinyin": "Nǐ shénme shíhou yǒu kòng?",
        "english": "When do you have free time?"
      }
    ]
  },
  {
    "hanzi": "书",
    "pinyin": "shū",
    "english": "book",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这是一本好书。",
        "pinyin": "Zhè shì yī běn hǎo shū.",
        "english": "This is a good book."
      }
    ]
  },
  {
    "hanzi": "水",
    "pinyin": "shuǐ",
    "english": "water",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "给我一杯水。",
        "pinyin": "Gěi wǒ yī bēi shuǐ.",
        "english": "Give me a glass of water."
      }
    ]
  },
  {
    "hanzi": "水果",
    "pinyin": "shuǐ guǒ",
    "english": "fruit",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我每天都吃水果。",
        "pinyin": "Wǒ měitiān dōu chī shuǐguǒ.",
        "english": "I eat fruit every day."
      }
    ]
  },
  {
    "hanzi": "睡觉",
    "pinyin": "shuì jiào",
    "english": "to sleep",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你应该多睡觉。",
        "pinyin": "Nǐ yīnggāi duō shuì jiào.",
        "english": "You should sleep more."
      }
    ]
  },
  {
    "hanzi": "四",
    "pinyin": "sì",
    "english": "4",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我们家有四口人。",
        "pinyin": "Wǒmen jiā yǒu sì kǒu rén.",
        "english": "There are four people in my family."
      }
    ]
  },
  {
    "hanzi": "岁",
    "pinyin": "suì",
    "english": "MW: years old",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我弟弟十岁了。",
        "pinyin": "Wǒ dìdi shí suì le.",
        "english": "My younger brother is ten years old."
      }
    ]
  },
  {
    "hanzi": "他",
    "pinyin": "tā",
    "english": "he",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "他是我的朋友。",
        "pinyin": "Tā shì wǒ de péngyǒu.",
        "english": "He is my friend."
      }
    ]
  },
  {
    "hanzi": "太",
    "pinyin": "tài",
    "english": " too, extremely",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这个苹果太大了。",
        "pinyin": "Zhège píngguǒ tài dàle.",
        "english": "This apple is too big."
      }
    ]
  },
  {
    "hanzi": "天气",
    "pinyin": "tiān qì",
    "english": "weather",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "今天天气很好。",
        "pinyin": "Jīntiān tiānqì hěn hǎo.",
        "english": "The weather is very good today."
      }
    ]
  },
  {
    "hanzi": "听",
    "pinyin": "tīng",
    "english": "to listen",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我听音乐。",
        "pinyin": "Wǒ tīng yīnyuè.",
        "english": "I listen to music."
      }
    ]
  },
  {
    "hanzi": "同学",
    "pinyin": "tóng xué",
    "english": "classmate",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "他是我的同学。",
        "pinyin": "Tā shì wǒ de tóngxué.",
        "english": "He is my classmate."
      }
    ]
  },
  {
    "hanzi": "喂",
    "pinyin": "wèi",
    "english": "to feed; hello",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "喂，请问是张老师吗？",
        "pinyin": "Wèi, qǐngwèn shì Zhāng lǎoshī ma?",
        "english": "Hello, may I ask if this is Teacher Zhang?"
      }
    ]
  },
  {
    "hanzi": "我",
    "pinyin": "wǒ",
    "english": "I",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我是老师。",
        "pinyin": "Wǒ shì lǎoshī.",
        "english": "I am a teacher."
      }
    ]
  },
  {
    "hanzi": "我们",
    "pinyin": "wǒ men",
    "english": "we",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我们在学中文。",
        "pinyin": "Wǒmen zài xué Zhōngwén.",
        "english": "We are learning Chinese."
      }
    ]
  },
  {
    "hanzi": "五",
    "pinyin": "wǔ",
    "english": "5",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "现在是五点。",
        "pinyin": "Xiànzài shì wǔ diǎn.",
        "english": "It is five o'clock now."
      }
    ]
  },
  {
    "hanzi": "喜欢",
    "pinyin": "xǐ huan",
    "english": "to like",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我喜欢猫。",
        "pinyin": "Wǒ xǐhuān māo.",
        "english": "I like cats."
      }
    ]
  },
  {
    "hanzi": "下",
    "pinyin": "xià",
    "english": "to descend; below",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "今天下雨了。",
        "pinyin": "Jīntiān xià yǔ le.",
        "english": "It rained today."
      }
    ]
  },
  {
    "hanzi": "下午",
    "pinyin": "xià wǔ",
    "english": "afternoon",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我们下午见。",
        "pinyin": "Wǒmen xiàwǔ jiàn.",
        "english": "See you this afternoon."
      }
    ]
  },
  {
    "hanzi": "下雨",
    "pinyin": "xià yǔ",
    "english": "to rain",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "外面下雨了，你带伞了吗？",
        "pinyin": "Wàimiàn xià yǔle, nǐ dài sǎnle ma?",
        "english": "It's raining outside, did you bring an umbrella?"
      }
    ]
  },
  {
    "hanzi": "先生",
    "pinyin": "xiān sheng",
    "english": " Mister, teacher",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "王先生在吗？",
        "pinyin": "Wáng xiānshēng zài ma?",
        "english": "Is Mr. Wang here?"
      }
    ]
  },
  {
    "hanzi": "现在",
    "pinyin": "xiàn zài",
    "english": "now",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "现在几点了？",
        "pinyin": "Xiànzài jǐ diǎn le?",
        "english": "What time is it now?"
      }
    ]
  },
  {
    "hanzi": "想",
    "pinyin": "xiǎng",
    "english": "to think; to want",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我想吃苹果。",
        "pinyin": "Wǒ xiǎng chī píngguǒ.",
        "english": "I want to eat an apple."
      }
    ]
  },
  {
    "hanzi": "小姐",
    "pinyin": "xiǎo jiě",
    "english": " Miss, young lady",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "小姐，请问您贵姓？",
        "pinyin": "Xiǎojiě, qǐngwèn nín guìxìng?",
        "english": "Miss, may I ask your name?"
      }
    ]
  },
  {
    "hanzi": "写",
    "pinyin": "xiě",
    "english": "to write",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我正在写邮件。",
        "pinyin": "Wǒ zhèngzài xiě yóujiàn.",
        "english": "I am writing an email."
      }
    ]
  },
  {
    "hanzi": "些",
    "pinyin": "xiē",
    "english": " MW: some, few",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我需要一些帮助。",
        "pinyin": "Wǒ xūyào yīxiē bāngzhù.",
        "english": "I need some help."
      }
    ]
  },
  {
    "hanzi": "谢谢",
    "pinyin": "xiè xie",
    "english": "thanks",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "谢谢你的帮助。",
        "pinyin": "Xièxie nǐ de bāngzhù.",
        "english": "Thank you for your help."
      }
    ]
  },
  {
    "hanzi": "星期",
    "pinyin": "xīng qī",
    "english": "week",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "今天星期几？",
        "pinyin": "Jīntiān xīngqī jǐ?",
        "english": "What day of the week is it today?"
      }
    ]
  },
  {
    "hanzi": "学生",
    "pinyin": "xué sheng",
    "english": "student",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我是学生。",
        "pinyin": "Wǒ shì xuésheng.",
        "english": "I am a student."
      }
    ]
  },
  {
    "hanzi": "学习",
    "pinyin": "xué xí",
    "english": " to study, to learn",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我每天学习中文。",
        "pinyin": "Wǒ měitiān xuéxí Zhōngwén.",
        "english": "I study Chinese every day."
      }
    ]
  },
  {
    "hanzi": "学校",
    "pinyin": "xué xiào",
    "english": "school",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我的学校很大。",
        "pinyin": "Wǒ de xuéxiào hěn dà.",
        "english": "My school is very big."
      }
    ]
  },
  {
    "hanzi": "一",
    "pinyin": "yī",
    "english": "1",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我有一个苹果。",
        "pinyin": "Wǒ yǒu yī gè píngguǒ.",
        "english": "I have one apple."
      }
    ]
  },
  {
    "hanzi": "有",
    "pinyin": "yǒu",
    "english": " to have, to exist",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我有一只猫。",
        "pinyin": "Wǒ yǒu yī zhī māo.",
        "english": "I have a cat."
      }
    ]
  },
  {
    "hanzi": "月",
    "pinyin": "yuè",
    "english": " month, moon",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "今天是五月一号。",
        "pinyin": "Jīntiān shì wǔ yuè yī hào.",
        "english": "Today is May 1st."
      }
    ]
  },
  {
    "hanzi": "在",
    "pinyin": "zài",
    "english": " at, on, in",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "他在学校。",
        "pinyin": "Tā zài xuéxiào.",
        "english": "He is at school."
      }
    ]
  },
  {
    "hanzi": "再见",
    "pinyin": "zài jiàn",
    "english": "goodbye",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "明天见，再见！",
        "pinyin": "Míngtiān jiàn, zàijiàn!",
        "english": "See you tomorrow, goodbye!"
      }
    ]
  },
  {
    "hanzi": "怎么",
    "pinyin": "zěn me",
    "english": "how",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这个字怎么写？",
        "pinyin": "Zhège zì zěnme xiě?",
        "english": "How do you write this character?"
      }
    ]
  },
  {
    "hanzi": "怎么样",
    "pinyin": "zěn me yàng",
    "english": "how is/are",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这件衣服怎么样？",
        "pinyin": "Zhè jiàn yīfu zěnmeyàng?",
        "english": "How is this piece of clothing?"
      }
    ]
  },
  {
    "hanzi": "中国",
    "pinyin": "Zhōng guó",
    "english": "China",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我的朋友是中国人。",
        "pinyin": "Wǒ de péngyǒu shì Zhōngguó rén.",
        "english": "My friend is Chinese."
      }
    ]
  },
  {
    "hanzi": "中午",
    "pinyin": "zhōng wǔ",
    "english": " noon, midday",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我们中午吃午饭。",
        "pinyin": "Wǒmen zhōngwǔ chī wǔfàn.",
        "english": "We eat lunch at noon."
      }
    ]
  },
  {
    "hanzi": "住",
    "pinyin": "zhù",
    "english": " to live, to stay",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你住在哪里？",
        "pinyin": "Nǐ zhù zài nǎlǐ?",
        "english": "Where do you live?"
      }
    ]
  },
  {
    "hanzi": "桌子",
    "pinyin": "zhuō zi",
    "english": "table",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "桌子上有一本书。",
        "pinyin": "Zhuōzi shàng yǒu yì běn shū.",
        "english": "There is a book on the table."
      }
    ]
  },
  {
    "hanzi": "字",
    "pinyin": "zì",
    "english": " word, character",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这个字怎么读？",
        "pinyin": "Zhège zì zěnme dú?",
        "english": "How do you read this character?"
      }
    ]
  },
  {
    "hanzi": "坐",
    "pinyin": "zuò",
    "english": "to sit",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "请坐。",
        "pinyin": "Qǐng zuò.",
        "english": "Please sit down."
      }
    ]
  },
  {
    "hanzi": "昨天",
    "pinyin": "zuó tiān",
    "english": "yesterday",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我昨天去图书馆了。",
        "pinyin": "Wǒ zuó tiān qù tú shū guǎn le.",
        "english": "I went to the library yesterday."
      }
    ]
  },
  {
    "hanzi": "白",
    "pinyin": "bái",
    "english": "white",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "这是一只白猫。",
        "pinyin": "Zhè shì yī zhǐ bái māo.",
        "english": "This is a white cat."
      }
    ]
  },
  {
    "hanzi": "帮助",
    "pinyin": "bāng zhù",
    "english": "to help",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "谢谢你帮助我。",
        "pinyin": "Xièxie nǐ bāngzhù wǒ.",
        "english": "Thank you for helping me."
      }
    ]
  },
  {
    "hanzi": "报纸",
    "pinyin": "bào zhǐ",
    "english": "newspaper",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "他每天早上都看报纸。",
        "pinyin": "Tā měitiān zǎoshang dōu kàn bàozhǐ.",
        "english": "He reads the newspaper every morning."
      }
    ]
  },
  {
    "hanzi": "比",
    "pinyin": "bǐ",
    "english": "than for comparison",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我比你高。",
        "pinyin": "Wǒ bǐ nǐ gāo.",
        "english": "I am taller than you."
      }
    ]
  },
  {
    "hanzi": "别",
    "pinyin": "bié",
    "english": "don't; other",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "别担心。",
        "pinyin": "Bié dānxīn.",
        "english": "Don't worry."
      }
    ]
  },
  {
    "hanzi": "长",
    "pinyin": "cháng",
    "english": "long",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "这条河很长。",
        "pinyin": "Zhè tiáo hé hěn cháng.",
        "english": "This river is very long."
      }
    ]
  },
  {
    "hanzi": "出",
    "pinyin": "chū",
    "english": "to go out",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "他早上八点出家门。",
        "pinyin": "Tā zǎoshang bā diǎn chū jiāmén.",
        "english": "He leaves the house at 8 AM."
      }
    ]
  },
  {
    "hanzi": "次",
    "pinyin": "cì",
    "english": "MW: times",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "请你再读一次。",
        "pinyin": "Qǐng nǐ zài dú yī cì.",
        "english": "Please read it one more time."
      }
    ]
  },
  {
    "hanzi": "错",
    "pinyin": "cuò",
    "english": "wrong; mistake",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "对不起，我错了。",
        "pinyin": "Duìbùqǐ, wǒ cuò le.",
        "english": "Sorry, I was wrong (or: I made a mistake)."
      }
    ]
  },
  {
    "hanzi": "但是",
    "pinyin": "dàn shì",
    "english": " but, however",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我想去，但是我没有时间。",
        "pinyin": "Wǒ xiǎng qù, dànshì wǒ méiyǒu shíjiān.",
        "english": "I want to go, but I don't have time."
      }
    ]
  },
  {
    "hanzi": "弟弟",
    "pinyin": "dì di",
    "english": "younger brother",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我的弟弟五岁了。",
        "pinyin": "Wǒ de dìdi wǔ suì le.",
        "english": "My younger brother is five years old."
      }
    ]
  },
  {
    "hanzi": "房间",
    "pinyin": "fáng jiān",
    "english": "room",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "这个房间很干净。",
        "pinyin": "Zhège fángjiān hěn gānjìng.",
        "english": "This room is very clean."
      }
    ]
  },
  {
    "hanzi": "服务员",
    "pinyin": "fú wù yuán",
    "english": "waiter",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "服务员，请给我们菜单。",
        "pinyin": "Fúwùyuán, qǐng gěi wǒmen càidān.",
        "english": "Waitress, please give us the menu."
      }
    ]
  },
  {
    "hanzi": "告诉",
    "pinyin": "gào su",
    "english": "to tell",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "请告诉我你的名字。",
        "pinyin": "Qǐng gàosù wǒ nǐ de míngzi.",
        "english": "Please tell me your name."
      }
    ]
  },
  {
    "hanzi": "哥哥",
    "pinyin": "gē ge",
    "english": "older brother",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我的哥哥喜欢踢足球。",
        "pinyin": "Wǒ de gēge xǐhuān tī zúqiú.",
        "english": "My older brother likes to play soccer."
      }
    ]
  },
  {
    "hanzi": "给",
    "pinyin": "gěi",
    "english": "to give",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "他给了我一个礼物。",
        "pinyin": "Tā gěile wǒ yīgè lǐwù.",
        "english": "He gave me a gift."
      }
    ]
  },
  {
    "hanzi": "公共汽车",
    "pinyin": "gōng gòng qì chē",
    "english": "bus",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我每天坐公共汽车上班。",
        "pinyin": "Wǒ měitiān zuò gōnggòng qìchē shàngbān.",
        "english": "I take the bus to work every day."
      }
    ]
  },
  {
    "hanzi": "贵",
    "pinyin": "guì",
    "english": "expensive",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "价钱太贵了。",
        "pinyin": "Jiàqian tài guì le.",
        "english": "The price is too expensive."
      }
    ]
  },
  {
    "hanzi": "还",
    "pinyin": "hái",
    "english": "still",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "你还忙吗？",
        "pinyin": "Nǐ hái máng ma?",
        "english": "Are you still busy?"
      }
    ]
  },
  {
    "hanzi": "好吃",
    "pinyin": "hǎo chī",
    "english": " tasty, delicious",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "这个蛋糕很好吃。",
        "pinyin": "Zhège dàngāo hěn hǎochī.",
        "english": "This cake is very delicious."
      }
    ]
  },
  {
    "hanzi": "黑",
    "pinyin": "hēi",
    "english": " black, dark",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "天黑了。",
        "pinyin": "Tiān hēi le.",
        "english": "It's dark now."
      }
    ]
  },
  {
    "hanzi": "红",
    "pinyin": "hóng",
    "english": "red",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "灯笼是红色的。",
        "pinyin": "Dēnglóng shì hóngsè de.",
        "english": "The lantern is red."
      }
    ]
  },
  {
    "hanzi": "欢迎",
    "pinyin": "huān yíng",
    "english": "welcome",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "欢迎光临。",
        "pinyin": "Huānyíng guānglín.",
        "english": "Welcome. (Used when greeting a customer.)"
      }
    ]
  },
  {
    "hanzi": "回答",
    "pinyin": "huí dá",
    "english": "to answer",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "请回答我的问题。",
        "pinyin": "Qǐng huídá wǒ de wèntí.",
        "english": "Please answer my question."
      }
    ]
  },
  {
    "hanzi": "鸡蛋",
    "pinyin": "jī dàn",
    "english": "egg",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我喜欢吃鸡蛋面。",
        "pinyin": "Wǒ xǐhuān chī jīdàn miàn.",
        "english": "I like to eat egg noodles."
      }
    ]
  },
  {
    "hanzi": "介绍",
    "pinyin": "jiè shào",
    "english": "to introduce",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "请你介绍一下你自己。",
        "pinyin": "Qǐng nǐ jièshào yīxià nǐ zìjǐ.",
        "english": "Please introduce yourself."
      }
    ]
  },
  {
    "hanzi": "近",
    "pinyin": "jìn",
    "english": " near, close",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "学校离我家很近。",
        "pinyin": "Xuéxiào lí wǒ jiā hěn jìn.",
        "english": "The school is very close to my home."
      }
    ]
  },
  {
    "hanzi": "进",
    "pinyin": "jìn",
    "english": "to enter",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "他进了房间。",
        "pinyin": "Tā jìnle fángjiān.",
        "english": "He entered the room."
      }
    ]
  },
  {
    "hanzi": "觉得",
    "pinyin": "jué de",
    "english": " to think, to feel",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我觉得这个主意很好。",
        "pinyin": "Wǒ juéde zhège zhǔyì hěn hǎo.",
        "english": "I think this idea is very good."
      }
    ]
  },
  {
    "hanzi": "咖啡",
    "pinyin": "kā fēi",
    "english": "coffee",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "你喝咖啡吗？",
        "pinyin": "Nǐ hē kāfēi ma?",
        "english": "Do you drink coffee?"
      }
    ]
  },
  {
    "hanzi": "开始",
    "pinyin": "kāi shǐ",
    "english": "to begin",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我们九点开始上课。",
        "pinyin": "Wǒmen jiǔ diǎn kāishǐ shàngkè.",
        "english": "We start class at nine o'clock."
      }
    ]
  },
  {
    "hanzi": "可能",
    "pinyin": "kě néng",
    "english": " might, maybe",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "明天可能会下雨。",
        "pinyin": "Míngtiān kěnéng huì xià yǔ.",
        "english": "It might rain tomorrow."
      }
    ]
  },
  {
    "hanzi": "快",
    "pinyin": "kuài",
    "english": " quick, fast",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "火车开得很快。",
        "pinyin": "Huǒchē kāi de hěn kuài.",
        "english": "The train drives very fast."
      }
    ]
  },
  {
    "hanzi": "快乐",
    "pinyin": "kuài lè",
    "english": "happy",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "祝你生日快乐。",
        "pinyin": "Zhù nǐ shēngrì kuàilè.",
        "english": "I wish you a happy birthday."
      }
    ]
  },
  {
    "hanzi": "卖",
    "pinyin": "mài",
    "english": "to sell",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "这家店卖衣服。",
        "pinyin": "Zhè jiā diàn mài yīfu.",
        "english": "This shop sells clothes."
      }
    ]
  },
  {
    "hanzi": "慢",
    "pinyin": "màn",
    "english": "slow",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "请慢点儿。",
        "pinyin": "Qǐng màn diǎn'r.",
        "english": "Please slow down (a bit)."
      }
    ]
  },
  {
    "hanzi": "忙",
    "pinyin": "máng",
    "english": "busy",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "你现在忙吗？",
        "pinyin": "Nǐ xiànzài máng ma?",
        "english": "Are you busy right now?"
      }
    ]
  },
  {
    "hanzi": "每",
    "pinyin": "měi",
    "english": " each, every",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我每天都去跑步。",
        "pinyin": "Wǒ měitiān dōu qù pǎobù.",
        "english": "I go running every day."
      }
    ]
  },
  {
    "hanzi": "门",
    "pinyin": "mén",
    "english": "door",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "请关门。",
        "pinyin": "Qǐng guān mén.",
        "english": "Please close the door."
      }
    ]
  },
  {
    "hanzi": "牛奶",
    "pinyin": "niú nǎi",
    "english": "milk",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我喜欢在早餐时喝牛奶。",
        "pinyin": "Wǒ xǐhuān zài zǎocān shí hē niúnǎi.",
        "english": "I like to drink milk at breakfast."
      }
    ]
  },
  {
    "hanzi": "晴",
    "pinyin": "qíng",
    "english": " clear, sunny",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "今天是晴天。",
        "pinyin": "Jīntiān shì qíngtiān.",
        "english": "Today is a sunny day."
      }
    ]
  },
  {
    "hanzi": "手机",
    "pinyin": "shǒu jī",
    "english": "mobile phone",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我的手机没电了。",
        "pinyin": "Wǒ de shǒujī méi diàn le.",
        "english": "My mobile phone is out of battery."
      }
    ]
  },
  {
    "hanzi": "所以",
    "pinyin": "suǒ yǐ",
    "english": " therefore, so",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我很忙，所以我不能去。",
        "pinyin": "Wǒ hěn máng, suǒyǐ wǒ bù néng qù.",
        "english": "I am very busy, so I cannot go."
      }
    ]
  },
  {
    "hanzi": "安静",
    "pinyin": "ān jìng",
    "english": "Adjective: quiet, peaceful",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请安静。",
        "pinyin": "Qǐng ān jìng.",
        "english": "Please be quiet."
      }
    ]
  },
  {
    "hanzi": "帮忙",
    "pinyin": "bāng máng",
    "english": "Verb: to help, to do a favour",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他经常帮忙打扫办公室。",
        "pinyin": "Tā jīngcháng bāngmáng dǎsǎo bàngōngshì.",
        "english": "He often helps clean the office."
      }
    ]
  },
  {
    "hanzi": "比较",
    "pinyin": "bǐ jiào",
    "english": "Adverb: quite, rather, fairly, comparatively",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这个任务比较简单。",
        "pinyin": "Zhège rènwu bǐjiào jiǎndān.",
        "english": "This task is relatively simple."
      }
    ]
  },
  {
    "hanzi": "宾馆",
    "pinyin": "bīn guǎn",
    "english": "Noun: hotel",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这家宾馆很干净。",
        "pinyin": "Zhè jiā bīnguǎn hěn gānjìng.",
        "english": "This hotel is very clean."
      }
    ]
  },
  {
    "hanzi": "冰箱",
    "pinyin": "bīng xiāng",
    "english": " Noun: fridge, icebox; Verb: to compete",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "牛奶在冰箱里。",
        "pinyin": "Niúnǎi zài bīngxiāng lǐ.",
        "english": "The milk is in the fridge."
      }
    ]
  },
  {
    "hanzi": "菜单",
    "pinyin": "cài dān",
    "english": "Noun: menu",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请给我菜单。",
        "pinyin": "Qǐng gěi wǒ càidān.",
        "english": "Please give me the menu."
      }
    ]
  },
  {
    "hanzi": "超市",
    "pinyin": "chāo shì",
    "english": "Noun: supermarket",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我们去超市买菜吧。",
        "pinyin": "Wǒmen qù chāoshì mǎi cài ba.",
        "english": "Let's go to the supermarket to buy some groceries."
      }
    ]
  },
  {
    "hanzi": "带",
    "pinyin": "dài",
    "english": " Noun: band, belt, area, region; Verb: to wear, to carry, to bring, to lead",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "你带伞了吗？",
        "pinyin": "Nǐ dài sǎn le ma?",
        "english": "Did you bring an umbrella?"
      }
    ]
  },
  {
    "hanzi": "蛋糕",
    "pinyin": "dàn gāo",
    "english": "Noun: cake",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这个蛋糕很好吃。",
        "pinyin": "Zhège dàngāo hěn hǎochī.",
        "english": "This cake is very delicious."
      }
    ]
  },
  {
    "hanzi": "担心",
    "pinyin": "dān xīn",
    "english": " Verb: to worry; Adjective: worried, anxious",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "不要担心我。",
        "pinyin": "Búyào dānxīn wǒ.",
        "english": "Don't worry about me."
      }
    ]
  },
  {
    "hanzi": "灯",
    "pinyin": "dēng",
    "english": "Noun: lamp, light",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请把灯打开。",
        "pinyin": "Qǐng bǎ dēng dǎkāi.",
        "english": "Please turn on the light."
      }
    ]
  },
  {
    "hanzi": "短",
    "pinyin": "duǎn",
    "english": "Adjective: short, brief",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "她的裙子很短。",
        "pinyin": "Tā de qúnzi hěn duǎn.",
        "english": "Her skirt is very short."
      }
    ]
  },
  {
    "hanzi": "锻炼",
    "pinyin": "duàn liàn",
    "english": "Verb: to exercise, to engage in physical exercise",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我每天锻炼身体。",
        "pinyin": "Wǒ měitiān duànliàn shēntǐ.",
        "english": "I exercise every day."
      }
    ]
  },
  {
    "hanzi": "饿",
    "pinyin": "è",
    "english": "Adjective: hungry",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我很饿。",
        "pinyin": "Wǒ hěn è.",
        "english": "I am very hungry."
      }
    ]
  },
  {
    "hanzi": "方便",
    "pinyin": "fāng biàn",
    "english": "Adjective: convenient",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这里的交通方便吗？",
        "pinyin": "Zhèlǐ de jiāotōng fāngbiàn ma?",
        "english": "Is the transportation here convenient?"
      }
    ]
  },
  {
    "hanzi": "干净",
    "pinyin": "gān jìng",
    "english": "Adjective: clean, tidy",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "房间很干净。",
        "pinyin": "Fángjiān hěn gānjìng.",
        "english": "The room is very clean."
      }
    ]
  },
  {
    "hanzi": "关",
    "pinyin": "guān",
    "english": " Noun: mountain pass, barrier Verb: to close, to shut, to turn off",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请关灯。",
        "pinyin": "Qǐng guān dēng.",
        "english": "Please turn off the light."
      }
    ]
  },
  {
    "hanzi": "还",
    "pinyin": "huán",
    "english": "Verb: to give back, to return",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请把笔还给我。",
        "pinyin": "Qǐng bǎ bǐ huán gěi wǒ.",
        "english": "Please return the pen to me."
      }
    ]
  },
  {
    "hanzi": "机会",
    "pinyin": "jī huì",
    "english": "Noun: opportunity, chance",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "不要错过这个机会。",
        "pinyin": "Bú yào cuòguò zhège jīhuì.",
        "english": "Don't miss this opportunity."
      }
    ]
  },
  {
    "hanzi": "结束",
    "pinyin": "jié shù",
    "english": " Noun: termination, end Verb: to finish, to end, to conclude",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "会议已经结束了。",
        "pinyin": "Huìyì yǐjīng jiéshù le.",
        "english": "The meeting has already ended."
      }
    ]
  },
  {
    "hanzi": "渴",
    "pinyin": "kě",
    "english": "Adjective: thirsty",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我很渴，想喝水。",
        "pinyin": "Wǒ hěn kě, xiǎng hē shuǐ.",
        "english": "I am very thirsty and want to drink water."
      }
    ]
  },
  {
    "hanzi": "空调",
    "pinyin": "kōng tiáo",
    "english": "Noun: air conditioning",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "今天太热了，我们开空调吧。",
        "pinyin": "Jīntiān tài rèle, wǒmen kāi kōngtiáo ba.",
        "english": "It's too hot today, let's turn on the air conditioning."
      }
    ]
  },
  {
    "hanzi": "哭",
    "pinyin": "kū",
    "english": "Verb: to cry, to weep",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "别哭了，没事的。",
        "pinyin": "Bié kū le, méi shì de.",
        "english": "Don't cry anymore, it's fine."
      }
    ]
  },
  {
    "hanzi": "裤子",
    "pinyin": "kù zi",
    "english": "Noun: trousers",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这条裤子太长了。",
        "pinyin": "Zhè tiáo kùzi tài cháng le.",
        "english": "These pants are too long."
      }
    ]
  },
  {
    "hanzi": "筷子",
    "pinyin": "kuài zi",
    "english": "Noun: chopsticks",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我需要一双筷子。",
        "pinyin": "Wǒ xūyào yī shuāng kuàizi.",
        "english": "I need a pair of chopsticks."
      }
    ]
  },
  {
    "hanzi": "辆",
    "pinyin": "liàng",
    "english": "Measure Word: for vehicles",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他有三辆车。",
        "pinyin": "Tā yǒu sān liàng chē.",
        "english": "He has three cars."
      }
    ]
  },
  {
    "hanzi": "满意",
    "pinyin": "mǎn yì",
    "english": "Verb: to satisfy Adjective: satisfied",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我对你的工作很满意。",
        "pinyin": "Wǒ duì nǐ de gōngzuò hěn mǎnyì.",
        "english": "I am very satisfied with your work."
      }
    ]
  },
  {
    "hanzi": "米",
    "pinyin": "mǐ",
    "english": "Noun: rice Measure Word: for meter",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这条鱼有五十厘米长。",
        "pinyin": "Zhè tiáo yú yǒu wǔshí lí mǐ cháng.",
        "english": "This fish is fifty centimeters long."
      }
    ]
  },
  {
    "hanzi": "面包",
    "pinyin": "miàn bāo",
    "english": "Noun: bread",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这个面包很好吃。",
        "pinyin": "Zhège miànbāo hěn hǎochī.",
        "english": "This bread is very delicious."
      }
    ]
  },
  {
    "hanzi": "面条",
    "pinyin": "miàn tiáo",
    "english": "Noun: noodles",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我最喜欢吃牛肉面条。",
        "pinyin": "Wǒ zuì xǐhuān chī niúròu miàntiáo.",
        "english": "I like eating beef noodles the most."
      }
    ]
  },
  {
    "hanzi": "拿",
    "pinyin": "ná",
    "english": "Verb: to hold, to seize",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请拿这本书。",
        "pinyin": "Qǐng ná zhè běn shū.",
        "english": "Please take this book."
      }
    ]
  },
  {
    "hanzi": "难",
    "pinyin": "nán",
    "english": "Adjective: difficult",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这个问题很难。",
        "pinyin": "Zhège wèntí hěn nán.",
        "english": "This question is very difficult."
      }
    ]
  },
  {
    "hanzi": "难过",
    "pinyin": "nán guò",
    "english": "Verb: to feel sorry, sad",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "听到这个消息，她很难过。",
        "pinyin": "Tīngdào zhège xiāoxi, tā hěn nánguò.",
        "english": "Hearing this news, she was very sad."
      }
    ]
  },
  {
    "hanzi": "努力",
    "pinyin": "nǔ lì",
    "english": " Noun: great effort Verb: to strive, to work/study hard Adjective: hard, hardworking",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "你一定要努力学习。",
        "pinyin": "Nǐ yīdìng yào nǔlì xuéxí.",
        "english": "You must study hard."
      }
    ]
  },
  {
    "hanzi": "盘子",
    "pinyin": "pán zi",
    "english": "Noun: tray, plate, dish",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请给我一个盘子。",
        "pinyin": "Qǐng gěi wǒ yīgè pánzi.",
        "english": "Please give me a plate."
      }
    ]
  },
  {
    "hanzi": "胖",
    "pinyin": "pàng",
    "english": "Adjective: fat, plump",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他的猫很胖，像个球。",
        "pinyin": "Tā de māo hěn pàng, xiàng gè qiú.",
        "english": "His cat is very fat, like a ball."
      }
    ]
  },
  {
    "hanzi": "啤酒",
    "pinyin": "pí jiǔ",
    "english": "Noun: beer",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他买了两瓶啤酒。",
        "pinyin": "Tā mǎi le liǎng píng píjiǔ.",
        "english": "He bought two bottles of beer."
      }
    ]
  },
  {
    "hanzi": "葡萄",
    "pinyin": "pú tao",
    "english": "Noun: grape",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我喜欢吃葡萄。",
        "pinyin": "Wǒ xǐhuān chī pútao.",
        "english": "I like eating grapes."
      }
    ]
  },
  {
    "hanzi": "热情",
    "pinyin": "rè qíng",
    "english": " Noun: enthusiasm, passion Adjective: enthusiastic, passionate, cordial",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "她待人很热情。",
        "pinyin": "Tā dài rén hěn rèqíng.",
        "english": "She treats people very warmly."
      }
    ]
  },
  {
    "hanzi": "认真",
    "pinyin": "rèn zhēn",
    "english": "Adjective: conscientious, earnest, serious",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他工作很认真。",
        "pinyin": "Tā gōngzuò hěn rènzhēn.",
        "english": "He is very conscientious about his work."
      }
    ]
  },
  {
    "hanzi": "容易",
    "pinyin": "róng yì",
    "english": "Adjective: easy",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这个考试很容易。",
        "pinyin": "Zhège kǎoshì hěn róngyì.",
        "english": "This test is very easy."
      }
    ]
  },
  {
    "hanzi": "伞",
    "pinyin": "sǎn",
    "english": "Noun: umbrella",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "下雨了，你需要一把伞。",
        "pinyin": "Xià yǔle, nǐ xūyào yī bǎ sǎn.",
        "english": "It's raining, you need an umbrella."
      }
    ]
  },
  {
    "hanzi": "生气",
    "pinyin": "shēng qì",
    "english": " Verb: to be/get angry Adjective: angry, mad",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他为什么生气了?",
        "pinyin": "Tā wèishénme shēng qì le?",
        "english": "Why did he get angry?"
      }
    ]
  },
  {
    "hanzi": "瘦",
    "pinyin": "shòu",
    "english": "Adjective: thin, slim",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他看起来很瘦。",
        "pinyin": "Tā kàn qǐlái hěn shòu.",
        "english": "He looks very thin."
      }
    ]
  },
  {
    "hanzi": "舒服",
    "pinyin": "shū fu",
    "english": "Adjective: comfortable",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这张床很舒服。",
        "pinyin": "Zhè zhāng chuáng hěn shūfu.",
        "english": "This bed is very comfortable."
      }
    ]
  },
  {
    "hanzi": "糖",
    "pinyin": "táng",
    "english": "Noun: sugar, sweets, candy",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我喜欢吃糖。",
        "pinyin": "Wǒ xǐhuān chī táng.",
        "english": "I like eating candy."
      }
    ]
  },
  {
    "hanzi": "万",
    "pinyin": "wàn",
    "english": "Number: 10000",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我银行里有一万块钱。",
        "pinyin": "Wǒ yínháng lǐ yǒu yī wàn kuài qián.",
        "english": "I have ten thousand yuan in the bank."
      }
    ]
  },
  {
    "hanzi": "完成",
    "pinyin": "wán chéng",
    "english": "Verb: to complete, to accomplish",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他成功完成了作业。",
        "pinyin": "Tā chénggōng wánchéngle zuòyè.",
        "english": "He successfully completed the homework."
      }
    ]
  },
  {
    "hanzi": "忘记",
    "pinyin": "wàng jì",
    "english": "Verb: to forget",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请不要忘记明天的会议。",
        "pinyin": "Qǐng bù yào wàngjì míngtiān de huìyì.",
        "english": "Please don't forget tomorrow's meeting."
      }
    ]
  },
  {
    "hanzi": "为",
    "pinyin": "wèi",
    "english": " Verb: to do, to act, to be, to become Relative Clause: for sb.",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他为我打开了门。",
        "pinyin": "Tā wèi wǒ dǎkāile mén.",
        "english": "He opened the door for me."
      }
    ]
  },
  {
    "hanzi": "位",
    "pinyin": "wèi",
    "english": " Noun: position, place, seat Measure Word: for people",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "餐厅里有三位客人。",
        "pinyin": "Cāntīng lǐ yǒu sān wèi kèren.",
        "english": "There are three guests in the restaurant."
      }
    ]
  },
  {
    "hanzi": "为了",
    "pinyin": "wèi le",
    "english": "Relative Clause: for, in order to",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "为了健康，他每天跑步。",
        "pinyin": "Wèile jiànkāng, tā měitiān pǎobù.",
        "english": "In order to be healthy, he runs every day."
      }
    ]
  },
  {
    "hanzi": "像",
    "pinyin": "xiàng",
    "english": "Verb: be/look like, to appear, to seem",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他很像他的爸爸。",
        "pinyin": "Tā hěn xiàng tā de bàba.",
        "english": "He looks very much like his father."
      }
    ]
  },
  {
    "hanzi": "香蕉",
    "pinyin": "xiāng jiāo",
    "english": "Noun: banana",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我喜欢吃香蕉。",
        "pinyin": "Wǒ xǐhuān chī xiāngjiāo.",
        "english": "I like eating bananas."
      }
    ]
  },
  {
    "hanzi": "要求",
    "pinyin": "yāo qiú",
    "english": " Noun: demand, requirement Verb: to require, to demand",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他的要求太高了。",
        "pinyin": "Tā de yāo qiú tài gāo le.",
        "english": "His demands are too high."
      }
    ]
  },
  {
    "hanzi": "一会儿",
    "pinyin": "yí huì r",
    "english": "Time: a while Adverb: in a moment, a little while",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我一会儿就回来。",
        "pinyin": "Wǒ yíhuìr jiù huílái.",
        "english": "I will be back in a moment."
      }
    ]
  },
  {
    "hanzi": "一样",
    "pinyin": "yí yàng",
    "english": "Time: finally, at last",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他的爱好跟我一样。",
        "pinyin": "Tā de àihào gēn wǒ yīyàng.",
        "english": "His hobby is the same as mine."
      }
    ]
  },
  {
    "hanzi": "应该",
    "pinyin": "yīng gāi",
    "english": "Auxiliary Verb: should, ought to",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "你应该休息了。",
        "pinyin": "Nǐ yīnggāi xiūxi le.",
        "english": "You should rest now."
      }
    ]
  },
  {
    "hanzi": "遇到",
    "pinyin": "yù dào",
    "english": "Verb: to meet, to run into",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "如果你遇到任何问题，请告诉我。",
        "pinyin": "Rúguǒ nǐ yù dào rènhé wèntí, qǐng gàosù wǒ.",
        "english": "If you encounter any problems, please tell me."
      }
    ]
  },
  {
    "hanzi": "站",
    "pinyin": "zhàn",
    "english": " Noun: station, stop Verb: to stand, to stop, to halt",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请问，下一站是哪里？",
        "pinyin": "Qǐngwèn, xià yí zhàn shì nǎli?",
        "english": "Excuse me, where is the next stop?"
      }
    ]
  },
  {
    "hanzi": "长",
    "pinyin": "zhǎng",
    "english": " Noun: chief, head Verb: to grow, to develop",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我在北京长大。",
        "pinyin": "Wǒ zài Běijīng zhǎng dà.",
        "english": "I grew up in Beijing."
      }
    ]
  },
  {
    "hanzi": "照顾",
    "pinyin": "zhào gù",
    "english": "Verb: to take care of, to look after",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "奶奶生病了，我要照顾她。",
        "pinyin": "Nǎinai shēngbìngle, wǒ yào zhàogù tā.",
        "english": "Grandma is sick, I need to take care of her."
      }
    ]
  },
  {
    "hanzi": "着急",
    "pinyin": "zháo jí",
    "english": "Verb: to worry, to be nervous",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "别着急，慢慢来。",
        "pinyin": "Bié zháojí, mànman lái.",
        "english": "Don't worry, take your time."
      }
    ]
  },
  {
    "hanzi": "照片",
    "pinyin": "zhào piàn",
    "english": "Noun: photo, picture",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我喜欢这张照片。",
        "pinyin": "Wǒ xǐhuan zhè zhāng zhàopiàn.",
        "english": "I like this photo."
      }
    ]
  },
  {
    "hanzi": "照相机",
    "pinyin": "zhào xiàng jī",
    "english": "Noun: camera",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我买了一个新的照相机。",
        "pinyin": "Wǒ mǎile yīgè xīn de zhàoxiàngjī.",
        "english": "I bought a new camera."
      }
    ]
  },
  {
    "hanzi": "只",
    "pinyin": "zhǐ",
    "english": "Adverb: only, just, merely",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我只剩下五块钱了。",
        "pinyin": "Wǒ zhǐ shèng xià wǔ kuài qián le.",
        "english": "I only have five yuan left."
      }
    ]
  },
  {
    "hanzi": "中间",
    "pinyin": "zhōng jiān",
    "english": "Location: between, in the middle, mid",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请把花瓶放在桌子中间。",
        "pinyin": "Qǐng bǎ huāpíng fàng zài zhuōzi zhōngjiān.",
        "english": "Please put the vase in the middle of the table."
      }
    ]
  },
  {
    "hanzi": "重要",
    "pinyin": "zhòng yào",
    "english": "Adjective: important",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "健康很重要。",
        "pinyin": "Jiànkāng hěn zhòngyào.",
        "english": "Health is very important."
      }
    ]
  },
  {
    "hanzi": "周末",
    "pinyin": "zhōu mò",
    "english": "Noun: weekend",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我周末想在家休息。",
        "pinyin": "Wǒ zhōumò xiǎng zài jiā xiūxi.",
        "english": "I want to rest at home on the weekend."
      }
    ]
  },
  {
    "hanzi": "祝",
    "pinyin": "zhù",
    "english": "Verb: to wish, to express good wishes",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "祝你生日快乐！",
        "pinyin": "Zhù nǐ shēngrì kuàilè!",
        "english": "Wish you a happy birthday!"
      }
    ]
  },
  {
    "hanzi": "主要",
    "pinyin": "zhǔ yào",
    "english": "Adjective: main, principal, major",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "她的主要工作是管理团队。",
        "pinyin": "Tā de zhǔyào gōngzuò shì guǎnlǐ tuánduì.",
        "english": "Her main job is managing the team."
      }
    ]
  },
  {
    "hanzi": "注意",
    "pinyin": "zhù yì",
    "english": "Verb: to pay attention to",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请注意安全。",
        "pinyin": "Qǐng zhùyì ānquán.",
        "english": "Please pay attention to safety."
      }
    ]
  },
  {
    "hanzi": "字典",
    "pinyin": "zì diǎn",
    "english": "Noun: dictionary, character book",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请查一下字典。",
        "pinyin": "Qǐng chá yīxià zìdiǎn.",
        "english": "Please check the dictionary."
      }
    ]
  },
  {
    "hanzi": "自己",
    "pinyin": "zì jǐ",
    "english": "Pronoun: oneself, self",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我要相信自己。",
        "pinyin": "Wǒ yào xiāngxìn zìjǐ.",
        "english": "I need to believe in myself."
      }
    ]
  },
  {
    "hanzi": "总是",
    "pinyin": "zǒng shì",
    "english": "Adverb: always",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他总是忘记带钥匙。",
        "pinyin": "Tā zǒng shì wàng jì dài yào shi.",
        "english": "He always forgets to bring his keys."
      }
    ]
  },
  {
    "hanzi": "作业",
    "pinyin": "zuò yè",
    "english": "Noun: homework, task, work",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "今天的作业是什么？",
        "pinyin": "Jīntiān de zuòyè shì shénme?",
        "english": "What is today's homework?"
      }
    ]
  },
  {
    "hanzi": "表达",
    "pinyin": "biǎo dá",
    "english": "Verb: to express, to convey",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你应该清楚地表达你的想法。",
        "pinyin": "Nǐ yīnggāi qīngchǔ de biǎodá nǐ de xiǎngfǎ.",
        "english": "You should clearly express your ideas."
      }
    ]
  },
  {
    "hanzi": "不但",
    "pinyin": "bú dàn",
    "english": "Conjunction: not only",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这道菜不但好吃，而且便宜。",
        "pinyin": "Zhè dào cài bùdàn hǎochī, érqiě piányi.",
        "english": "This dish is not only delicious but also cheap."
      }
    ]
  },
  {
    "hanzi": "不过",
    "pinyin": "bú guò",
    "english": " Adverb: only, just, no more than Conjunction: but, however",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这不过是一个小问题。",
        "pinyin": "Zhè búguò shì yī gè xiǎo wèntí.",
        "english": "This is only a small problem."
      }
    ]
  },
  {
    "hanzi": "成熟",
    "pinyin": "chéng shú",
    "english": "Adjective: mature",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他的想法比同龄人成熟。",
        "pinyin": "Tā de xiǎngfǎ bǐ tónglíngrén chéngshú.",
        "english": "His ideas are more mature than those of his peers."
      }
    ]
  },
  {
    "hanzi": "对话",
    "pinyin": "duì huà",
    "english": "Noun: dialog",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们开始对话吧。",
        "pinyin": "Wǒmen kāishǐ duìhuà ba.",
        "english": "Let's start the conversation."
      }
    ]
  },
  {
    "hanzi": "刚刚",
    "pinyin": "gāng gāng",
    "english": "Adverb: just now, a moment ago",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "雨刚刚停了。",
        "pinyin": "Yǔ gānggāng tíng le.",
        "english": "The rain just stopped."
      }
    ]
  },
  {
    "hanzi": "个子",
    "pinyin": "gè zi",
    "english": "Noun: height, stature",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她的个子很高。",
        "pinyin": "Tā de gèzi hěn gāo.",
        "english": "She is very tall."
      }
    ]
  },
  {
    "hanzi": "购物",
    "pinyin": "gòu wù",
    "english": "Verb: to go shopping",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我周末喜欢购物。",
        "pinyin": "Wǒ zhōumò xǐhuān gòuwù.",
        "english": "I like to go shopping on weekends."
      }
    ]
  },
  {
    "hanzi": "好像",
    "pinyin": "hǎo xiàng",
    "english": "Verb: to seem, to be like, look like",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "天气好像要下雨了。",
        "pinyin": "Tiānqì hǎoxiàng yào xiàyǔ le.",
        "english": "It seems like it's going to rain."
      }
    ]
  },
  {
    "hanzi": "后来",
    "pinyin": "hòu lái",
    "english": "Adverb: afterwards, later",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她一开始不喜欢，后来习惯了。",
        "pinyin": "Tā yī kāishǐ bù xǐhuān, hòulái xíguàn le.",
        "english": "She didn't like it at first, but later she got used to it."
      }
    ]
  },
  {
    "hanzi": "忽然",
    "pinyin": "hū rán",
    "english": "Adverb: suddenly",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他忽然想起了这件事。",
        "pinyin": "Tā hūrán xiǎngqǐle zhè jiàn shì.",
        "english": "He suddenly remembered this matter."
      }
    ]
  },
  {
    "hanzi": "极其",
    "pinyin": "jí qí",
    "english": "Adverb: extremely",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个任务极其困难。",
        "pinyin": "Zhè ge rènwù jíqí kùnnan.",
        "english": "This task is extremely difficult."
      }
    ]
  },
  {
    "hanzi": "棵",
    "pinyin": "kē",
    "english": "Measure Word: for trees, plants, etc.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "院子里有一棵大树。",
        "pinyin": "Yuànzi lǐ yǒu yī kē dà shù.",
        "english": "There is one big tree in the yard."
      }
    ]
  },
  {
    "hanzi": "扩大",
    "pinyin": "kuò dà",
    "english": "Verb: to expand, to enlarge",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "公司决定扩大生产规模。",
        "pinyin": "Gōngsī juédìng kuòdà shēngchǎn guīmó.",
        "english": "The company decided to expand the scale of production."
      }
    ]
  },
  {
    "hanzi": "聊天",
    "pinyin": "liáo tiān",
    "english": "Verb: to chat",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们喜欢边喝咖啡边聊天。",
        "pinyin": "Wǒmen xǐhuān biān hē kāfēi biān liáotiān.",
        "english": "We like to drink coffee and chat at the same time."
      }
    ]
  },
  {
    "hanzi": "留学",
    "pinyin": "liú xué",
    "english": "Verb: to study abroad",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她计划明年留学。",
        "pinyin": "Tā jìhuà míngnián liú xué.",
        "english": "She plans to study abroad next year."
      }
    ]
  },
  {
    "hanzi": "麻烦",
    "pinyin": "má fan",
    "english": "Verb: to trouble sb. Adjective: troublesome",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个问题太麻烦了。",
        "pinyin": "Zhège wèntí tài máfán le.",
        "english": "This problem is too troublesome."
      }
    ]
  },
  {
    "hanzi": "内容",
    "pinyin": "nèi róng",
    "english": "Noun: content, substance",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这篇文章的内容很丰富。",
        "pinyin": "Zhè piān wénzhāng de nèiróng hěn fēngfù.",
        "english": "The content of this article is very rich."
      }
    ]
  },
  {
    "hanzi": "起飞",
    "pinyin": "qǐ fēi",
    "english": "Verb: to take off",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "飞机马上要起飞了。",
        "pinyin": "Fēijī mǎshàng yào qǐfēi le.",
        "english": "The airplane is about to take off."
      }
    ]
  },
  {
    "hanzi": "群",
    "pinyin": "qún",
    "english": "Measure Word: for group, crowd, etc.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "一群鸟飞走了。",
        "pinyin": "Yì qún niǎo fēi zǒu le.",
        "english": "A flock of birds flew away."
      }
    ]
  },
  {
    "hanzi": "人民币",
    "pinyin": "rén mín bì",
    "english": "Noun: RMB, Chinese Yuan",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "那个多少人民币?",
        "pinyin": "Nà ge duōshǎo rénmínbì?",
        "english": "How much is that in RMB?"
      }
    ]
  },
  {
    "hanzi": "试",
    "pinyin": "shì",
    "english": " Noun: experiment, examination, test Verb: to test, to attempt",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你可以试穿一下这件衣服。",
        "pinyin": "Nǐ kěyǐ shìchuān yīxià zhè jiàn yīfu.",
        "english": "You can try on this piece of clothing."
      }
    ]
  },
  {
    "hanzi": "市场",
    "pinyin": "shì chǎng",
    "english": "Noun: market",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "市场很大。",
        "pinyin": "Shìchǎng hěn dà.",
        "english": "The market is very large."
      }
    ]
  },
  {
    "hanzi": "适合",
    "pinyin": "shì hé",
    "english": "Verb: to fit, to suit",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个工作很适合你。",
        "pinyin": "Zhège gōngzuò hěn shìhé nǐ.",
        "english": "This job is very suitable for you."
      }
    ]
  },
  {
    "hanzi": "食品",
    "pinyin": "shí pǐn",
    "english": "Noun: food",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "商店里有很多食品。",
        "pinyin": "Shāngdiàn lǐ yǒu hěn duō shípǐn.",
        "english": "There is a lot of food in the store."
      }
    ]
  },
  {
    "hanzi": "算",
    "pinyin": "suàn",
    "english": "Verb: to calculate",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "让我算算。",
        "pinyin": "Ràng wǒ suàn suan.",
        "english": "Let me calculate it."
      }
    ]
  },
  {
    "hanzi": "孙子",
    "pinyin": "sūn zi",
    "english": "Noun: grandson",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他是我的孙子。",
        "pinyin": "Tā shì wǒ de sūnzi.",
        "english": "He is my grandson."
      }
    ]
  },
  {
    "hanzi": "台",
    "pinyin": "tái",
    "english": " Noun: desk, platform Measure Word: for vehicles, machinese, etc.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我买了一台新电脑。",
        "pinyin": "Wǒ mǎi le yī tái xīn diànnǎo.",
        "english": "I bought a new computer."
      }
    ]
  },
  {
    "hanzi": "态度",
    "pinyin": "tài du",
    "english": "Noun: manner, attitude",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他的态度很友好。",
        "pinyin": "Tā de tàidu hěn yǒuhǎo.",
        "english": "His attitude is very friendly."
      }
    ]
  },
  {
    "hanzi": "谈",
    "pinyin": "tán",
    "english": "Verb: to talk",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他们正在谈生意。",
        "pinyin": "Tāmen zhèngzài tán shēngyì.",
        "english": "They are discussing business."
      }
    ]
  },
  {
    "hanzi": "弹钢琴",
    "pinyin": "tán gāng qín",
    "english": "Verb: to play the piano",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你会弹钢琴吗？",
        "pinyin": "Nǐ huì tán gāngqín ma?",
        "english": "Can you play the piano?"
      }
    ]
  },
  {
    "hanzi": "躺",
    "pinyin": "tǎng",
    "english": "Verb: to lie down, to recline",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他累了，躺在沙发上。",
        "pinyin": "Tā lèi le, tǎng zài shāfā shang.",
        "english": "He was tired, so he lay down on the sofa."
      }
    ]
  },
  {
    "hanzi": "汤",
    "pinyin": "tāng",
    "english": "Noun: soup",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个汤很好喝。",
        "pinyin": "Zhège tāng hěn hǎo hē.",
        "english": "This soup tastes very good."
      }
    ]
  },
  {
    "hanzi": "停止",
    "pinyin": "tíng zhǐ",
    "english": "Verb: to stop, to halt",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "雨终于停止了。",
        "pinyin": "Yǔ zhōngyú tíngzhǐ le.",
        "english": "The rain finally stopped."
      }
    ]
  },
  {
    "hanzi": "往",
    "pinyin": "wǎng",
    "english": "Verb: to go",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你往哪儿去？",
        "pinyin": "Nǐ wǎng nǎr qù?",
        "english": "Where are you headed?"
      }
    ]
  },
  {
    "hanzi": "网站",
    "pinyin": "wǎng zhàn",
    "english": "Noun: website",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我找到一个很好的学习网站。",
        "pinyin": "Wǒ zhǎodào yī gè hěn hǎo de xuéxí wǎngzhàn.",
        "english": "I found a very good study website."
      }
    ]
  },
  {
    "hanzi": "握手",
    "pinyin": "wò shǒu",
    "english": "Verb: to shake hands",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他走过来跟我握手。",
        "pinyin": "Tā zǒu guòlái gēn wǒ wòshǒu.",
        "english": "He walked over and shook hands with me."
      }
    ]
  },
  {
    "hanzi": "西红柿",
    "pinyin": "xī hóng shì",
    "english": "Noun: tomato",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这种汤是用西红柿做的。",
        "pinyin": "Zhè zhǒng tāng shì yòng xīhóngshì zuò de.",
        "english": "This kind of soup is made with tomatoes."
      }
    ]
  },
  {
    "hanzi": "洗衣机",
    "pinyin": "xǐ yī jī",
    "english": "Noun: washing machine",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "洗衣机坏了，不能用。",
        "pinyin": "Xǐyījī huài le, bù néng yòng.",
        "english": "The washing machine is broken and cannot be used."
      }
    ]
  },
  {
    "hanzi": "笑话",
    "pinyin": "xiào hua",
    "english": "Noun: joke",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他讲了一个好笑的笑话。",
        "pinyin": "Tā jiǎngle yīgè hǎoxiào de xiàohuà.",
        "english": "He told a funny joke."
      }
    ]
  },
  {
    "hanzi": "小说",
    "pinyin": "xiǎo shuō",
    "english": "Noun: novel, fiction",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我喜欢看小说。",
        "pinyin": "Wǒ xǐhuān kàn xiǎoshuō.",
        "english": "I like reading novels."
      }
    ]
  },
  {
    "hanzi": "信任",
    "pinyin": "xìn rèn",
    "english": "Noun: trust Verb: to trust",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "信任非常重要。",
        "pinyin": "Xìnrèn fēicháng zhòngyào.",
        "english": "Trust is very important."
      }
    ]
  },
  {
    "hanzi": "信心",
    "pinyin": "xìn xīn",
    "english": "Noun: confidence, faith",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我对这次考试很有信心。",
        "pinyin": "Wǒ duì zhè cì kǎoshì hěn yǒu xìnxīn.",
        "english": "I have a lot of confidence in this exam."
      }
    ]
  },
  {
    "hanzi": "信用卡",
    "pinyin": "xìn yòng kǎ",
    "english": "Noun: credit card",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我想用信用卡付款。",
        "pinyin": "Wǒ xiǎng yòng xìnyòngkǎ fù kuǎn.",
        "english": "I want to pay by credit card."
      }
    ]
  },
  {
    "hanzi": "性格",
    "pinyin": "xìng gé",
    "english": "Noun: nature, temperament, character",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她的性格很好。",
        "pinyin": "Tā de xìnggé hěn hǎo.",
        "english": "Her personality is very good."
      }
    ]
  },
  {
    "hanzi": "呀",
    "pinyin": "ya",
    "english": "Particle: expressing surprise or doubt",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "真的呀?",
        "pinyin": "Zhēn de ya?",
        "english": "Really?"
      }
    ]
  },
  {
    "hanzi": "研究生",
    "pinyin": "yán jiū shēng",
    "english": "Noun: graduate, postgraduate or research student",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我姐姐是一名研究生。",
        "pinyin": "Wǒ jiějie shì yī míng yánjiūshēng.",
        "english": "My older sister is a graduate student."
      }
    ]
  },
  {
    "hanzi": "钥匙",
    "pinyin": "yào shi",
    "english": "Noun: key",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我的钥匙在哪里？",
        "pinyin": "Wǒ de yàoshi zài nǎlǐ?",
        "english": "Where is my key?"
      }
    ]
  },
  {
    "hanzi": "也许",
    "pinyin": "yě xǔ",
    "english": "Adverb: perhaps, maybe",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他也许很忙。",
        "pinyin": "Tā yěxǔ hěn máng.",
        "english": "Maybe he is busy."
      }
    ]
  },
  {
    "hanzi": "叶子",
    "pinyin": "yè zi",
    "english": "Noun: leaf",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "叶子是绿色的。",
        "pinyin": "Yèzi shì lǜsè de.",
        "english": "The leaves are green."
      }
    ]
  },
  {
    "hanzi": "与",
    "pinyin": "yǔ",
    "english": "Conjunction: and, with",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我喜欢咖啡与茶。",
        "pinyin": "Wǒ xǐhuān kāfēi yǔ chá.",
        "english": "I like coffee and tea."
      }
    ]
  },
  {
    "hanzi": "语法",
    "pinyin": "yǔ fǎ",
    "english": "Noun: grammar",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你的语法很好。",
        "pinyin": "Nǐ de yǔfǎ hěn hǎo.",
        "english": "Your grammar is very good."
      }
    ]
  },
  {
    "hanzi": "语言",
    "pinyin": "yǔ yán",
    "english": "Noun: language",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你会说几种语言？",
        "pinyin": "Nǐ huì shuō jǐ zhǒng yǔyán?",
        "english": "How many languages can you speak?"
      }
    ]
  },
  {
    "hanzi": "圆",
    "pinyin": "yuán",
    "english": " Noun: circle Adjective: circular, round",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这张桌子很圆。",
        "pinyin": "Zhè zhāng zhuōzi hěn yuán.",
        "english": "This table is very round."
      }
    ]
  },
  {
    "hanzi": "增长",
    "pinyin": "zēng zhǎng",
    "english": "Noun: increase, growth Verb: to increase, to grow",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们的业务在快速增长。",
        "pinyin": "Wǒmen de yèwù zài kuàisù zēngzhǎng.",
        "english": "Our business is growing rapidly."
      }
    ]
  },
  {
    "hanzi": "窄",
    "pinyin": "zhǎi",
    "english": "Adjective: narrow",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这条路太窄了。",
        "pinyin": "Zhè tiáo lù tài zhǎi le.",
        "english": "This road is too narrow."
      }
    ]
  },
  {
    "hanzi": "正好",
    "pinyin": "zhèng hǎo",
    "english": "Adverb: just right, just at the right time",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你来得正好，我们一起走吧。",
        "pinyin": "Nǐ láide zhènghǎo, wǒmen yìqǐ zǒu ba.",
        "english": "You arrived at just the right time; let's go together."
      }
    ]
  },
  {
    "hanzi": "整齐",
    "pinyin": "zhěng qí",
    "english": "Adjective: neat, tidy, in good order",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他的房间很整齐。",
        "pinyin": "Tā de fángjiān hěn zhěngqí.",
        "english": "His room is very tidy."
      }
    ]
  },
  {
    "hanzi": "正确",
    "pinyin": "zhèng què",
    "english": "Adjective: correct, proper",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你的答案是正确的。",
        "pinyin": "Nǐ de dá'àn shì zhèngquè de.",
        "english": "Your answer is correct."
      }
    ]
  },
  {
    "hanzi": "只",
    "pinyin": "zhī",
    "english": "Measure Word: for birds and animals, a pair of things, parts of the body, etc.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我有一只猫。",
        "pinyin": "Wǒ yǒu yī zhǐ māo.",
        "english": "I have one cat."
      }
    ]
  },
  {
    "hanzi": "质量",
    "pinyin": "zhì liàng",
    "english": "Noun: quality",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个产品的质量非常好。",
        "pinyin": "Zhège chǎnpǐn de zhìliàng fēicháng hǎo.",
        "english": "The quality of this product is very good."
      }
    ]
  },
  {
    "hanzi": "撞",
    "pinyin": "zhuàng",
    "english": "Verb: to hit, to bump against, to collide, to run into",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "小心，别撞到头。",
        "pinyin": "Xiǎoxīn, bié zhuàng dào tóu.",
        "english": "Be careful, don't bump your head."
      }
    ]
  },
  {
    "hanzi": "准确",
    "pinyin": "zhǔn què",
    "english": "Adjective: accurate, precise, exact",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你的答案很准确。",
        "pinyin": "Nǐ de dá'àn hěn zhǔnquè.",
        "english": "Your answer is very accurate."
      }
    ]
  },
  {
    "hanzi": "准时",
    "pinyin": "zhǔn shí",
    "english": "Adjective: on time, punctual",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请准时到达。",
        "pinyin": "Qǐng zhǔn shí dào dá.",
        "english": "Please arrive on time."
      }
    ]
  },
  {
    "hanzi": "组织",
    "pinyin": "zǔ zhī",
    "english": "Noun: organisation Verb: to organize",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这是一个很大的组织。",
        "pinyin": "Zhè shì yīgè hěn dà de zǔzhī.",
        "english": "This is a very large organization."
      }
    ]
  },
  {
    "hanzi": "最后",
    "pinyin": "zuì hòu",
    "english": "Time: finally, at last",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们最后成功了。",
        "pinyin": "Wǒmen zuìhòu chénggōng le.",
        "english": "We finally succeeded."
      }
    ]
  },
  {
    "hanzi": "尊重",
    "pinyin": "zūn zhòng",
    "english": " Noun: respect, esteem Verb: to respect, to honor",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请尊重我的选择。",
        "pinyin": "Qǐng zūnzhòng wǒ de xuǎnzé.",
        "english": "Please respect my choice."
      }
    ]
  },
  {
    "hanzi": "做生意",
    "pinyin": "zuò shēng yi",
    "english": "Verb: to do business",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我的父母在国外做生意。",
        "pinyin": "Wǒ de fùmǔ zài guówài zuò shēngyì.",
        "english": "My parents do business overseas."
      }
    ]
  },
  {
    "hanzi": "安慰",
    "pinyin": "ān wèi",
    "english": " Noun: comfort, consolation Verb: to comfort, to console",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们应该去安慰他。",
        "pinyin": "Wǒmen yīnggāi qù ānwèi tā.",
        "english": "We should go and comfort him."
      }
    ]
  },
  {
    "hanzi": "班主任",
    "pinyin": "bān zhǔ rèn",
    "english": "Noun: teacher in charge of a class",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们的班主任人很好。",
        "pinyin": "Wǒmen de bānzhǔrèn rén hěn hǎo.",
        "english": "Our homeroom teacher is very nice."
      }
    ]
  },
  {
    "hanzi": "报告",
    "pinyin": "bào gào",
    "english": " Noun: report, speech, talk Verb: to report",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请在周五前完成这份报告。",
        "pinyin": "Qǐng zài Zhōuwǔ qián wánchéng zhè fèn bàogào.",
        "english": "Please finish this report before Friday."
      }
    ]
  },
  {
    "hanzi": "保留",
    "pinyin": "bǎo liú",
    "english": "Noun: reservation Verb: to reserve, to hold back",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请保留您的收据。",
        "pinyin": "Qǐng bǎoliú nín de shōujù.",
        "english": "Please keep your receipt."
      }
    ]
  },
  {
    "hanzi": "保险",
    "pinyin": "bǎo xiǎn",
    "english": "Noun: insurance Verb: to insure Adjective: safe, secure",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我买了一份健康保险。",
        "pinyin": "Wǒ mǎi le yī fèn jiànkāng bǎoxiǎn.",
        "english": "I bought a health insurance policy."
      }
    ]
  },
  {
    "hanzi": "背景",
    "pinyin": "bèi jǐng",
    "english": "Noun: background, context",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "故事的背景是上海。",
        "pinyin": "Gùshì de bèijǐng shì Shànghǎi.",
        "english": "The setting (or background) of the story is Shanghai."
      }
    ]
  },
  {
    "hanzi": "被子",
    "pinyin": "bèi zi",
    "english": "Noun: quilt",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这床被子很暖和。",
        "pinyin": "Zhè chuáng bèizi hěn nuǎnhuo.",
        "english": "This quilt is very warm."
      }
    ]
  },
  {
    "hanzi": "本科",
    "pinyin": "běn kē",
    "english": "Noun: Bachelor course",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他明年将完成本科学习。",
        "pinyin": "Tā míngnián jiāng wánchéng běnkē xuéxí.",
        "english": "He will complete his undergraduate studies next year."
      }
    ]
  },
  {
    "hanzi": "本领",
    "pinyin": "běn lǐng",
    "english": "Noun: skill, ability, capability",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他学习了新的本领。",
        "pinyin": "Tā xuéxí le xīn de běnlǐng.",
        "english": "He learned a new skill."
      }
    ]
  },
  {
    "hanzi": "比例",
    "pinyin": "bǐ lì",
    "english": "Noun: proportion, scale",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "男女比例是二比一。",
        "pinyin": "Nán nǚ bǐ lì shì èr bǐ yī.",
        "english": "The ratio of men to women is two to one."
      }
    ]
  },
  {
    "hanzi": "表情",
    "pinyin": "biǎo qíng",
    "english": "Noun: expression",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他脸上露出了惊讶的表情。",
        "pinyin": "Tā liǎn shàng lù chū le jīngyà de biǎoqíng.",
        "english": "A look of surprise appeared on his face."
      }
    ]
  },
  {
    "hanzi": "脖子",
    "pinyin": "bó zi",
    "english": "Noun: neck",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的脖子疼。",
        "pinyin": "Wǒ de bózi téng.",
        "english": "My neck hurts."
      }
    ]
  },
  {
    "hanzi": "布",
    "pinyin": "bù",
    "english": "Noun: cloth",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她买了一块布。",
        "pinyin": "Tā mǎi le yī kuài bù.",
        "english": "She bought a piece of cloth."
      }
    ]
  },
  {
    "hanzi": "不必",
    "pinyin": "bú bì",
    "english": "Verb: does not have to",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你做决定时不必着急。",
        "pinyin": "Nǐ zuò juédìng shí búbì zháojí.",
        "english": "You don't have to rush when making a decision."
      }
    ]
  },
  {
    "hanzi": "不好意思",
    "pinyin": "bù hǎo yì si",
    "english": " Verb: to feel embarrassed Expression: excuse me, sorry",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "不好意思，请问洗手间在哪里？",
        "pinyin": "Bù hǎo yì si, qǐng wèn xǐ shǒu jiān zài nǎ lǐ?",
        "english": "Excuse me, may I ask where the restroom is?"
      }
    ]
  },
  {
    "hanzi": "不免",
    "pinyin": "bù miǎn",
    "english": "Adverb: inevitably",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "一个人在国外生活，不免会想家。",
        "pinyin": "Yī gè rén zài guó wài shēng huó, bù miǎn huì xiǎng jiā.",
        "english": "Living alone abroad, one inevitably misses home."
      }
    ]
  },
  {
    "hanzi": "不然",
    "pinyin": "bù rán",
    "english": "Conjunction: otherwise",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "快点走，不然我们就迟到了。",
        "pinyin": "Kuài diǎn zǒu, bùrán wǒmen jiù chídào le.",
        "english": "Walk faster, otherwise we will be late."
      }
    ]
  },
  {
    "hanzi": "不如",
    "pinyin": "bù rú",
    "english": "Verb: not as good as",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的咖啡不如你的甜。",
        "pinyin": "Wǒ de kāfēi bù rú nǐ de tián.",
        "english": "My coffee is not as sweet as yours."
      }
    ]
  },
  {
    "hanzi": "不要紧",
    "pinyin": "bú yào jǐn",
    "english": "Expression: it doesn't matter, never mind",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "只是小事，不要紧。",
        "pinyin": "Zhǐshì xiǎoshì, bú yào jǐn.",
        "english": "It's just a small matter, it doesn't matter."
      }
    ]
  },
  {
    "hanzi": "步骤",
    "pinyin": "bù zhòu",
    "english": "Noun: step, move, measure",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请仔细阅读操作步骤。",
        "pinyin": "Qǐng zǐxì yuèdú cāozuò bùzhòu.",
        "english": "Please read the operating steps carefully."
      }
    ]
  },
  {
    "hanzi": "不足",
    "pinyin": "bù zú",
    "english": " Noun: shortcomings Adjective: insufficient, not enough",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们应该看到自己的不足。",
        "pinyin": "Wǒmen yīnggāi kàndào zìjǐ de bù zú.",
        "english": "We should recognize our own shortcomings."
      }
    ]
  },
  {
    "hanzi": "踩",
    "pinyin": "cǎi",
    "english": "Verb: to stamp on, to step, to press a pedal",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请不要踩草地。",
        "pinyin": "Qǐng búyào cǎi cǎodì.",
        "english": "Please do not step on the grass."
      }
    ]
  },
  {
    "hanzi": "采访",
    "pinyin": "cǎi fǎng",
    "english": "Verb: to interview, to gather news",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "记者正在采访这位明星。",
        "pinyin": "Jìzhě zhèngzài cǎifǎng zhè wèi míngxīng.",
        "english": "The reporter is interviewing this celebrity."
      }
    ]
  },
  {
    "hanzi": "彩虹",
    "pinyin": "cǎi hóng",
    "english": "Noun: rainbow",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢彩虹的颜色。",
        "pinyin": "Wǒ xǐhuān cǎihóng de yánsè.",
        "english": "I like the colors of the rainbow."
      }
    ]
  },
  {
    "hanzi": "采取",
    "pinyin": "cǎi qǔ",
    "english": "Verb: to carry out, to adopt, to take",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们必须采取行动。",
        "pinyin": "Wǒmen bìxū cǎiqǔ xíngdòng.",
        "english": "We must take action."
      }
    ]
  },
  {
    "hanzi": "残疾",
    "pinyin": "cán jí",
    "english": " Noun: disability, deformity Adjective: disabled, handicapped",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们应该帮助残疾人。",
        "pinyin": "Wǒmen yīnggāi bāngzhù cánjí rén.",
        "english": "We should help disabled people."
      }
    ]
  },
  {
    "hanzi": "册",
    "pinyin": "cè",
    "english": " Noun: book, booklet Measure Word: for books",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这本书是第一册。",
        "pinyin": "Zhè běn shū shì dì yī cè.",
        "english": "This book is the first volume."
      }
    ]
  },
  {
    "hanzi": "叉子",
    "pinyin": "chā zi",
    "english": "Noun: fork",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我需要一个叉子。",
        "pinyin": "Wǒ xūyào yí ge chāzi.",
        "english": "I need a fork."
      }
    ]
  },
  {
    "hanzi": "朝代",
    "pinyin": "cháo dài",
    "english": "Noun: dynasty",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "中国历史上有许多朝代。",
        "pinyin": "Zhōngguó lìshǐ shàng yǒu xǔduō zhāodài.",
        "english": "There were many dynasties in Chinese history."
      }
    ]
  },
  {
    "hanzi": "吵架",
    "pinyin": "chǎo jià",
    "english": "Noun: quarrel Verb: to quarrel",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "不要和朋友吵架。",
        "pinyin": "Búyào hé péngyou chǎojià.",
        "english": "Don't quarrel with friends."
      }
    ]
  },
  {
    "hanzi": "车厢",
    "pinyin": "chē xiāng",
    "english": "Noun: carriage",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "那个车厢里很安静。",
        "pinyin": "Nàgè chēxiāng lǐ hěn ānjìng.",
        "english": "That carriage is very quiet inside."
      }
    ]
  },
  {
    "hanzi": "成分",
    "pinyin": "chéng fèn",
    "english": "Noun: ingredient, component",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个药的主要成分是什么？",
        "pinyin": "Zhège yào de zhǔyào chéngfèn shì shénme?",
        "english": "What are the main ingredients of this medicine?"
      }
    ]
  },
  {
    "hanzi": "成果",
    "pinyin": "chéng guǒ",
    "english": "Noun: result, achievement, gain",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们的努力终于有了成果。",
        "pinyin": "Wǒmen de nǔlì zhōngyú yǒu le chéngguǒ.",
        "english": "Our efforts finally yielded results."
      }
    ]
  },
  {
    "hanzi": "称呼",
    "pinyin": "chēng hu",
    "english": " Noun: name, term of address Verb: to address sb., to call sb. a name",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我该怎么称呼您？",
        "pinyin": "Wǒ gāi zěnme chēnghu nín?",
        "english": "How should I address you?"
      }
    ]
  },
  {
    "hanzi": "成就",
    "pinyin": "chéng jiù",
    "english": "Noun: accomplishment, achievement",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他取得了很大的成就。",
        "pinyin": "Tā qǔ dé le hěn dà de chéng jiù.",
        "english": "He has achieved great accomplishments."
      }
    ]
  },
  {
    "hanzi": "成立",
    "pinyin": "chéng lì",
    "english": "Verb: to establish, to set up, to found",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们想成立一个读书会。",
        "pinyin": "Wǒmen xiǎng chénglì yīgè dúshūhuì.",
        "english": "We want to establish a book club."
      }
    ]
  },
  {
    "hanzi": "承受",
    "pinyin": "chéng shòu",
    "english": "Verb: to bear, to endure, to receive",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他承受了很大的压力。",
        "pinyin": "Tā chéngshòu le hěn dà de yālì.",
        "english": "He bore a lot of pressure."
      }
    ]
  },
  {
    "hanzi": "成语",
    "pinyin": "chéng yǔ",
    "english": "Noun: idiom, proverb",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你最喜欢的成语是什么？",
        "pinyin": "Nǐ zuì xǐhuān de chéngyǔ shì shénme?",
        "english": "What is your favorite idiom?"
      }
    ]
  },
  {
    "hanzi": "成长",
    "pinyin": "chéng zhǎng",
    "english": "Verb: to grow up, to mature",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我希望你能健康快乐地成长。",
        "pinyin": "Wǒ xīwàng nǐ néng jiànkāng kuàilè de chéngzhǎng.",
        "english": "I hope you can grow up healthy and happy."
      }
    ]
  },
  {
    "hanzi": "翅膀",
    "pinyin": "chì bǎng",
    "english": "Noun: wing",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "鸟用翅膀飞翔。",
        "pinyin": "Niǎo yòng chìbǎng fēixiáng.",
        "english": "Birds use wings to fly."
      }
    ]
  },
  {
    "hanzi": "池子",
    "pinyin": "chí zi",
    "english": "Noun: pond",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "池子里的水很清。",
        "pinyin": "Chízi lǐ de shuǐ hěn qīng.",
        "english": "The water in the pond is very clear."
      }
    ]
  },
  {
    "hanzi": "充电器",
    "pinyin": "chōng diàn qì",
    "english": "Noun: battery charger",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你带充电器了吗？",
        "pinyin": "Nǐ dài chōngdiànqì le ma?",
        "english": "Did you bring the charger?"
      }
    ]
  },
  {
    "hanzi": "除",
    "pinyin": "chú",
    "english": " Verb: to divide, to exclude Relative Clause: except for",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "每天除周日外都营业。",
        "pinyin": "Měitiān chú zhōurì wài dōu yíngyè.",
        "english": "It is open every day except Sunday."
      }
    ]
  },
  {
    "hanzi": "初级",
    "pinyin": "chū jí",
    "english": "Adjective: primary, elementary",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她目前在学初级英语。",
        "pinyin": "Tā mùqián zài xué chūjí Yīngyǔ.",
        "english": "She is currently studying elementary English."
      }
    ]
  },
  {
    "hanzi": "除夕",
    "pinyin": "chú xī",
    "english": "Noun: New Year's Eve",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "除夕，我们一家人会吃年夜饭。",
        "pinyin": "Chúxī, wǒmen yījiā rén huì chī niányè fàn.",
        "english": "On New Year's Eve, our whole family eats the reunion dinner."
      }
    ]
  },
  {
    "hanzi": "出席",
    "pinyin": "chū xí",
    "english": "Verb: to attend, to be present",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请准时出席。",
        "pinyin": "Qǐng zhǔnshí chūxí.",
        "english": "Please attend on time."
      }
    ]
  },
  {
    "hanzi": "传播",
    "pinyin": "chuán bō",
    "english": "Verb: to spread, to propagate, to disseminate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "互联网可以快速传播信息。",
        "pinyin": "Hùliánwǎng kěyǐ kuàisù chuánbō xìnxī.",
        "english": "The internet can quickly spread information."
      }
    ]
  },
  {
    "hanzi": "传递",
    "pinyin": "chuán dì",
    "english": "Verb: to pass on to, to transfer",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请传递这份文件。",
        "pinyin": "Qǐng chuán dì zhè fèn wén jiàn.",
        "english": "Please pass on this document."
      }
    ]
  },
  {
    "hanzi": "传染",
    "pinyin": "chuán rǎn",
    "english": "Verb: to infect, to be contagious",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这种感冒很容易传染。",
        "pinyin": "Zhè zhǒng gǎnmào hěn róngyì chuánrǎn.",
        "english": "This type of cold is very easily transmitted."
      }
    ]
  },
  {
    "hanzi": "磁带",
    "pinyin": "cí dài",
    "english": "Noun: magnetic tape",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我还有一些旧磁带。",
        "pinyin": "Wǒ hái yǒu yīxiē jiù cídài.",
        "english": "I still have some old tapes."
      }
    ]
  },
  {
    "hanzi": "从此",
    "pinyin": "cóng cǐ",
    "english": "Conjunction: from now on",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们相遇后，从此在一起了。",
        "pinyin": "Tāmen xiāngyù hòu, cóngcǐ zài yīqǐ le.",
        "english": "After they met, they were together from then on."
      }
    ]
  },
  {
    "hanzi": "匆忙",
    "pinyin": "cōng máng",
    "english": "Adjective: hasty, hurried",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他看起来很匆忙。",
        "pinyin": "Tā kàn qǐlái hěn cōngmáng.",
        "english": "He looks very hurried."
      }
    ]
  },
  {
    "hanzi": "存",
    "pinyin": "cún",
    "english": "Verb: to deposit, to keep",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我把钱存进银行了。",
        "pinyin": "Wǒ bǎ qián cún jìn yínháng le.",
        "english": "I deposited the money into the bank."
      }
    ]
  },
  {
    "hanzi": "措施",
    "pinyin": "cuò shī",
    "english": "Noun: measure, step",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "公司采取了有效的措施。",
        "pinyin": "Gōngsī cǎiqǔle yǒuxiào de cuòshī.",
        "english": "The company adopted effective measures."
      }
    ]
  },
  {
    "hanzi": "打交道",
    "pinyin": "dǎ jiāo dao",
    "english": "Verb: have dealings with",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我不喜欢和陌生人打交道。",
        "pinyin": "Wǒ bù xǐhuān hé mòshēngrén dǎ jiāodào.",
        "english": "I don't like dealing with strangers."
      }
    ]
  },
  {
    "hanzi": "打喷嚏",
    "pinyin": "dǎ pēn tì",
    "english": "Verb: to sneeze",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我感觉快要打喷嚏了。",
        "pinyin": "Wǒ gǎnjué kuàiyào dǎ pēntì le.",
        "english": "I feel like I am about to sneeze."
      }
    ]
  },
  {
    "hanzi": "打听",
    "pinyin": "dǎ ting",
    "english": "Verb: to ask about, to inquire about, to nose into",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我想打听一下这附近有没有超市。",
        "pinyin": "Wǒ xiǎng dǎtīng yīxià zhè fùjìn yǒu méiyǒu chāoshì.",
        "english": "I want to inquire if there is a supermarket nearby."
      }
    ]
  },
  {
    "hanzi": "大象",
    "pinyin": "dà xiàng",
    "english": "Noun: elephant",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "动物园里有大象。",
        "pinyin": "Dòngwùyuán lǐ yǒu dàxiàng.",
        "english": "There are elephants in the zoo."
      }
    ]
  },
  {
    "hanzi": "耽误",
    "pinyin": "dān wu",
    "english": "Verb: to delay",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我不想耽误你的时间。",
        "pinyin": "Wǒ bù xiǎng dānwù nǐ de shíjiān.",
        "english": "I don't want to delay your time."
      }
    ]
  },
  {
    "hanzi": "单元",
    "pinyin": "dān yuán",
    "english": "Noun: unit, cell, entrance number",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们住在这个楼的第三单元。",
        "pinyin": "Wǒmen zhù zài zhège lóu de dì sān dānyuán.",
        "english": "We live in the third unit (entrance) of this building."
      }
    ]
  },
  {
    "hanzi": "当代",
    "pinyin": "dāng dài",
    "english": "Time: present, nowadays",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "当代社会变化很快。",
        "pinyin": "Dāngdài shèhuì biànhuà hěn kuài.",
        "english": "Contemporary society changes very fast."
      }
    ]
  },
  {
    "hanzi": "到达",
    "pinyin": "dào dá",
    "english": "Verb: to arrive, to reach",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你什么时候到达？",
        "pinyin": "Nǐ shénme shíhou dàodá?",
        "english": "When will you arrive?"
      }
    ]
  },
  {
    "hanzi": "道德",
    "pinyin": "dào dé",
    "english": "Noun: morality, ethics",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "诚实是一种基本道德。",
        "pinyin": "Chéngshí shì yī zhǒng jīběn dàodé.",
        "english": "Honesty is a basic moral standard."
      }
    ]
  },
  {
    "hanzi": "道理",
    "pinyin": "dào lǐ",
    "english": "Noun: principle, reason, argument",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这句话很有道理。",
        "pinyin": "Zhè jù huà hěn yǒu dàoli.",
        "english": "This statement is very reasonable."
      }
    ]
  },
  {
    "hanzi": "导演",
    "pinyin": "dǎo yǎn",
    "english": " Noun: director film, etc. Verb: to direct",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "那位导演拍了很多好电影。",
        "pinyin": "Nà wèi dǎoyǎn pāi le hěn duō hǎo diànyǐng.",
        "english": "That director has made many good films."
      }
    ]
  },
  {
    "hanzi": "等候",
    "pinyin": "děng hòu",
    "english": "Verb: to wait",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请在这里等候经理。",
        "pinyin": "Qǐng zài zhèlǐ děnghòu jīnglǐ.",
        "english": "Please wait here for the manager."
      }
    ]
  },
  {
    "hanzi": "等于",
    "pinyin": "děng yú",
    "english": "Verb: to equal, to amount to",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "二加二等于四。",
        "pinyin": "Èr jiā èr dĕngyú sì.",
        "english": "Two plus two equals four."
      }
    ]
  },
  {
    "hanzi": "地区",
    "pinyin": "dì qū",
    "english": "Noun: region, district, area",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一个多山的地区。",
        "pinyin": "Zhè shì yīgè duō shān de dìqū.",
        "english": "This is a mountainous region."
      }
    ]
  },
  {
    "hanzi": "地毯",
    "pinyin": "dì tǎn",
    "english": "Noun: carpet",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "地毯很软。",
        "pinyin": "Dìtǎn hěn ruǎn.",
        "english": "The carpet is very soft."
      }
    ]
  },
  {
    "hanzi": "地震",
    "pinyin": "dì zhèn",
    "english": "Noun: earthquake",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "日本经常有地震。",
        "pinyin": "Rìběn jīngcháng yǒu dìzhèn.",
        "english": "Japan often has earthquakes."
      }
    ]
  },
  {
    "hanzi": "点头",
    "pinyin": "diǎn tóu",
    "english": "Verb: to nod",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他点点头表示同意。",
        "pinyin": "Tā diǎn diǎntóu biǎoshì tóngyì.",
        "english": "He nodded to show agreement."
      }
    ]
  },
  {
    "hanzi": "冻",
    "pinyin": "dòng",
    "english": " Noun: jelly Verb: to freeze, to feel very cold",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我快冻死了！",
        "pinyin": "Wǒ kuài dòng sǐ le!",
        "english": "I'm freezing to death!"
      }
    ]
  },
  {
    "hanzi": "洞",
    "pinyin": "dòng",
    "english": "Noun: cave, hole",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "墙上有一个洞。",
        "pinyin": "Qiáng shang yǒu yīgè dòng.",
        "english": "There is a hole in the wall."
      }
    ]
  },
  {
    "hanzi": "动画片",
    "pinyin": "dòng huà piàn",
    "english": "Noun: cartoon, animation",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢看动画片。",
        "pinyin": "Wǒ xǐhuān kàn dònghuàpiàn.",
        "english": "I like watching cartoons."
      }
    ]
  },
  {
    "hanzi": "堆",
    "pinyin": "duī",
    "english": " Noun: pile, stack, heap Measure Word: for piles of things",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "桌子上有一堆书。",
        "pinyin": "Zhuōzi shang yǒu yī duī shū.",
        "english": "There is a pile of books on the table."
      }
    ]
  },
  {
    "hanzi": "对方",
    "pinyin": "duì fāng",
    "english": "Noun: counterpart, the other side",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你应该考虑一下对方的感受。",
        "pinyin": "Nǐ yīnggāi kǎolǜ yīxià duìfāng de gǎnshòu.",
        "english": "You should consider the feelings of the other party."
      }
    ]
  },
  {
    "hanzi": "对手",
    "pinyin": "duì shǒu",
    "english": "Noun: opponent, rival",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他是一个很强的对手。",
        "pinyin": "Tā shì yīgè hěn qiáng de duìshǒu.",
        "english": "He is a very strong opponent."
      }
    ]
  },
  {
    "hanzi": "发表",
    "pinyin": "fā biǎo",
    "english": "Verb: to issue, to publish",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "比赛结果什么时候发表？",
        "pinyin": "Bǐsài jiéguǒ shénme shíhou fābiǎo?",
        "english": "When will the competition results be published?"
      }
    ]
  },
  {
    "hanzi": "发愁",
    "pinyin": "fā chóu",
    "english": "Verb: to worry, to be anxious",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "不要为这点小事发愁。",
        "pinyin": "Bú yào wèi zhè diǎn xiǎoshì fāchóu.",
        "english": "Don't worry about this little thing."
      }
    ]
  },
  {
    "hanzi": "发抖",
    "pinyin": "fā dǒu",
    "english": "Verb: to shiver, to shudder, to tremble",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的手冷得发抖。",
        "pinyin": "Tā de shǒu lěng de fādǒu.",
        "english": "His hands were trembling from the cold."
      }
    ]
  },
  {
    "hanzi": "发明",
    "pinyin": "fā míng",
    "english": "Noun: invention Verb: to invent",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一个伟大的发明。",
        "pinyin": "Zhè shì yīgè wěidà de fāmíng.",
        "english": "This is a great invention."
      }
    ]
  },
  {
    "hanzi": "发票",
    "pinyin": "fā piào",
    "english": "Noun: invoice, receipt",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请给我一张发票。",
        "pinyin": "Qǐng gěi wǒ yī zhāng fāpiào.",
        "english": "Please give me an invoice."
      }
    ]
  },
  {
    "hanzi": "发言",
    "pinyin": "fā yán",
    "english": " Noun: statement Verb: to speak, to make a speech",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "大家都可以在会议上发言。",
        "pinyin": "Dàjiā dōu kěyǐ zài huìyì shang fāyán.",
        "english": "Everyone can speak at the meeting."
      }
    ]
  },
  {
    "hanzi": "法院",
    "pinyin": "fǎ yuàn",
    "english": "Noun: court of law, court",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们去了法院。",
        "pinyin": "Tāmen qùle fǎyuàn.",
        "english": "They went to the court."
      }
    ]
  },
  {
    "hanzi": "反而",
    "pinyin": "fǎn ér",
    "english": "Adverb: instead, on the contrary",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他没有感谢我，反而批评了我。",
        "pinyin": "Tā méiyǒu gǎnxiè wǒ, fǎn'ér pīpíngle wǒ.",
        "english": "He didn't thank me; instead, he criticized me."
      }
    ]
  },
  {
    "hanzi": "反复",
    "pinyin": "fǎn fù",
    "english": "Adverb: repeatedly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我反复听这首歌。",
        "pinyin": "Wǒ fǎnfù tīng zhè shǒu gē.",
        "english": "I listened to this song repeatedly."
      }
    ]
  },
  {
    "hanzi": "凡是",
    "pinyin": "fán shì",
    "english": "Adverb: every, any, all",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "凡是新的东西，我都很感兴趣。",
        "pinyin": "Fán shì xīn de dōngxi, wǒ dōu hěn gǎn xìngqù.",
        "english": "I am interested in anything new."
      }
    ]
  },
  {
    "hanzi": "房东",
    "pinyin": "fáng dōng",
    "english": "Noun: landlord",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的房东人很好。",
        "pinyin": "Wǒ de fángdōng rén hěn hǎo.",
        "english": "My landlord is very nice."
      }
    ]
  },
  {
    "hanzi": "肺",
    "pinyin": "fèi",
    "english": "Noun: lung",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "吸烟对肺不好。",
        "pinyin": "Xīyān duì fèi bù hǎo.",
        "english": "Smoking is bad for the lungs."
      }
    ]
  },
  {
    "hanzi": "愤怒",
    "pinyin": "fèn nù",
    "english": "Adjective: angry",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "听到这个消息，他感到很愤怒。",
        "pinyin": "Tīng dào zhè ge xiāoxi, tā gǎndào hěn fènnù.",
        "english": "Hearing this news, he felt very angry."
      }
    ]
  },
  {
    "hanzi": "风格",
    "pinyin": "fēng gé",
    "english": "Noun: style",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她的穿衣风格很独特。",
        "pinyin": "Tā de chuānyī fēnggé hěn dútè.",
        "english": "Her clothing style is very unique."
      }
    ]
  },
  {
    "hanzi": "否认",
    "pinyin": "fǒu rèn",
    "english": "Verb: to deny",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他否认了指控。",
        "pinyin": "Tā fǒurènle zhǐkòng.",
        "english": "He denied the accusation."
      }
    ]
  },
  {
    "hanzi": "幅",
    "pinyin": "fú",
    "english": "Measure Word: for pictures, paintings, textiles, etc.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他买了一幅画。",
        "pinyin": "Tā mǎi le yì fú huà.",
        "english": "He bought a painting."
      }
    ]
  },
  {
    "hanzi": "扶",
    "pinyin": "fú",
    "english": "Verb: to help sb. up",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请扶我起来。",
        "pinyin": "Qǐng fú wǒ qǐlái.",
        "english": "Please help me up."
      }
    ]
  },
  {
    "hanzi": "改正",
    "pinyin": "gǎi zhèng",
    "english": " Noun: correction Verb: to correct, to amend",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "老师要求他改正错误。",
        "pinyin": "Lǎoshī yāoqiú tā gǎizhèng cuòwù.",
        "english": "The teacher asked him to correct his mistake."
      }
    ]
  },
  {
    "hanzi": "干活儿",
    "pinyin": "gàn huó r",
    "english": "Verb: to work often hard, manual work",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们下午要去工地干活儿。",
        "pinyin": "Wǒmen xiàwǔ yào qù gōngdì gàn huór.",
        "english": "We have to go to the construction site to work this afternoon."
      }
    ]
  },
  {
    "hanzi": "赶紧",
    "pinyin": "gǎn jǐn",
    "english": "Adverb: at once, losing no time",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们迟到了，赶紧走吧。",
        "pinyin": "Wǒmen chídào le, gǎnjǐn zǒu ba.",
        "english": "We are late, hurry up and go."
      }
    ]
  },
  {
    "hanzi": "赶快",
    "pinyin": "gǎn kuài",
    "english": "Adverb: at once, immediately",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "下雨了，赶快回家。",
        "pinyin": "Xià yǔ le, gǎnkuài huí jiā.",
        "english": "It's raining, hurry home."
      }
    ]
  },
  {
    "hanzi": "革命",
    "pinyin": "gé mìng",
    "english": "Noun: revolution",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "工业革命彻底改变了人类生活。",
        "pinyin": "Gōngyè gémìng chèdǐ gǎibiànle rénlèi shēnghuó.",
        "english": "The Industrial Revolution fundamentally changed human life."
      }
    ]
  },
  {
    "hanzi": "格外",
    "pinyin": "gé wài",
    "english": "Adverb: especially, particularly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她今天显得格外开心。",
        "pinyin": "Tā jīntiān xiǎnde géwài kāixīn.",
        "english": "She looks particularly happy today."
      }
    ]
  },
  {
    "hanzi": "各自",
    "pinyin": "gè zì",
    "english": "Adverb: each, respective",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "会议结束后，大家各自离开了。",
        "pinyin": "Huìyì jiéshù hòu, dàjiā gèzì líkāile.",
        "english": "After the meeting ended, everyone left separately."
      }
    ]
  },
  {
    "hanzi": "鸽子",
    "pinyin": "gē zi",
    "english": "Noun: pigeon",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "鸽子喜欢吃米。",
        "pinyin": "Gēzi xǐhuan chī mǐ.",
        "english": "Pigeons like to eat rice."
      }
    ]
  },
  {
    "hanzi": "更加",
    "pinyin": "gèng jiā",
    "english": "Adverb: more, even more",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "看到她的成功，我更加努力了。",
        "pinyin": "Kàndào tā de chénggōng, wǒ gèngjiā nǔlì le.",
        "english": "Seeing her success, I worked even harder."
      }
    ]
  },
  {
    "hanzi": "公布",
    "pinyin": "gōng bù",
    "english": "Verb: to announce, to make public",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "公司公布了新计划。",
        "pinyin": "Gōngsī gōngbùle xīn jìhuà.",
        "english": "The company announced the new plan."
      }
    ]
  },
  {
    "hanzi": "工厂",
    "pinyin": "gōng chǎng",
    "english": "Noun: factory",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这家工厂生产汽车。",
        "pinyin": "Zhè jiā gōngchǎng shēngchǎn qìchē.",
        "english": "This factory produces cars."
      }
    ]
  },
  {
    "hanzi": "工程师",
    "pinyin": "gōng chéng shī",
    "english": "Noun: engineer",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我想成为一名工程师。",
        "pinyin": "Wǒ xiǎng chéngwéi yī míng gōngchéngshī.",
        "english": "I want to become an engineer."
      }
    ]
  },
  {
    "hanzi": "工人",
    "pinyin": "gōng rén",
    "english": "Noun: worker",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "工人们正在工作。",
        "pinyin": "Gōngrénmen zhèngzài gōngzuò.",
        "english": "The workers are currently working."
      }
    ]
  },
  {
    "hanzi": "工业",
    "pinyin": "gōng yè",
    "english": "Noun: industry",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这里的工业发展很快。",
        "pinyin": "Zhèlǐ de gōngyè fāzhǎn hěn kuài.",
        "english": "The industry here is developing rapidly."
      }
    ]
  },
  {
    "hanzi": "公元",
    "pinyin": "gōng yuán",
    "english": "Noun: Christian era",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "公元2008年，北京举办了奥运会。",
        "pinyin": "Gōngyuán èr líng líng bā nián, Běijīng jǔbàn le Àoyùnhuì.",
        "english": "In 2008 AD, Beijing hosted the Olympic Games."
      }
    ]
  },
  {
    "hanzi": "公主",
    "pinyin": "gōng zhǔ",
    "english": "Noun: princess",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这位公主很漂亮。",
        "pinyin": "Zhè wèi gōngzhǔ hěn piàoliang.",
        "english": "This princess is very beautiful."
      }
    ]
  },
  {
    "hanzi": "古典",
    "pinyin": "gǔ diǎn",
    "english": "Adjective: classical",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢古典音乐。",
        "pinyin": "Wǒ xǐhuan gǔdiǎn yīnyuè.",
        "english": "I like classical music."
      }
    ]
  },
  {
    "hanzi": "挂号",
    "pinyin": "guà hào",
    "english": "Verb: to register",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "看病前，你必须先挂号。",
        "pinyin": "Kànbìng qián, nǐ bìxū xiān guà hào.",
        "english": "Before seeing the doctor, you must register first."
      }
    ]
  },
  {
    "hanzi": "乖",
    "pinyin": "guāi",
    "english": "Adjective: obedient, well-behaved, clever, good",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你真是个乖孩子。",
        "pinyin": "Nǐ zhēnshi gè guāi háizi.",
        "english": "You are truly a good/well-behaved child."
      }
    ]
  },
  {
    "hanzi": "怪不得",
    "pinyin": "guài bu de",
    "english": "Conjunction: no wonder so that is why",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你生病了？怪不得你没来上课。",
        "pinyin": "Nǐ shēngbìngle? Guàibude nǐ méi lái shàngkè.",
        "english": "You are sick? No wonder you didn't come to class."
      }
    ]
  },
  {
    "hanzi": "拐弯",
    "pinyin": "guǎi wān",
    "english": "Verb: to turn a corner, to change direction",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "前面路口请向右拐弯。",
        "pinyin": "Qiánmiàn lùkǒu qǐng xiàng yòu guǎiwān.",
        "english": "Please turn right at the next intersection."
      }
    ]
  },
  {
    "hanzi": "关怀",
    "pinyin": "guān huái",
    "english": " Noun: care, solicitude Verb: to care for, to show solicitude for",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们应该多给老人一些关怀。",
        "pinyin": "Wǒmen yīnggāi duō gěi lǎorén yīxiē guānhuái.",
        "english": "We should give the elderly more care."
      }
    ]
  },
  {
    "hanzi": "冠军",
    "pinyin": "guàn jūn",
    "english": "Noun: champion",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他获得了比赛的冠军。",
        "pinyin": "Tā huòdéle bǐsài de guànjūn.",
        "english": "He won the championship of the competition."
      }
    ]
  },
  {
    "hanzi": "观念",
    "pinyin": "guān niàn",
    "english": "Noun: concept, idea, thought",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的观念很传统。",
        "pinyin": "Tā de guānniàn hěn chuántǒng.",
        "english": "His ideas are very traditional."
      }
    ]
  },
  {
    "hanzi": "罐头",
    "pinyin": "guàn tou",
    "english": "Noun: tin, can",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢吃鱼罐头。",
        "pinyin": "Wǒ xǐhuān chī yú guàntou.",
        "english": "I like eating canned fish."
      }
    ]
  },
  {
    "hanzi": "广场",
    "pinyin": "guǎng chǎng",
    "english": "Noun: public square",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们正在广场上跳舞。",
        "pinyin": "Tāmen zhèngzài guǎngchǎng shang tiàowǔ.",
        "english": "They are dancing in the public square."
      }
    ]
  },
  {
    "hanzi": "广大",
    "pinyin": "guǎng dà",
    "english": "Adjective: vast, extensive, widespread",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们得到了广大群众的支持。",
        "pinyin": "Wǒmen dédào le guǎngdà qúnzhòng de zhīchí.",
        "english": "We received the support of the broad masses of people."
      }
    ]
  },
  {
    "hanzi": "广泛",
    "pinyin": "guǎng fàn",
    "english": "Adjective: extensive, wide ranging",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个问题引起了广泛的讨论。",
        "pinyin": "Zhè ge wèntí yǐnqǐle guǎngfàn de tǎolùn.",
        "english": "This issue sparked widespread discussion."
      }
    ]
  },
  {
    "hanzi": "光滑",
    "pinyin": "guāng huá",
    "english": "Adjective: smooth, sleek, glossy",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这张桌子很光滑。",
        "pinyin": "Zhè zhāng zhuōzi hěn guānghuá.",
        "english": "This table is very smooth."
      }
    ]
  },
  {
    "hanzi": "光临",
    "pinyin": "guāng lín",
    "english": "Verb: to visit as honorable guest",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "欢迎各位贵宾光临指导。",
        "pinyin": "Huānyíng gèwèi guìbīn guānglín zhǐdǎo.",
        "english": "We welcome all distinguished guests to visit and give guidance."
      }
    ]
  },
  {
    "hanzi": "规则",
    "pinyin": "guī zé",
    "english": "Noun: rule, regulation",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们必须遵守规则。",
        "pinyin": "Wǒmen bìxū zūnshǒu guīzé.",
        "english": "We must abide by the rules."
      }
    ]
  },
  {
    "hanzi": "过敏",
    "pinyin": "guò mǐn",
    "english": "Noun: allergy Verb: to be allergic",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我对花粉过敏。",
        "pinyin": "Wǒ duì huāfěn guòmǐn.",
        "english": "I am allergic to pollen."
      }
    ]
  },
  {
    "hanzi": "过期",
    "pinyin": "guò qī",
    "english": "Verb: to expire, to exceed the time limit",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这牛奶过期了，不能喝。",
        "pinyin": "Zhè niúnǎi guòqī le, bù néng hē.",
        "english": "This milk has expired, so you cannot drink it."
      }
    ]
  },
  {
    "hanzi": "果实",
    "pinyin": "guǒ shí",
    "english": "Noun: fruits, gains",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "努力工作后，我们终于看到了果实。",
        "pinyin": "Nǔlì gōngzuò hòu, wǒmen zhōngyú kàndào le guǒshí.",
        "english": "After working hard, we finally saw the fruits (of our labor)."
      }
    ]
  },
  {
    "hanzi": "海关",
    "pinyin": "hǎi guān",
    "english": "Noun: customs",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我要过海关。",
        "pinyin": "Wǒ yào guò hǎi guān.",
        "english": "I need to go through customs."
      }
    ]
  },
  {
    "hanzi": "何况",
    "pinyin": "hé kuàng",
    "english": "Relative Clause: let alone",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我连午饭都没吃，何况请客吃饭。",
        "pinyin": "Wǒ lián wǔfàn dōu méi chī, hékuàng qǐngkè chīfàn.",
        "english": "I haven't even eaten lunch, let alone treat others to dinner."
      }
    ]
  },
  {
    "hanzi": "横",
    "pinyin": "héng",
    "english": "Adjective: horizontal, across",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这条路是横的。",
        "pinyin": "Zhè tiáo lù shì héng de.",
        "english": "This road is horizontal."
      }
    ]
  },
  {
    "hanzi": "忽视",
    "pinyin": "hū shì",
    "english": "Verb: to neglect, to ignore, to overlook",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "忙碌时，不要忽视健康。",
        "pinyin": "Mánglù shí, bù yào hūshì jiànkāng.",
        "english": "When busy, don't neglect your health."
      }
    ]
  },
  {
    "hanzi": "呼吸",
    "pinyin": "hū xī",
    "english": "Verb: to breathe",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "人需要空气来呼吸。",
        "pinyin": "Rén xūyào kōngqì lái hūxī.",
        "english": "People need air to breathe."
      }
    ]
  },
  {
    "hanzi": "胡须",
    "pinyin": "hú xū",
    "english": "Noun: beard",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的胡须很长。",
        "pinyin": "Tā de húxū hěn cháng.",
        "english": "His beard is very long."
      }
    ]
  },
  {
    "hanzi": "花生",
    "pinyin": "huā shēng",
    "english": "Noun: peanut",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢吃花生。",
        "pinyin": "Wǒ xǐhuān chī huāshēng.",
        "english": "I like eating peanuts."
      }
    ]
  },
  {
    "hanzi": "华裔",
    "pinyin": "huá yì",
    "english": "Noun: ethnic Chinese but non-Chinese citizen",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他是一个美国华裔。",
        "pinyin": "Tā shì yīgè Měiguó huáyì.",
        "english": "He is a Chinese American."
      }
    ]
  },
  {
    "hanzi": "幻想",
    "pinyin": "huàn xiǎng",
    "english": " Noun: illusion, fantasy  Verb: to dream",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "别再幻想了，面对现实吧。",
        "pinyin": "Bié zài huànxiǎng le, miànduì xiànshí ba.",
        "english": "Stop fantasizing and face reality."
      }
    ]
  },
  {
    "hanzi": "黄瓜",
    "pinyin": "huáng guā",
    "english": "Noun: cucumber",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢吃黄瓜沙拉。",
        "pinyin": "Wǒ xǐhuān chī huángguā shālā.",
        "english": "I like to eat cucumber salad."
      }
    ]
  },
  {
    "hanzi": "皇后",
    "pinyin": "huáng hòu",
    "english": "Noun: empress",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这位皇后很善良。",
        "pinyin": "Zhè wèi huánghòu hěn shànliáng.",
        "english": "This empress is very kind."
      }
    ]
  },
  {
    "hanzi": "灰尘",
    "pinyin": "huī chén",
    "english": "Noun: dust",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "桌子上有一层灰尘。",
        "pinyin": "Zhuōzi shang yǒu yī céng huīchén.",
        "english": "There is a layer of dust on the table."
      }
    ]
  },
  {
    "hanzi": "婚姻",
    "pinyin": "hūn yīn",
    "english": "Noun: wedding, marriage",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们的婚姻很幸福。",
        "pinyin": "Tāmen de hūnyīn hěn xìngfú.",
        "english": "Their marriage is very happy."
      }
    ]
  },
  {
    "hanzi": "活跃",
    "pinyin": "huó yuè",
    "english": "Adjective: active, vigorous",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "教室气氛很活跃。",
        "pinyin": "Jiàoshì qìfēn hěn huóyuè.",
        "english": "The classroom atmosphere is very active."
      }
    ]
  },
  {
    "hanzi": "及格",
    "pinyin": "jí gé",
    "english": "Verb: to pass a test",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他考试及格了。",
        "pinyin": "Tā kǎoshì jí gé le.",
        "english": "He passed the exam."
      }
    ]
  },
  {
    "hanzi": "系领带",
    "pinyin": "jì lǐng dài",
    "english": "Verb: to tie one's necktie",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他正在系领带。",
        "pinyin": "Tā zhèngzài xì lǐngdài.",
        "english": "He is tying his necktie."
      }
    ]
  },
  {
    "hanzi": "纪录",
    "pinyin": "jì lù",
    "english": "Noun: record",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他打破了世界纪录。",
        "pinyin": "Tā dǎpò le shìjiè jìlù.",
        "english": "He broke the world record."
      }
    ]
  },
  {
    "hanzi": "寂寞",
    "pinyin": "jì mò",
    "english": "Adjective: lonely",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他一个人住，有点寂寞。",
        "pinyin": "Tā yīgè rén zhù, yǒudiǎn jìmò.",
        "english": "He lives alone, so he feels a little lonely."
      }
    ]
  },
  {
    "hanzi": "记忆",
    "pinyin": "jì yì",
    "english": "Noun: memory Verb: to remember",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一段美好的记忆。",
        "pinyin": "Zhè shì yī duàn měihǎo de jìyì.",
        "english": "This is a beautiful memory."
      }
    ]
  },
  {
    "hanzi": "家乡",
    "pinyin": "jiā xiāng",
    "english": "Noun: hometown, native place",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的家乡很美。",
        "pinyin": "Wǒ de jiāxiāng hěn měi.",
        "english": "My hometown is very beautiful."
      }
    ]
  },
  {
    "hanzi": "假装",
    "pinyin": "jiǎ zhuāng",
    "english": "Verb: to pretend",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "孩子们喜欢假装自己是超级英雄。",
        "pinyin": "Háizimen xǐhuān jiǎzhuāng zìjǐ shì chāojí yīngxióng.",
        "english": "Children like to pretend they are superheroes."
      }
    ]
  },
  {
    "hanzi": "夹子",
    "pinyin": "jiā zi",
    "english": "Noun: clip, clamp, tongs",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "纸张太多了，需要一个夹子。",
        "pinyin": "Zhǐzhāng tài duōle, xūyào yīgè jiāzi.",
        "english": "There are too many papers; I need a clip."
      }
    ]
  },
  {
    "hanzi": "捡",
    "pinyin": "jiǎn",
    "english": "Verb: to pick up, to gather",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他捡起了一支笔。",
        "pinyin": "Tā jiǎn qǐle yī zhī bǐ.",
        "english": "He picked up a pen."
      }
    ]
  },
  {
    "hanzi": "煎",
    "pinyin": "jiān",
    "english": "Verb: to pan fry",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我想煎一个鸡蛋。",
        "pinyin": "Wǒ xiǎng jiān yí ge jīdàn.",
        "english": "I want to pan-fry an egg."
      }
    ]
  },
  {
    "hanzi": "肩膀",
    "pinyin": "jiān bǎng",
    "english": "Noun: shoulder",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的肩膀疼。",
        "pinyin": "Wǒ de jiānbǎng téng.",
        "english": "My shoulder hurts."
      }
    ]
  },
  {
    "hanzi": "剪刀",
    "pinyin": "jiǎn dāo",
    "english": "Noun: scissors",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "剪刀在哪儿？",
        "pinyin": "Jiǎndāo zài nǎr?",
        "english": "Where are the scissors?"
      }
    ]
  },
  {
    "hanzi": "坚决",
    "pinyin": "jiān jué",
    "english": "Adjective: resolute, determined",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的态度很坚决。",
        "pinyin": "Tā de tài dù hěn jiān jué.",
        "english": "His attitude is very resolute."
      }
    ]
  },
  {
    "hanzi": "坚强",
    "pinyin": "jiān qiáng",
    "english": "Adjective: strong",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她是一个非常坚强的人。",
        "pinyin": "Tā shì yīgè fēicháng jiānqiáng de rén.",
        "english": "She is a very strong person."
      }
    ]
  },
  {
    "hanzi": "尖锐",
    "pinyin": "jiān ruì",
    "english": "Adjective: sharp, acute illness",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他提出了一个尖锐的问题。",
        "pinyin": "Tā tíchūle yīgè jiānruì de wèntí.",
        "english": "He raised a pointed question."
      }
    ]
  },
  {
    "hanzi": "健身房",
    "pinyin": "jiàn shēn fáng",
    "english": "Noun: gym, gymnasium",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "下班后，他常去健身房。",
        "pinyin": "Xià bān hòu, tā cháng qù jiànshēnfáng.",
        "english": "After work, he often goes to the gym."
      }
    ]
  },
  {
    "hanzi": "建筑",
    "pinyin": "jiàn zhù",
    "english": " Noun: building, architecture Verb: to build, to construct",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一座古老的建筑。",
        "pinyin": "Zhè shì yī zuò gǔlǎo de jiànzhù.",
        "english": "This is an ancient building."
      }
    ]
  },
  {
    "hanzi": "降落",
    "pinyin": "jiàng luò",
    "english": "Verb: to descend, to land",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "飞机正在降落。",
        "pinyin": "Fēijī zhèngzài jiàngluò.",
        "english": "The airplane is landing now."
      }
    ]
  },
  {
    "hanzi": "浇",
    "pinyin": "jiāo",
    "english": "Verb: to water, to pour, to sprinkle",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我去给花浇水。",
        "pinyin": "Wǒ qù gěi huā jiāo shuǐ.",
        "english": "I am going to water the flowers."
      }
    ]
  },
  {
    "hanzi": "狡猾",
    "pinyin": "jiǎo huá",
    "english": "Adjective: sly, cunning, tricky",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "别相信他，他很狡猾。",
        "pinyin": "Bié xiāngxìn tā, tā hěn jiǎohuá.",
        "english": "Don't trust him, he is very cunning."
      }
    ]
  },
  {
    "hanzi": "教练",
    "pinyin": "jiào liàn",
    "english": "Noun: sports coach, instructor",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们的教练很严格。",
        "pinyin": "Wǒmen de jiàoliàn hěn yángé.",
        "english": "Our coach is very strict."
      }
    ]
  },
  {
    "hanzi": "胶水",
    "pinyin": "jiāo shuǐ",
    "english": "Noun: glue",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请给我一点胶水。",
        "pinyin": "Qǐng gěi wǒ yī diǎn jiāoshuǐ.",
        "english": "Please give me a little glue."
      }
    ]
  },
  {
    "hanzi": "教训",
    "pinyin": "jiào xùn",
    "english": "Noun: lesson Verb: to teach sb. a lesson",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们应该吸取这次的教训。",
        "pinyin": "Wǒmen yīnggāi xīqǔ zhè cì de jiàoxun.",
        "english": "We should learn from this lesson."
      }
    ]
  },
  {
    "hanzi": "解放",
    "pinyin": "jiě fàng",
    "english": " Noun: liberation Verb: to liberate, to emancipate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们要解放思想。",
        "pinyin": "Wǒmen yào jiěfàng sīxiǎng.",
        "english": "We must emancipate our minds."
      }
    ]
  },
  {
    "hanzi": "解说员",
    "pinyin": "jiě shuō yuán",
    "english": "Noun: commentator",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我想当一名解说员。",
        "pinyin": "Wǒ xiǎng dāng yī míng jiěshuōyuán.",
        "english": "I want to become a commentator."
      }
    ]
  },
  {
    "hanzi": "戒烟",
    "pinyin": "jiè yān",
    "english": "Verb: to give up smoking",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他决定从下个月开始戒烟。",
        "pinyin": "Tā juédìng cóng xià ge yuè kāishǐ jiè yān.",
        "english": "He decided to start quitting smoking next month."
      }
    ]
  },
  {
    "hanzi": "结账",
    "pinyin": "jié zhàng",
    "english": "Verb: to pay the bill",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "服务员，请结账。",
        "pinyin": "Fúwùyuán, qǐng jiézhàng.",
        "english": "Waiter, please bring the bill."
      }
    ]
  },
  {
    "hanzi": "紧急",
    "pinyin": "jǐn jí",
    "english": "Adjective: urgent, pressing",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请走紧急出口。",
        "pinyin": "Qǐng zǒu jǐnjí chūkǒu.",
        "english": "Please use the emergency exit."
      }
    ]
  },
  {
    "hanzi": "谨慎",
    "pinyin": "jǐn shèn",
    "english": "Adjective: cautious, prudent",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他做决定时很谨慎。",
        "pinyin": "Tā zuò juédìng shí hěn jǐnshèn.",
        "english": "He is very cautious when making decisions."
      }
    ]
  },
  {
    "hanzi": "救护车",
    "pinyin": "jiù hù chē",
    "english": "Noun: ambulance",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "救护车来了。",
        "pinyin": "Jiùhùchē lái le.",
        "english": "The ambulance has arrived."
      }
    ]
  },
  {
    "hanzi": "举",
    "pinyin": "jǔ",
    "english": "Verb: to raise, to hold up, to elect",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "有问题请举手。",
        "pinyin": "Yǒu wèntí qǐng jǔ shǒu.",
        "english": "If you have a question, please raise your hand."
      }
    ]
  },
  {
    "hanzi": "决心",
    "pinyin": "jué xīn",
    "english": " Noun: determination, resolution Verb: to make up one's mind",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他有很大的决心要学好中文。",
        "pinyin": "Tā yǒu hěn dà de juéxīn yào xuéhǎo Zhōngwén.",
        "english": "He has great determination to learn Chinese well."
      }
    ]
  },
  {
    "hanzi": "军事",
    "pinyin": "jūn shì",
    "english": "Noun: military affairs",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一个军事基地。",
        "pinyin": "Zhè shì yīgè jūnshì jīdì.",
        "english": "This is a military base."
      }
    ]
  },
  {
    "hanzi": "均匀",
    "pinyin": "jūn yún",
    "english": "Adjective: even, homogeneous",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请把颜料涂抹均匀。",
        "pinyin": "Qǐng bǎ yánliào túmǒ jūnyún.",
        "english": "Please apply the paint evenly."
      }
    ]
  },
  {
    "hanzi": "看来",
    "pinyin": "kàn lái",
    "english": "Conjunction: it seems, it appears",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "看来我们得重新计划了。",
        "pinyin": "Kànlái wǒmen děi chóngxīn jìhuà le.",
        "english": "It seems we have to reschedule (plan again)."
      }
    ]
  },
  {
    "hanzi": "恐怖",
    "pinyin": "kǒng bù",
    "english": "Adjective: terrble, fearful, frightening",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "那部电影很恐怖。",
        "pinyin": "Nà bù diànyǐng hěn kǒngbù.",
        "english": "That movie is very frightening."
      }
    ]
  },
  {
    "hanzi": "辣椒",
    "pinyin": "là jiāo",
    "english": "Noun: hot pepper, chili",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢吃辣椒。",
        "pinyin": "Wǒ xǐhuān chī làjiāo.",
        "english": "I like eating chili peppers."
      }
    ]
  },
  {
    "hanzi": "蜡烛",
    "pinyin": "là zhú",
    "english": "Noun: candle",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "停电了，我们点了蜡烛。",
        "pinyin": "Tíngdiànle, wǒmen diǎnle làzhú.",
        "english": "The power went out, so we lit a candle."
      }
    ]
  },
  {
    "hanzi": "粒",
    "pinyin": "lì",
    "english": "Noun: grain Measure Word: for small roung things",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我吃了两粒药。",
        "pinyin": "Wǒ chīle liǎng lì yào.",
        "english": "I took two pills."
      }
    ]
  },
  {
    "hanzi": "礼拜天",
    "pinyin": "lǐ bài tiān",
    "english": "Time: Sunday",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "礼拜天是我的休息日。",
        "pinyin": "Lǐbàitiān shì wǒ de xiūxirì.",
        "english": "Sunday is my rest day."
      }
    ]
  },
  {
    "hanzi": "立方",
    "pinyin": "lì fāng",
    "english": "Noun: cube",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个房间的体积是多少立方米？",
        "pinyin": "Zhè ge fángjiān de tǐjī shì duōshǎo lìfāng mǐ?",
        "english": "What is the volume of this room in cubic meters?"
      }
    ]
  },
  {
    "hanzi": "立即",
    "pinyin": "lì jí",
    "english": "Adverb: immediately, at once",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请立即开始工作。",
        "pinyin": "Qǐng lìjí kāishǐ gōngzuò.",
        "english": "Please start working immediately."
      }
    ]
  },
  {
    "hanzi": "恋爱",
    "pinyin": "liàn ài",
    "english": " Noun: love Verb: to be in love, to have an affair",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们谈了三年恋爱。",
        "pinyin": "Tāmen tánle sān nián liàn'ài.",
        "english": "They dated for three years."
      }
    ]
  },
  {
    "hanzi": "连忙",
    "pinyin": "lián máng",
    "english": "Adverb: promptly, at once",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他一听到消息，连忙跑去告诉了大家。",
        "pinyin": "Tā yī tīng dào xiāoxī, liánmáng pǎo qù gàosule dàjiā.",
        "english": "As soon as he heard the news, he promptly ran to tell everyone."
      }
    ]
  },
  {
    "hanzi": "连续剧",
    "pinyin": "lián xù jù",
    "english": "Noun: TV series",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这部连续剧一共有三十集。",
        "pinyin": "Zhè bù liánxùjù yīgòng yǒu sānshí jí.",
        "english": "This TV series has a total of thirty episodes."
      }
    ]
  },
  {
    "hanzi": "零件",
    "pinyin": "líng jiàn",
    "english": "Noun: part, component",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个机器缺少一个重要零件。",
        "pinyin": "Zhège jīqì quēshǎo yīgè zhòngyào língjiàn.",
        "english": "This machine is missing an important component."
      }
    ]
  },
  {
    "hanzi": "录取",
    "pinyin": "lù qǔ",
    "english": "Verb: to enroll, being admitted e.g. university",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他收到了大学的录取通知书。",
        "pinyin": "Tā shōudào le dàxué de lùqǔ tōngzhīshū.",
        "english": "He received the university admission letter."
      }
    ]
  },
  {
    "hanzi": "秘书",
    "pinyin": "mì shū",
    "english": "Noun: secretary",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她现在是公司的秘书。",
        "pinyin": "Tā xiànzài shì gōngsī de mìshū.",
        "english": "She is now the company's secretary."
      }
    ]
  },
  {
    "hanzi": "棉花",
    "pinyin": "mián hua",
    "english": "Noun: cotton",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "棉花可以用来做衣服。",
        "pinyin": "Miánhuā kěyǐ yòng lái zuò yīfu.",
        "english": "Cotton can be used to make clothes."
      }
    ]
  },
  {
    "hanzi": "民主",
    "pinyin": "mín zhǔ",
    "english": "Noun: democracy Adjective: democratic",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一个民主的国家。",
        "pinyin": "Zhè shì yīgè mínzhǔ de guójiā.",
        "english": "This is a democratic country."
      }
    ]
  },
  {
    "hanzi": "名胜古迹",
    "pinyin": "míng shèng gǔ jì",
    "english": "Noun: historical sites and scenic spots",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "北京有很多名胜古迹。",
        "pinyin": "Běijīng yǒu hěn duō míngshèng gǔjì.",
        "english": "Beijing has many famous historical sites and scenic spots."
      }
    ]
  },
  {
    "hanzi": "明信片",
    "pinyin": "míng xìn piàn",
    "english": "Noun: postcard",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我要买一张明信片。",
        "pinyin": "Wǒ yào mǎi yī zhāng míngxìnpiàn.",
        "english": "I want to buy a postcard."
      }
    ]
  },
  {
    "hanzi": "明星",
    "pinyin": "míng xīng",
    "english": "Noun: star, celebrity",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "很多年轻人喜欢这位明星。",
        "pinyin": "Hěn duō niánqīng rén xǐhuān zhè wèi míngxīng.",
        "english": "Many young people like this celebrity."
      }
    ]
  },
  {
    "hanzi": "模糊",
    "pinyin": "mó hu",
    "english": "Adjective: fuzzy, blurred, indistinct",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "照片洗得有点模糊。",
        "pinyin": "Zhàopiàn xǐ de yǒudiǎn móhu.",
        "english": "The developed photo is a bit blurry."
      }
    ]
  },
  {
    "hanzi": "内科",
    "pinyin": "nèi kē",
    "english": "Noun: internal medicine",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他去看内科医生了。",
        "pinyin": "Tā qù kàn nèikē yīshēng le.",
        "english": "He went to see an internal medicine doctor."
      }
    ]
  },
  {
    "hanzi": "年代",
    "pinyin": "nián dài",
    "english": "Time: decade, age, period",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我出生在九十年代。",
        "pinyin": "Wǒ chūshēng zài jiǔshí niándài.",
        "english": "I was born in the nineties."
      }
    ]
  },
  {
    "hanzi": "宁可",
    "pinyin": "nìng kě",
    "english": "Conjunction: would rather, preferably",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我宁可在家看书，也不出去。",
        "pinyin": "Wǒ nìngkě zài jiā kànshū, yě bù chūqù.",
        "english": "I would rather read at home than go out."
      }
    ]
  },
  {
    "hanzi": "牛仔裤",
    "pinyin": "niú zǎi kù",
    "english": "Noun: jeans",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这条牛仔裤很舒服。",
        "pinyin": "Zhè tiáo níuzǎikù hěn shūfu.",
        "english": "This pair of jeans is very comfortable."
      }
    ]
  },
  {
    "hanzi": "浓",
    "pinyin": "nóng",
    "english": "Adjective: dense, concentrated, thick",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "花的香味很浓。",
        "pinyin": "Huā de xiāngwèi hěn nóng.",
        "english": "The flower's scent is very strong."
      }
    ]
  },
  {
    "hanzi": "农民",
    "pinyin": "nóng mín",
    "english": "Noun: peasant, farmer",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "农民在田里工作。",
        "pinyin": "Nóngmín zài tiánli gōngzuò.",
        "english": "Farmers work in the fields."
      }
    ]
  },
  {
    "hanzi": "农业",
    "pinyin": "nóng yè",
    "english": "Noun: agriculture, farming",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的工作与农业有关。",
        "pinyin": "Tā de gōngzuò yǔ nóngyè yǒuguān.",
        "english": "His job is related to agriculture."
      }
    ]
  },
  {
    "hanzi": "女士",
    "pinyin": "nǚ shì",
    "english": "Noun: lady, madam",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "王女士是我们的新经理。",
        "pinyin": "Wáng Nǚshì shì wǒmen de xīn jīnglǐ.",
        "english": "Ms. Wang is our new manager."
      }
    ]
  },
  {
    "hanzi": "偶然",
    "pinyin": "ǒu rán",
    "english": "Adverb: accidentally, by chance",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我偶然遇到了他。",
        "pinyin": "Wǒ ǒurán yùdào le tā.",
        "english": "I accidentally ran into him."
      }
    ]
  },
  {
    "hanzi": "排队",
    "pinyin": "pái duì",
    "english": "Verb: to queue, to line up",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "很多人在排队。",
        "pinyin": "Hěn duō rén zài pái duì.",
        "english": "Many people are queuing up."
      }
    ]
  },
  {
    "hanzi": "排球",
    "pinyin": "pái qiú",
    "english": "Noun: volleyball",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢打排球。",
        "pinyin": "Wǒ xǐhuān dǎ páiqiú.",
        "english": "I like playing volleyball."
      }
    ]
  },
  {
    "hanzi": "赔偿",
    "pinyin": "péi cháng",
    "english": "Noun: compensation Verb: to compensate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们要求他赔偿损失。",
        "pinyin": "Wǒmen yāoqiú tā péicháng sǔnshī.",
        "english": "We demanded him to compensate for the losses."
      }
    ]
  },
  {
    "hanzi": "佩服",
    "pinyin": "pèi fu",
    "english": "Verb: to admire",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我很佩服他的勇气。",
        "pinyin": "Wǒ hěn pèifú tā de yǒngqì.",
        "english": "I really admire his courage."
      }
    ]
  },
  {
    "hanzi": "培养",
    "pinyin": "péi yǎng",
    "english": "Verb: to train, to cultivate, to bring up",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们应该培养良好的习惯。",
        "pinyin": "Wǒmen yīnggāi pěiyǎng liánghǎo de xíguàn.",
        "english": "We should cultivate good habits."
      }
    ]
  },
  {
    "hanzi": "碰见",
    "pinyin": "pèng jiàn",
    "english": "Verb: to run into, to bump into",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "昨天我在街上碰见了他。",
        "pinyin": "Zuótiān wǒ zài jiē shàng pèng jiàn le tā.",
        "english": "Yesterday I ran into him on the street."
      }
    ]
  },
  {
    "hanzi": "匹",
    "pinyin": "pǐ",
    "english": "Noun: ordinary person Measure Word: for horses and cloth",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我有一匹马。",
        "pinyin": "Wǒ yǒu yī pǐ mǎ.",
        "english": "I have one horse."
      }
    ]
  },
  {
    "hanzi": "披",
    "pinyin": "pī",
    "english": "Verb: to drape over one's shoulder, to crack",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "天冷了，快披上外套。",
        "pinyin": "Tiān lěng le, kuài pī shàng wàitào.",
        "english": "It's cold, quickly put on a jacket."
      }
    ]
  },
  {
    "hanzi": "疲劳",
    "pinyin": "pí láo",
    "english": " Noun: wariness, fatigue Adjective: tired, weary, exhausted",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "感到疲劳时，最好休息一下。",
        "pinyin": "Gǎn dào pí láo shí, zuì hǎo xiū xi yī xià.",
        "english": "When you feel tired, it is best to rest for a bit."
      }
    ]
  },
  {
    "hanzi": "皮鞋",
    "pinyin": "pí xié",
    "english": "Noun: leather shoes",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我买了一双皮鞋。",
        "pinyin": "Wǒ mǎi le yī shuāng píxié.",
        "english": "I bought a pair of leather shoes."
      }
    ]
  },
  {
    "hanzi": "片",
    "pinyin": "piàn",
    "english": " Noun: thin piece, slice, film Measure Word: for movies, scenes, etc. pieces of things",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请给我一片面包。",
        "pinyin": "Qǐng gěi wǒ yí piàn miànbāo.",
        "english": "Please give me a slice of bread."
      }
    ]
  },
  {
    "hanzi": "片面",
    "pinyin": "piàn miàn",
    "english": "Adjective: unilateral, one-sided",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你的观点有点片面。",
        "pinyin": "Nǐ de guāndiǎn yǒudiǎn piànmiàn.",
        "english": "Your point of view is a bit one-sided."
      }
    ]
  },
  {
    "hanzi": "飘",
    "pinyin": "piāo",
    "english": "Verb: to flutter, to float in the wind",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "旗子在风中飘着。",
        "pinyin": "Qízi zài fēng zhōng piāozhe.",
        "english": "The flag is fluttering in the wind."
      }
    ]
  },
  {
    "hanzi": "频道",
    "pinyin": "pín dào",
    "english": "Noun: frequency, TV channel",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你在看哪个频道？",
        "pinyin": "Nǐ zài kàn nǎge píndào?",
        "english": "Which channel are you watching?"
      }
    ]
  },
  {
    "hanzi": "品种",
    "pinyin": "pǐn zhǒng",
    "english": "Noun: variety, breed",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是什么狗的品种？",
        "pinyin": "Zhè shì shénme gǒu de pǐnzhǒng?",
        "english": "What breed of dog is this?"
      }
    ]
  },
  {
    "hanzi": "平",
    "pinyin": "píng",
    "english": "Adjective: flat, level, calm, peaceful",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这条路很平。",
        "pinyin": "Zhè tiáo lù hěn píng.",
        "english": "This road is very flat."
      }
    ]
  },
  {
    "hanzi": "平常",
    "pinyin": "píng cháng",
    "english": " Adjective: ordinary, common Adverb: generally, usually",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一个平常的日子。",
        "pinyin": "Zhè shì yīgè píngcháng de rìzi.",
        "english": "This is just an ordinary day."
      }
    ]
  },
  {
    "hanzi": "平方",
    "pinyin": "píng fāng",
    "english": "Noun: square",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "房间的面积是二十平方米。",
        "pinyin": "Fángjiān de miànjī shì èrshí píngfāng mǐ.",
        "english": "The area of the room is twenty square meters."
      }
    ]
  },
  {
    "hanzi": "平衡",
    "pinyin": "píng héng",
    "english": "Noun: balance, equilibrium",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他失去了平衡。",
        "pinyin": "Tā shīqù le pínghéng.",
        "english": "He lost his balance."
      }
    ]
  },
  {
    "hanzi": "评价",
    "pinyin": "píng jià",
    "english": "Verb: to assess, to evaluate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你如何评价这本书？",
        "pinyin": "Nǐ rúhé píngjià zhè běn shū?",
        "english": "How would you evaluate this book?"
      }
    ]
  },
  {
    "hanzi": "平静",
    "pinyin": "píng jìng",
    "english": "Noun: calm, quiet, tranquil",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "湖面非常平静。",
        "pinyin": "Húmiàn fēicháng píngjìng.",
        "english": "The surface of the lake is very calm (tranquil)."
      }
    ]
  },
  {
    "hanzi": "平均",
    "pinyin": "píng jūn",
    "english": " Noun: average Adjective: average, mean",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "今天的平均温度是多少？",
        "pinyin": "Jīntiān de píngjūn wēndù shì duōshǎo?",
        "english": "What is today's average temperature?"
      }
    ]
  },
  {
    "hanzi": "破产",
    "pinyin": "pò chǎn",
    "english": "Noun: bankruptcy Verb: to go bankrupt",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的公司破产了。",
        "pinyin": "Tā de gōngsī pòchǎn le.",
        "english": "His company went bankrupt."
      }
    ]
  },
  {
    "hanzi": "朴素",
    "pinyin": "pǔ sù",
    "english": "Adjective: plain, simple",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她喜欢穿朴素的衣服。",
        "pinyin": "Tā xǐhuān chuān pǔsù de yīfu.",
        "english": "She likes to wear plain clothes."
      }
    ]
  },
  {
    "hanzi": "奇迹",
    "pinyin": "qí jì",
    "english": "Noun: miracle, wonder",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一件奇迹。",
        "pinyin": "Zhè shì yī jiàn qíjī.",
        "english": "This is a miracle."
      }
    ]
  },
  {
    "hanzi": "其余",
    "pinyin": "qí yú",
    "english": "Pronoun: the rest, the others",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "三个人先走了，其余的人还在等。",
        "pinyin": "Sān gè rén xiān zǒu le, qíyú de rén hái zài děng.",
        "english": "Three people left first, the rest of the people are still waiting."
      }
    ]
  },
  {
    "hanzi": "谦虚",
    "pinyin": "qiān xū",
    "english": "Adjective: modest",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他非常谦虚，从不夸耀自己。",
        "pinyin": "Tā fēicháng qiānxū, cóng bù kuāyào zìjǐ.",
        "english": "He is very modest and never boasts about himself."
      }
    ]
  },
  {
    "hanzi": "签字",
    "pinyin": "qiān zì",
    "english": "Verb: to sign signature",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请在这里签字。",
        "pinyin": "Qǐng zài zhèlǐ qiānzì.",
        "english": "Please sign here."
      }
    ]
  },
  {
    "hanzi": "枪",
    "pinyin": "qiāng",
    "english": "Noun: gun, spear",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我看到一把玩具枪。",
        "pinyin": "Wǒ kàndào yī bǎ wánjù qiāng.",
        "english": "I saw a toy gun."
      }
    ]
  },
  {
    "hanzi": "强调",
    "pinyin": "qiáng diào",
    "english": "Verb: to emphasize, to stress, to underling",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他强调了时间的宝贵。",
        "pinyin": "Tā qiángdiàole shíjiān de bǎoguì.",
        "english": "He emphasized how precious time is."
      }
    ]
  },
  {
    "hanzi": "悄悄",
    "pinyin": "qiāo qiāo",
    "english": "Adverb: quietly, secretly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她悄悄离开了。",
        "pinyin": "Tā qiāo qiāo lí kāi le.",
        "english": "She quietly left."
      }
    ]
  },
  {
    "hanzi": "勤劳",
    "pinyin": "qín láo",
    "english": "Adjective: hardworking, industrious",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的奶奶很勤劳。",
        "pinyin": "Wǒ de nǎinai hěn qínláo.",
        "english": "My grandmother is very hardworking."
      }
    ]
  },
  {
    "hanzi": "侵略",
    "pinyin": "qīn lüè",
    "english": " Noun: invasion, aggression Verb: to invade",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们反对任何形式的侵略。",
        "pinyin": "Wǒmen fǎnduì rènhé xíngshì de qīnlüè.",
        "english": "We oppose aggression in any form."
      }
    ]
  },
  {
    "hanzi": "青",
    "pinyin": "qīng",
    "english": "Adjective: blue/green",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢吃青菜。",
        "pinyin": "Wǒ xǐhuān chī qīngcài.",
        "english": "I like eating green vegetables."
      }
    ]
  },
  {
    "hanzi": "青春",
    "pinyin": "qīng chūn",
    "english": "Time: youth, youthfulness",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们应该珍惜青春。",
        "pinyin": "Wǒmen yīnggāi zhēnxī qīngchūn.",
        "english": "We should cherish our youth."
      }
    ]
  },
  {
    "hanzi": "情景",
    "pinyin": "qíng jǐng",
    "english": "Noun: scene, sight, condition, circumstances",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这情景真美，像一幅画。",
        "pinyin": "Zhè qíngjǐng zhēn měi, xiàng yī fú huà.",
        "english": "This scene is truly beautiful, like a painting."
      }
    ]
  },
  {
    "hanzi": "请求",
    "pinyin": "qǐng qiú",
    "english": " Noun: request Verb: to request, to ask",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我有一个小请求。",
        "pinyin": "Wǒ yǒu yīgè xiǎo qǐngqiú.",
        "english": "I have a small request."
      }
    ]
  },
  {
    "hanzi": "青少年",
    "pinyin": "qīng shào nián",
    "english": "Noun: young person, teenager",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这本书适合青少年阅读。",
        "pinyin": "Zhè běn shū shìhé qīngshàonián yuèdú.",
        "english": "This book is suitable for young people to read."
      }
    ]
  },
  {
    "hanzi": "轻视",
    "pinyin": "qīng shì",
    "english": "Verb: to look down upon, to contempt",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们不能轻视敌人。",
        "pinyin": "Wǒmen bù néng qīngshì dírén.",
        "english": "We must not underestimate the enemy."
      }
    ]
  },
  {
    "hanzi": "情绪",
    "pinyin": "qíng xù",
    "english": "Noun: feeling, mood, sentiment",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "今天她情绪很好。",
        "pinyin": "Jīntiān tā qíngxù hěn hǎo.",
        "english": "Today her mood is very good."
      }
    ]
  },
  {
    "hanzi": "球迷",
    "pinyin": "qiú mí",
    "english": "Noun: football fan",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我爸爸是多年的老球迷了。",
        "pinyin": "Wǒ bàba shì duōnián de lǎo qiúmí le.",
        "english": "My father has been a fan for many years."
      }
    ]
  },
  {
    "hanzi": "去世",
    "pinyin": "qù shì",
    "english": "Verb: to pass away, to die",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的奶奶去年去世了。",
        "pinyin": "Wǒ de nǎinai qùnián qùshì le.",
        "english": "My grandmother passed away last year."
      }
    ]
  },
  {
    "hanzi": "取消",
    "pinyin": "qǔ xiāo",
    "english": "Noun: cancellation Verb: to cancel",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们取消了今天的会议。",
        "pinyin": "Wǒmen qǔxiāole jīntiān de huìyì.",
        "english": "We canceled today's meeting."
      }
    ]
  },
  {
    "hanzi": "全面",
    "pinyin": "quán miàn",
    "english": "Adjective: all-around, overall, comprehensive",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这份报告很全面。",
        "pinyin": "Zhè fèn bàogào hěn quánmiàn.",
        "english": "This report is very comprehensive."
      }
    ]
  },
  {
    "hanzi": "确定",
    "pinyin": "què dìng",
    "english": "Verb: to make sure, to define, to determine",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请确定会议时间。",
        "pinyin": "Qǐng quèdìng huìyì shíjiān.",
        "english": "Please confirm the meeting time."
      }
    ]
  },
  {
    "hanzi": "嚷",
    "pinyin": "rǎng",
    "english": "Verb: to blurt out, to shout",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "不要在图书馆里嚷。",
        "pinyin": "Bùyào zài túshūguǎn lǐ rǎng.",
        "english": "Don't shout in the library."
      }
    ]
  },
  {
    "hanzi": "热爱",
    "pinyin": "rè ài",
    "english": "Verb: to love ardently, to adore",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他非常热爱他的职业。",
        "pinyin": "Tā fēicháng rè'ài tā de zhíyè.",
        "english": "He is very passionate about his profession."
      }
    ]
  },
  {
    "hanzi": "热心",
    "pinyin": "rè xīn",
    "english": " Noun: enthusiasm Adjective: enthusiastic, ardent, warmhearted",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她对公益事业很热心。",
        "pinyin": "Tā duì gōngyì shìyè hěn rèxīn.",
        "english": "She is very enthusiastic about public welfare."
      }
    ]
  },
  {
    "hanzi": "日历",
    "pinyin": "rì lì",
    "english": "Noun: calendar",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "日历在哪里？",
        "pinyin": "Rìlì zài nǎlǐ?",
        "english": "Where is the calendar?"
      }
    ]
  },
  {
    "hanzi": "日期",
    "pinyin": "rì qī",
    "english": "Noun: date",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请告诉我旅行的日期。",
        "pinyin": "Qǐng gàosù wǒ lǚxíng de rìqī.",
        "english": "Please tell me the date of the trip."
      }
    ]
  },
  {
    "hanzi": "日用品",
    "pinyin": "rì yòng pǐn",
    "english": "Noun: articles for daily use",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我去商店买一些日用品。",
        "pinyin": "Wǒ qù shāngdiàn mǎi yīxiē rìyòngpǐn.",
        "english": "I went to the store to buy some daily necessities."
      }
    ]
  },
  {
    "hanzi": "融化",
    "pinyin": "róng huà",
    "english": "Verb: to melt, to thaw",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "天气太热，冰淇淋融化了。",
        "pinyin": "Tiānqì tài rè, bīngqílín rónghuà le.",
        "english": "The weather is too hot, the ice cream melted."
      }
    ]
  },
  {
    "hanzi": "荣幸",
    "pinyin": "róng xìng",
    "english": "Adjective: honoured",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我很荣幸能参加这次会议。",
        "pinyin": "Wǒ hěn róngxìng néng cānjiā zhè cì huìyì.",
        "english": "I am very honoured to be able to attend this meeting."
      }
    ]
  },
  {
    "hanzi": "荣誉",
    "pinyin": "róng yù",
    "english": "Noun: honour, glory",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她获得了最高的荣誉。",
        "pinyin": "Tā huòdéle zuìgāo de róngyù.",
        "english": "She received the highest honour."
      }
    ]
  },
  {
    "hanzi": "软件",
    "pinyin": "ruǎn jiàn",
    "english": "Noun: software",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个软件很有用。",
        "pinyin": "Zhège ruǎnjiàn hěn yǒuyòng.",
        "english": "This software is very useful."
      }
    ]
  },
  {
    "hanzi": "洒",
    "pinyin": "sǎ",
    "english": "Verb: to sprinkle, to spray",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "给花洒点水吧。",
        "pinyin": "Gěi huā sǎ diǎn shuǐ ba.",
        "english": "Sprinkle some water on the flowers."
      }
    ]
  },
  {
    "hanzi": "傻",
    "pinyin": "shǎ",
    "english": "Adjective: foolish",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "别傻了。",
        "pinyin": "Bié shǎ le.",
        "english": "Don't be silly."
      }
    ]
  },
  {
    "hanzi": "杀",
    "pinyin": "shā",
    "english": "Verb: to kill",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他不敢杀鱼。",
        "pinyin": "Tā bù gǎn shā yú.",
        "english": "He doesn't dare to kill the fish."
      }
    ]
  },
  {
    "hanzi": "沙漠",
    "pinyin": "shā mò",
    "english": "Noun: desert",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "沙漠里有很多沙子。",
        "pinyin": "Shāmò lǐ yǒu hěn duō shāzi.",
        "english": "There is a lot of sand in the desert."
      }
    ]
  },
  {
    "hanzi": "闪电",
    "pinyin": "shǎn diàn",
    "english": "Noun: lightning",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "闪电划过天空。",
        "pinyin": "Shǎndiàn huà guò tiānkōng.",
        "english": "Lightning flashed across the sky."
      }
    ]
  },
  {
    "hanzi": "扇子",
    "pinyin": "shàn zi",
    "english": "Noun: fan",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "夏天用扇子很舒服。",
        "pinyin": "Xiàtiān yòng shànzi hěn shūfu.",
        "english": "Using a fan in the summer is very comfortable."
      }
    ]
  },
  {
    "hanzi": "上当",
    "pinyin": "shàng dàng",
    "english": "Verb: to be fooled",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "小心别上当。",
        "pinyin": "Xiǎoxīn bié shàng dàng.",
        "english": "Be careful not to be fooled."
      }
    ]
  },
  {
    "hanzi": "商品",
    "pinyin": "shāng pǐn",
    "english": "Noun: good, commodity",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这些商品价格合理。",
        "pinyin": "Zhèxiē shāngpǐn jiàgé hélǐ.",
        "english": "These goods are reasonably priced."
      }
    ]
  },
  {
    "hanzi": "商业",
    "pinyin": "shāng yè",
    "english": "Noun: business, commerce, trade",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这里有很多商业机会。",
        "pinyin": "Zhè lǐ yǒu hěn duō shāngyè jīhuì.",
        "english": "There are many business opportunities here."
      }
    ]
  },
  {
    "hanzi": "设施",
    "pinyin": "shè shī",
    "english": "Noun: facility, installation",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这座公园有很多公共设施。",
        "pinyin": "Zhè zuò gōngyuán yǒu hěn duō gōnggòng shèshī.",
        "english": "This park has many public facilities."
      }
    ]
  },
  {
    "hanzi": "舌头",
    "pinyin": "shé tou",
    "english": "Noun: tongue",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "医生让我伸出舌头。",
        "pinyin": "Yīshēng ràng wǒ shēn chū shétou.",
        "english": "The doctor asked me to stick out my tongue."
      }
    ]
  },
  {
    "hanzi": "神秘",
    "pinyin": "shén mì",
    "english": "Noun: mystery Adjective: mysterious",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她有一个很神秘的身份。",
        "pinyin": "Tā yǒu yī gè hěn shén mì de shēn fèn.",
        "english": "She has a very mysterious identity."
      }
    ]
  },
  {
    "hanzi": "升",
    "pinyin": "shēng",
    "english": " Verb: to promote, to raise Measure Word: 1 liter",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我买了两升果汁。",
        "pinyin": "Wǒ mǎi le liǎng shēng guǒzhī.",
        "english": "I bought two liters of juice."
      }
    ]
  },
  {
    "hanzi": "生产",
    "pinyin": "shēng chǎn",
    "english": " Noun: production Verb: to produce, to manufacture",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个工厂生产手机。",
        "pinyin": "Zhège gōngchǎng shēngchǎn shǒujī.",
        "english": "This factory produces mobile phones."
      }
    ]
  },
  {
    "hanzi": "声调",
    "pinyin": "shēng diào",
    "english": "Noun: tone, note",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "汉语有四个声调。",
        "pinyin": "Hànyǔ yǒu sì gè shēngdiào.",
        "english": "Mandarin Chinese has four tones."
      }
    ]
  },
  {
    "hanzi": "生动",
    "pinyin": "shēng dòng",
    "english": "Adjective: vivid, lively",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他讲的故事很生动。",
        "pinyin": "Tā jiǎng de gùshi hěn shēngdòng.",
        "english": "The story he told was very vivid."
      }
    ]
  },
  {
    "hanzi": "省略",
    "pinyin": "shěng lüè",
    "english": "Verb: to leave out, to omit",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "为了节省时间，他省略了开场白。",
        "pinyin": "Wèile jiéshěng shíjiān, tā shěnglüèle kāichǎngbái.",
        "english": "To save time, he omitted the opening remarks."
      }
    ]
  },
  {
    "hanzi": "绳子",
    "pinyin": "shéng zi",
    "english": "Noun: string, rope, cord",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请给我一根绳子。",
        "pinyin": "Qǐng gěi wǒ yī gēn shéngzi.",
        "english": "Please give me a piece of string/rope."
      }
    ]
  },
  {
    "hanzi": "士兵",
    "pinyin": "shì bīng",
    "english": "Noun: soldier",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他曾经是一名士兵。",
        "pinyin": "Tā céngjīng shì yī míng shìbīng.",
        "english": "He used to be a soldier."
      }
    ]
  },
  {
    "hanzi": "似的",
    "pinyin": "shì de",
    "english": "Conjunction: seems as if",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她的眼睛像星星似的。",
        "pinyin": "Tā de yǎnjīng xiàng xīngxing shìde.",
        "english": "Her eyes are like stars."
      }
    ]
  },
  {
    "hanzi": "实话",
    "pinyin": "shí huà",
    "english": "Noun: truth",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "说实话，我不喜欢这部电影。",
        "pinyin": "Shuō shíhuà, wǒ bù xǐhuān zhè bù diànyǐng.",
        "english": "To tell the truth, I don't like this movie."
      }
    ]
  },
  {
    "hanzi": "使劲儿",
    "pinyin": "shǐ jìn r",
    "english": "Verb: to exert all one's strength",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你得使劲儿推门。",
        "pinyin": "Nǐ děi shǐjìnr tuī mén.",
        "english": "You have to push the door hard."
      }
    ]
  },
  {
    "hanzi": "试卷",
    "pinyin": "shì juàn",
    "english": "Noun: examination paper",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我做完了试卷。",
        "pinyin": "Wǒ zuò wán le shìjuǎn.",
        "english": "I finished the test paper."
      }
    ]
  },
  {
    "hanzi": "时刻",
    "pinyin": "shí kè",
    "english": "Time: moment",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一个历史性的时刻。",
        "pinyin": "Zhè shì yīgè lìshǐ xìng de shíkè.",
        "english": "This is a historic moment."
      }
    ]
  },
  {
    "hanzi": "时髦",
    "pinyin": "shí máo",
    "english": "Adjective: fashionable",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这条裙子看起来很时髦。",
        "pinyin": "Zhè tiáo qúnzi kànqilai hěn shímáo.",
        "english": "This dress looks very fashionable."
      }
    ]
  },
  {
    "hanzi": "时期",
    "pinyin": "shí qī",
    "english": "Noun: period, phase",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "婴儿期是人生成长的重要时期。",
        "pinyin": "Yīng'ér qí shì rénshēng chéngzhǎng de zhòngyào shíqī.",
        "english": "Infancy is an important period of growth in life."
      }
    ]
  },
  {
    "hanzi": "时尚",
    "pinyin": "shí shàng",
    "english": "Noun: fashion",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这条裙子很时尚。",
        "pinyin": "Zhè tiáo qúnzi hěn shíshàng.",
        "english": "This skirt is very fashionable."
      }
    ]
  },
  {
    "hanzi": "石头",
    "pinyin": "shí tou",
    "english": "Noun: stone",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "路上有一块石头。",
        "pinyin": "Lùshang yǒu yī kuài shítou.",
        "english": "There is a stone on the road."
      }
    ]
  },
  {
    "hanzi": "实行",
    "pinyin": "shí xíng",
    "english": "Verb: to put into practice, to carry out",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们明天开始实行这个计划。",
        "pinyin": "Wǒmen míngtiān kāishǐ shíxíng zhège jìhuà.",
        "english": "We will start implementing this plan tomorrow."
      }
    ]
  },
  {
    "hanzi": "实验",
    "pinyin": "shí yàn",
    "english": "Noun: experiment Verb: to experiment",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "实验失败了。",
        "pinyin": "Shíyàn shībài le.",
        "english": "The experiment failed."
      }
    ]
  },
  {
    "hanzi": "实用",
    "pinyin": "shí yòng",
    "english": "Adjective: practical, pragmatisch, applied",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这本书很实用。",
        "pinyin": "Zhè běn shū hěn shíyòng.",
        "english": "This book is very practical."
      }
    ]
  },
  {
    "hanzi": "始终",
    "pinyin": "shǐ zhōng",
    "english": "Adverb: from beginning to end",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "老师始终保持微笑。",
        "pinyin": "Lǎoshī shǐzhōng bǎochí wēixiào.",
        "english": "The teacher consistently maintained a smile."
      }
    ]
  },
  {
    "hanzi": "手工",
    "pinyin": "shǒu gōng",
    "english": "Noun: hondwork Adjective: manual",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的手工很好。",
        "pinyin": "Tā de shǒugōng hěn hǎo.",
        "english": "His handiwork is very good."
      }
    ]
  },
  {
    "hanzi": "收获",
    "pinyin": "shōu huò",
    "english": " Noun: result, gain, harvest Verb: to harvest",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你有什么收获？",
        "pinyin": "Nǐ yǒu shénme shōuhuò?",
        "english": "What did you gain?"
      }
    ]
  },
  {
    "hanzi": "收据",
    "pinyin": "shōu jù",
    "english": "Noun: receipt",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请保留收据。",
        "pinyin": "Qǐng bǎoliú shōujù.",
        "english": "Please keep the receipt."
      }
    ]
  },
  {
    "hanzi": "受伤",
    "pinyin": "shòu shāng",
    "english": "Verb: to get injured",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "小心，别受伤。",
        "pinyin": "Xiǎoxīn, bié shòushāng.",
        "english": "Be careful, don't get injured."
      }
    ]
  },
  {
    "hanzi": "手指",
    "pinyin": "shǒu zhǐ",
    "english": "Noun: finger",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的手指受伤了。",
        "pinyin": "Wǒ de shǒuzhǐ shòushāng le.",
        "english": "My finger is injured."
      }
    ]
  },
  {
    "hanzi": "鼠标",
    "pinyin": "shǔ biāo",
    "english": "Noun: mouse IT",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "那个鼠标是无线的。",
        "pinyin": "Nàge shǔbiāo shì wúxiàn de.",
        "english": "That mouse is wireless."
      }
    ]
  },
  {
    "hanzi": "蔬菜",
    "pinyin": "shū cài",
    "english": "Noun: vegetables",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢吃蔬菜。",
        "pinyin": "Wǒ xǐhuan chī shūcài.",
        "english": "I like to eat vegetables."
      }
    ]
  },
  {
    "hanzi": "书架",
    "pinyin": "shū jià",
    "english": "Noun: bookshelf",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "把书放在书架上。",
        "pinyin": "Bǎ shū fàng zài shūjià shang.",
        "english": "Put the book on the bookshelf."
      }
    ]
  },
  {
    "hanzi": "数据",
    "pinyin": "shù jù",
    "english": "Noun: data",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们需要分析这些数据。",
        "pinyin": "Wǒmen xūyào fēnxī zhèxiē shùjù.",
        "english": "We need to analyze this data."
      }
    ]
  },
  {
    "hanzi": "输入",
    "pinyin": "shū rù",
    "english": "Verb: to import, to input",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请输入你的密码。",
        "pinyin": "Qǐng shūrù nǐ de mìmǎ.",
        "english": "Please enter your password."
      }
    ]
  },
  {
    "hanzi": "舒适",
    "pinyin": "shū shì",
    "english": "Adjective: comfortable, cozy",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个房间很舒适。",
        "pinyin": "Zhège fángjiān hěn shūshì.",
        "english": "This room is very comfortable."
      }
    ]
  },
  {
    "hanzi": "梳子",
    "pinyin": "shū zi",
    "english": "Noun: comb",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我需要一把梳子。",
        "pinyin": "Wǒ xūyào yì bǎ shūzi.",
        "english": "I need a comb."
      }
    ]
  },
  {
    "hanzi": "说不定",
    "pinyin": "shuō bu dìng",
    "english": "Adverb: maybe, cannot say for sure",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们说不定会在路上遇到他。",
        "pinyin": "Wǒmen shuō bu dìng huì zài lù shang yù dào tā.",
        "english": "Maybe we will run into him on the road."
      }
    ]
  },
  {
    "hanzi": "撕",
    "pinyin": "sī",
    "english": "Verb: to tear up",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我把信撕成了两半。",
        "pinyin": "Wǒ bǎ xìn sī chéng le liǎng bàn.",
        "english": "I tore the letter into two halves."
      }
    ]
  },
  {
    "hanzi": "丝绸",
    "pinyin": "sī chóu",
    "english": "Noun: silk, silk cloth",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "丝绸摸起来很柔软。",
        "pinyin": "Sīchóu mō qǐlái hěn róuruǎn.",
        "english": "Silk feels very soft."
      }
    ]
  },
  {
    "hanzi": "思考",
    "pinyin": "sī kǎo",
    "english": "Verb: to ponder over, to think over, to reflect upon",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你做决定前应该仔细思考。",
        "pinyin": "Nǐ zuò juédìng qián yīnggāi zǐxì sīkǎo.",
        "english": "You should think carefully before making a decision."
      }
    ]
  },
  {
    "hanzi": "寺庙",
    "pinyin": "sì miào",
    "english": "Noun: temple, monastery",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这座寺庙很古老。",
        "pinyin": "Zhè zuò sìmiào hěn gǔlǎo.",
        "english": "This temple is very old."
      }
    ]
  },
  {
    "hanzi": "私人",
    "pinyin": "sī rén",
    "english": "Noun: private person Adjective: private",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一家私人公司。",
        "pinyin": "Zhè shì yī jiā sī rén gōng sī.",
        "english": "This is a private company."
      }
    ]
  },
  {
    "hanzi": "宿舍",
    "pinyin": "sù shè",
    "english": "Noun: dormitory",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的宿舍在四楼。",
        "pinyin": "Wǒ de sùshě zài sì lóu.",
        "english": "My dormitory is on the fourth floor."
      }
    ]
  },
  {
    "hanzi": "所",
    "pinyin": "suǒ",
    "english": "Adverb: actually Measure Word: for houses, buildings, institutions",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这所大学很有名。",
        "pinyin": "Zhè suǒ dàxué hěn yǒumíng.",
        "english": "This university is very famous."
      }
    ]
  },
  {
    "hanzi": "所谓",
    "pinyin": "suǒ wèi",
    "english": "Adverb: so-called",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "什么是所谓的成功？",
        "pinyin": "Shénme shì suǒwèi de chénggōng?",
        "english": "What is this so-called success?"
      }
    ]
  },
  {
    "hanzi": "缩小",
    "pinyin": "suō xiǎo",
    "english": "Verb: to reduce, to shrink, to lessen",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这件毛衣洗后缩小了。",
        "pinyin": "Zhè jiàn máoyī xǐ hòu suōxiǎo le.",
        "english": "This sweater shrunk after washing."
      }
    ]
  },
  {
    "hanzi": "塔",
    "pinyin": "tǎ",
    "english": "Noun: tower",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这座塔很高。",
        "pinyin": "Zhè zuò tǎ hěn gāo.",
        "english": "This tower is very high."
      }
    ]
  },
  {
    "hanzi": "太极拳",
    "pinyin": "tài jí quán",
    "english": "Noun: shadowboxing, Taiji",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "爷爷每天早上打太极拳。",
        "pinyin": "Yéye měitiān zǎoshang dǎ Tàijíquán.",
        "english": "Grandpa practices Tai Chi every morning."
      }
    ]
  },
  {
    "hanzi": "太太",
    "pinyin": "tài tai",
    "english": "Noun: wife, Madame, Mrs.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "王太太是位好老师。",
        "pinyin": "Wáng tàitai shì wèi hǎo lǎoshī.",
        "english": "Mrs. Wang is a good teacher."
      }
    ]
  },
  {
    "hanzi": "套",
    "pinyin": "tào",
    "english": "Noun: cover Verb: to cover with Measure Word: for sets of things",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她有一套红色的运动服。",
        "pinyin": "Tā yǒu yī tào hóngsè de yùndòngfú.",
        "english": "She has a red tracksuit."
      }
    ]
  },
  {
    "hanzi": "逃避",
    "pinyin": "táo bì",
    "english": "Verb: to escape, to avoid, to shirk",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "不要逃避现实。",
        "pinyin": "Bú yào táobì xiànshí.",
        "english": "Don't avoid reality."
      }
    ]
  },
  {
    "hanzi": "特意",
    "pinyin": "tè yì",
    "english": "Adverb: specially, expressly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你是特意来的吗？",
        "pinyin": "Nǐ shì tèyì lái de ma?",
        "english": "Did you come specially?"
      }
    ]
  },
  {
    "hanzi": "特征",
    "pinyin": "tè zhēng",
    "english": "Noun: distinctive feature, characteristic",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这种植物有什么特征？",
        "pinyin": "Zhè zhǒng zhíwù yǒu shénme tèzhēng?",
        "english": "What are the characteristics of this plant?"
      }
    ]
  },
  {
    "hanzi": "疼爱",
    "pinyin": "téng ài",
    "english": "Verb: to love dearly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "父母都很疼爱他们的独生女。",
        "pinyin": "Fùmǔ dōu hěn téng'ài tāmen de dúshēngnǚ.",
        "english": "Both parents love their only daughter dearly."
      }
    ]
  },
  {
    "hanzi": "提倡",
    "pinyin": "tí chàng",
    "english": "Verb: to promote, to advocate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "学校提倡节约用水。",
        "pinyin": "Xuéxiào tíchàng jiéyuē yòngshuǐ.",
        "english": "The school advocates saving water."
      }
    ]
  },
  {
    "hanzi": "提纲",
    "pinyin": "tí gāng",
    "english": "Noun: key points, outline",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请把演讲提纲发给我。",
        "pinyin": "Qǐng bǎ yǎnjiǎng tígāng fā gěi wǒ.",
        "english": "Please send me the outline for the speech."
      }
    ]
  },
  {
    "hanzi": "体积",
    "pinyin": "tǐ jī",
    "english": "Noun: volume",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个箱子的体积很大。",
        "pinyin": "Zhège xiāngzi de tǐjī hěn dà.",
        "english": "The volume of this box is very large."
      }
    ]
  },
  {
    "hanzi": "题目",
    "pinyin": "tí mù",
    "english": "Noun: topic, title",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个题目太难了。",
        "pinyin": "Zhège tímù tài nánle.",
        "english": "This question is too difficult."
      }
    ]
  },
  {
    "hanzi": "提问",
    "pinyin": "tí wèn",
    "english": "Verb: to raise a question",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请在课程结束后提问。",
        "pinyin": "Qǐng zài kèchéng jiéshù hòu tíwèn.",
        "english": "Please ask questions after the class ends."
      }
    ]
  },
  {
    "hanzi": "体验",
    "pinyin": "tǐ yàn",
    "english": "Verb: to experience for oneself",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我想体验一下当地的生活。",
        "pinyin": "Wǒ xiǎng tǐyàn yīxià dāngdì de shēnghuó.",
        "english": "I want to experience the local way of life for a bit."
      }
    ]
  },
  {
    "hanzi": "天空",
    "pinyin": "tiān kōng",
    "english": "Noun: sky",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "今天的天空很晴朗。",
        "pinyin": "Jīntiān de tiānkōng hěn qínglǎng.",
        "english": "Today's sky is very clear."
      }
    ]
  },
  {
    "hanzi": "田野",
    "pinyin": "tián yě",
    "english": "Noun: field, open land",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们在田野里散步。",
        "pinyin": "Wǒmen zài tiányě lǐ sànbù.",
        "english": "We took a walk in the fields."
      }
    ]
  },
  {
    "hanzi": "天真",
    "pinyin": "tiān zhēn",
    "english": "Adjective: naive, innocent",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的想法太天真了。",
        "pinyin": "Tā de xiǎngfǎ tài tiānzhēn le.",
        "english": "His idea is too naive."
      }
    ]
  },
  {
    "hanzi": "调皮",
    "pinyin": "tiáo pí",
    "english": "Adjective: naughty, tricky",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "那个孩子很调皮。",
        "pinyin": "Nàge háizi hěn diàopí.",
        "english": "That child is very naughty."
      }
    ]
  },
  {
    "hanzi": "挑战",
    "pinyin": "tiǎo zhàn",
    "english": "Noun: challange",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢接受挑战。",
        "pinyin": "Wǒ xǐhuan jiēshòu tiǎozhàn.",
        "english": "I like accepting challenges."
      }
    ]
  },
  {
    "hanzi": "调整",
    "pinyin": "tiáo zhěng",
    "english": "Noun: adjustment Verb: to adjust, to revise",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们需要调整计划。",
        "pinyin": "Wǒmen xūyào tiáozhěng jìhuà.",
        "english": "We need to adjust the plan."
      }
    ]
  },
  {
    "hanzi": "铜",
    "pinyin": "tóng",
    "english": "Noun: copper",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这枚硬币是铜做的。",
        "pinyin": "Zhè méi yìngbì shì tóng zuò de.",
        "english": "This coin is made of copper."
      }
    ]
  },
  {
    "hanzi": "通常",
    "pinyin": "tōng cháng",
    "english": "Adverb: regular, usually, normally",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我通常早上喝咖啡。",
        "pinyin": "Wǒ tōngcháng zǎoshang hē kāfēi.",
        "english": "I usually drink coffee in the morning."
      }
    ]
  },
  {
    "hanzi": "痛苦",
    "pinyin": "tòng kǔ",
    "english": "Noun: pain, suffering Adjective: painful",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他因为生病而感到十分痛苦。",
        "pinyin": "Tā yīnwèi shēngbìng ér gǎndào shífēn tòngkǔ.",
        "english": "He felt extremely painful because of his illness."
      }
    ]
  },
  {
    "hanzi": "痛快",
    "pinyin": "tòng kuài",
    "english": "Adjective: delighted, very happy",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们玩得很痛快。",
        "pinyin": "Wǒmen wán dé hěn tòngkuài.",
        "english": "We had a really great time."
      }
    ]
  },
  {
    "hanzi": "通讯",
    "pinyin": "tōng xùn",
    "english": "Noun: communication, news report",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "手机是主要的通讯工具。",
        "pinyin": "Shǒujī shì zhǔyào de tōngxùn gōngjù.",
        "english": "Mobile phones are the primary means of communication."
      }
    ]
  },
  {
    "hanzi": "统一",
    "pinyin": "tǒng yī",
    "english": "Verb: to unify, to unite, to integrate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们应该统一一下意见。",
        "pinyin": "Wǒmen yīnggāi tǒngyī yīxià yìjiàn.",
        "english": "We should unify our opinions/views."
      }
    ]
  },
  {
    "hanzi": "统治",
    "pinyin": "tǒng zhì",
    "english": "Noun: regime, government Verb: to rule, to govern",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他统治这个国家已经十年了。",
        "pinyin": "Tā tǒngzhì zhège guójiā yǐjīng shí nián le.",
        "english": "He has ruled this country for ten years."
      }
    ]
  },
  {
    "hanzi": "透明",
    "pinyin": "tòu míng",
    "english": "Adjective: transparent",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个杯子是透明的。",
        "pinyin": "Zhège bēizi shì tòumíng de.",
        "english": "This cup is transparent."
      }
    ]
  },
  {
    "hanzi": "投资",
    "pinyin": "tóu zī",
    "english": "Noun: investment Verb: to invest",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一个很好的投资。",
        "pinyin": "Zhè shì yī gè hěn hǎo de tóu zī.",
        "english": "This is a very good investment."
      }
    ]
  },
  {
    "hanzi": "吐",
    "pinyin": "tù",
    "english": "Verb: to vomit",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "别吃太多, 不然你会吐的。",
        "pinyin": "Bié chī tài duō, bùrán nǐ huì tǔ de.",
        "english": "Don't eat too much, otherwise you will vomit."
      }
    ]
  },
  {
    "hanzi": "突出",
    "pinyin": "tū chū",
    "english": "Adjective: outstanding",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的表现很突出。",
        "pinyin": "Tā de biǎoxiàn hěn tūchū.",
        "english": "His performance is very outstanding."
      }
    ]
  },
  {
    "hanzi": "土地",
    "pinyin": "tǔ dì",
    "english": "Noun: land, soil, territory",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这片土地很适合种菜。",
        "pinyin": "Zhè piàn tǔdì hěn shìhé zhòng cài.",
        "english": "This piece of land is very suitable for growing vegetables."
      }
    ]
  },
  {
    "hanzi": "土豆",
    "pinyin": "tǔ dòu",
    "english": "Noun: potato",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢吃土豆。",
        "pinyin": "Wǒ xǐhuān chī tǔdòu.",
        "english": "I like eating potatoes."
      }
    ]
  },
  {
    "hanzi": "兔子",
    "pinyin": "tù zi",
    "english": "Noun: rabbit",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "兔子喜欢吃胡萝卜。",
        "pinyin": "Tùzi xǐhuan chī húluóbo.",
        "english": "Rabbits like to eat carrots."
      }
    ]
  },
  {
    "hanzi": "团",
    "pinyin": "tuán",
    "english": "Noun: group, regiment Measure Word: for ball-like things",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们是一个旅游团。",
        "pinyin": "Wǒmen shì yīgè lǚyóu tuán.",
        "english": "We are a tourist group."
      }
    ]
  },
  {
    "hanzi": "退",
    "pinyin": "tuì",
    "english": "Verb: to return, to decline, to withdraw",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请往后退一步。",
        "pinyin": "Qǐng wǎng hòu tuì yī bù.",
        "english": "Please step back one pace."
      }
    ]
  },
  {
    "hanzi": "退步",
    "pinyin": "tuì bù",
    "english": " Noun: regression Verb: to regress, to fall behind, to go backward",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的中文最近退步了。",
        "pinyin": "Wǒ de Zhōngwén zuìjìn tuìbù le.",
        "english": "My Chinese level has recently regressed."
      }
    ]
  },
  {
    "hanzi": "推辞",
    "pinyin": "tuī cí",
    "english": "Verb: to decline, to turn down",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他推辞了我的邀请。",
        "pinyin": "Tā tuīcíle wǒ de yāoqǐng.",
        "english": "He declined my invitation."
      }
    ]
  },
  {
    "hanzi": "推广",
    "pinyin": "tuī guǎng",
    "english": "Verb: to spread, to popularize",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这种方法值得推广。",
        "pinyin": "Zhè zhǒng fāngfǎ zhíde tuīguǎng.",
        "english": "This method is worth promoting."
      }
    ]
  },
  {
    "hanzi": "推荐",
    "pinyin": "tuī jiàn",
    "english": "Noun: recommendation Verb: to recommend",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我推荐这家饭馆。",
        "pinyin": "Wǒ tuījiàn zhè jiā fànguǎn.",
        "english": "I recommend this restaurant."
      }
    ]
  },
  {
    "hanzi": "退休",
    "pinyin": "tuì xiū",
    "english": "Noun: retirement Verb: to retire",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我爸爸明年就要退休了。",
        "pinyin": "Wǒ bàba míngnián jiù yào tuìxiū le.",
        "english": "My father is going to retire next year."
      }
    ]
  },
  {
    "hanzi": "歪",
    "pinyin": "wāi",
    "english": "Adjective: crooked, devious",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你的画挂歪了。",
        "pinyin": "Nǐ de huà guà wāile.",
        "english": "Your painting is hung crookedly."
      }
    ]
  },
  {
    "hanzi": "外交",
    "pinyin": "wài jiāo",
    "english": "Noun: diplomacy, foreign affairs",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他毕业后想从事外交工作。",
        "pinyin": "Tā bìyè hòu xiǎng cóngshì wàijiāo gōngzuò.",
        "english": "He wants to engage in foreign affairs work after graduation."
      }
    ]
  },
  {
    "hanzi": "弯",
    "pinyin": "wān",
    "english": "Noun: a curve Verb: to bend, to curve Adjective: bent, curved",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他弯下腰，系鞋带。",
        "pinyin": "Tā wān xià yāo, jì xié dài.",
        "english": "He bent down to tie his shoelaces."
      }
    ]
  },
  {
    "hanzi": "玩具",
    "pinyin": "wán jù",
    "english": "Noun: toy",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "弟弟喜欢玩玩具。",
        "pinyin": "Dìdi xǐhuan wán wánjù.",
        "english": "My younger brother likes playing with toys."
      }
    ]
  },
  {
    "hanzi": "完美",
    "pinyin": "wán měi",
    "english": "Adjective: perfect",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一个完美的计划。",
        "pinyin": "Zhè shì yīgè wánměi de jìhuà.",
        "english": "This is a perfect plan."
      }
    ]
  },
  {
    "hanzi": "完善",
    "pinyin": "wán shàn",
    "english": " Verb: to improve, to make perfect Adjective: perfect 万一 ",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们需要完善这个系统。",
        "pinyin": "Wǒmen xūyào wánshàn zhège xìtǒng.",
        "english": "We need to improve this system."
      }
    ]
  },
  {
    "hanzi": "汉字",
    "pinyin": "wàn yī",
    "english": "Noun: contingency Conjunction: in case",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我会写很多汉字。",
        "pinyin": "Wǒ huì xiě hěn duō Hànzì.",
        "english": "I can write many Chinese characters."
      }
    ]
  },
  {
    "hanzi": "完整",
    "pinyin": "wán zhěng",
    "english": "Adjective: complete, intact",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们需要一个完整的计划。",
        "pinyin": "Wǒmen xūyào yīgè wánzhěng de jìhuà.",
        "english": "We need a complete plan."
      }
    ]
  },
  {
    "hanzi": "往返",
    "pinyin": "wǎng fǎn",
    "english": "Adverb: back and forth, to and from",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "往返需要三个小时。",
        "pinyin": "Wǎngfǎn xūyào sān gè xiǎoshí.",
        "english": "The round trip requires three hours."
      }
    ]
  },
  {
    "hanzi": "王子",
    "pinyin": "wáng zǐ",
    "english": "Noun: prince",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "王子非常英俊。",
        "pinyin": "Wángzǐ fēicháng yīngjùn.",
        "english": "The prince is extremely handsome."
      }
    ]
  },
  {
    "hanzi": "胃",
    "pinyin": "wèi",
    "english": "Noun: stomach",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我胃有点儿不舒服。",
        "pinyin": "Wǒ wèi yǒudiǎnr bù shūfú.",
        "english": "My stomach is a little uncomfortable."
      }
    ]
  },
  {
    "hanzi": "尾巴",
    "pinyin": "wěi ba",
    "english": "Noun: tail",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "狗摇尾巴。",
        "pinyin": "Gǒu yáo wěibā.",
        "english": "The dog wags its tail."
      }
    ]
  },
  {
    "hanzi": "未必",
    "pinyin": "wèi bì",
    "english": "Adverb: not necessarily",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "便宜的商品，质量未必差。",
        "pinyin": "Piányi de shāngpǐn, zhìliàng wèi bì chà.",
        "english": "Cheap goods are not necessarily of poor quality."
      }
    ]
  },
  {
    "hanzi": "伟大",
    "pinyin": "wěi dà",
    "english": "Adjective: great, mighty",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "母爱是伟大的。",
        "pinyin": "Mǔ'ài shì wěidà de.",
        "english": "Maternal love is great."
      }
    ]
  },
  {
    "hanzi": "违反",
    "pinyin": "wéi fǎn",
    "english": "Verb: to violate law",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们不能违反法律。",
        "pinyin": "Wǒmen bù néng wéifǎn fǎlǜ.",
        "english": "We must not violate the law."
      }
    ]
  },
  {
    "hanzi": "危害",
    "pinyin": "wēi hài",
    "english": "Noun: endangerment Verb: to endanger, to harm",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "吸烟危害健康。",
        "pinyin": "Xīyān wēihài jiànkāng.",
        "english": "Smoking harms health."
      }
    ]
  },
  {
    "hanzi": "维护",
    "pinyin": "wéi hù",
    "english": "Verb: to defend, to safeguard, to maintain",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "电脑需要定期维护。",
        "pinyin": "Diànnǎo xūyào dìngqī wéihù.",
        "english": "The computer needs regular maintenance."
      }
    ]
  },
  {
    "hanzi": "围巾",
    "pinyin": "wéi jīn",
    "english": "Noun: scarf",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这条围巾很暖和。",
        "pinyin": "Zhè tiáo wéijīn hěn nuǎnhuo.",
        "english": "This scarf is very warm."
      }
    ]
  },
  {
    "hanzi": "未来",
    "pinyin": "wèi lái",
    "english": "Noun: future",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们的未来会更好。",
        "pinyin": "Wǒmen de wèilái huì gèng hǎo.",
        "english": "Our future will be better."
      }
    ]
  },
  {
    "hanzi": "委屈",
    "pinyin": "wěi qu",
    "english": "Verb: to feel wronged",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他觉得很委屈。",
        "pinyin": "Tā juéde hěn wěiqu.",
        "english": "He felt very wronged."
      }
    ]
  },
  {
    "hanzi": "围绕",
    "pinyin": "wéi rào",
    "english": "Verb: to revolve around, to surround",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "大家围绕着桌子坐下。",
        "pinyin": "Dàjiā wéirǎozhe zhuōzi zuò xià.",
        "english": "Everyone sat down around the table."
      }
    ]
  },
  {
    "hanzi": "委托",
    "pinyin": "wěi tuō",
    "english": "Verb: to entrust, to commission, to consign",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他委托我买票。",
        "pinyin": "Tā wěituō wǒ mǎi piào.",
        "english": "He commissioned me to buy tickets."
      }
    ]
  },
  {
    "hanzi": "微笑",
    "pinyin": "wēi xiào",
    "english": "Noun: smile Verb: to smile",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她的微笑很甜。",
        "pinyin": "Tā de wēixiào hěn tián.",
        "english": "Her smile is very sweet."
      }
    ]
  },
  {
    "hanzi": "威胁",
    "pinyin": "wēi xié",
    "english": "Noun: threat, menace Verb: to threaten, to menace",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你不能用暴力威胁他人。",
        "pinyin": "Nǐ bù néng yòng bàolì wēixié tā rén.",
        "english": "You cannot threaten other people with violence."
      }
    ]
  },
  {
    "hanzi": "唯一",
    "pinyin": "wéi yī",
    "english": "Adverb: only, sole",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是唯一的方法。",
        "pinyin": "Zhè shì wéiyī de fāngfǎ.",
        "english": "This is the only method."
      }
    ]
  },
  {
    "hanzi": "位置",
    "pinyin": "wèi zhì",
    "english": "Noun: position, place",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一个好位置。",
        "pinyin": "Zhè shì yī gè hǎo wèizhì.",
        "english": "This is a good position (or spot)."
      }
    ]
  },
  {
    "hanzi": "闻",
    "pinyin": "wén",
    "english": "Verb: to hear, to smell",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我闻到一股香味。",
        "pinyin": "Wǒ wéndào yī gǔ xiāngwèi.",
        "english": "I smelled a burst of fragrance."
      }
    ]
  },
  {
    "hanzi": "吻",
    "pinyin": "wěn",
    "english": "Noun: kiss Verb: to kiss",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "给我一个告别吻。",
        "pinyin": "Gěi wǒ yī ge gàobié wěn.",
        "english": "Give me a farewell kiss."
      }
    ]
  },
  {
    "hanzi": "稳定",
    "pinyin": "wěn dìng",
    "english": "Noun: stability Verb: to stabalize Adjective: steady, stable",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的工作很稳定。",
        "pinyin": "Tā de gōngzuò hěn wěndìng.",
        "english": "His job is very stable."
      }
    ]
  },
  {
    "hanzi": "问候",
    "pinyin": "wèn hòu",
    "english": "Verb: to send a greeting",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请代我问候你的父母。",
        "pinyin": "Qǐng dài wǒ wènhòu nǐ de fùmǔ.",
        "english": "Please convey my greetings to your parents."
      }
    ]
  },
  {
    "hanzi": "文件",
    "pinyin": "wén jiàn",
    "english": "Noun: document, file",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个文件很重要，你读了吗？",
        "pinyin": "Zhège wénjiàn hěn zhòngyào, nǐ dúle ma?",
        "english": "This document is very important, have you read it?"
      }
    ]
  },
  {
    "hanzi": "文具",
    "pinyin": "wén jù",
    "english": "Noun: stationery, writing materials",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我需要去买一些文具。",
        "pinyin": "Wǒ xūyào qù mǎi yīxiē wénjù.",
        "english": "I need to go buy some stationery."
      }
    ]
  },
  {
    "hanzi": "文明",
    "pinyin": "wén míng",
    "english": "Noun: civilization, culture Adjective: civilized",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们出门旅行要文明。",
        "pinyin": "Wǒmen chūmén lǚxíng yào wénmíng.",
        "english": "We must be civilized (polite) when we travel."
      }
    ]
  },
  {
    "hanzi": "温暖",
    "pinyin": "wēn nuǎn",
    "english": "Adjective: warm",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的笑容很温暖。",
        "pinyin": "Tā de xiàoróng hěn wēnnuǎn.",
        "english": "His smile is very warm."
      }
    ]
  },
  {
    "hanzi": "温柔",
    "pinyin": "wēn róu",
    "english": "Adjective: gentle, soft, tender",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她的声音非常温柔。",
        "pinyin": "Tā de shēngyīn fēicháng wēnróu.",
        "english": "Her voice is extremely gentle."
      }
    ]
  },
  {
    "hanzi": "文学",
    "pinyin": "wén xué",
    "english": "Noun: literature",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她喜欢读外国文学。",
        "pinyin": "Tā xǐhuān dú wàiguó wénxué.",
        "english": "She likes reading foreign literature."
      }
    ]
  },
  {
    "hanzi": "卧室",
    "pinyin": "wò shì",
    "english": "Noun: bedroom",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是我的卧室。",
        "pinyin": "Zhè shì wǒ de wòshì.",
        "english": "This is my bedroom."
      }
    ]
  },
  {
    "hanzi": "雾",
    "pinyin": "wù",
    "english": "Noun: fog",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "今天早上有很大的雾。",
        "pinyin": "Jīntiān zǎoshang yǒu hěn dà de wù.",
        "english": "There was very thick fog this morning."
      }
    ]
  },
  {
    "hanzi": "物理",
    "pinyin": "wù lǐ",
    "english": "Noun: physics",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢物理。",
        "pinyin": "Wǒ xǐhuān wùlǐ.",
        "english": "I like physics."
      }
    ]
  },
  {
    "hanzi": "无奈",
    "pinyin": "wú nài",
    "english": "Verb: to have no choice",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "事情已经发生，我们也只能无奈接受。",
        "pinyin": "Shìqing yǐjīng fāshēng, wǒmen yě zhǐ néng wúnài jiēshòu.",
        "english": "The matter has already happened, and we can only helplessly accept it."
      }
    ]
  },
  {
    "hanzi": "武器",
    "pinyin": "wǔ qì",
    "english": "Noun: weapon, arms",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这种武器是非法的。",
        "pinyin": "Zhè zhǒng wǔqì shì fēifǎ de.",
        "english": "This type of weapon is illegal."
      }
    ]
  },
  {
    "hanzi": "无数",
    "pinyin": "wú shù",
    "english": "Adjective: countless, innumerable",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他获得了无数奖项。",
        "pinyin": "Tā huòdéle wúshù jiǎngxiàng.",
        "english": "He has won countless awards."
      }
    ]
  },
  {
    "hanzi": "武术",
    "pinyin": "wǔ shù",
    "english": "Noun: martial arts",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢看武术表演。",
        "pinyin": "Wǒ xǐhuān kàn wǔshù biǎoyǎn.",
        "english": "I like watching martial arts performances."
      }
    ]
  },
  {
    "hanzi": "物质",
    "pinyin": "wù zhì",
    "english": "Noun: matter, substance, material",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "水是一种无色无味的物质。",
        "pinyin": "Shuǐ shì yī zhǒng wú sè wú wèi de wù zhì.",
        "english": "Water is a colorless and odorless substance."
      }
    ]
  },
  {
    "hanzi": "屋子",
    "pinyin": "wū zi",
    "english": "Noun: room, house",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这间屋子很干净。",
        "pinyin": "Zhè jiān wūzi hěn gānjìng.",
        "english": "This room is very clean."
      }
    ]
  },
  {
    "hanzi": "戏剧",
    "pinyin": "xì jù",
    "english": "Noun: drama, play, theater",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢看戏剧。",
        "pinyin": "Wǒ xǐhuān kàn xìjù.",
        "english": "I like watching drama/plays."
      }
    ]
  },
  {
    "hanzi": "吸收",
    "pinyin": "xī shōu",
    "english": "Verb: to absorb, to soak up, to assimilate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他很快就吸收了新的知识。",
        "pinyin": "Tā hěn kuài jiù xīshōu le xīn de zhīshi.",
        "english": "He quickly absorbed the new knowledge."
      }
    ]
  },
  {
    "hanzi": "吓",
    "pinyin": "xià",
    "english": "Verb: to frighten, to scare",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我吓死了。",
        "pinyin": "Wǒ xià sǐ le.",
        "english": "I was scared to death."
      }
    ]
  },
  {
    "hanzi": "县",
    "pinyin": "xiàn",
    "english": "Noun: county",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的家乡在一个小县。",
        "pinyin": "Wǒ de jiāxiāng zài yīgè xiǎo xiàn.",
        "english": "My hometown is in a small county."
      }
    ]
  },
  {
    "hanzi": "显得",
    "pinyin": "xiǎn de",
    "english": "Verb: to seem, to look, to appear",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她今天显得很累。",
        "pinyin": "Tā jīntiān xiǎnde hěn lèi.",
        "english": "She seems very tired today."
      }
    ]
  },
  {
    "hanzi": "现金",
    "pinyin": "xiàn jīn",
    "english": "Noun: cash",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这里只收现金。",
        "pinyin": "Zhèlǐ zhǐ shōu xiànjīn.",
        "english": "We only accept cash here."
      }
    ]
  },
  {
    "hanzi": "显然",
    "pinyin": "xiǎn rán",
    "english": "Adjective: clear, evident",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个答案显然不对。",
        "pinyin": "Zhège dá'àn xiǎnrán bù duì.",
        "english": "This answer is obviously incorrect."
      }
    ]
  },
  {
    "hanzi": "现实",
    "pinyin": "xiàn shí",
    "english": "Noun: reality, actuality Adjective: real, actual",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们必须面对现实。",
        "pinyin": "Wǒmen bìxū miànduì xiànshí.",
        "english": "We must face reality."
      }
    ]
  },
  {
    "hanzi": "显示",
    "pinyin": "xiǎn shì",
    "english": "Noun: Display Verb: to show, to display, to demonstrate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "屏幕上显示着当前时间。",
        "pinyin": "Píngmù shang xiǎnshìzhe dāngqián shíjiān.",
        "english": "The screen is displaying the current time."
      }
    ]
  },
  {
    "hanzi": "现象",
    "pinyin": "xiàn xiàng",
    "english": "Noun: appearance, phenomenon",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一个常见的现象。",
        "pinyin": "Zhè shì yīgè chángjiàn de xiànxiàng.",
        "english": "This is a common phenomenon."
      }
    ]
  },
  {
    "hanzi": "鲜艳",
    "pinyin": "xiān yàn",
    "english": "Adjective: bright-coloured, colourful",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她喜欢鲜艳的红色。",
        "pinyin": "Tā xǐhuān xiānyàn de hóngsè.",
        "english": "She likes bright red."
      }
    ]
  },
  {
    "hanzi": "项链",
    "pinyin": "xiàng liàn",
    "english": "Noun: necklace",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我买了一条漂亮的项链。",
        "pinyin": "Wǒ mǎi le yī tiáo piàoliang de xiàngliàn.",
        "english": "I bought a beautiful necklace."
      }
    ]
  },
  {
    "hanzi": "项目",
    "pinyin": "xiàng mù",
    "english": "Noun: item, project, sports event",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个项目很重要。",
        "pinyin": "Zhège xiàngmù hěn zhòngyào.",
        "english": "This project is very important."
      }
    ]
  },
  {
    "hanzi": "想念",
    "pinyin": "xiǎng niàn",
    "english": "Verb: to miss, to remember with longing",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我很想念我的家乡。",
        "pinyin": "Wǒ hěn xiǎngniàn wǒ de jiāxiāng.",
        "english": "I miss my hometown very much."
      }
    ]
  },
  {
    "hanzi": "橡皮",
    "pinyin": "xiàng pí",
    "english": "Noun: rubber, eraser",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的橡皮不见了。",
        "pinyin": "Wǒ de xiàngpí bù jiànle.",
        "english": "My eraser is missing."
      }
    ]
  },
  {
    "hanzi": "象棋",
    "pinyin": "xiàng qí",
    "english": "Noun: Chinese chess",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们来下象棋吧。",
        "pinyin": "Wǒmen lái xià xiàngqí ba.",
        "english": "Let's play Chinese chess."
      }
    ]
  },
  {
    "hanzi": "想象",
    "pinyin": "xiǎng xiàng",
    "english": "Noun: imagination Verb: to imagine, to visualize",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我无法想象没有手机的日子。",
        "pinyin": "Wǒ wúfǎ xiǎngxiàng méiyǒu shǒujī de rìzi.",
        "english": "I cannot imagine a day without a cell phone."
      }
    ]
  },
  {
    "hanzi": "小麦",
    "pinyin": "xiǎo mài",
    "english": "Noun: wheat",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "小麦是制作面粉的主要原料。",
        "pinyin": "Xiǎomài shì zhìzuò miànfěn de zhǔyào yuánliào.",
        "english": "Wheat is the main raw material for making flour."
      }
    ]
  },
  {
    "hanzi": "消灭",
    "pinyin": "xiāo miè",
    "english": "Noun: annihilation Verb: to eliminate, to perish",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "农民正在消灭害虫。",
        "pinyin": "Nóngmín zhèngzài xiāomiè hàichóng.",
        "english": "The farmers are eliminating the pests."
      }
    ]
  },
  {
    "hanzi": "小气",
    "pinyin": "xiǎo qi",
    "english": "Adjective: stingy, petty, miserly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你不要这么小气。",
        "pinyin": "Nǐ bú yào zhème xiǎoqì.",
        "english": "Don't be so stingy/petty."
      }
    ]
  },
  {
    "hanzi": "消失",
    "pinyin": "xiāo shī",
    "english": "Verb: to disappear, to fade away",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "雾很快就消失了。",
        "pinyin": "Wù hěn kuài jiù xiāoshī le.",
        "english": "The fog quickly disappeared."
      }
    ]
  },
  {
    "hanzi": "孝顺",
    "pinyin": "xiào shun",
    "english": "Verb: to be obedient to one's parents",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她对父母很孝顺。",
        "pinyin": "Tā duì fùmǔ hěn xiàoshùn.",
        "english": "She is very dutiful towards her parents."
      }
    ]
  },
  {
    "hanzi": "小偷",
    "pinyin": "xiǎo tōu",
    "english": "Noun: thief",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "小心小偷。",
        "pinyin": "Xiǎoxīn xiǎo tōu.",
        "english": "Watch out for the thief."
      }
    ]
  },
  {
    "hanzi": "协调",
    "pinyin": "xié tiáo",
    "english": "Verb: to coordinate, to harmonize",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的动作很协调。",
        "pinyin": "Tā de dòngzuò hěn xiétiáo.",
        "english": "His movements are very coordinated."
      }
    ]
  },
  {
    "hanzi": "信号",
    "pinyin": "xìn hào",
    "english": "Noun: signal",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这里的信号很弱。",
        "pinyin": "Zhèlǐ de xìnghào hěn ruò.",
        "english": "The signal here is very weak."
      }
    ]
  },
  {
    "hanzi": "心理",
    "pinyin": "xīn lǐ",
    "english": "Noun: psychology, mentality Adjective: psychological, menatl",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他需要专业的心理辅导。",
        "pinyin": "Tā xūyào zhuānyè de xīnlǐ fǔdǎo.",
        "english": "He needs professional psychological counseling."
      }
    ]
  },
  {
    "hanzi": "欣赏",
    "pinyin": "xīn shǎng",
    "english": "Verb: to enjoy, to appreciate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他很欣赏古典音乐。",
        "pinyin": "Tā hěn xīnshǎng gǔdiǎn yīnyuè.",
        "english": "He really appreciates classical music."
      }
    ]
  },
  {
    "hanzi": "心脏",
    "pinyin": "xīn zàng",
    "english": "Noun: heart",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的心脏跳得很快。",
        "pinyin": "Wǒ de xīnzàng tiào de hěn kuài.",
        "english": "My heart is beating very fast."
      }
    ]
  },
  {
    "hanzi": "形成",
    "pinyin": "xíng chéng",
    "english": "Verb: to form, to take shape",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这需要时间才能形成习惯。",
        "pinyin": "Zhè xūyào shíjiān cáinéng xíngchéng xíguàn.",
        "english": "This requires time in order to form a habit."
      }
    ]
  },
  {
    "hanzi": "行动",
    "pinyin": "xíng dòng",
    "english": "Noun: action, operation Verb: to move, to act",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他马上行动了。",
        "pinyin": "Tā mǎshàng xíngdòng le.",
        "english": "He immediately took action."
      }
    ]
  },
  {
    "hanzi": "幸亏",
    "pinyin": "xìng kuī",
    "english": "Adverb: furtunately, luckily",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "幸亏我早出门了，不然会迟到。",
        "pinyin": "Xìngkuī wǒ zǎo chūménle, bùrán huì chídào.",
        "english": "Fortunately, I left early, or I would have been late."
      }
    ]
  },
  {
    "hanzi": "行人",
    "pinyin": "xíng rén",
    "english": "Noun: pedestrian",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这里的行人很多。",
        "pinyin": "Zhèlǐ de xíngrén hěn duō.",
        "english": "There are many pedestrians here."
      }
    ]
  },
  {
    "hanzi": "形容",
    "pinyin": "xíng róng",
    "english": "Noun: description Verb: to describe",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的表情很难形容。",
        "pinyin": "Tā de biǎoqíng hěn nán xíngróng.",
        "english": "His expression is difficult to describe."
      }
    ]
  },
  {
    "hanzi": "形势",
    "pinyin": "xíng shì",
    "english": "Noun: situation, circumstances, terrain",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "形势正在好转。",
        "pinyin": "Xíngshì zhèngzài hǎozhuǎn.",
        "english": "The situation is improving."
      }
    ]
  },
  {
    "hanzi": "形式",
    "pinyin": "xíng shì",
    "english": "Noun: form, shape",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们改变了会议的形式。",
        "pinyin": "Wǒmen gǎibiànle huìyì de xíngshì.",
        "english": "We changed the format of the meeting."
      }
    ]
  },
  {
    "hanzi": "行为",
    "pinyin": "xíng wéi",
    "english": "Noun: action, conduct, behaviour, activity",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的行为很奇怪。",
        "pinyin": "Tā de xíngwéi hěn qíguài.",
        "english": "His behavior is very strange."
      }
    ]
  },
  {
    "hanzi": "形象",
    "pinyin": "xíng xiàng",
    "english": "Noun: image, appearance, figure",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她的形象很专业。",
        "pinyin": "Tā de xíngxiàng hěn zhuānyè.",
        "english": "Her image is very professional."
      }
    ]
  },
  {
    "hanzi": "幸运",
    "pinyin": "xìng yùn",
    "english": "Noun: luck, fortune Adjective: lucky, fortunate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我觉得自己很幸运。",
        "pinyin": "Wǒ juéde zìjǐ hěn xìngyùn.",
        "english": "I feel very lucky."
      }
    ]
  },
  {
    "hanzi": "性质",
    "pinyin": "xìng zhì",
    "english": "Noun: nature, character",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们的工作性质不同。",
        "pinyin": "Tāmen de gōngzuò xìngzhì bù tóng.",
        "english": "The nature of their work is different."
      }
    ]
  },
  {
    "hanzi": "形状",
    "pinyin": "xíng zhuàng",
    "english": "Noun: form, shape",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢这辆车的形状。",
        "pinyin": "Wǒ xǐhuan zhè liàng chē de xíngzhuàng.",
        "english": "I like the shape of this car."
      }
    ]
  },
  {
    "hanzi": "胸",
    "pinyin": "xiōng",
    "english": "Noun: chest",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的胸很壮。",
        "pinyin": "Tā de xiōng hěn zhuàng.",
        "english": "His chest is very strong."
      }
    ]
  },
  {
    "hanzi": "兄弟",
    "pinyin": "xiōng dì",
    "english": "Noun: brothers",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他有两个兄弟。",
        "pinyin": "Tā yǒu liǎng gè xiōngdì.",
        "english": "He has two brothers."
      }
    ]
  },
  {
    "hanzi": "雄伟",
    "pinyin": "xióng wěi",
    "english": "Adjective: grand, magnificent",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这座山看起来非常雄伟。",
        "pinyin": "Zhè zuò shān kàn qǐlái fēicháng xióngwěi.",
        "english": "This mountain looks extremely magnificent."
      }
    ]
  },
  {
    "hanzi": "修改",
    "pinyin": "xiū gǎi",
    "english": "Noun: modification Verb: to modify, to amend, to revise",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "老师要求我修改作文。",
        "pinyin": "Lǎoshī yāoqiú wǒ xiūgǎi zuòwén.",
        "english": "The teacher asked me to revise my essay."
      }
    ]
  },
  {
    "hanzi": "休闲",
    "pinyin": "xiū xián",
    "english": "Noun: leisure",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢在周末做一些休闲活动。",
        "pinyin": "Wǒ xǐhuān zài zhōumò zuò yīxiē xiūxián huódòng.",
        "english": "I like to do some leisure activities on the weekend."
      }
    ]
  },
  {
    "hanzi": "叙述",
    "pinyin": "xù shù",
    "english": "Noun: narration Verb: to tell, to relate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你能叙述一下细节吗？",
        "pinyin": "Nǐ néng xùshù yīxià xìjié ma?",
        "english": "Can you relate the details?"
      }
    ]
  },
  {
    "hanzi": "虚心",
    "pinyin": "xū xīn",
    "english": "Adjective: modest",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们要虚心学习。",
        "pinyin": "Wǒmen yào xūxīn xuéxí.",
        "english": "We must study with an open mind."
      }
    ]
  },
  {
    "hanzi": "宣布",
    "pinyin": "xuān bù",
    "english": "Verb: to declare, to announce",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "公司宣布了新的规定。",
        "pinyin": "Gōngsī xuānbùle xīn de guīdìng.",
        "english": "The company announced new regulations."
      }
    ]
  },
  {
    "hanzi": "学术",
    "pinyin": "xué shù",
    "english": "Noun: learning, science",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他喜欢研究学术问题。",
        "pinyin": "Tā xǐhuān yánjiū xuéshù wèntí.",
        "english": "He likes to research academic questions."
      }
    ]
  },
  {
    "hanzi": "训练",
    "pinyin": "xùn liàn",
    "english": "Noun: training Verb: to train, to drill",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "运动员每天都要训练。",
        "pinyin": "Yùndòngyuán měi tiān dōu yào xùnliàn.",
        "english": "Athletes must train every day."
      }
    ]
  },
  {
    "hanzi": "询问",
    "pinyin": "xún wèn",
    "english": "Verb: to inquire",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你可以询问工作人员。",
        "pinyin": "Nǐ kěyǐ xúnwèn gōngzuò rényuán.",
        "english": "You can inquire with the staff."
      }
    ]
  },
  {
    "hanzi": "寻找",
    "pinyin": "xún zhǎo",
    "english": "Verb: to seek, to look for",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他在寻找解决问题的方法。",
        "pinyin": "Tā zài xúnzhǎo jiějué wèntí de fāngfǎ.",
        "english": "He is looking for a way to solve the problem."
      }
    ]
  },
  {
    "hanzi": "痒",
    "pinyin": "yǎng",
    "english": "Verb: to itch, to tickle",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的皮肤很痒。",
        "pinyin": "Wǒ de pífū hěn yǎng.",
        "english": "My skin is very itchy."
      }
    ]
  },
  {
    "hanzi": "样式",
    "pinyin": "yàng shì",
    "english": "Noun: type, style, pattern",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢这个手机的样式。",
        "pinyin": "Wǒ xǐhuān zhège shǒujī de yàngshì.",
        "english": "I like the style of this cell phone."
      }
    ]
  },
  {
    "hanzi": "阳台",
    "pinyin": "yáng tái",
    "english": "Noun: balcony",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "阳台上有花。",
        "pinyin": "Yángtái shang yǒu huā.",
        "english": "There are flowers on the balcony."
      }
    ]
  },
  {
    "hanzi": "咬",
    "pinyin": "yǎo",
    "english": "Verb: to bite",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "小心，狗会咬人。",
        "pinyin": "Xiǎoxīn, gǒu huì yǎo rén.",
        "english": "Be careful, the dog might bite."
      }
    ]
  },
  {
    "hanzi": "要不",
    "pinyin": "yào bù",
    "english": "Conjunction: otherwise",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "快点，要不我们会迟到的。",
        "pinyin": "Kuài diǎn, yàobù wǒmen huì chídào de.",
        "english": "Hurry up, otherwise we will be late."
      }
    ]
  },
  {
    "hanzi": "液体",
    "pinyin": "yè tǐ",
    "english": "Noun: liquid",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "水是一种液体。",
        "pinyin": "Shuǐ shì yī zhǒng yè tǐ.",
        "english": "Water is a type of liquid."
      }
    ]
  },
  {
    "hanzi": "业余",
    "pinyin": "yè yú",
    "english": "Noun: spare time Adjective: amateur",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他利用业余时间学习编程。",
        "pinyin": "Tā lìyòng yèyú shíjiān xuéxí biānchéng.",
        "english": "He uses his spare time to study programming."
      }
    ]
  },
  {
    "hanzi": "一辈子",
    "pinyin": "yí bèi zi",
    "english": "Noun: a lifetime",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们是一辈子的好朋友。",
        "pinyin": "Wǒmen shì yībèizi de hǎo péngyou.",
        "english": "We are lifelong good friends."
      }
    ]
  },
  {
    "hanzi": "一旦",
    "pinyin": "yí dàn",
    "english": "Time: in one day Conjunction: in case, if, once",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "一旦决定了，就不要后悔。",
        "pinyin": "Yídàn juédìng le, jiù bùyào hòuhuǐ.",
        "english": "Once you decide, don't regret it."
      }
    ]
  },
  {
    "hanzi": "一路平安",
    "pinyin": "yí lù píng ān",
    "english": "Expression: have a save trip!",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "祝你一路平安！",
        "pinyin": "Zhù nǐ yī lù píng ān!",
        "english": "I wish you a safe trip!"
      }
    ]
  },
  {
    "hanzi": "疑问",
    "pinyin": "yí wèn",
    "english": "Noun: question, doubt",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "大家对这个问题还有疑问吗？",
        "pinyin": "Dàjiā duì zhège wèntí hái yǒu yíwèn ma?",
        "english": "Does everyone still have questions about this issue?"
      }
    ]
  },
  {
    "hanzi": "意义",
    "pinyin": "yì yì",
    "english": "Noun: meaning, sense, significance",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "学习中文很有意义。",
        "pinyin": "Xuéxí Zhōngwén hěn yǒu yìyì.",
        "english": "Learning Chinese is very meaningful."
      }
    ]
  },
  {
    "hanzi": "一致",
    "pinyin": "yí zhì",
    "english": "Noun: agreement Adjective: identical, unanimous views, etc.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "大家的意见很一致。",
        "pinyin": "Dàjiā de yìjiàn hěn yīzhì.",
        "english": "Everyone's opinions are very consistent (or unanimous)."
      }
    ]
  },
  {
    "hanzi": "因而",
    "pinyin": "yīn ér",
    "english": "Conjunction: thus, as a result",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "天气突然变冷，因而我们取消了旅行。",
        "pinyin": "Tiānqì túrán biàn lěng, yīn'ér wǒmen qǔxiāole lǚxíng.",
        "english": "The weather suddenly turned cold, and as a result, we canceled the trip."
      }
    ]
  },
  {
    "hanzi": "硬币",
    "pinyin": "yìng bì",
    "english": "Noun: coin",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他把硬币放进了口袋。",
        "pinyin": "Tā bǎ yìngbì fàng jìnle kǒudài.",
        "english": "He put the coin into his pocket."
      }
    ]
  },
  {
    "hanzi": "应付",
    "pinyin": "yìng fu",
    "english": "Verb: to deal with, to cope with",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我能应付这个小问题。",
        "pinyin": "Wǒ néng yìngfù zhè ge xiǎo wèntí.",
        "english": "I can handle this small problem."
      }
    ]
  },
  {
    "hanzi": "硬件",
    "pinyin": "yìng jiàn",
    "english": "Noun: hardware",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们需要升级硬件。",
        "pinyin": "Wǒmen xūyào shēngjí yìngjiàn.",
        "english": "We need to upgrade the hardware."
      }
    ]
  },
  {
    "hanzi": "迎接",
    "pinyin": "yíng jiē",
    "english": "Verb: to greet, to welcome, to meet",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们去机场迎接她。",
        "pinyin": "Wǒmen qù jīchǎng yíngjiē tā.",
        "english": "We are going to the airport to welcome her."
      }
    ]
  },
  {
    "hanzi": "应聘",
    "pinyin": "yìng pìn",
    "english": "Verb: to apply for a job",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我昨天去应聘了。",
        "pinyin": "Wǒ zuótiān qù yìngpìn le.",
        "english": "I went to apply for the job yesterday."
      }
    ]
  },
  {
    "hanzi": "营养",
    "pinyin": "yíng yǎng",
    "english": "Noun: nutrition, nourishment",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "蔬菜很有营养。",
        "pinyin": "Shūcài hěn yǒu yíngyǎng.",
        "english": "Vegetables are very nutritious."
      }
    ]
  },
  {
    "hanzi": "营业",
    "pinyin": "yíng yè",
    "english": "Verb: to do business, to trade",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这家咖啡馆早上八点营业。",
        "pinyin": "Zhè jiā kāfēiguǎn zǎoshang bā diǎn yíngyè.",
        "english": "This cafe opens at 8 AM."
      }
    ]
  },
  {
    "hanzi": "应用",
    "pinyin": "yìng yòng",
    "english": " Noun: application Verb: to apply, to use",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我安装了一个新的应用。",
        "pinyin": "Wǒ ānzhuāngle yīgè xīn de yìngyòng.",
        "english": "I installed a new application (app)."
      }
    ]
  },
  {
    "hanzi": "影子",
    "pinyin": "yǐng zi",
    "english": "Noun: shadow",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我看到一个影子在墙上。",
        "pinyin": "Wǒ kàndào yīgè yǐngzi zài qiáng shàng.",
        "english": "I saw a shadow on the wall."
      }
    ]
  },
  {
    "hanzi": "拥挤",
    "pinyin": "yōng jǐ",
    "english": "Verb: to squeeze, to press Adjective: crowded",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "高峰时段的地铁非常拥挤。",
        "pinyin": "Gāofēng shíduàn de dìtiě fēicháng yǒngjǐ.",
        "english": "The subway during rush hour is extremely crowded."
      }
    ]
  },
  {
    "hanzi": "勇气",
    "pinyin": "yǒng qì",
    "english": "Noun: courage",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他需要勇气才能迈出第一步。",
        "pinyin": "Tā xūyào yǒngqì cái néng màichū dì yī bù.",
        "english": "He needs courage to take the first step."
      }
    ]
  },
  {
    "hanzi": "幼儿园",
    "pinyin": "yòu ér yuán",
    "english": "Noun: kintergarten, nursery school",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的孩子去幼儿园了。",
        "pinyin": "Wǒ de háizi qù yòu'éryuán le.",
        "english": "My child went to kindergarten."
      }
    ]
  },
  {
    "hanzi": "优惠",
    "pinyin": "yōu huì",
    "english": "Adjective: preferential, favourable",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这家店有优惠价格。",
        "pinyin": "Zhè jiā diàn yǒu yōuhuì jiàgé.",
        "english": "This store has preferential prices."
      }
    ]
  },
  {
    "hanzi": "悠久",
    "pinyin": "yōu jiǔ",
    "english": "Adjective: long, longstanding",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个城市的历史非常悠久。",
        "pinyin": "Zhège chéngshì de lìshǐ fēicháng yōujiǔ.",
        "english": "This city has a very long history."
      }
    ]
  },
  {
    "hanzi": "游览",
    "pinyin": "yóu lǎn",
    "english": "Verb: to visit, to go sightseeing",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们打算明天游览这个公园。",
        "pinyin": "Wǒmen dǎsuàn míngtiān yóulǎn zhège gōngyuán.",
        "english": "We plan to visit this park tomorrow."
      }
    ]
  },
  {
    "hanzi": "有利",
    "pinyin": "yǒu lì",
    "english": "Adjective: advantageous, beneficial",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "健康饮食对身体有利。",
        "pinyin": "Jiànkāng yǐnshí duì shēntǐ yǒulì.",
        "english": "Healthy eating is beneficial for the body."
      }
    ]
  },
  {
    "hanzi": "优美",
    "pinyin": "yōu měi",
    "english": "Adjective: fine, graceful",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她的舞姿非常优美。",
        "pinyin": "Tā de wǔzī fēicháng yōuměi.",
        "english": "Her dancing posture is extremely graceful."
      }
    ]
  },
  {
    "hanzi": "优势",
    "pinyin": "yōu shì",
    "english": "Noun: superiority, dominance, advantage",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "学习中文是你的优势。",
        "pinyin": "Xuéxí Zhōngwén shì nǐ de yōushì.",
        "english": "Learning Chinese is your advantage."
      }
    ]
  },
  {
    "hanzi": "犹豫",
    "pinyin": "yóu yù",
    "english": "Verb: to hesitate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "别犹豫，直接告诉我。",
        "pinyin": "Bié yóuyù, zhíjiē gàosù wǒ.",
        "english": "Don't hesitate, just tell me directly."
      }
    ]
  },
  {
    "hanzi": "预订",
    "pinyin": "yù dìng",
    "english": "Noun: booking Verb: to book, to subscribe for",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我想预订下周的机票。",
        "pinyin": "Wǒ xiǎng yùdìng xiàzhōu de jīpiào.",
        "english": "I want to book air tickets for next week."
      }
    ]
  },
  {
    "hanzi": "预防",
    "pinyin": "yù fáng",
    "english": "Noun: prevention, prophylaxis Verb: to prevent",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "多吃水果可以预防疾病。",
        "pinyin": "Duō chī shuǐguǒ kěyǐ yùfáng jíbìng.",
        "english": "Eating more fruit can prevent illness."
      }
    ]
  },
  {
    "hanzi": "玉米",
    "pinyin": "yù mǐ",
    "english": "Noun: corn, maize",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢吃玉米。",
        "pinyin": "Wǒ xǐhuān chī yùmǐ.",
        "english": "I like eating corn."
      }
    ]
  },
  {
    "hanzi": "宇宙",
    "pinyin": "yǔ zhòu",
    "english": "Noun: universe, cosmos",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "宇宙中有生命吗？",
        "pinyin": "Yǔzhòu zhōng yǒu shēngmìng ma?",
        "english": "Is there life in the universe?"
      }
    ]
  },
  {
    "hanzi": "原料",
    "pinyin": "yuán liào",
    "english": "Noun: raw material",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "生产这种产品需要哪些原料？",
        "pinyin": "Shēngchǎn zhè zhǒng chǎnpǐn xūyào nǎ xiē yuánliào?",
        "english": "What raw materials are needed to produce this product?"
      }
    ]
  },
  {
    "hanzi": "愿望",
    "pinyin": "yuàn wàng",
    "english": "Noun: desire, wish",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的生日愿望是健康快乐。",
        "pinyin": "Wǒ de shēngrì yuànwàng shì jiànkāng kuàilè.",
        "english": "My birthday wish is to be healthy and happy."
      }
    ]
  },
  {
    "hanzi": "运气",
    "pinyin": "yùn qi",
    "english": "Noun: luck, fate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的运气很好。",
        "pinyin": "Wǒ de yùnqi hěn hǎo.",
        "english": "My luck is very good."
      }
    ]
  },
  {
    "hanzi": "运输",
    "pinyin": "yùn shū",
    "english": "Noun: transport Verb: to transport",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "海上运输成本较低。",
        "pinyin": "Hǎishàng yùnshū chéngběn jiào dī.",
        "english": "Sea transport costs are relatively low."
      }
    ]
  },
  {
    "hanzi": "运用",
    "pinyin": "yùn yòng",
    "english": "Verb: to use, to utilize",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们必须学会运用这个工具。",
        "pinyin": "Wǒmen bìxū xuéhuì yùnyòng zhège gōngjù.",
        "english": "We must learn how to utilize this tool."
      }
    ]
  },
  {
    "hanzi": "灾害",
    "pinyin": "zāi hài",
    "english": "Noun: calamity, disaster",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "地震是一种自然灾害。",
        "pinyin": "Dìzhèn shì yī zhǒng zìrán zāihài.",
        "english": "An earthquake is a type of natural disaster."
      }
    ]
  },
  {
    "hanzi": "赞成",
    "pinyin": "zàn chéng",
    "english": "Verb: to approve of, to agree with",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我赞成这个计划。",
        "pinyin": "Wǒ zànchéng zhège jìhuà.",
        "english": "I approve of this plan."
      }
    ]
  },
  {
    "hanzi": "赞美",
    "pinyin": "zàn měi",
    "english": "Noun: applause, praise Verb: to praise, to admire",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "老师赞美了我的画。",
        "pinyin": "Lǎoshī zànměile wǒ de huà.",
        "english": "The teacher praised my drawing."
      }
    ]
  },
  {
    "hanzi": "造成",
    "pinyin": "zào chéng",
    "english": "Verb: to bring about, to create, to cause",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的错误造成了很大的麻烦。",
        "pinyin": "Tā de cuò wù zào chéng le hěn dà de má fán.",
        "english": "His mistake caused a lot of trouble."
      }
    ]
  },
  {
    "hanzi": "糟糕",
    "pinyin": "zāo gāo",
    "english": "Adjective: terrible, bad",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "糟糕，我迟到了！",
        "pinyin": "Zāogāo, wǒ chídào le!",
        "english": "Oh no, I'm late!"
      }
    ]
  },
  {
    "hanzi": "则",
    "pinyin": "zé",
    "english": " Noun: norm, standard Verb: to follow rule, etc. Conjunction: then Measure Word: for written items",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我写了一则通知。",
        "pinyin": "Wǒ xiěle yì zé tōngzhī.",
        "english": "I wrote a notice."
      }
    ]
  },
  {
    "hanzi": "责备",
    "pinyin": "zé bèi",
    "english": "Verb: to blame, to criticize",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她很少责备别人。",
        "pinyin": "Tā hěn shǎo zébèi biérén.",
        "english": "She rarely blames others."
      }
    ]
  },
  {
    "hanzi": "展开",
    "pinyin": "zhǎn kāi",
    "english": "Verb: to unfold, to carry out, to spread out",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请把地图展开。",
        "pinyin": "Qǐng bǎ dìtú zhǎnkāi.",
        "english": "Please unfold the map."
      }
    ]
  },
  {
    "hanzi": "粘贴",
    "pinyin": "zhān tiē",
    "english": "Verb: to stick, to affix, to paste",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请把这个链接粘贴到聊天框。",
        "pinyin": "Qǐng bǎ zhège liánjiē zhāntiē dào liáotiān kuāng.",
        "english": "Please paste this link into the chat box."
      }
    ]
  },
  {
    "hanzi": "占线",
    "pinyin": "zhàn xiàn",
    "english": "Adjective: busy phone",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我打电话过去，但是占线。",
        "pinyin": "Wǒ dǎ diànhuà guòqù, dànshì zhànxiàn.",
        "english": "I called, but the line was busy."
      }
    ]
  },
  {
    "hanzi": "战争",
    "pinyin": "zhàn zhēng",
    "english": "Noun: war",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "战争很可怕。",
        "pinyin": "Zhànzhēng hěn kěpà.",
        "english": "War is very terrible."
      }
    ]
  },
  {
    "hanzi": "涨",
    "pinyin": "zhǎng",
    "english": "Verb: to rise, to go up",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "房租涨了一百块。",
        "pinyin": "Fángzū zhǎngle yìbǎi kuài.",
        "english": "The rent increased by one hundred yuan."
      }
    ]
  },
  {
    "hanzi": "账户",
    "pinyin": "zhàng hù",
    "english": "Noun: bank account",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我要开一个账户。",
        "pinyin": "Wǒ yào kāi yīgè zhànghù.",
        "english": "I need to open an account."
      }
    ]
  },
  {
    "hanzi": "掌握",
    "pinyin": "zhǎng wò",
    "english": "Verb: to grasp, to master, to control",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他已经掌握了这门技术。",
        "pinyin": "Tā yǐjīng zhǎngwòle zhè mén jìshù.",
        "english": "He has already mastered this skill."
      }
    ]
  },
  {
    "hanzi": "照常",
    "pinyin": "zhào cháng",
    "english": "Adverb: as usual",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "商店照常营业。",
        "pinyin": "Shāngdiàn zhàocháng yíngyè.",
        "english": "The store is open as usual."
      }
    ]
  },
  {
    "hanzi": "着凉",
    "pinyin": "zháo liáng",
    "english": "Verb: to catch a cold",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "多穿点，别着凉了。",
        "pinyin": "Duō chuān diǎn, bié zhuó liáng le.",
        "english": "Wear a bit more so you don't catch a cold."
      }
    ]
  },
  {
    "hanzi": "振动",
    "pinyin": "zhèn dòng",
    "english": "Noun: vibration Verb: to vibrate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "手机设置为振动模式。",
        "pinyin": "Shǒujī shèzhì wéi zhèndòng móshì.",
        "english": "The phone is set to vibration mode."
      }
    ]
  },
  {
    "hanzi": "诊断",
    "pinyin": "zhěn duàn",
    "english": "Noun: diagnosis Verb: to diagnose",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "医生诊断出他得了流感。",
        "pinyin": "Yīshēng zhěnduàn chū tā déle liúgǎn.",
        "english": "The doctor diagnosed that he had the flu."
      }
    ]
  },
  {
    "hanzi": "真实",
    "pinyin": "zhēn shí",
    "english": "Adjective: real, true",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一个真实的故事。",
        "pinyin": "Zhè shì yīgè zhēnshí de gùshì.",
        "english": "This is a real story."
      }
    ]
  },
  {
    "hanzi": "正",
    "pinyin": "zhèng",
    "english": "Adjective: upright, honest Adverb: just, upright",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他坐得很正。",
        "pinyin": "Tā zuò dé hěn zhèng.",
        "english": "He is sitting very straight (upright)."
      }
    ]
  },
  {
    "hanzi": "睁",
    "pinyin": "zhēng",
    "english": "Verb: to open the eyes",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "听到声音，她立刻睁开了眼睛。",
        "pinyin": "Tīng dào shēngyīn, tā lìkè zhēng kāi le yǎnjing.",
        "english": "Hearing the sound, she immediately opened her eyes."
      }
    ]
  },
  {
    "hanzi": "政策",
    "pinyin": "zhèng cè",
    "english": "Noun: policy",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们最近改变了公司的政策。",
        "pinyin": "Tāmen zuìjìn gǎibiàn le gōngsī de zhèngcè.",
        "english": "They recently changed the company's policy."
      }
    ]
  },
  {
    "hanzi": "整个",
    "pinyin": "zhěng gè",
    "english": "Adjective: whole, entire",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "整个过程都很顺利。",
        "pinyin": "Zhěnggè guòchéng dōu hěn shùnlì.",
        "english": "The whole process went very smoothly."
      }
    ]
  },
  {
    "hanzi": "证件",
    "pinyin": "zhèng jiàn",
    "english": "Noun: certificate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "记得带上你的证件。",
        "pinyin": "Jìde dàishàng nǐ de zhèngjiàn.",
        "english": "Remember to bring your ID documents."
      }
    ]
  },
  {
    "hanzi": "证据",
    "pinyin": "zhèng jù",
    "english": "Noun: evidence, proof",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "警方找到了新的证据。",
        "pinyin": "Jǐngfāng zhǎodào le xīn de zhèngjù.",
        "english": "The police found new evidence."
      }
    ]
  },
  {
    "hanzi": "争论",
    "pinyin": "zhēng lùn",
    "english": "Noun: argument, debate Verb: to argue, to debate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "别再争论了，快开始工作吧。",
        "pinyin": "Bié zài zhēnglùn le, kuài kāishǐ gōngzuò ba.",
        "english": "Stop arguing and start working quickly."
      }
    ]
  },
  {
    "hanzi": "挣钱",
    "pinyin": "zhèng qián",
    "english": "Verb: to make money",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他努力工作挣钱。",
        "pinyin": "Tā nǔlì gōngzuò zhèng qián.",
        "english": "He works hard to earn money."
      }
    ]
  },
  {
    "hanzi": "征求",
    "pinyin": "zhēng qiú",
    "english": "Verb: to solicit, to seek, to ask for",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们正在征求大家的意见。",
        "pinyin": "Wǒmen zhèngzài zhēngqiú dàjiā de yìjiàn.",
        "english": "We are currently seeking everyone's opinions."
      }
    ]
  },
  {
    "hanzi": "争取",
    "pinyin": "zhēng qǔ",
    "english": "Verb: to strive for, to fight for",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们会争取更好的成绩。",
        "pinyin": "Wǒmen huì zhēngqǔ gèng hǎo de chéngjì.",
        "english": "We will strive for better results."
      }
    ]
  },
  {
    "hanzi": "整体",
    "pinyin": "zhěng tǐ",
    "english": "Noun: whole entity",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "整体来看，结果不错。",
        "pinyin": "Zhěngtǐ lái kàn, jiéguǒ bùcuò.",
        "english": "Overall, the results are good."
      }
    ]
  },
  {
    "hanzi": "智慧",
    "pinyin": "zhì huì",
    "english": "Noun: wisdom, intelligence, knowledge",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "智慧比金钱更重要。",
        "pinyin": "Zhìhuì bǐ jīnqián gèng zhòngyào.",
        "english": "Wisdom is more important than money."
      }
    ]
  },
  {
    "hanzi": "治疗",
    "pinyin": "zhì liáo",
    "english": "Noun: medical treatment Verb: to treat, to cure",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这种药可以治疗感冒。",
        "pinyin": "Zhè zhǒng yào kěyǐ zhìliáo gǎnmào.",
        "english": "This medicine can treat colds."
      }
    ]
  },
  {
    "hanzi": "支票",
    "pinyin": "zhī piào",
    "english": "Noun: check bank",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我需要开一张支票给你。",
        "pinyin": "Wǒ xūyào kāi yī zhāng zhīpiào gěi nǐ.",
        "english": "I need to write a check for you."
      }
    ]
  },
  {
    "hanzi": "执行",
    "pinyin": "zhí xíng",
    "english": "Verb: to carry out, to execute",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们必须执行这个计划。",
        "pinyin": "Wǒmen bìxū zhíxíng zhège jìhuà.",
        "english": "We must carry out this plan."
      }
    ]
  },
  {
    "hanzi": "秩序",
    "pinyin": "zhì xù",
    "english": "Noun: order, orderly state",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请保持安静和秩序。",
        "pinyin": "Qǐng bǎochí ānjìng hé zhìxù.",
        "english": "Please maintain quietness and order."
      }
    ]
  },
  {
    "hanzi": "志愿者",
    "pinyin": "zhì yuàn zhě",
    "english": "Noun: volunteer",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我想成为一名志愿者。",
        "pinyin": "Wǒ xiǎng chéngwéi yī míng zhìyuànzhě.",
        "english": "I want to become a volunteer."
      }
    ]
  },
  {
    "hanzi": "执照",
    "pinyin": "zhí zhào",
    "english": "Noun: license",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的执照过期了。",
        "pinyin": "Wǒ de zhízhào guòqī le.",
        "english": "My license has expired."
      }
    ]
  },
  {
    "hanzi": "重",
    "pinyin": "zhòng",
    "english": "Adjective: heavy, serious Adverb: heavily",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的病很重。",
        "pinyin": "Tā de bìng hěn zhòng.",
        "english": "His illness is very serious."
      }
    ]
  },
  {
    "hanzi": "钟",
    "pinyin": "zhōng",
    "english": "Noun: clock, bell Measure Word: o'clock",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "现在是三点钟。",
        "pinyin": "Xiànzài shì sān diǎn zhōng.",
        "english": "It is three o'clock now."
      }
    ]
  },
  {
    "hanzi": "中心",
    "pinyin": "zhōng xīn",
    "english": "Noun: center",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们的办公室在市中心。",
        "pinyin": "Wǒmen de bàngōngshì zài shì zhōngxīn.",
        "english": "Our office is in the city center."
      }
    ]
  },
  {
    "hanzi": "中旬",
    "pinyin": "zhōng xún",
    "english": "Time: middle third of a month",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们计划在五月中旬去旅行。",
        "pinyin": "Wǒmen jìhuà zài wǔ yuè zhōngxún qù lǚxíng.",
        "english": "We plan to travel in the middle of May."
      }
    ]
  },
  {
    "hanzi": "周到",
    "pinyin": "zhōu dao",
    "english": "Adjective: thoughtful, considerate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们的服务很周到。",
        "pinyin": "Tāmen de fúwù hěn zhōudào.",
        "english": "Their service is very thoughtful and considerate."
      }
    ]
  },
  {
    "hanzi": "煮",
    "pinyin": "zhǔ",
    "english": "Verb: to cook, to boil",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "妈妈在煮饭。",
        "pinyin": "Māma zài zhǔ fàn.",
        "english": "Mom is cooking rice."
      }
    ]
  },
  {
    "hanzi": "主持",
    "pinyin": "zhǔ chí",
    "english": "Verb: to direct, to manage, to preside over",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "经理主持了今天的会议。",
        "pinyin": "Jīnglǐ zhǔchíle jīntiān de huìyì.",
        "english": "The manager presided over today's meeting."
      }
    ]
  },
  {
    "hanzi": "嘱咐",
    "pinyin": "zhǔ fù",
    "english": "Verb: to exhort, to enjoin, to tell",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "妈妈嘱咐我要早点回家。",
        "pinyin": "Māmā zhǔfù wǒ yào zǎodiǎn huíjiā.",
        "english": "Mom instructed me to go home early."
      }
    ]
  },
  {
    "hanzi": "主人",
    "pinyin": "zhǔ rén",
    "english": "Noun: host, master",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "狗在等它的主人。",
        "pinyin": "Gǒu zài děng tā de zhǔrén.",
        "english": "The dog is waiting for its master."
      }
    ]
  },
  {
    "hanzi": "主席",
    "pinyin": "zhǔ xí",
    "english": "Noun: chairman",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他是公司的主席。",
        "pinyin": "Tā shì gōngsī de zhǔxí.",
        "english": "He is the chairman of the company."
      }
    ]
  },
  {
    "hanzi": "抓紧",
    "pinyin": "zhuā jǐn",
    "english": "Verb: to grasp firmly, to pay special attention to, to seize",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "抓紧时间，我们快迟到了。",
        "pinyin": "Zhuājǐn shíjiān, wǒmen kuài chídào le.",
        "english": "Hurry up (seize the time), we are going to be late soon."
      }
    ]
  },
  {
    "hanzi": "专心",
    "pinyin": "zhuān xīn",
    "english": " Noun: concentration Verb: to concentrate Adjective: concentrated, attentive",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请你专心工作。",
        "pinyin": "Qǐng nǐ zhuānxīn gōngzuò.",
        "english": "Please concentrate on your work."
      }
    ]
  },
  {
    "hanzi": "装",
    "pinyin": "zhuāng",
    "english": " Noun: dress, clothing, costume Verb: to pretend, to install, to fix, to load, to pack",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你别装了，我知道你懂。",
        "pinyin": "Nǐ bié zhuāng le, wǒ zhīdào nǐ dǒng.",
        "english": "Stop pretending, I know you understand."
      }
    ]
  },
  {
    "hanzi": "状况",
    "pinyin": "zhuàng kuàng",
    "english": "Noun: condition, state, situation",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的健康状况不太好。",
        "pinyin": "Tā de jiànkāng zhuàngkuàng bú tài hǎo.",
        "english": "His health condition is not very good."
      }
    ]
  },
  {
    "hanzi": "状态",
    "pinyin": "zhuàng tài",
    "english": "Noun: state, condition",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我今天状态很好。",
        "pinyin": "Wǒ jīntiān zhuàngtài hěn hǎo.",
        "english": "My state/condition today is very good."
      }
    ]
  },
  {
    "hanzi": "紫",
    "pinyin": "zǐ",
    "english": "Adjective: purple",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我最喜欢紫色。",
        "pinyin": "Wǒ zuì xǐhuān zǐsè.",
        "english": "I like the color purple the most."
      }
    ]
  },
  {
    "hanzi": "自从",
    "pinyin": "zì cóng",
    "english": "Adverb: ever since Relative Clause: since",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "自从他搬家后，我们就没见过他。",
        "pinyin": "Zìcóng tā bānjiā hòu, wǒmen jiù méi jiànguo tā.",
        "english": "Ever since he moved house, we haven't seen him."
      }
    ]
  },
  {
    "hanzi": "自动",
    "pinyin": "zì dòng",
    "english": "Adjective: automatic",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这里的门是自动的。",
        "pinyin": "Zhèlǐ de mén shì zìdòng de.",
        "english": "The door here is automatic."
      }
    ]
  },
  {
    "hanzi": "自豪",
    "pinyin": "zì háo",
    "english": "Adjective: proud",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们为这个成就感到自豪。",
        "pinyin": "Wǒmen wèi zhège chéngjiù gǎndào zìháo.",
        "english": "We feel proud of this achievement."
      }
    ]
  },
  {
    "hanzi": "罪犯",
    "pinyin": "zuì fàn",
    "english": "Noun: criminal",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他是一个危险的罪犯。",
        "pinyin": "Tā shì yīgè wēixiǎn de zuìfàn.",
        "english": "He is a dangerous criminal."
      }
    ]
  },

  {
    "hanzi": "不客气",
    "pinyin": "bú kè qi",
    "english": "you are welcome",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "谢谢！不客气。",
        "pinyin": "Xièxie! Bù kèqì.",
        "english": "Thank you! You’re welcome."
      }
    ]
  },
  {
    "hanzi": "饭馆",
    "pinyin": "fàn guǎn",
    "english": "restaurant",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我们去那个饭馆吃饭吧。",
        "pinyin": "Wǒmen qù nàge fànguǎn chīfàn ba.",
        "english": "Let's go eat at that restaurant."
      }
    ]
  },
  {
    "hanzi": "狗",
    "pinyin": "gǒu",
    "english": "dog",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "他养了一只小狗。",
        "pinyin": "Tā yǎng le yī zhī xiǎo gǒu.",
        "english": "He keeps a small dog."
      }
    ]
  },
  {
    "hanzi": "喝",
    "pinyin": "hē",
    "english": "to drink",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "喝一杯咖啡吧。",
        "pinyin": "Hē yī bēi kāfēi ba.",
        "english": "Have a cup of coffee."
      }
    ]
  },
  {
    "hanzi": "会",
    "pinyin": "huì",
    "english": " can, to be abl- e to",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我会说中文。",
        "pinyin": "Wǒ huì shuō Zhōngwén.",
        "english": "I can speak Chinese."
      }
    ]
  },
  {
    "hanzi": "火车站",
    "pinyin": "huǒ chē zhàn",
    "english": "train station",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我在火车站等你。",
        "pinyin": "Wǒ zài huǒchēzhàn děng nǐ.",
        "english": "I will wait for you at the train station."
      }
    ]
  },
  {
    "hanzi": "叫",
    "pinyin": "jiào",
    "english": " to be called, to call",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "叫我小李就行。",
        "pinyin": "Jiào wǒ Xiǎo Lǐ jiù xíng.",
        "english": "Call me Xiao Li."
      }
    ]
  },
  {
    "hanzi": "里",
    "pinyin": "lǐ",
    "english": " in, inside",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "书在包里，你看得到吗？",
        "pinyin": "Shū zài bāo lǐ, nǐ kàn dé dào ma?",
        "english": "The book is inside the bag, can you see it?"
      }
    ]
  },
  {
    "hanzi": "零",
    "pinyin": "líng",
    "english": "0",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "今天气温是零度。",
        "pinyin": "Jīntiān qìwēn shì líng dù.",
        "english": "The temperature today is zero degrees."
      }
    ]
  },
  {
    "hanzi": "没",
    "pinyin": "méi",
    "english": "not",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我没时间跟你说话。",
        "pinyin": "Wǒ méi shíjiān gēn nǐ shuōhuà.",
        "english": "I don't have time to talk to you."
      }
    ]
  },
  {
    "hanzi": "没关系",
    "pinyin": "méi guān xi",
    "english": "it doesn't matter",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "迟到没关系。",
        "pinyin": "Chídào méiguānxi.",
        "english": "It’s okay to be late."
      }
    ]
  },
  {
    "hanzi": "名字",
    "pinyin": "míng zi",
    "english": "name",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你的名字很好听。",
        "pinyin": "Nǐ de míngzi hěn hǎotīng.",
        "english": "Your name sounds nice."
      }
    ]
  },
  {
    "hanzi": "认识",
    "pinyin": "rèn shi",
    "english": " to know, to recognize",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我认识他的哥哥。",
        "pinyin": "Wǒ rènshi tā de gēge.",
        "english": "I know his older brother."
      }
    ]
  },
  {
    "hanzi": "日",
    "pinyin": "rì",
    "english": " day, sun",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "今天是几月几日？",
        "pinyin": "Jīntiān shì jǐ yuè jǐ rì?",
        "english": "What month and what day is it today?"
      }
    ]
  },
  {
    "hanzi": "三",
    "pinyin": "sān",
    "english": "3",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "我有三本书。",
        "pinyin": "Wǒ yǒu sān běn shū.",
        "english": "I have three books."
      }
    ]
  },
  {
    "hanzi": "商店",
    "pinyin": "shāng diàn",
    "english": " shop, store",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这家商店早上九点开门。",
        "pinyin": "Zhè jiā shāngdiàn zǎoshang jiǔ diǎn kāimén.",
        "english": "This shop opens at nine o'clock in the morning."
      }
    ]
  },
  {
    "hanzi": "说话",
    "pinyin": "shuō huà",
    "english": " to speak, to talk",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "请小声说话，这里很安静。",
        "pinyin": "Qǐng xiǎoshēng shuōhuà, zhèlǐ hěn ānjìng.",
        "english": "Please speak quietly, it's very quiet here."
      }
    ]
  },
  {
    "hanzi": "她",
    "pinyin": "tā",
    "english": "she",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "她是我的好朋友。",
        "pinyin": "Tā shì wǒ de hǎo péngyou.",
        "english": "She is my good friend."
      }
    ]
  },
  {
    "hanzi": "小",
    "pinyin": "xiǎo",
    "english": "small",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这只狗非常小。",
        "pinyin": "Zhè zhī gǒu fēicháng xiǎo.",
        "english": "This dog is very small."
      }
    ]
  },
  {
    "hanzi": "衣服",
    "pinyin": "yī fu",
    "english": "clothes",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "衣服要洗了。",
        "pinyin": "Yīfu yào xǐ le.",
        "english": "The clothes need washing."
      }
    ]
  },
  {
    "hanzi": "医生",
    "pinyin": "yī shēng",
    "english": "doctor",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "医生给我检查身体。",
        "pinyin": "Yīshēng gěi wǒ jiǎnchá shēntǐ.",
        "english": "The doctor checks my body."
      }
    ]
  },
  {
    "hanzi": "医院",
    "pinyin": "yī yuàn",
    "english": "hospital",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "医院离家很近。",
        "pinyin": "Yīyuàn lí jiā hěn jìn.",
        "english": "The hospital is close to home."
      }
    ]
  },
  {
    "hanzi": "椅子",
    "pinyin": "yǐ zi",
    "english": "chair",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "教室有三十把椅子。",
        "pinyin": "Jiàoshì yǒu sānshí bǎ yǐzi.",
        "english": "There are thirty chairs in the classroom."
      }
    ]
  },
  {
    "hanzi": "这",
    "pinyin": "zhè",
    "english": "this",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "这是我送给你的礼物。",
        "pinyin": "Zhè shì wǒ sòng gěi nǐ de lǐwù.",
        "english": "This is the gift I gave you."
      }
    ]
  },
  {
    "hanzi": "做",
    "pinyin": "zuò",
    "english": " to do, to make",
    "hsk": "HSK 1",
    "exampleSentences": [
      {
        "chinese": "你想做些什么？",
        "pinyin": "Nǐ xiǎng zuò xiē shénme?",
        "english": "What do you want to do?"
      }
    ]
  },
  {
    "hanzi": "吧",
    "pinyin": "ba",
    "english": "particle: indicating suggestion",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我们走吧，时间不早了。",
        "pinyin": "Wǒmen zǒu ba, shíjiān bù zǎo le.",
        "english": "Let's go, it's getting late."
      }
    ]
  },
  {
    "hanzi": "百",
    "pinyin": "bǎi",
    "english": "100",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "这件衣服要一百块。",
        "pinyin": "Zhè jiàn yīfu yào yì bǎi kuài.",
        "english": "This piece of clothing costs one hundred dollars (kuai)."
      }
    ]
  },
  {
    "hanzi": "唱歌",
    "pinyin": "chàng gē",
    "english": "to sing",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "她很喜欢在KTV唱歌。",
        "pinyin": "Tā hěn xǐhuān zài KTV chànggē.",
        "english": "She really likes singing at KTV (karaoke)."
      }
    ]
  },
  {
    "hanzi": "船",
    "pinyin": "chuán",
    "english": " boat, ship",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我们坐船过河。",
        "pinyin": "Wǒmen zuò chuán guò hé.",
        "english": "We cross the river by boat."
      }
    ]
  },
  {
    "hanzi": "穿",
    "pinyin": "chuān",
    "english": "to wear",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "今天天气冷，你要多穿衣服。",
        "pinyin": "Jīntiān tiānqì lěng, nǐ yào duō chuān yīfu.",
        "english": "The weather is cold today, you need to wear more clothes."
      }
    ]
  },
  {
    "hanzi": "从",
    "pinyin": "cóng",
    "english": "from",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我从北京来。",
        "pinyin": "Wǒ cóng Běijīng lái.",
        "english": "I come from Beijing."
      }
    ]
  },
  {
    "hanzi": "大家",
    "pinyin": "dà jiā",
    "english": "everybody",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "大家好，我是新来的老师。",
        "pinyin": "Dàjiā hǎo, wǒ shì xīn lái de lǎoshī.",
        "english": "Hello everyone, I am the new teacher."
      }
    ]
  },
  {
    "hanzi": "打篮球",
    "pinyin": "dǎ lán qiú",
    "english": "play basketball",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "你会打篮球吗？",
        "pinyin": "Nǐ huì dǎ lánqiú ma?",
        "english": "Can you play basketball?"
      }
    ]
  },
  {
    "hanzi": "到",
    "pinyin": "dào",
    "english": "to arrive",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "火车几点到上海？",
        "pinyin": "Huǒchē jǐ diǎn dào Shànghǎi?",
        "english": "What time does the train arrive in Shanghai?"
      }
    ]
  },
  {
    "hanzi": "得",
    "pinyin": "de",
    "english": "particle: used to link verb with adjective",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "他汉语说得很好。",
        "pinyin": "Tā Hànyǔ shuō de hěn hǎo.",
        "english": "He speaks Chinese very well."
      }
    ]
  },
  {
    "hanzi": "等",
    "pinyin": "děng",
    "english": "to wait",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "请在这里等我一下。",
        "pinyin": "Qǐng zài zhèlǐ děng wǒ yīxià.",
        "english": "Please wait for me here for a moment."
      }
    ]
  },
  {
    "hanzi": "第一",
    "pinyin": "dì yī",
    "english": "first",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "她是这次比赛的第一名。",
        "pinyin": "Tā shì zhè cì bǐsài de dì yī míng.",
        "english": "She is the first place winner in this competition."
      }
    ]
  },
  {
    "hanzi": "懂",
    "pinyin": "dǒng",
    "english": "to understand",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "你懂我说的话吗？",
        "pinyin": "Nǐ dǒng wǒ shuō de huà ma?",
        "english": "Do you understand what I'm saying?"
      }
    ]
  },
  {
    "hanzi": "对",
    "pinyin": "duì",
    "english": " right, correct",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "你的答案是完全对的。",
        "pinyin": "Nǐ de dá'àn shì wánquán duì de.",
        "english": "Your answer is completely correct."
      }
    ]
  },
  {
    "hanzi": "非常",
    "pinyin": "fēi cháng",
    "english": "very",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "天气非常冷。",
        "pinyin": "Tiānqì fēicháng lěng.",
        "english": "The weather is extremely cold."
      }
    ]
  },
  {
    "hanzi": "高",
    "pinyin": "gāo",
    "english": " high, tall",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "这栋楼很高。",
        "pinyin": "Zhè dòng lóu hěn gāo.",
        "english": "This building is very tall."
      }
    ]
  },
  {
    "hanzi": "公斤",
    "pinyin": "gōng jīn",
    "english": "kilogram",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "这袋米有五公斤重。",
        "pinyin": "Zhè dài mǐ yǒu wǔ gōngjīn zhòng.",
        "english": "This bag of rice weighs five kilograms."
      }
    ]
  },
  {
    "hanzi": "公司",
    "pinyin": "gōng sī",
    "english": "company",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我在一家电脑公司工作。",
        "pinyin": "Wǒ zài yī jiā diànnǎo gōngsī gōngzuò.",
        "english": "I work at a computer company."
      }
    ]
  },
  {
    "hanzi": "过",
    "pinyin": "guo",
    "english": "particle: indicating action in the past",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我们一起过春节。",
        "pinyin": "Wǒmen yīqǐ guò Chūnjié.",
        "english": "We celebrate Spring Festival together."
      }
    ]
  },
  {
    "hanzi": "孩子",
    "pinyin": "hái zi",
    "english": "child",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "那个孩子今年五岁了。",
        "pinyin": "Nàge háizi jīnnián wǔ suì le.",
        "english": "That child is five years old this year."
      }
    ]
  },
  {
    "hanzi": "号",
    "pinyin": "hào",
    "english": " number, day of month",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "今天是几月几号？",
        "pinyin": "Jīntiān shì jǐ yuè jǐ hào?",
        "english": "What is the date today?"
      }
    ]
  },
  {
    "hanzi": "机场",
    "pinyin": "jī chǎng",
    "english": "airport",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "你什么时候去机场？",
        "pinyin": "Nǐ shénme shíhou qù jīchǎng?",
        "english": "When are you going to the airport?"
      }
    ]
  },
  {
    "hanzi": "件",
    "pinyin": "jiàn",
    "english": " MW: for events, things, clothes",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我带了三件行李去旅行。",
        "pinyin": "Wǒ dàile sān jiàn xíngli qù lǚxíng.",
        "english": "I took three pieces of luggage for the trip."
      }
    ]
  },
  {
    "hanzi": "教室",
    "pinyin": "jiào shì",
    "english": "classroom",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "老师正在教室里上课。",
        "pinyin": "Lǎoshī zhèngzài jiàoshì lǐ shàngkè.",
        "english": "The teacher is having class in the classroom."
      }
    ]
  },
  {
    "hanzi": "姐姐",
    "pinyin": "jiě jie",
    "english": "older sister",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我姐姐比我大两岁。",
        "pinyin": "Wǒ jiějie bǐ wǒ dà liǎng suì.",
        "english": "My older sister is two years older than me."
      }
    ]
  },
  {
    "hanzi": "就",
    "pinyin": "jiù",
    "english": "only; as soon as",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "就一杯咖啡。",
        "pinyin": "Jiù yī bēi kāfēi.",
        "english": "Just one coffee."
      }
    ]
  },
  {
    "hanzi": "考试",
    "pinyin": "kǎo shì",
    "english": "exam",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "明天我们有一个汉语考试。",
        "pinyin": "Míngtiān wǒmen yǒu yīgè Hànyǔ kǎoshì.",
        "english": "We have a Chinese test tomorrow."
      }
    ]
  },
  {
    "hanzi": "课",
    "pinyin": "kè",
    "english": " class, lesson",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我们下午有数学课。",
        "pinyin": "Wǒmen xiàwǔ yǒu shùxué kè.",
        "english": "We have a math class this afternoon."
      }
    ]
  },
  {
    "hanzi": "可以",
    "pinyin": "kě yǐ",
    "english": " can, may",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "你现在可以走了。",
        "pinyin": "Nǐ xiànzài kěyǐ zǒu le.",
        "english": "You can leave now."
      }
    ]
  },
  {
    "hanzi": "累",
    "pinyin": "lèi",
    "english": "tired",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "工作一天很累。",
        "pinyin": "Gōngzuò yī tiān hěn lèi.",
        "english": "Very tired after a day’s work."
      }
    ]
  },
  {
    "hanzi": "离",
    "pinyin": "lí",
    "english": " to leave, to be away from",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "学校离我家很近。",
        "pinyin": "Xuéxiào lí wǒ jiā hěn jìn.",
        "english": "The school is very close to my house."
      }
    ]
  },
  {
    "hanzi": "两",
    "pinyin": "liǎng",
    "english": "two",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我买了两个苹果。",
        "pinyin": "Wǒ mǎi le liǎng ge píngguǒ.",
        "english": "I bought two apples."
      }
    ]
  },
  {
    "hanzi": "路",
    "pinyin": "lù",
    "english": " road, path",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "这条路通向火车站。",
        "pinyin": "Zhè tiáo lù tōngxiàng huǒchēzhàn.",
        "english": "This road leads to the train station."
      }
    ]
  },
  {
    "hanzi": "旅游",
    "pinyin": "lǚ yóu",
    "english": "to travel",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我喜欢去不同的地方旅游。",
        "pinyin": "Wǒ xǐhuan qù bù tóng de dìfang lǚyóu.",
        "english": "I like traveling to different places."
      }
    ]
  },
  {
    "hanzi": "妹妹",
    "pinyin": "mèi mei",
    "english": "younger sister",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我的妹妹今年五岁了。",
        "pinyin": "Wǒ de mèimei jīnnián wǔ suì le.",
        "english": "My younger sister is five years old this year."
      }
    ]
  },
  {
    "hanzi": "男人",
    "pinyin": "nán rén",
    "english": "man",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "那个穿西装的男人是我的老板。",
        "pinyin": "Nà ge chuān xīzhuāng de nánrén shì wǒ de lǎobǎn.",
        "english": "The man wearing the suit is my boss."
      }
    ]
  },
  {
    "hanzi": "您",
    "pinyin": "nín",
    "english": "you polite",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "您好，请问您找谁？",
        "pinyin": "Nín hǎo, qǐngwèn nín zhǎo shéi?",
        "english": "Hello, may I ask who you are looking for?"
      }
    ]
  },
  {
    "hanzi": "女人",
    "pinyin": "nǚ rén",
    "english": "woman",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "那个女人正在打电话。",
        "pinyin": "Nà ge nǚrén zhèngzài dǎ diànhuà.",
        "english": "That woman is currently on the phone."
      }
    ]
  },
  {
    "hanzi": "旁边",
    "pinyin": "páng biān",
    "english": "beside",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我的自行车停在椅子旁边。",
        "pinyin": "Wǒ de zìxíngchē tíng zài yǐzi pángbiān.",
        "english": "My bicycle is parked next to the chair."
      }
    ]
  },
  {
    "hanzi": "跑步",
    "pinyin": "pǎo bù",
    "english": "to run",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "早上我去公园跑步。",
        "pinyin": "Zǎoshang wǒ qù gōngyuán pǎo bù.",
        "english": "I go running in the park in the morning."
      }
    ]
  },
  {
    "hanzi": "便宜",
    "pinyin": "pián yi",
    "english": "cheap",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "这件衬衫很便宜。",
        "pinyin": "Zhè jiàn chènshān hěn piányi.",
        "english": "This shirt is very cheap."
      }
    ]
  },
  {
    "hanzi": "票",
    "pinyin": "piào",
    "english": "ticket",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "请给我一张电影票。",
        "pinyin": "Qǐng gěi wǒ yì zhāng diànyǐng piào.",
        "english": "Please give me a movie ticket."
      }
    ]
  },
  {
    "hanzi": "起床",
    "pinyin": "qǐ chuáng",
    "english": "to get up",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我每天七点半起床。",
        "pinyin": "Wǒ měitiān qī diǎn bàn qǐchuáng.",
        "english": "I get up at 7:30 every day."
      }
    ]
  },
  {
    "hanzi": "妻子",
    "pinyin": "qī zi",
    "english": "wife",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "他和他妻子一起住在北京。",
        "pinyin": "Tā hé tā qīzi yìqǐ zhù zài Běijīng.",
        "english": "He and his wife live together in Beijing."
      }
    ]
  },
  {
    "hanzi": "千",
    "pinyin": "qiān",
    "english": "1000",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "这本书值一千块钱。",
        "pinyin": "Zhè běn shū zhí yī qiān kuài qián.",
        "english": "This book is worth one thousand yuan."
      }
    ]
  },
  {
    "hanzi": "去年",
    "pinyin": "qù nián",
    "english": "last year",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我是去年开始学中文的。",
        "pinyin": "Wǒ shì qùnián kāishǐ xué Zhōngwén de.",
        "english": "I started learning Chinese last year."
      }
    ]
  },
  {
    "hanzi": "让",
    "pinyin": "ràng",
    "english": " to permit, to let",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "妈妈不让我看电视。",
        "pinyin": "Māma bú ràng wǒ kàn diànshì.",
        "english": "Mom doesn't let me watch TV."
      }
    ]
  },
  {
    "hanzi": "上班",
    "pinyin": "shàng bān",
    "english": "to go to work",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我八点上班。",
        "pinyin": "Wǒ bā diǎn shàng bān.",
        "english": "I start work at eight."
      }
    ]
  },
  {
    "hanzi": "身体",
    "pinyin": "shēn tǐ",
    "english": " body, health",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "运动对身体很好。",
        "pinyin": "Yùndòng duì shēntǐ hěn hǎo.",
        "english": "Exercise is good for the body."
      }
    ]
  },
  {
    "hanzi": "生病",
    "pinyin": "shēng bìng",
    "english": "to get sick",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "妹妹生病了没去学校。",
        "pinyin": "Mèimei shēng bìng le méi qù xuéxiào.",
        "english": "My sister got sick and didn’t go to school."
      }
    ]
  },
  {
    "hanzi": "生日",
    "pinyin": "shēng rì",
    "english": "birthday",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "今天是我的生日。",
        "pinyin": "Jīntiān shì wǒ de shēngrì.",
        "english": "Today is my birthday."
      }
    ]
  },
  {
    "hanzi": "时间",
    "pinyin": "shí jiān",
    "english": " time, period",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "现在没时间吃饭。",
        "pinyin": "Xiànzài méi shíjiān chī fàn.",
        "english": "There’s no time to eat now."
      }
    ]
  },
  {
    "hanzi": "事情",
    "pinyin": "shì qing",
    "english": " thing, affair",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我有很多事情要做。",
        "pinyin": "Wǒ yǒu hěn duō shìqing yào zuò.",
        "english": "I have many things to do."
      }
    ]
  },
  {
    "hanzi": "手表",
    "pinyin": "shǒu biǎo",
    "english": "wrist watch",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我的手表停了。",
        "pinyin": "Wǒ de shǒubiǎo tíng le.",
        "english": "My watch stopped."
      }
    ]
  },
  {
    "hanzi": "送",
    "pinyin": "sòng",
    "english": " to deliver, to give",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "他送给我一本书。",
        "pinyin": "Tā sòng gěi wǒ yì běn shū.",
        "english": "He gave me a book (as a gift)."
      }
    ]
  },
  {
    "hanzi": "题",
    "pinyin": "tí",
    "english": "question of a test",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "这道题太难了，我不会做。",
        "pinyin": "Zhè dào tí tài nán le, wǒ bú huì zuò.",
        "english": "This question is too difficult; I don't know how to do it."
      }
    ]
  },
  {
    "hanzi": "踢足球",
    "pinyin": "tī zú qiú",
    "english": "to play football",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我喜欢在周末踢足球。",
        "pinyin": "Wǒ xǐhuān zài zhōumò tī zúqiú.",
        "english": "I like playing soccer on the weekend."
      }
    ]
  },
  {
    "hanzi": "跳舞",
    "pinyin": "tiào wǔ",
    "english": "to dance",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "姐姐喜欢跳舞。",
        "pinyin": "Jiějie xǐhuān tiào wǔ.",
        "english": "My sister likes to dance."
      }
    ]
  },
  {
    "hanzi": "外",
    "pinyin": "wài",
    "english": "outside; foreign",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "外面下雨了，我们待在家里吧。",
        "pinyin": "Wàimiàn xià yǔ le, wǒmen dāi zài jiālǐ ba.",
        "english": "It's raining outside, let's stay inside the house."
      }
    ]
  },
  {
    "hanzi": "完",
    "pinyin": "wán",
    "english": "to finish",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "你什么时候能做完作业？",
        "pinyin": "Nǐ shénme shíhou néng zuò wán zuòyè?",
        "english": "When can you finish the homework?"
      }
    ]
  },
  {
    "hanzi": "玩",
    "pinyin": "wán",
    "english": "to play",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "孩子们在公园里玩得很开心。",
        "pinyin": "Háizimen zài gōngyuán lǐ wán de hěn kāixīn.",
        "english": "The children are having a great time playing in the park."
      }
    ]
  },
  {
    "hanzi": "晚上",
    "pinyin": "wǎn shang",
    "english": "evening",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "今天晚上我们去看电影。",
        "pinyin": "Jīntiān wǎnshang wǒmen qù kàn diànyǐng.",
        "english": "We are going to watch a movie tonight."
      }
    ]
  },
  {
    "hanzi": "为什么",
    "pinyin": "wèi shén me",
    "english": "why",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "你为什么不吃这个苹果？",
        "pinyin": "Nǐ wèishénme bù chī zhège píngguǒ?",
        "english": "Why don't you eat this apple?"
      }
    ]
  },
  {
    "hanzi": "问",
    "pinyin": "wèn",
    "english": "to ask",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "如果你有问题，可以随时问我。",
        "pinyin": "Rúguǒ nǐ yǒu wèntí, kěyǐ suíshí wèn wǒ.",
        "english": "If you have questions, you can ask me anytime."
      }
    ]
  },
  {
    "hanzi": "问题",
    "pinyin": "wèn tí",
    "english": " problem, question",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我对这个问题很感兴趣。",
        "pinyin": "Wǒ duì zhège wèntí hěn gǎn xìngqù.",
        "english": "I am very interested in this question."
      }
    ]
  },
  {
    "hanzi": "洗",
    "pinyin": "xǐ",
    "english": "to wash",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "吃饭前一定要洗手。",
        "pinyin": "Chī fàn qián yīdìng yào xǐ shǒu.",
        "english": "You must wash your hands before eating."
      }
    ]
  },
  {
    "hanzi": "西瓜",
    "pinyin": "xī guā",
    "english": "watermelon",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "夏天吃西瓜是最棒的。",
        "pinyin": "Xiàtiān chī xīguā shì zuì bàng de.",
        "english": "Eating watermelon in the summer is the best."
      }
    ]
  },
  {
    "hanzi": "希望",
    "pinyin": "xī wàng",
    "english": " to hope, to wish",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我希望明天是个晴天。",
        "pinyin": "Wǒ xīwàng míngtiān shì ge qíngtiān.",
        "english": "I hope tomorrow is a sunny day."
      }
    ]
  },
  {
    "hanzi": "向",
    "pinyin": "xiàng",
    "english": "towards",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "房子朝南向阳。",
        "pinyin": "Fángzi cháo nán xiàng yáng.",
        "english": "The house faces south and gets sunlight."
      }
    ]
  },
  {
    "hanzi": "笑",
    "pinyin": "xiào",
    "english": " to smile, to laugh",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "听到这个笑话，大家都笑了。",
        "pinyin": "Tīng dào zhège xiàohuà, dàjiā dōu xiào le.",
        "english": "Hearing this joke, everyone laughed."
      }
    ]
  },
  {
    "hanzi": "小时",
    "pinyin": "xiǎo shí",
    "english": "hour",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "他每天学习汉语两个小时。",
        "pinyin": "Tā měitiān xuéxí Hànyǔ liǎng ge xiǎoshí.",
        "english": "He studies Chinese for two hours every day."
      }
    ]
  },
  {
    "hanzi": "新",
    "pinyin": "xīn",
    "english": "new",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我买了一双新鞋子。",
        "pinyin": "Wǒ mǎi le yī shuāng xīn xiézi.",
        "english": "I bought a new pair of shoes."
      }
    ]
  },
  {
    "hanzi": "姓",
    "pinyin": "xìng",
    "english": "surname",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "请问您贵姓大名？",
        "pinyin": "Qǐng wèn nín guì xìng dà míng?",
        "english": "May I ask your honored surname and full name?"
      }
    ]
  },
  {
    "hanzi": "休息",
    "pinyin": "xiū xi",
    "english": "to rest",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "工作太累了，你应该休息一下。",
        "pinyin": "Gōngzuò tài lèi le, nǐ yīnggāi xiūxi yīxià.",
        "english": "Work is too tiring, you should rest for a bit."
      }
    ]
  },
  {
    "hanzi": "雪",
    "pinyin": "xuě",
    "english": "snow",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "昨天晚上下了一场大雪。",
        "pinyin": "Zuótiān wǎnshang xià le yī chǎng dà xuě.",
        "english": "There was heavy snow last night."
      }
    ]
  },
  {
    "hanzi": "眼睛",
    "pinyin": "yǎn jing",
    "english": "eye",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "她的眼睛又大又亮。",
        "pinyin": "Tā de yǎnjing yòu dà yòu liàng.",
        "english": "Her eyes are big and bright."
      }
    ]
  },
  {
    "hanzi": "颜色",
    "pinyin": "yán sè",
    "english": "colour",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我最喜欢的颜色是蓝色。",
        "pinyin": "Wǒ zuì xǐhuān de yánsè shì lán sè.",
        "english": "My favorite color is blue."
      }
    ]
  },
  {
    "hanzi": "羊肉",
    "pinyin": "yáng ròu",
    "english": "mutton",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "晚上我们吃羊肉火锅。",
        "pinyin": "Wǎnshang wǒmen chī yángròu huǒguō.",
        "english": "We’re eating mutton hotpot tonight."
      }
    ]
  },
  {
    "hanzi": "药",
    "pinyin": "yào",
    "english": "medicine",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "记得饭后吃药。",
        "pinyin": "Jìde fàn hòu chī yào.",
        "english": "Remember to take the medicine after the meal."
      }
    ]
  },
  {
    "hanzi": "要",
    "pinyin": "yào",
    "english": "to want to",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我明天要去北京。",
        "pinyin": "Wǒ míngtiān yào qù Běijīng.",
        "english": "I am going to Beijing tomorrow."
      }
    ]
  },
  {
    "hanzi": "也",
    "pinyin": "yě",
    "english": "also",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我喜欢喝茶，他也喜欢。",
        "pinyin": "Wǒ xǐhuān hē chá, tā yě xǐhuān.",
        "english": "I like drinking tea, and he likes it too."
      }
    ]
  },
  {
    "hanzi": "已经",
    "pinyin": "yǐ jīng",
    "english": "already",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我已经吃完饭了。",
        "pinyin": "Wǒ yǐjīng chī wán fàn le.",
        "english": "I have already finished eating."
      }
    ]
  },
  {
    "hanzi": "一起",
    "pinyin": "yì qǐ",
    "english": "together",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我们一起去超市买东西吧。",
        "pinyin": "Wǒmen yīqǐ qù chāoshì mǎi dōngxi ba.",
        "english": "Let's go to the supermarket to buy things together."
      }
    ]
  },
  {
    "hanzi": "意思",
    "pinyin": "yì si",
    "english": "meaning",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "你说的这是什么意思？",
        "pinyin": "Nǐ shuō de zhè shì shénme yìsi?",
        "english": "What does what you said mean?"
      }
    ]
  },
  {
    "hanzi": "阴",
    "pinyin": "yīn",
    "english": "cloudy",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "今天外面是阴天。",
        "pinyin": "Jīntiān wàimiàn shì yīntiān.",
        "english": "It is cloudy outside today."
      }
    ]
  },
  {
    "hanzi": "因为",
    "pinyin": "yīn wèi",
    "english": "because",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我今天很忙，因为有很多工作要做。",
        "pinyin": "Wǒ jīntiān hěn máng, yīnwèi yǒu hěn duō gōngzuò yào zuò.",
        "english": "I am very busy today because I have a lot of work to do."
      }
    ]
  },
  {
    "hanzi": "右边",
    "pinyin": "yòu bian",
    "english": "right side",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "请往右边看。",
        "pinyin": "Qǐng wǎng yòubian kàn.",
        "english": "Please look to the right side."
      }
    ]
  },
  {
    "hanzi": "游泳",
    "pinyin": "yóu yǒng",
    "english": "to swim",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我喜欢夏天去海边游泳。",
        "pinyin": "Wǒ xǐhuān xiàtiān qù hǎibiān yóuyǒng.",
        "english": "I like going swimming at the beach in the summer."
      }
    ]
  },
  {
    "hanzi": "鱼",
    "pinyin": "yú",
    "english": "fish",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我不太喜欢吃鱼。",
        "pinyin": "Wǒ bú tài xǐhuān chī yú.",
        "english": "I don't really like eating fish."
      }
    ]
  },
  {
    "hanzi": "元",
    "pinyin": "yuán",
    "english": "MW: for money Yuan",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "这本书二十元。",
        "pinyin": "Zhè běn shū èrshí yuán.",
        "english": "This book is 20 yuan."
      }
    ]
  },
  {
    "hanzi": "远",
    "pinyin": "yuǎn",
    "english": " far, distant",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "学校离我家很远。",
        "pinyin": "Xuéxiào lí wǒ jiā hěn yuǎn.",
        "english": "The school is very far from my home."
      }
    ]
  },
  {
    "hanzi": "运动",
    "pinyin": "yùn dòng",
    "english": "sports; to move",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "每天运动对身体有好处。",
        "pinyin": "Měitiān yùndòng duì shēntǐ yǒu hǎochù.",
        "english": "Exercising every day is beneficial for the body."
      }
    ]
  },
  {
    "hanzi": "再",
    "pinyin": "zài",
    "english": " again, once more",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "请你再说一遍。",
        "pinyin": "Qǐng nǐ zài shuō yī biàn.",
        "english": "Please say it one more time."
      }
    ]
  },
  {
    "hanzi": "早上",
    "pinyin": "zǎo shang",
    "english": "early morning",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我早上七点起床。",
        "pinyin": "Wǒ zǎoshang qī diǎn qǐchuáng.",
        "english": "I get up at seven o'clock in the morning."
      }
    ]
  },
  {
    "hanzi": "张",
    "pinyin": "zhāng",
    "english": "MW: for flat objects",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "请给我一张纸。",
        "pinyin": "Qǐng gěi wǒ yī zhāng zhǐ.",
        "english": "Please give me a piece of paper."
      }
    ]
  },
  {
    "hanzi": "丈夫",
    "pinyin": "zhàng fu",
    "english": "husband",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "她的丈夫是一名老师。",
        "pinyin": "Tā de zhàngfu shì yī míng lǎoshī.",
        "english": "Her husband is a teacher."
      }
    ]
  },
  {
    "hanzi": "找",
    "pinyin": "zhǎo",
    "english": "to look for",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "你在找什么东西？",
        "pinyin": "Nǐ zài zhǎo shénme dōngxi?",
        "english": "What are you looking for?"
      }
    ]
  },
  {
    "hanzi": "着",
    "pinyin": "zhe",
    "english": "particle: indicating action in progress",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "他笑着对我说“你好”。",
        "pinyin": "Tā xiàozhe duì wǒ shuō \"\"Nǐ hǎo.\"\"",
        "english": "He smiled and said \"\"Hello\"\" to me."
      }
    ]
  },
  {
    "hanzi": "真",
    "pinyin": "zhēn",
    "english": " real, true",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "今天的太阳真大。",
        "pinyin": "Jīntiān de tàiyáng zhēn dà.",
        "english": "Today's sun is really strong."
      }
    ]
  },
  {
    "hanzi": "正在",
    "pinyin": "zhèng zài",
    "english": "in the process of",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我正在做饭，请等一下。",
        "pinyin": "Wǒ zhèngzài zuò fàn, qǐng děng yīxià.",
        "english": "I am currently cooking, please wait a moment."
      }
    ]
  },
  {
    "hanzi": "知道",
    "pinyin": "zhī dào",
    "english": "to know",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我知道怎么去那个地方。",
        "pinyin": "Wǒ zhīdào zěnme qù nàge dìfang.",
        "english": "I know how to get to that place."
      }
    ]
  },
  {
    "hanzi": "准备",
    "pinyin": "zhǔn bèi",
    "english": "to prepare",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "你们准备好了吗？",
        "pinyin": "Nǐmen zhǔnbèi hǎo le ma?",
        "english": "Are you guys ready?"
      }
    ]
  },
  {
    "hanzi": "自行车",
    "pinyin": "zì xíng chē",
    "english": "bicycle",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我骑自行车去上班。",
        "pinyin": "Wǒ qí zìxíngchē qù shàng bān.",
        "english": "I ride a bike to work."
      }
    ]
  },
  {
    "hanzi": "走",
    "pinyin": "zǒu",
    "english": "to walk",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "我们现在该走了。",
        "pinyin": "Wǒmen xiànzài gāi zǒu le.",
        "english": "We should go now."
      }
    ]
  },
  {
    "hanzi": "最",
    "pinyin": "zuì",
    "english": "most",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "这是我最喜欢的一本书。",
        "pinyin": "Zhè shì wǒ zuì xǐhuān de yī běn shū.",
        "english": "This is my favorite book."
      }
    ]
  },
  {
    "hanzi": "左边",
    "pinyin": "zuǒ bian",
    "english": "left side",
    "hsk": "HSK 2",
    "exampleSentences": [
      {
        "chinese": "请把车停在左边。",
        "pinyin": "Qǐng bǎ chē tíng zài zuǒbian.",
        "english": "Please park the car on the left side."
      }
    ]
  },
  {
    "hanzi": "啊",
    "pinyin": "a",
    "english": "Particle: showing approval",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "啊，原来是你！",
        "pinyin": "À, yuánlái shì nǐ!",
        "english": "Ah, so it was you!"
      }
    ]
  },
  {
    "hanzi": "阿姨",
    "pinyin": "ā yí",
    "english": "Noun: aunt",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "阿姨，请问邮局在哪里？",
        "pinyin": "Āyí, qǐngwèn yóujú zài nǎli?",
        "english": "Auntie (Madam), excuse me, where is the post office?"
      }
    ]
  },
  {
    "hanzi": "矮",
    "pinyin": "ǎi",
    "english": "Adjective: low, short",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他比他的弟弟高，不矮。",
        "pinyin": "Tā bǐ tā de dìdi gāo, bù ǎi.",
        "english": "He is taller than his younger brother, not short."
      }
    ]
  },
  {
    "hanzi": "爱好",
    "pinyin": "ài hào",
    "english": " Noun: hobby, interest; Verb: to like",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "你的爱好是什么？",
        "pinyin": "Nǐ de àihào shì shénme?",
        "english": "What is your hobby?"
      }
    ]
  },
  {
    "hanzi": "把",
    "pinyin": "bǎ",
    "english": " Noun: handle; Verb: to grasp, to hold; Particle: for ba-sentences; Measure Word: for a bunch or objects with handle",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请把书给我。",
        "pinyin": "Qǐng bǎ shū gěi wǒ.",
        "english": "Please give me the book."
      }
    ]
  },
  {
    "hanzi": "半",
    "pinyin": "bàn",
    "english": "Number: half",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "半小时后见面。",
        "pinyin": "Bàn xiǎoshí hòu jiàn miàn.",
        "english": "Meet in half an hour."
      }
    ]
  },
  {
    "hanzi": "搬",
    "pinyin": "bān",
    "english": "Verb: to move, to shift",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我们搬到新家了。",
        "pinyin": "Wǒmen bān dào xīn jiā le.",
        "english": "We moved to a new home."
      }
    ]
  },
  {
    "hanzi": "班",
    "pinyin": "bān",
    "english": " Noun: class, team, squad; Measure Word: for groups, rankings, etc.",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我们班有四十个学生。",
        "pinyin": "Wǒmen bān yǒu sìshí ge xuésheng.",
        "english": "Our class has forty students."
      }
    ]
  },
  {
    "hanzi": "办法",
    "pinyin": "bàn fǎ",
    "english": "Noun: method, way, means",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我有办法解决问题。",
        "pinyin": "Wǒ yǒu bànfǎ jiějué wèntí.",
        "english": "I have a way to solve the problem."
      }
    ]
  },
  {
    "hanzi": "办公室",
    "pinyin": "bàn gōng shì",
    "english": "Noun: office, bureau",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "办公室在三楼。",
        "pinyin": "Bàngōngshì zài sān lóu.",
        "english": "The office is on the third floor."
      }
    ]
  },
  {
    "hanzi": "饱",
    "pinyin": "bǎo",
    "english": "Adjective: full from eating",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "吃饱了别吃了。",
        "pinyin": "Chī bǎo le bié chī le.",
        "english": "Stop eating when you’re full."
      }
    ]
  },
  {
    "hanzi": "包",
    "pinyin": "bāo",
    "english": " Noun: bag, package; Verb: to cover, to wrap, to hold, to include",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我买了一个包。",
        "pinyin": "Wǒ mǎi le yī gè bāo.",
        "english": "I bought a bag."
      }
    ]
  },
  {
    "hanzi": "被",
    "pinyin": "bèi",
    "english": "Relative Clause: by for passive sentence",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "书被我弄丢了。",
        "pinyin": "Shū bèi wǒ nòng diū le.",
        "english": "The book was lost by me."
      }
    ]
  },
  {
    "hanzi": "北方",
    "pinyin": "běi fāng",
    "english": "Location: north, northern part of a country",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我家在北方。",
        "pinyin": "Wǒ jiā zài běifāng.",
        "english": "My home is in the north."
      }
    ]
  },
  {
    "hanzi": "比赛",
    "pinyin": "bǐ sài",
    "english": "Noun: competition, match",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "明天有足球比赛。",
        "pinyin": "Míngtiān yǒu zúqiú bǐsài.",
        "english": "There’s a football match tomorrow."
      }
    ]
  },
  {
    "hanzi": "必须",
    "pinyin": "bì xū",
    "english": "Auxiliary Verb: to have to, to must",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我们必须准时到。",
        "pinyin": "Wǒmen bìxū zhǔnshí dào.",
        "english": "We must arrive on time."
      }
    ]
  },
  {
    "hanzi": "鼻子",
    "pinyin": "bí zi",
    "english": "Noun: nose",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我的鼻子有点疼。",
        "pinyin": "Wǒ de bízi yǒudiǎn téng.",
        "english": "My nose hurts a bit."
      }
    ]
  },
  {
    "hanzi": "变化",
    "pinyin": "biàn huà",
    "english": "Noun: change, variation",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "天气变化很快。",
        "pinyin": "Tiānqì biànhuà hěn kuài.",
        "english": "The weather changes quickly."
      }
    ]
  },
  {
    "hanzi": "表示",
    "pinyin": "biǎo shì",
    "english": "Verb: to express, to show, to indicate",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他表示同意我们的看法。",
        "pinyin": "Tā biǎoshì tóngyì wǒmen de kànfǎ.",
        "english": "He expressed agreement with our point of view."
      }
    ]
  },
  {
    "hanzi": "表演",
    "pinyin": "biǎo yǎn",
    "english": " Noun: performance, show; Verb: to perform, to act",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "晚上的表演非常精彩。",
        "pinyin": "Wǎnshang de biǎoyǎn fēicháng jīngcǎi.",
        "english": "The evening performance was very wonderful."
      }
    ]
  },
  {
    "hanzi": "别人",
    "pinyin": "bié ren",
    "english": "Pronoun: others, other people",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "别管别人怎么想。",
        "pinyin": "Bié guǎn biérén zěnme xiǎng.",
        "english": "Don’t care what others think."
      }
    ]
  },
  {
    "hanzi": "才",
    "pinyin": "cái",
    "english": " Noun: ability, talent Adverb: just, only if",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我八点才起床。",
        "pinyin": "Wǒ bā diǎn cái qǐ chuáng.",
        "english": "I didn’t get up until eight."
      }
    ]
  },
  {
    "hanzi": "参加",
    "pinyin": "cān jiā",
    "english": "Verb: to attend, to take part, to join",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我参加公司聚会。",
        "pinyin": "Wǒ cānjiā gōngsī jùhuì.",
        "english": "I attend the company party."
      }
    ]
  },
  {
    "hanzi": "草",
    "pinyin": "cǎo",
    "english": "Noun: grass, straw",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "草地上有很多花。",
        "pinyin": "Cǎo dì shàng yǒu hěn duō huā.",
        "english": "There are many flowers on the grass."
      }
    ]
  },
  {
    "hanzi": "层",
    "pinyin": "céng",
    "english": " Noun: layer, floor; Measure Word: for layer, story, floor",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我家在五层楼。",
        "pinyin": "Wǒ jiā zài wǔ céng lóu.",
        "english": "My home is on the fifth floor."
      }
    ]
  },
  {
    "hanzi": "差",
    "pinyin": "chà",
    "english": " Verb: to lack, short of; Adjective: poor",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "还差五分钟九点。",
        "pinyin": "Hái chà wǔ fēnzhōng jiǔ diǎn.",
        "english": "It’s five minutes to nine."
      }
    ]
  },
  {
    "hanzi": "衬衫",
    "pinyin": "chèn shān",
    "english": "Noun: shirt, blouse",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我买了一件白衬衫。",
        "pinyin": "Wǒ mǎi le yī jiàn bái chènshān.",
        "english": "I bought a white shirt."
      }
    ]
  },
  {
    "hanzi": "成绩",
    "pinyin": "chéng jì",
    "english": "Noun: score, achievement, grades",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "考试成绩出来了。",
        "pinyin": "Kǎoshì chéngjì chū lái le.",
        "english": "The exam results are out."
      }
    ]
  },
  {
    "hanzi": "城市",
    "pinyin": "chéng shì",
    "english": "Noun: city, town",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "北京是一个大城市。",
        "pinyin": "Běijīng shì yī gè dà chéngshì.",
        "english": "Beijing is a big city."
      }
    ]
  },
  {
    "hanzi": "迟到",
    "pinyin": "chí dào",
    "english": "Verb: to be late",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "今天我迟到了十分钟。",
        "pinyin": "Jīntiān wǒ chídào le shí fēnzhōng.",
        "english": "I was ten minutes late today."
      }
    ]
  },
  {
    "hanzi": "厨房",
    "pinyin": "chú fáng",
    "english": "Noun: kitchen",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "厨房里很干净。",
        "pinyin": "Chúfáng lǐ hěn gānjìng.",
        "english": "The kitchen is clean."
      }
    ]
  },
  {
    "hanzi": "除了",
    "pinyin": "chú le",
    "english": "Conjunction: except for, apart from, besides",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "除了苹果我还买了香蕉。",
        "pinyin": "Chūle píngguǒ wǒ hái mǎi le xiāngjiāo.",
        "english": "Besides apples"
      }
    ]
  },
  {
    "hanzi": "出现",
    "pinyin": "chū xiàn",
    "english": "Verb: to appear, to arise",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "问题突然出现了。",
        "pinyin": "Wèntí tūrán chūxiàn le.",
        "english": "The problem suddenly appeared."
      }
    ]
  },
  {
    "hanzi": "春",
    "pinyin": "chūn",
    "english": "Noun: spring",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "春天是旅游的好季节。",
        "pinyin": "Chūntiān shì lǚyóu de hǎo jìjié.",
        "english": "Spring is a good season for travel."
      }
    ]
  },
  {
    "hanzi": "词语",
    "pinyin": "cí yǔ",
    "english": "Noun: word, expression",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我记不住这些新的词语。",
        "pinyin": "Wǒ jìbúzhù zhèxiē xīn de cíyǔ.",
        "english": "I cannot remember these new words/phrases."
      }
    ]
  },
  {
    "hanzi": "聪明",
    "pinyin": "cōng ming",
    "english": "Adjective: clever, intelligent, smart",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我的弟弟很聪明。",
        "pinyin": "Wǒ de dìdi hěn cōngming.",
        "english": "My little brother is very smart."
      }
    ]
  },
  {
    "hanzi": "打扫",
    "pinyin": "dǎ sǎo",
    "english": "Verb: to clean",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "星期六我打扫房间。",
        "pinyin": "Xīngqīliù wǒ dǎsǎo fángjiān.",
        "english": "I clean the room on Saturday."
      }
    ]
  },
  {
    "hanzi": "打算",
    "pinyin": "dǎ suàn",
    "english": " Noun: plan, intention; Verb: to plan, to think of, to calculate",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我打算去超市买菜。",
        "pinyin": "Wǒ dǎsuàn qù chāoshì mǎi cài.",
        "english": "I plan to go to the supermarket to buy groceries."
      }
    ]
  },
  {
    "hanzi": "当然",
    "pinyin": "dāng rán",
    "english": "Adverb: certainly, of course",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "当然可以借给你。",
        "pinyin": "Dāngrán kěyǐ jiè gěi nǐ.",
        "english": "Of course I can lend it to you."
      }
    ]
  },
  {
    "hanzi": "地",
    "pinyin": "de",
    "english": "Particle: used before a verb",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "慢慢地走。",
        "pinyin": "Màn man de zǒu.",
        "english": "Walk slowly."
      }
    ]
  },
  {
    "hanzi": "低",
    "pinyin": "dī",
    "english": "Adjective: low",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请把声音调低一点。",
        "pinyin": "Qǐng bǎ shēngyīn tiáo dī yīdiǎn.",
        "english": "Please turn the volume down a little."
      }
    ]
  },
  {
    "hanzi": "地方",
    "pinyin": "dì fang",
    "english": "Noun: region, place, location",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这个地方很安静。",
        "pinyin": "Zhège dìfang hěn ānjìng.",
        "english": "This place is very quiet."
      }
    ]
  },
  {
    "hanzi": "地铁",
    "pinyin": "dì tiě",
    "english": "Noun: subway",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我每天坐地铁上班。",
        "pinyin": "Wǒ měi tiān zuò dìtiě shàng bān.",
        "english": "I take the subway to work every day."
      }
    ]
  },
  {
    "hanzi": "地图",
    "pinyin": "dì tú",
    "english": "Noun: map",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请给我一张城市地图。",
        "pinyin": "Qǐng gěi wǒ yī zhāng chéngshì dìtú.",
        "english": "Please give me a city map."
      }
    ]
  },
  {
    "hanzi": "电梯",
    "pinyin": "diàn tī",
    "english": "Noun: elevator",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "电梯坏了我们走楼梯。",
        "pinyin": "Diàntī huài le wǒmen zǒu lóutī.",
        "english": "The elevator is broken"
      }
    ]
  },
  {
    "hanzi": "电子邮件",
    "pinyin": "diàn zǐ yóu jiàn",
    "english": "Noun: email",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我给他发电子邮件。",
        "pinyin": "Wǒ gěi tā fā diànzǐ yóujiàn.",
        "english": "I send him an email."
      }
    ]
  },
  {
    "hanzi": "东",
    "pinyin": "dōng",
    "english": "Location: east",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "太阳从东边升起。",
        "pinyin": "Tàiyáng cóng dōngbian shēngqǐ.",
        "english": "The sun rises from the east."
      }
    ]
  },
  {
    "hanzi": "冬",
    "pinyin": "dōng",
    "english": "Noun: winter",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "冬天穿厚衣服。",
        "pinyin": "Dōngtiān chuān hòu yīfu.",
        "english": "Wear thick clothes in winter."
      }
    ]
  },
  {
    "hanzi": "动物",
    "pinyin": "dòng wù",
    "english": "Noun: animal",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "动物园有很多动物。",
        "pinyin": "Dòngwùyuán yǒu hěn duō dòngwù.",
        "english": "The zoo has many animals."
      }
    ]
  },
  {
    "hanzi": "段",
    "pinyin": "duàn",
    "english": "Measure Word: for paragraphs, segments, periods, stories",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这是一段很精彩的表演。",
        "pinyin": "Zhè shì yī duàn hěn jīngcǎi de biǎoyǎn.",
        "english": "This is a very wonderful performance (segment)."
      }
    ]
  },
  {
    "hanzi": "多么",
    "pinyin": "duō me",
    "english": "Adverb: how, what",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "今天多么冷啊！",
        "pinyin": "Jīntiān duōme lěng a!",
        "english": "How cold it is today!"
      }
    ]
  },
  {
    "hanzi": "耳朵",
    "pinyin": "ěr duo",
    "english": "Noun: ear",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "耳朵疼去看医生。",
        "pinyin": "Ěrduo téng qù kàn yīshēng.",
        "english": "Go to the doctor if your ears hurt."
      }
    ]
  },
  {
    "hanzi": "而且",
    "pinyin": "ér qiě",
    "english": "Conjunction: moreover, in addition, furthermore",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这件衣服便宜而且好看。",
        "pinyin": "Zhè jiàn yīfu piányi érqiě hǎokàn.",
        "english": "This shirt is cheap and nice."
      }
    ]
  },
  {
    "hanzi": "发烧",
    "pinyin": "fā shāo",
    "english": "Verb: to have fever",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "孩子发烧要去医院。",
        "pinyin": "Háizi fā shāo yào qù yīyuàn.",
        "english": "The child has a fever and needs the hospital."
      }
    ]
  },
  {
    "hanzi": "发现",
    "pinyin": "fā xiàn",
    "english": "Verb: to discover, to find",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我发现钱包丢了。",
        "pinyin": "Wǒ fāxiàn qiánbāo diū le.",
        "english": "I found my wallet was lost."
      }
    ]
  },
  {
    "hanzi": "放",
    "pinyin": "fàng",
    "english": "Verb: to let go, to put, have a vacation",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "把书放桌上。",
        "pinyin": "Bǎ shū fàng zhuō shàng.",
        "english": "Put the book on the table."
      }
    ]
  },
  {
    "hanzi": "放心",
    "pinyin": "fàng xīn",
    "english": "Verb: to rest, to be at ease",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请放心我来做。",
        "pinyin": "Qǐng fàngxīn wǒ lái zuò.",
        "english": "Don’t worry"
      }
    ]
  },
  {
    "hanzi": "分",
    "pinyin": "fēn",
    "english": " Noun: minute, point, 0.01 Yuan; Verb: to divide, to distinguish",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "现在是八点十分。",
        "pinyin": "Xiànzài shì bā diǎn shí fēn.",
        "english": "It’s ten past eight."
      }
    ]
  },
  {
    "hanzi": "附近",
    "pinyin": "fù jìn",
    "english": "Noun: vicinity; Adverb: nearby; Relative Clause: next to",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "附近有超市吗？",
        "pinyin": "Fùjìn yǒu chāoshì ma?",
        "english": "Is there a supermarket nearby?"
      }
    ]
  },
  {
    "hanzi": "复习",
    "pinyin": "fù xí",
    "english": "Noun: revision; Verb: to revise",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "晚上我要复习功课。",
        "pinyin": "Wǎnshang wǒ yào fùxí gōngkè.",
        "english": "I need to review lessons tonight."
      }
    ]
  },
  {
    "hanzi": "敢",
    "pinyin": "gǎn",
    "english": "Auxiliary Verb: to dare",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "你敢一个人回家吗？",
        "pinyin": "Nǐ gǎn yīgè rén huí jiā ma?",
        "english": "Do you dare to go home alone?"
      }
    ]
  },
  {
    "hanzi": "感冒",
    "pinyin": "gǎn mào",
    "english": "Noun: common cold Verb: to catch a cold",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我感冒了要吃药。",
        "pinyin": "Wǒ gǎnmào le yào chī yào.",
        "english": "I caught a cold and need medicine."
      }
    ]
  },
  {
    "hanzi": "刚才",
    "pinyin": "gāng cái",
    "english": "Time: just a moment ago",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "刚才我在超市买菜。",
        "pinyin": "Gāngcái wǒ zài chāoshì mǎi cài.",
        "english": "I was buying groceries at the supermarket just now."
      }
    ]
  },
  {
    "hanzi": "跟",
    "pinyin": "gēn",
    "english": "Verb: to follow Relative Clause: with Conjunction: and",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我跟他去超市。",
        "pinyin": "Wǒ gēn tā qù chāoshì.",
        "english": "I go to the supermarket with him."
      }
    ]
  },
  {
    "hanzi": "根据",
    "pinyin": "gēn jù",
    "english": " Noun: basis, foundation Relative Clause: according to, based on Verb: to base on",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "根据天气预报会下雨。",
        "pinyin": "Gēnjù tiānqì yùbào huì xià yǔ.",
        "english": "According to the weather forecast"
      }
    ]
  },
  {
    "hanzi": "更",
    "pinyin": "gèng",
    "english": "Adverb: even more",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "今天更冷了。",
        "pinyin": "Jīntiān gèng lěng le.",
        "english": "It’s even colder today."
      }
    ]
  },
  {
    "hanzi": "公园",
    "pinyin": "gōng yuán",
    "english": "Noun: park",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "公园里很多人散步。",
        "pinyin": "Gōngyuán lǐ hěn duō rén sànbù.",
        "english": "Many people walk in the park."
      }
    ]
  },
  {
    "hanzi": "故事",
    "pinyin": "gù shi",
    "english": "Noun: story, tale",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "妈妈给我讲故事。",
        "pinyin": "Māma gěi wǒ jiǎng gùshi.",
        "english": "Mom tells me stories."
      }
    ]
  },
  {
    "hanzi": "刮风",
    "pinyin": "guā fēng",
    "english": "Verb: to be windy",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "外面刮风了关窗吧。",
        "pinyin": "Wàimiàn guā fēng le guān chuāng ba.",
        "english": "It’s windy outside"
      }
    ]
  },
  {
    "hanzi": "关系",
    "pinyin": "guān xì",
    "english": " Noun: relationship, relation Verb: to affect, to have to do with",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我们关系很好。",
        "pinyin": "Wǒmen guānxi hěn hǎo.",
        "english": "We have a good relationship."
      }
    ]
  },
  {
    "hanzi": "关心",
    "pinyin": "guān xīn",
    "english": "Noun: concern Verb: to care for",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "妈妈很关心我的学习。",
        "pinyin": "Māma hěn guānxīn wǒ de xuéxí.",
        "english": "Mom cares a lot about my studies."
      }
    ]
  },
  {
    "hanzi": "关于",
    "pinyin": "guān yú",
    "english": "Relative Clause: concerning, with regards to, about",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "关于工作我们明天谈。",
        "pinyin": "Guānyú gōngzuò wǒmen míngtiān tán.",
        "english": "About work"
      }
    ]
  },
  {
    "hanzi": "国家",
    "pinyin": "guó jiā",
    "english": "Noun: country, state, nation",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "中国是一个大国。",
        "pinyin": "Zhōngguó shì yī gè dà guó.",
        "english": "China is a big country."
      }
    ]
  },
  {
    "hanzi": "过去",
    "pinyin": "guò qù",
    "english": " Verb: to go over, to pass by Adverb: past, former",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "过去看看怎么了。",
        "pinyin": "Guòqù kànkan zěnme le.",
        "english": "Go over and see what happened."
      }
    ]
  },
  {
    "hanzi": "果汁",
    "pinyin": "guǒ zhī",
    "english": "Noun: fruit juice",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我喜欢喝鲜榨的橙子果汁。",
        "pinyin": "Wǒ xǐhuan hē xiānzhà de chéngzi guǒzhī.",
        "english": "I like to drink freshly squeezed orange juice."
      }
    ]
  },
  {
    "hanzi": "害怕",
    "pinyin": "hài pà",
    "english": "Verb: to be afraid, to fear",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "孩子害怕黑。",
        "pinyin": "Háizi hàipà hēi.",
        "english": "The child is afraid of the dark."
      }
    ]
  },
  {
    "hanzi": "还是",
    "pinyin": "hái shì",
    "english": " Adverb: still, nevertheless Conjunction: or",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "你喝茶还是咖啡？",
        "pinyin": "Nǐ hē chá háishì kāfēi?",
        "english": "Tea or coffee?"
      }
    ]
  },
  {
    "hanzi": "河",
    "pinyin": "hé",
    "english": "Noun: river",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "河边有很多树。",
        "pinyin": "Hé biān yǒu hěn duō shù.",
        "english": "There are many trees by the river."
      }
    ]
  },
  {
    "hanzi": "黑板",
    "pinyin": "hēi bǎn",
    "english": "Noun: blackboard",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "老师在黑板上写字。",
        "pinyin": "Lǎoshī zài hēibǎn shàng xiě zì.",
        "english": "The teacher writes on the blackboard."
      }
    ]
  },
  {
    "hanzi": "护照",
    "pinyin": "hù zhào",
    "english": "Noun: passport",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "出国要带护照。",
        "pinyin": "Chūguó yào dài hùzhào.",
        "english": "Bring your passport when going abroad."
      }
    ]
  },
  {
    "hanzi": "画",
    "pinyin": "huà",
    "english": " Noun: picture, painting Verb: to draw, to paint",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "墙上挂着一幅画。",
        "pinyin": "Qiáng shàng guà zhe yī fú huà.",
        "english": "A painting hangs on the wall."
      }
    ]
  },
  {
    "hanzi": "花",
    "pinyin": "huā",
    "english": "Noun: flower Verb: to spend",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他花了很多时间学习中文。",
        "pinyin": "Tā huāle hěn duō shíjiān xuéxí Zhōngwén.",
        "english": "He spent a lot of time studying Chinese."
      }
    ]
  },
  {
    "hanzi": "花园",
    "pinyin": "huā yuán",
    "english": "Noun: garden",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我们家有个小花园。",
        "pinyin": "Wǒmen jiā yǒu gè xiǎo huāyuán.",
        "english": "We have a small garden at home."
      }
    ]
  },
  {
    "hanzi": "坏",
    "pinyin": "huài",
    "english": "Adjective: bad, broken, spoiled",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我的手机坏了。",
        "pinyin": "Wǒ de shǒujī huài le.",
        "english": "My phone is broken."
      }
    ]
  },
  {
    "hanzi": "换",
    "pinyin": "huàn",
    "english": "Verb: to change, to exchange",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "换衣服去吃饭。",
        "pinyin": "Huàn yīfu qù chī fàn.",
        "english": "Change clothes to eat."
      }
    ]
  },
  {
    "hanzi": "环境",
    "pinyin": "huán jìng",
    "english": "Noun: environment, surroundings",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "保护环境很重要。",
        "pinyin": "Bǎohù huánjìng hěn zhòngyào.",
        "english": "Protecting the environment is important."
      }
    ]
  },
  {
    "hanzi": "黄",
    "pinyin": "huáng",
    "english": " Verb: to fall through Adjective: yellow, pornographic",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "香蕉皮是黄色的。",
        "pinyin": "Xiāngjiāo pí shì huángsè de.",
        "english": "Banana peel is yellow."
      }
    ]
  },
  {
    "hanzi": "会议",
    "pinyin": "huì yì",
    "english": "Noun: meeting, conference",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "明天上午有公司会议。",
        "pinyin": "Míngtiān shàngwǔ yǒu gōngsī huìyì.",
        "english": "There’s a company meeting tomorrow morning."
      }
    ]
  },
  {
    "hanzi": "或者",
    "pinyin": "huò zhě",
    "english": "Conjunction: or, possibly",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "喝茶或者咖啡？",
        "pinyin": "Hē chá huòzhě kāfēi?",
        "english": "Tea or coffee?"
      }
    ]
  },
  {
    "hanzi": "极",
    "pinyin": "jí",
    "english": " Noun: pole Adverb: extremely, highly",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这个电影极好看。",
        "pinyin": "Zhège diànyǐng jí hǎokàn.",
        "english": "This movie is extremely good."
      }
    ]
  },
  {
    "hanzi": "记得",
    "pinyin": "jì de",
    "english": "Verb: to remember",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我记得你的生日。",
        "pinyin": "Wǒ jìde nǐ de shēngrì.",
        "english": "I remember your birthday."
      }
    ]
  },
  {
    "hanzi": "几乎",
    "pinyin": "jī hū",
    "english": "Adverb: almost, nearly",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我几乎每天跑步。",
        "pinyin": "Wǒ jīhū měi tiān pǎo bù.",
        "english": "I run almost every day."
      }
    ]
  },
  {
    "hanzi": "季节",
    "pinyin": "jì jié",
    "english": "Noun: season, period",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "秋天是收获的季节。",
        "pinyin": "Qiūtiān shì shōuhuò de jìjié.",
        "english": "Autumn is the harvest season."
      }
    ]
  },
  {
    "hanzi": "检查",
    "pinyin": "jiǎn chá",
    "english": " Noun: inspection Verb: to check, to inspect, to examine",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "开车前，记得检查一下轮胎。",
        "pinyin": "Kāichē qián, jìde jiǎnchá yīxià lúntāi.",
        "english": "Before driving, remember to check the tires."
      }
    ]
  },
  {
    "hanzi": "简单",
    "pinyin": "jiǎn dān",
    "english": "Adjective: simple, uncomplicated",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这个问题比我想象的要简单。",
        "pinyin": "Zhège wèntí bǐ wǒ xiǎngxiàng de yào jiǎndān.",
        "english": "This problem is simpler than I imagined."
      }
    ]
  },
  {
    "hanzi": "健康",
    "pinyin": "jiàn kāng",
    "english": "Noun: health Adjective: healthy",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "运动对保持身体健康非常有益。",
        "pinyin": "Yùndòng duì bǎochí shēntǐ jiànkāng fēicháng yǒuyì.",
        "english": "Exercise is very beneficial for maintaining physical health."
      }
    ]
  },
  {
    "hanzi": "见面",
    "pinyin": "jiàn miàn",
    "english": "Verb: to meet, to see sb.",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我们约好明天见面。",
        "pinyin": "Wǒmen yuē hǎo míngtiān jiàn miàn.",
        "english": "We agreed to meet tomorrow."
      }
    ]
  },
  {
    "hanzi": "讲",
    "pinyin": "jiǎng",
    "english": " Noun: speech, lecture Verb: to speak, to explain, to negotiate",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请你讲一下这个故事。",
        "pinyin": "Qǐng nǐ jiǎng yīxià zhège gùshi.",
        "english": "Please tell this story."
      }
    ]
  },
  {
    "hanzi": "脚",
    "pinyin": "jiǎo",
    "english": "Noun: foot",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我的脚有点疼。",
        "pinyin": "Wǒ de jiǎo yǒudiǎn téng.",
        "english": "My foot hurts a bit."
      }
    ]
  },
  {
    "hanzi": "角",
    "pinyin": "jiǎo",
    "english": " Noun: angle, corner, horn Measure Word: for 0.1 yuan",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "桌子的角有点尖锐。",
        "pinyin": "Zhuōzi de jiǎo yǒu diǎn jiānruì.",
        "english": "The corner of the table is a bit sharp."
      }
    ]
  },
  {
    "hanzi": "借",
    "pinyin": "jiè",
    "english": "Verb: to lend, to borrow, to make use of an opportunity",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "借我一支笔。",
        "pinyin": "Jiè wǒ yī zhī bǐ.",
        "english": "Lend me a pen."
      }
    ]
  },
  {
    "hanzi": "接",
    "pinyin": "jiē",
    "english": "Verb: to receive, to meet, to connect, to catch",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "爸爸去车站接我。",
        "pinyin": "Bàba qù chēzhàn jiē wǒ.",
        "english": "Dad picks me up at the station."
      }
    ]
  },
  {
    "hanzi": "街道",
    "pinyin": "jiē dào",
    "english": "Noun: street",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这条街道很热闹。",
        "pinyin": "Zhè tiáo jiēdào hěn rènao.",
        "english": "This street is lively."
      }
    ]
  },
  {
    "hanzi": "结婚",
    "pinyin": "jié hūn",
    "english": " Noun: marriage, wedding Verb: to marry",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他们去年结婚了。",
        "pinyin": "Tāmen qùnián jiéhūn le.",
        "english": "They got married last year."
      }
    ]
  },
  {
    "hanzi": "解决",
    "pinyin": "jiě jué",
    "english": "Verb: to settle dispute, to resolve, to solve",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "解决问题的方法。",
        "pinyin": "Jiějué wèntí de fāngfǎ.",
        "english": "Ways to solve problems."
      }
    ]
  },
  {
    "hanzi": "节目",
    "pinyin": "jié mù",
    "english": "Noun: program, item",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "电视节目很好看。",
        "pinyin": "Diànshì jiémù hěn hǎokàn.",
        "english": "The TV program is good."
      }
    ]
  },
  {
    "hanzi": "节日",
    "pinyin": "jié rì",
    "english": "Noun: holiday, festival",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "中秋节是重要节日。",
        "pinyin": "Zhōngqiū jié shì zhòngyào jiérì.",
        "english": "Mid-Autumn Festival is an important holiday."
      }
    ]
  },
  {
    "hanzi": "经常",
    "pinyin": "jīng cháng",
    "english": "Adverb: often, frequently",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我经常去公园散步。",
        "pinyin": "Wǒ jīngcháng qù gōngyuán sànbù.",
        "english": "I often walk in the park."
      }
    ]
  },
  {
    "hanzi": "经过",
    "pinyin": "jīng guò",
    "english": " Verb: to pass, to go through Relative Clause: after, as a result of",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "路过超市买点菜。",
        "pinyin": "Lù guò chāoshì mǎi diǎn cài.",
        "english": "Pass by the supermarket to buy groceries."
      }
    ]
  },
  {
    "hanzi": "经理",
    "pinyin": "jīng lǐ",
    "english": "Noun: manager, director",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "公司经理很忙。",
        "pinyin": "Gōngsī jīnglǐ hěn máng.",
        "english": "The company manager is busy."
      }
    ]
  },
  {
    "hanzi": "旧",
    "pinyin": "jiù",
    "english": "Adjective: old, used, worn",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "旧衣服扔掉吧。",
        "pinyin": "Jiù yīfu rēng diào ba.",
        "english": "Throw away old clothes."
      }
    ]
  },
  {
    "hanzi": "久",
    "pinyin": "jiǔ",
    "english": "Adjective: long time",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我们好久没见面了。",
        "pinyin": "Wǒmen hǎojiǔ méi jiàn miàn le.",
        "english": "We haven’t met for a long time."
      }
    ]
  },
  {
    "hanzi": "举行",
    "pinyin": "jǔ xíng",
    "english": "Verb: to hold meeting, etc.",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "学校举行运动会。",
        "pinyin": "Xuéxiào jǔxíng yùndònghuì.",
        "english": "The school holds a sports meet."
      }
    ]
  },
  {
    "hanzi": "句子",
    "pinyin": "jù zi",
    "english": "Noun: sentence",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这个句子很难懂。",
        "pinyin": "Zhège jùzi hěn nán dǒng.",
        "english": "This sentence is hard to understand."
      }
    ]
  },
  {
    "hanzi": "决定",
    "pinyin": "jué dìng",
    "english": "Noun: decision Verb: to decide",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我决定去北京。",
        "pinyin": "Wǒ juédìng qù Běijīng.",
        "english": "I decide to go to Beijing."
      }
    ]
  },
  {
    "hanzi": "刻",
    "pinyin": "kè",
    "english": " Verb: to cut, to carve Measure Word: for quarter of an hour",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "现在是八刻。",
        "pinyin": "Xiànzài shì bā kè.",
        "english": "It’s a quarter past eight."
      }
    ]
  },
  {
    "hanzi": "可爱",
    "pinyin": "kě ài",
    "english": "Adjective: cute, lovely",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "你的小猫真可爱。",
        "pinyin": "Nǐ de xiǎo māo zhēn kě'ài.",
        "english": "Your kitten is truly cute."
      }
    ]
  },
  {
    "hanzi": "客人",
    "pinyin": "kè rén",
    "english": "Noun: guest, customer, visitor",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "家里来了客人。",
        "pinyin": "Jiālǐ lái le kèrén.",
        "english": "Guests came to the house."
      }
    ]
  },
  {
    "hanzi": "口",
    "pinyin": "kǒu",
    "english": "Noun: mouth Measure Word: for things with mouths or a mouth full of",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "一口饭吃下去。",
        "pinyin": "Yī kǒu fàn chī xiàqù.",
        "english": "Eat a mouthful of rice."
      }
    ]
  },
  {
    "hanzi": "蓝",
    "pinyin": "lán",
    "english": "Adjective: blue",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "天空是蓝色的。",
        "pinyin": "Tiānkōng shì lánsè de.",
        "english": "The sky is blue."
      }
    ]
  },
  {
    "hanzi": "老",
    "pinyin": "lǎo",
    "english": "Adjective: old Adverb: always",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我爷爷很老了。",
        "pinyin": "Wǒ yéye hěn lǎo le.",
        "english": "My grandpa is very old."
      }
    ]
  },
  {
    "hanzi": "离开",
    "pinyin": "lí kāi",
    "english": "Verb: to depart, to leave",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "火车五点离开。",
        "pinyin": "Huǒchē wǔ diǎn líkāi.",
        "english": "The train leaves at five."
      }
    ]
  },
  {
    "hanzi": "历史",
    "pinyin": "lì shǐ",
    "english": "Noun: history",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我喜欢学历史。",
        "pinyin": "Wǒ xǐhuān xué lìshǐ.",
        "english": "I like studying history."
      }
    ]
  },
  {
    "hanzi": "礼物",
    "pinyin": "lǐ wù",
    "english": "Noun: gift, present",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我送朋友生日礼物。",
        "pinyin": "Wǒ sòng péngyou shēngrì lǐwù.",
        "english": "I give my friend a birthday gift."
      }
    ]
  },
  {
    "hanzi": "脸",
    "pinyin": "liǎn",
    "english": "Noun: face",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "洗脸后擦干。",
        "pinyin": "Xǐ liǎn hòu cā gān.",
        "english": "Dry your face after washing."
      }
    ]
  },
  {
    "hanzi": "练习",
    "pinyin": "liàn xí",
    "english": " Noun: exercise, practice Verb: to practice",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "每天练习中文。",
        "pinyin": "Měi tiān liànxí Zhōngwén.",
        "english": "Practice Chinese daily."
      }
    ]
  },
  {
    "hanzi": "了解",
    "pinyin": "liǎo jiě",
    "english": "Verb: to understand",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我了解他的情况。",
        "pinyin": "Wǒ liǎojiě tā de qíngkuàng.",
        "english": "I understand his situation."
      }
    ]
  },
  {
    "hanzi": "邻居",
    "pinyin": "lín jū",
    "english": "Noun: neighbour",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "邻居阿姨很和气。",
        "pinyin": "Línjū āyí hěn héqì.",
        "english": "The neighbor auntie is kind."
      }
    ]
  },
  {
    "hanzi": "楼",
    "pinyin": "lóu",
    "english": "Noun: storied building Measure Word: for floor",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我们住六楼。",
        "pinyin": "Wǒmen zhù liù lóu.",
        "english": "We live on the sixth floor."
      }
    ]
  },
  {
    "hanzi": "绿",
    "pinyin": "lǜ",
    "english": "Adjective: green",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "树叶是绿的。",
        "pinyin": "Shùyè shì lǜ de.",
        "english": "The leaves are green."
      }
    ]
  },
  {
    "hanzi": "马",
    "pinyin": "mǎ",
    "english": "Noun: horse",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我喜欢骑马。",
        "pinyin": "Wǒ xǐhuan qí mǎ.",
        "english": "I like riding horses."
      }
    ]
  },
  {
    "hanzi": "马上",
    "pinyin": "mǎ shàng",
    "english": "Adverb: immediately, at once",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我马上就来。",
        "pinyin": "Wǒ mǎshàng jiù lái.",
        "english": "I’m coming right away."
      }
    ]
  },
  {
    "hanzi": "帽子",
    "pinyin": "mào zi",
    "english": "Noun: hat, cap",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "戴帽子保暖。",
        "pinyin": "Dài màozi bǎo nuǎn.",
        "english": "Wear a hat to keep warm."
      }
    ]
  },
  {
    "hanzi": "明白",
    "pinyin": "míng bai",
    "english": "Verb: to understand Adjective: clear, obvious",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我明白了谢谢。",
        "pinyin": "Wǒ míngbai le xièxie.",
        "english": "I understand"
      }
    ]
  },
  {
    "hanzi": "奶奶",
    "pinyin": "nǎi nai",
    "english": "Noun: grandmother father's mother",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "奶奶给我做饭。",
        "pinyin": "Nǎinai gěi wǒ zuò fàn.",
        "english": "Grandma cooks for me."
      }
    ]
  },
  {
    "hanzi": "南",
    "pinyin": "nán",
    "english": "Location: south",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "南方天气暖和。",
        "pinyin": "Nánfāng tiānqì nuǎnhuo.",
        "english": "The south has warm weather."
      }
    ]
  },
  {
    "hanzi": "年级",
    "pinyin": "nián jí",
    "english": "Noun: grade, year",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我在三年级。",
        "pinyin": "Wǒ zài sān niánjí.",
        "english": "I’m in third grade."
      }
    ]
  },
  {
    "hanzi": "年轻",
    "pinyin": "nián qīng",
    "english": "Adjective: young",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他看起来很年轻。",
        "pinyin": "Tā kàn qǐlái hěn niánqīng.",
        "english": "He looks very young."
      }
    ]
  },
  {
    "hanzi": "鸟",
    "pinyin": "niǎo",
    "english": "Noun: bird",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "树上有鸟在唱歌。",
        "pinyin": "Shù shàng yǒu niǎo zài chàng gē.",
        "english": "Birds are singing in the tree."
      }
    ]
  },
  {
    "hanzi": "爬山",
    "pinyin": "pá shān",
    "english": "Noun: hiking Verb: to climb a mountain",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "星期天我们去爬山。",
        "pinyin": "Xīngqītiān wǒmen qù pá shān.",
        "english": "We go hiking on Sunday."
      }
    ]
  },
  {
    "hanzi": "普通话",
    "pinyin": "pǔ tōng huà",
    "english": "Noun: Mandarin",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请说普通话。",
        "pinyin": "Qǐng shuō pǔtōnghuà.",
        "english": "Please speak Mandarin."
      }
    ]
  },
  {
    "hanzi": "骑",
    "pinyin": "qí",
    "english": "Verb: to ride animal or bike",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我骑车去超市。",
        "pinyin": "Wǒ qí chē qù chāoshì.",
        "english": "I ride a bike to the supermarket."
      }
    ]
  },
  {
    "hanzi": "奇怪",
    "pinyin": "qí guài",
    "english": "Adjective: strange, weird",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "今天天气真奇怪。",
        "pinyin": "Jīntiān tiānqì zhēn qíguài.",
        "english": "The weather is really strange today."
      }
    ]
  },
  {
    "hanzi": "其实",
    "pinyin": "qí shí",
    "english": "Adverb: actually, in fact",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "其实我很累。",
        "pinyin": "Qíshí wǒ hěn lèi.",
        "english": "Actually"
      }
    ]
  },
  {
    "hanzi": "其他",
    "pinyin": "qí tā",
    "english": "Pronoun: other, others",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "其他人都走了。",
        "pinyin": "Qítā rén dōu zǒu le.",
        "english": "Everyone else left."
      }
    ]
  },
  {
    "hanzi": "铅笔",
    "pinyin": "qiān bǐ",
    "english": "Noun: pencil",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我用铅笔写字。",
        "pinyin": "Wǒ yòng qiānbǐ xiě zì.",
        "english": "I write characters using a pencil."
      }
    ]
  },
  {
    "hanzi": "清楚",
    "pinyin": "qīng chu",
    "english": "Adjective: clear, distinct",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "老师说得很清楚。",
        "pinyin": "Lǎoshī shuō de hěn qīngchu.",
        "english": "The teacher spoke very clearly."
      }
    ]
  },
  {
    "hanzi": "秋",
    "pinyin": "qiū",
    "english": "Noun: autumn, fall",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "秋天叶子变黄。",
        "pinyin": "Qiūtiān yèzi biàn huáng.",
        "english": "Leaves turn yellow in autumn."
      }
    ]
  },
  {
    "hanzi": "裙子",
    "pinyin": "qún zi",
    "english": "Noun: skirt",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我买了一条红裙子。",
        "pinyin": "Wǒ mǎi le yī tiáo hóng qúnzi.",
        "english": "I bought a red skirt."
      }
    ]
  },
  {
    "hanzi": "然后",
    "pinyin": "rán hòu",
    "english": "Conjunction: then, afterwards",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我们先吃饭，然后看电影。",
        "pinyin": "Wǒmen xiān chī fàn, ránhòu kàn diànyǐng.",
        "english": "We eat first, then watch a movie."
      }
    ]
  },
  {
    "hanzi": "认为",
    "pinyin": "rèn wéi",
    "english": "Verb: to think, to believe, to consider",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我认为他是对的。",
        "pinyin": "Wǒ rènwéi tā shì duì de.",
        "english": "I think he’s right."
      }
    ]
  },
  {
    "hanzi": "如果",
    "pinyin": "rú guǒ",
    "english": "Conjunction: if",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "如果下雨我们不去。",
        "pinyin": "Rúguǒ xià yǔ wǒmen bù qù.",
        "english": "If it rains"
      }
    ]
  },
  {
    "hanzi": "上网",
    "pinyin": "shàng wǎng",
    "english": "Verb: to be on the internet",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "晚上我喜欢上网看新闻。",
        "pinyin": "Wǎnshang wǒ xǐhuān shàng wǎng kàn xīnwén.",
        "english": "I like to go online and read news at night."
      }
    ]
  },
  {
    "hanzi": "声音",
    "pinyin": "shēng yīn",
    "english": "Noun: voice, sound",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "她的声音很甜。",
        "pinyin": "Tā de shēngyīn hěn tián.",
        "english": "Her voice is sweet."
      }
    ]
  },
  {
    "hanzi": "使",
    "pinyin": "shǐ",
    "english": " Noun: envoy, messenger Verb: to make, to cause, to use, to employ",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "成功使他更加自信。",
        "pinyin": "Chénggōng shǐ tā gèngjiā zìxìn.",
        "english": "Success made him more confident."
      }
    ]
  },
  {
    "hanzi": "世界",
    "pinyin": "shì jiè",
    "english": "Noun: world",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "世界很大我想去看看。",
        "pinyin": "Shìjiè hěn dà wǒ xiǎng qù kànkan.",
        "english": "The world is big"
      }
    ]
  },
  {
    "hanzi": "树",
    "pinyin": "shù",
    "english": "Noun: tree",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "院子里有三棵树。",
        "pinyin": "Yuànzi lǐ yǒu sān kē shù.",
        "english": "There are three trees in the yard."
      }
    ]
  },
  {
    "hanzi": "叔叔",
    "pinyin": "shū shu",
    "english": "Noun: uncle",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "叔叔给我买了玩具。",
        "pinyin": "Shūshu gěi wǒ mǎi le wánjù.",
        "english": "Uncle bought me a toy."
      }
    ]
  },
  {
    "hanzi": "数学",
    "pinyin": "shù xué",
    "english": "Noun: mathematics",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我喜欢数学课。",
        "pinyin": "Wǒ xǐhuān shùxué kè.",
        "english": "I like math class."
      }
    ]
  },
  {
    "hanzi": "刷牙",
    "pinyin": "shuā yá",
    "english": "Verb: to brush teeth",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "每天早晚刷牙。",
        "pinyin": "Měi tiān zǎowǎn shuā yá.",
        "english": "Brush teeth morning and night."
      }
    ]
  },
  {
    "hanzi": "双",
    "pinyin": "shuāng",
    "english": " Adjective: two, pair, both Measure Word: for a pair of shoes, etc.",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我买了一双鞋。",
        "pinyin": "Wǒ mǎi le yī shuāng xié.",
        "english": "I bought a pair of shoes."
      }
    ]
  },
  {
    "hanzi": "水平",
    "pinyin": "shuǐ píng",
    "english": " Noun: level, standard Adjective: horizontal",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "他的中文水平很高。",
        "pinyin": "Tā de Zhōngwén shuǐpíng hěn gāo.",
        "english": "His Chinese level is high."
      }
    ]
  },
  {
    "hanzi": "司机",
    "pinyin": "sī jī",
    "english": "Noun: driver",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "出租车司机很友好。",
        "pinyin": "Chūzūchē sījī hěn yǒuhǎo.",
        "english": "The taxi driver is friendly."
      }
    ]
  },
  {
    "hanzi": "虽然",
    "pinyin": "suī rán",
    "english": "Conjunction: although",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "虽然很冷，但是她还是出门了。",
        "pinyin": "Suīrán hěn lěng, dànshì tā háishì chū mén le.",
        "english": "Although it was cold, she still went out."
      }
    ]
  },
  {
    "hanzi": "太阳",
    "pinyin": "tài yáng",
    "english": "Noun: sun",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "太阳升起来了。",
        "pinyin": "Tàiyáng shēng qǐlái le.",
        "english": "The sun is rising."
      }
    ]
  },
  {
    "hanzi": "特别",
    "pinyin": "tè bié",
    "english": "Adjective: special, particular",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这家饭馆特别好吃。",
        "pinyin": "Zhè jiā fànguǎn tèbié hǎo chī.",
        "english": "This restaurant is especially delicious."
      }
    ]
  },
  {
    "hanzi": "疼",
    "pinyin": "téng",
    "english": " Noun: pain Verb: to ache, to hurt",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我的头有点疼。",
        "pinyin": "Wǒ de tóu yǒudiǎn téng.",
        "english": "My head aches a bit."
      }
    ]
  },
  {
    "hanzi": "提高",
    "pinyin": "tí gāo",
    "english": "Verb: to raise, to increase",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我们要提高服务质量。",
        "pinyin": "Wǒmen yào tígāo fúwù zhìliàng.",
        "english": "We need to improve service quality."
      }
    ]
  },
  {
    "hanzi": "体育",
    "pinyin": "tǐ yù",
    "english": "Noun: sports",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "学校有体育课。",
        "pinyin": "Xuéxiào yǒu tǐyù kè.",
        "english": "The school has PE class."
      }
    ]
  },
  {
    "hanzi": "甜",
    "pinyin": "tián",
    "english": "Adjective: sweet",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这个蛋糕很甜。",
        "pinyin": "Zhège dàngāo hěn tián.",
        "english": "This cake is very sweet."
      }
    ]
  },
  {
    "hanzi": "条",
    "pinyin": "tiáo",
    "english": " Noun: strip, clause Measure Word: for long thin things",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我买了一条裤子。",
        "pinyin": "Wǒ mǎi le yī tiáo kùzi.",
        "english": "I bought a pair of pants."
      }
    ]
  },
  {
    "hanzi": "同事",
    "pinyin": "tóng shì",
    "english": "Noun: colleague",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我的同事很热情。",
        "pinyin": "Wǒ de tóngshì hěn rèqíng.",
        "english": "My colleagues are warm."
      }
    ]
  },
  {
    "hanzi": "同意",
    "pinyin": "tóng yì",
    "english": "Verb: to agree, to consent, to approve",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我同意你的想法。",
        "pinyin": "Wǒ tóngyì nǐ de xiǎngfǎ.",
        "english": "I agree with your idea."
      }
    ]
  },
  {
    "hanzi": "头发",
    "pinyin": "tóu fa",
    "english": "Noun: hair on the head",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "她的头发很长。",
        "pinyin": "Tā de tóufa hěn cháng.",
        "english": "Her hair is very long."
      }
    ]
  },
  {
    "hanzi": "突然",
    "pinyin": "tū rán",
    "english": "Adjective: sudden, abrupt Adverb: suddenly, unexpectedly",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "门突然开了。",
        "pinyin": "Mén tūrán kāi le.",
        "english": "The door suddenly opened."
      }
    ]
  },
  {
    "hanzi": "图书馆",
    "pinyin": "tú shū guǎn",
    "english": "Noun: library",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "图书馆在学校旁边。",
        "pinyin": "Túshūguǎn zài xuéxiào pángbiān.",
        "english": "The library is next to the school."
      }
    ]
  },
  {
    "hanzi": "腿",
    "pinyin": "tuǐ",
    "english": "Noun: leg",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我的腿跑不动了。",
        "pinyin": "Wǒ de tuǐ pǎo bù dòng le.",
        "english": "My legs can’t run anymore."
      }
    ]
  },
  {
    "hanzi": "碗",
    "pinyin": "wǎn",
    "english": "Noun: bowl",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "一碗米饭够吗？",
        "pinyin": "Yī wǎn mǐfàn gòu ma?",
        "english": "Is one bowl of rice enough?"
      }
    ]
  },
  {
    "hanzi": "文化",
    "pinyin": "wén huà",
    "english": "Noun: culture",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "中国文化很丰富。",
        "pinyin": "Zhōngguó wénhuà hěn fēngfù.",
        "english": "Chinese culture is rich."
      }
    ]
  },
  {
    "hanzi": "西",
    "pinyin": "xī",
    "english": "Location: west",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "太阳从西边落下。",
        "pinyin": "Tàiyáng cóng xībiān luòxià.",
        "english": "The sun sets from the west."
      }
    ]
  },
  {
    "hanzi": "习惯",
    "pinyin": "xí guàn",
    "english": " Noun: habit, usual practice, custom Verb: to be/get used to",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我不太习惯这里的气候。",
        "pinyin": "Wǒ bú tài xíguàn zhèlǐ de qìhòu.",
        "english": "I am not quite accustomed to the climate here."
      }
    ]
  },
  {
    "hanzi": "洗手间",
    "pinyin": "xǐ shǒu jiān",
    "english": "Noun: toilet, bathroom",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请问洗手间在哪里？",
        "pinyin": "Qǐngwèn xǐshǒujiān zài nǎlǐ?",
        "english": "Excuse me, where is the restroom?"
      }
    ]
  },
  {
    "hanzi": "洗澡",
    "pinyin": "xǐ zǎo",
    "english": "Verb: to take a shower, to have a bath",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "晚上我洗澡睡觉。",
        "pinyin": "Wǎnshang wǒ xǐ zǎo shuì jiào.",
        "english": "I shower and sleep at night."
      }
    ]
  },
  {
    "hanzi": "夏",
    "pinyin": "xià",
    "english": "Noun: summer",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "夏天很热。",
        "pinyin": "Xiàtiān hěn rè.",
        "english": "Summer is very hot."
      }
    ]
  },
  {
    "hanzi": "先",
    "pinyin": "xiān",
    "english": "Adverb: early, former, first, before",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "先吃饭再看电视。",
        "pinyin": "Xiān chī fàn zài kàn diànshì.",
        "english": "Eat first"
      }
    ]
  },
  {
    "hanzi": "相同",
    "pinyin": "xiāng tóng",
    "english": "Adjective: identical, same",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我们想法相同。",
        "pinyin": "Wǒmen xiǎngfǎ xiāngtóng.",
        "english": "We think the same."
      }
    ]
  },
  {
    "hanzi": "相信",
    "pinyin": "xiāng xìn",
    "english": "Verb: to believe in, have faith in",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我完全相信你说的话。",
        "pinyin": "Wǒ wánquán xiāngxìn nǐ shuō de huà.",
        "english": "I completely believe what you say."
      }
    ]
  },
  {
    "hanzi": "小心",
    "pinyin": "xiǎo xīn",
    "english": "Verb: to be careful Adjective: careful Expression: Take care!",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "过马路要小心。",
        "pinyin": "Guò mǎlù yào xiǎoxīn.",
        "english": "Be careful crossing the road."
      }
    ]
  },
  {
    "hanzi": "校长",
    "pinyin": "xiào zhǎng",
    "english": "Noun: headmaster, president university",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "校长在办公室开会。",
        "pinyin": "Xiàozhǎng zài bàngōngshì kāi huì.",
        "english": "The principal is in a meeting."
      }
    ]
  },
  {
    "hanzi": "鞋",
    "pinyin": "xié",
    "english": "Noun: shoe",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我买了新鞋。",
        "pinyin": "Wǒ mǎi le xīn xié.",
        "english": "I bought new shoes."
      }
    ]
  },
  {
    "hanzi": "信",
    "pinyin": "xìn",
    "english": " Noun: letter, trust Verb: to believe, to trust",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我收到一封信。",
        "pinyin": "Wǒ shōudào yī fēng xìn.",
        "english": "I received a letter."
      }
    ]
  },
  {
    "hanzi": "新闻",
    "pinyin": "xīn wén",
    "english": "Noun: news",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "电视上播新闻。",
        "pinyin": "Diànshì shàng bō xīnwén.",
        "english": "News is on TV."
      }
    ]
  },
  {
    "hanzi": "新鲜",
    "pinyin": "xīn xiān",
    "english": "Adjective: fresh food, experience, etc.",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "超市有新鲜蔬菜。",
        "pinyin": "Chāoshì yǒu xīnxiān shūcài.",
        "english": "The supermarket has fresh vegetables."
      }
    ]
  },
  {
    "hanzi": "行李箱",
    "pinyin": "xíng li xiāng",
    "english": "Noun: suitcase",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我的行李箱很重。",
        "pinyin": "Wǒ de xínglixiāng hěn zhòng.",
        "english": "My suitcase is heavy."
      }
    ]
  },
  {
    "hanzi": "兴趣",
    "pinyin": "xìng qù",
    "english": "Noun: interest",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我的兴趣是旅游。",
        "pinyin": "Wǒ de xìngqù shì lǚyóu.",
        "english": "My interest is traveling."
      }
    ]
  },
  {
    "hanzi": "熊猫",
    "pinyin": "xióng māo",
    "english": "Noun: panda",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "动物园有熊猫。",
        "pinyin": "Dòngwùyuán yǒu xióngmāo.",
        "english": "The zoo has pandas."
      }
    ]
  },
  {
    "hanzi": "需要",
    "pinyin": "xū yào",
    "english": " Noun: needs Verb: to need, to want",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "你需要帮忙吗？",
        "pinyin": "Nǐ xūyào bāngmáng ma?",
        "english": "Do you need help?"
      }
    ]
  },
  {
    "hanzi": "选择",
    "pinyin": "xuǎn zé",
    "english": " Noun: choice, option Verb: to choose, to select",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请选择一道菜。",
        "pinyin": "Qǐng xuǎnzé yī dào cài.",
        "english": "Please choose a dish."
      }
    ]
  },
  {
    "hanzi": "眼镜",
    "pinyin": "yǎn jìng",
    "english": "Noun: eyeglasses",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我戴眼镜看书。",
        "pinyin": "Wǒ dài yǎnjìng kàn shū.",
        "english": "I wear glasses to read."
      }
    ]
  },
  {
    "hanzi": "爷爷",
    "pinyin": "yé ye",
    "english": "Noun: grandfather father's father",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "爷爷喜欢下棋。",
        "pinyin": "Yéye xǐhuān xià qí.",
        "english": "Grandpa likes playing chess."
      }
    ]
  },
  {
    "hanzi": "一般",
    "pinyin": "yì bān",
    "english": " Adjective: ordinary, general, common Adverb: in general, generally",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我一般七点起床。",
        "pinyin": "Wǒ yībān qī diǎn qǐ chuáng.",
        "english": "I generally get up at seven."
      }
    ]
  },
  {
    "hanzi": "一边",
    "pinyin": "yì biān",
    "english": "Location: one side Adverb: on the one hand",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "一边走一边吃。",
        "pinyin": "Yī biān zǒu yī biān chī.",
        "english": "Eat while walking."
      }
    ]
  },
  {
    "hanzi": "一定",
    "pinyin": "yí dìng",
    "english": " Adjective: definite, fixed, given Adverb: surely, certainly",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "明天一定来哦。",
        "pinyin": "Míngtiān yīdìng lái ó.",
        "english": "Be sure to come tomorrow."
      }
    ]
  },
  {
    "hanzi": "一共",
    "pinyin": "yí gòng",
    "english": "Adverb: althogether",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "一共多少钱？",
        "pinyin": "Yī gòng duōshǎo qián?",
        "english": "How much in total?"
      }
    ]
  },
  {
    "hanzi": "以后",
    "pinyin": "yǐ hòu",
    "english": "Time: after, afterwards",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "以后别忘了带伞。",
        "pinyin": "Yǐhòu bié wàng le dài sǎn.",
        "english": "Don’t forget an umbrella in the future."
      }
    ]
  },
  {
    "hanzi": "以前",
    "pinyin": "yǐ qián",
    "english": " Time: before Adverb: previous, formerly",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "以前我住农村。",
        "pinyin": "Yǐqián wǒ zhù nóngcūn.",
        "english": "I lived in the countryside before."
      }
    ]
  },
  {
    "hanzi": "以为",
    "pinyin": "yǐ wéi",
    "english": "Verb: to think wrongly, to be under the wrong impression",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我以为你今天不会来了。",
        "pinyin": "Wǒ yǐwéi nǐ jīntiān bú huì lái le.",
        "english": "I thought you weren't coming today."
      }
    ]
  },
  {
    "hanzi": "一直",
    "pinyin": "yī zhí",
    "english": "Adverb: always, continuously, straight",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "一直往前走就到了。",
        "pinyin": "Yīzhí wǎng qián zǒu jiù dào le.",
        "english": "Go straight ahead and you’ll arrive."
      }
    ]
  },
  {
    "hanzi": "银行",
    "pinyin": "yín háng",
    "english": "Noun: bank for money",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "银行在超市对面。",
        "pinyin": "Yínháng zài chāoshì duìmiàn.",
        "english": "The bank is opposite the supermarket."
      }
    ]
  },
  {
    "hanzi": "音乐",
    "pinyin": "yīn yuè",
    "english": "Noun: music",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "晚上我听音乐放松。",
        "pinyin": "Wǎnshang wǒ tīng yīnyuè fàngsōng.",
        "english": "I listen to music to relax at night."
      }
    ]
  },
  {
    "hanzi": "影响",
    "pinyin": "yǐng xiǎng",
    "english": " Noun: influence, effect Verb: to influence, to affect",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "天气影响心情。",
        "pinyin": "Tiānqì yǐngxiǎng xīnqíng.",
        "english": "Weather affects mood."
      }
    ]
  },
  {
    "hanzi": "用",
    "pinyin": "yòng",
    "english": "Verb: to use, to employ, to apply",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "请用筷子吃饭。",
        "pinyin": "Qǐng yòng kuàizi chī fàn.",
        "english": "Please eat with chopsticks."
      }
    ]
  },
  {
    "hanzi": "又",
    "pinyin": "yòu",
    "english": "Adverb: again",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我又饿了。",
        "pinyin": "Wǒ yòu è le.",
        "english": "I’m hungry again."
      }
    ]
  },
  {
    "hanzi": "有名",
    "pinyin": "yǒu míng",
    "english": "Adjective: famous, well known",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "这家饭馆很有名。",
        "pinyin": "Zhè jiā fànguǎn hěn yǒumíng.",
        "english": "This restaurant is famous."
      }
    ]
  },
  {
    "hanzi": "游戏",
    "pinyin": "yóu xì",
    "english": "Noun: game, play",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "孩子们玩游戏很开心。",
        "pinyin": "Háizimen wán yóuxì hěn kāixīn.",
        "english": "Kids are happy playing games."
      }
    ]
  },
  {
    "hanzi": "愿意",
    "pinyin": "yuàn yì",
    "english": "Auxiliary Verb: to be willing, be ready, to wish, to want",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "你愿意帮忙吗？",
        "pinyin": "Nǐ yuànyì bāngmáng ma?",
        "english": "Are you willing to help?"
      }
    ]
  },
  {
    "hanzi": "越",
    "pinyin": "yuè",
    "english": "Verb: to exceed, to climb over, to surpass",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "天气越来越冷。",
        "pinyin": "Tiānqì yuè lái yuè lěng.",
        "english": "The weather is getting colder."
      }
    ]
  },
  {
    "hanzi": "月亮",
    "pinyin": "yuè liang",
    "english": "Noun: moon",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "中秋节看月亮。",
        "pinyin": "Zhōngqiū jié kàn yuèliang.",
        "english": "Watch the moon on Mid-Autumn."
      }
    ]
  },
  {
    "hanzi": "云",
    "pinyin": "yún",
    "english": "Noun: cloud",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "天上有白云。",
        "pinyin": "Tiān shàng yǒu bái yún.",
        "english": "There are white clouds in the sky."
      }
    ]
  },
  {
    "hanzi": "种",
    "pinyin": "zhǒng",
    "english": " Noun: species, race, breed Measure Word: type, kind, sort or for languages",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "你喜欢哪一种口味的冰淇淋？",
        "pinyin": "Nǐ xǐhuān nǎ yī zhǒng kǒuwèi de bīngqílín?",
        "english": "Which kind of ice cream flavor do you like?"
      }
    ]
  },
  {
    "hanzi": "终于",
    "pinyin": "zhōng yú",
    "english": "Adverb: at last, finally, eventually",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "经过努力，我们终于成功了。",
        "pinyin": "Jīngguò nǔlì, wǒmen zhōngyú chénggōngle.",
        "english": "After effort, we finally succeeded."
      }
    ]
  },
  {
    "hanzi": "最近",
    "pinyin": "zuì jìn",
    "english": "Adverb: recently, lately, soon",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "我最近很忙。",
        "pinyin": "Wǒ zuìjìn hěn máng.",
        "english": "I have been very busy recently."
      }
    ]
  },
  {
    "hanzi": "作用",
    "pinyin": "zuò yòng",
    "english": " Noun: action, function, impact, effect Verb: to affect",
    "hsk": "HSK 3",
    "exampleSentences": [
      {
        "chinese": "酒精有麻醉作用。",
        "pinyin": "Jiǔjīng yǒu mázuì zuòyòng.",
        "english": "Alcohol has an anesthetic effect."
      }
    ]
  },
  {
    "hanzi": "爱情",
    "pinyin": "ài qíng",
    "english": "Noun: love",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "爱情需要时间来培养。",
        "pinyin": "Àiqíng xūyào shíjiān lái péiyǎng.",
        "english": "Love requires time to cultivate."
      }
    ]
  },
  {
    "hanzi": "暗",
    "pinyin": "àn",
    "english": "Adjective: dark",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "房间里很暗。",
        "pinyin": "Fángjiān lǐ hěn àn.",
        "english": "The room is very dark."
      }
    ]
  },
  {
    "hanzi": "安排",
    "pinyin": "ān pái",
    "english": " Noun: plan Verb: to plan, to arrange",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请你安排一下会议时间。",
        "pinyin": "Qǐng nǐ ānpái yíxià huìyì shíjiān.",
        "english": "Please arrange the meeting time."
      }
    ]
  },
  {
    "hanzi": "安全",
    "pinyin": "ān quán",
    "english": " Noun: safety Adjective: safe, secure",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "孩子的安全最重要。",
        "pinyin": "Háizi de ānquán zuì zhòngyào.",
        "english": "Children's safety is the most important."
      }
    ]
  },
  {
    "hanzi": "按时",
    "pinyin": "àn shí",
    "english": "Adjective: on time, on schedule",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请按时交作业。",
        "pinyin": "Qǐng ànshí jiāo zuòyè.",
        "english": "Please hand in your homework on time."
      }
    ]
  },
  {
    "hanzi": "按照",
    "pinyin": "àn zhào",
    "english": "Relative Clause: according to",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们要按照规定办事。",
        "pinyin": "Wǒmen yào ànzhào guīdìng bànshì.",
        "english": "We must handle matters according to the regulations."
      }
    ]
  },
  {
    "hanzi": "抱",
    "pinyin": "bào",
    "english": "Verb: to hug, to embrace, to hold",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "孩子跑过来抱住了妈妈。",
        "pinyin": "Háizi pǎo guòlái bào zhù le māma.",
        "english": "The child ran over and hugged the mother."
      }
    ]
  },
  {
    "hanzi": "报道",
    "pinyin": "bào dào",
    "english": "Noun: report Verb: to report",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "新闻报道了这次事故的细节。",
        "pinyin": "Xīnwén bàodào le zhè cì shìgù de xìjié.",
        "english": "The news reported the details of this accident."
      }
    ]
  },
  {
    "hanzi": "保护",
    "pinyin": "bǎo hù",
    "english": " Noun: protection Verb: to protect, to safeguard",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们应该保护环境。",
        "pinyin": "Wǒmen yīnggāi bǎohù huánjìng.",
        "english": "We should protect the environment."
      }
    ]
  },
  {
    "hanzi": "包括",
    "pinyin": "bāo kuò",
    "english": "Verb: to include, to consist of",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "费用包括饭钱。",
        "pinyin": "Fèiyòng bāokuò fàn qián.",
        "english": "The cost includes meals."
      }
    ]
  },
  {
    "hanzi": "报名",
    "pinyin": "bào míng",
    "english": "Verb: to sign up, to register",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你报名参加比赛了吗？",
        "pinyin": "Nǐ bàomíng cānjiā bǐsài le ma?",
        "english": "Did you sign up for the competition?"
      }
    ]
  },
  {
    "hanzi": "抱歉",
    "pinyin": "bào qiàn",
    "english": "Expression: sorry! my apologies!",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "抱歉，我来晚了。",
        "pinyin": "Bàoqiàn, wǒ lái wǎn le.",
        "english": "I'm sorry, I came late."
      }
    ]
  },
  {
    "hanzi": "保证",
    "pinyin": "bǎo zhèng",
    "english": " Noun: guarantee Verb: to guarantee, to ensure, to assure",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我保证下次不会迟到了。",
        "pinyin": "Wǒ bǎozhèng xià cì bú huì chídào le.",
        "english": "I guarantee I won't be late next time."
      }
    ]
  },
  {
    "hanzi": "倍",
    "pinyin": "bèi",
    "english": "Measure Word: for times, -fold",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这里的价格是那里的两倍。",
        "pinyin": "Zhèlǐ de jiàgé shì nàlǐ de liǎng bèi.",
        "english": "The price here is twice the price there."
      }
    ]
  },
  {
    "hanzi": "笨",
    "pinyin": "bèn",
    "english": "Adjective: stupid, foolish",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他学东西有点笨。",
        "pinyin": "Tā xué dōngxi yǒudiǎn bèn.",
        "english": "He is a little slow at learning things (clumsy/dull)."
      }
    ]
  },
  {
    "hanzi": "本来",
    "pinyin": "běn lái",
    "english": " Adjective: original Adverb: originally, at first",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我本来打算今天去看电影。",
        "pinyin": "Wǒ běnlái dǎsuàn jīntiān qù kàn diànyǐng.",
        "english": "I originally planned to go watch a movie today."
      }
    ]
  },
  {
    "hanzi": "笔记本",
    "pinyin": "bǐ jì běn",
    "english": "Noun: notebook",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我买了新笔记本。",
        "pinyin": "Wǒ mǎi le xīn bǐjìběn.",
        "english": "I bought a new notebook."
      }
    ]
  },
  {
    "hanzi": "毕业",
    "pinyin": "bì yè",
    "english": "Verb: to graduate, to finish school",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她明年就要大学毕业了。",
        "pinyin": "Tā míngnián jiù yào dàxué bìyè le.",
        "english": "She will graduate from university next year."
      }
    ]
  },
  {
    "hanzi": "遍",
    "pinyin": "biàn",
    "english": "Adverb: all over Measure Word: for a time",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请你再读一遍课文。",
        "pinyin": "Qǐng nǐ zài dú yí biàn kèwén.",
        "english": "Please read the text again."
      }
    ]
  },
  {
    "hanzi": "表格",
    "pinyin": "biǎo gé",
    "english": "Noun: form, table",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请填写这张表格。",
        "pinyin": "Qǐng tiánxiě zhè zhāng biǎogé.",
        "english": "Please fill out this form."
      }
    ]
  },
  {
    "hanzi": "表扬",
    "pinyin": "biǎo yáng",
    "english": "Verb: to praise, to commend",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "老师表扬了那个好学生。",
        "pinyin": "Lǎoshī biǎoyáng le nàge hǎo xuésheng.",
        "english": "The teacher praised that good student."
      }
    ]
  },
  {
    "hanzi": "标准",
    "pinyin": "biāo zhǔn",
    "english": " Noun: standard, norm Adjective: standard",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他的发音非常标准。",
        "pinyin": "Tā de fāyīn fēicháng biāozhǔn.",
        "english": "His pronunciation is very standard."
      }
    ]
  },
  {
    "hanzi": "饼干",
    "pinyin": "bǐng gān",
    "english": "Noun: buscuit, cookie",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "冰箱里有饼干。",
        "pinyin": "Bīngxiāng lǐ yǒu bǐnggān.",
        "english": "There are biscuits in the fridge."
      }
    ]
  },
  {
    "hanzi": "并且",
    "pinyin": "bìng qiě",
    "english": "Conjunction: and, besides, moreover",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他做得很快，并且质量也很好。",
        "pinyin": "Tā zuò de hěn kuài, bìngqiě zhìliàng yě hěn hǎo.",
        "english": "He did it quickly, and the quality is also very good."
      }
    ]
  },
  {
    "hanzi": "博士",
    "pinyin": "bó shì",
    "english": "Noun: doctor, Ph.D.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他是一位物理学博士。",
        "pinyin": "Tā shì yī wèi wùlǐxué bóshì.",
        "english": "He is a Ph.D. in physics."
      }
    ]
  },
  {
    "hanzi": "不得不",
    "pinyin": "bù dé bù",
    "english": "Auxiliary Verb: to have to, cannot but",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "因为生病，我不得不请假。",
        "pinyin": "Yīnwèi shēngbìng, wǒ bùdébù qǐngjià.",
        "english": "Because I was sick, I had to ask for leave."
      }
    ]
  },
  {
    "hanzi": "部分",
    "pinyin": "bù fen",
    "english": "Noun: part, section",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "大部分学生都完成了作业。",
        "pinyin": "Dà bùfen xuésheng dōu wánchéngle zuòyè.",
        "english": "The majority (large part) of the students have finished their homework."
      }
    ]
  },
  {
    "hanzi": "不管",
    "pinyin": "bù guǎn",
    "english": "Conjunction: regardless of, no matter what/how",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "不管多忙，你都要休息。",
        "pinyin": "Bùguǎn duō máng, nǐ dōu yào xiūxi.",
        "english": "No matter how busy you are, you must rest."
      }
    ]
  },
  {
    "hanzi": "不仅",
    "pinyin": "bù jǐn",
    "english": "Conjunction: not only, not just",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他不仅聪明，而且非常努力。",
        "pinyin": "Tā bùjǐn cōngming, érqiě fēicháng nǔlì.",
        "english": "Not only is he smart, but he is also very hardworking."
      }
    ]
  },
  {
    "hanzi": "擦",
    "pinyin": "cā",
    "english": "Verb: to wipe, to rub, to erase",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请你把桌子擦干净。",
        "pinyin": "Qǐng nǐ bǎ zhuōzi cā gānjìng.",
        "english": "Please wipe the table clean."
      }
    ]
  },
  {
    "hanzi": "猜",
    "pinyin": "cāi",
    "english": "Verb: to guess",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你猜我今天遇到了谁？",
        "pinyin": "Nǐ cāi wǒ jīntiān yùdàole shéi?",
        "english": "Guess who I ran into today?"
      }
    ]
  },
  {
    "hanzi": "材料",
    "pinyin": "cái liào",
    "english": "Noun: material, data, stuff",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "做蛋糕需要很多材料。",
        "pinyin": "Zuò dàngāo xūyào hěn duō cáiliào.",
        "english": "Making a cake requires a lot of ingredients (materials)."
      }
    ]
  },
  {
    "hanzi": "参观",
    "pinyin": "cān guān",
    "english": "Verb: to visit, to look around",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们明天去参观博物馆。",
        "pinyin": "Wǒmen míngtiān qù cānguān bówùguǎn.",
        "english": "We are going to visit the museum tomorrow."
      }
    ]
  },
  {
    "hanzi": "差不多",
    "pinyin": "chà bu duō",
    "english": "Adjective: almost, more or less",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们的想法差不多一样。",
        "pinyin": "Wǒmen de xiǎngfǎ chàbuduō yīyàng.",
        "english": "Our ideas are almost the same."
      }
    ]
  },
  {
    "hanzi": "尝",
    "pinyin": "cháng",
    "english": "Verb: to taste Adverb: once",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "尝尝这道菜。",
        "pinyin": "Cháng chang zhè dào cài.",
        "english": "Taste this dish."
      }
    ]
  },
  {
    "hanzi": "场",
    "pinyin": "chǎng",
    "english": " Noun: field, place Measure Word: for events, happenings, etc.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "今天有一场足球赛。",
        "pinyin": "Jīntiān yǒu yī chǎng zúqiú sài.",
        "english": "There’s a football match today."
      }
    ]
  },
  {
    "hanzi": "长城",
    "pinyin": "Cháng chéng",
    "english": "Noun: the Great Wall",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "长城是世界著名的奇迹。",
        "pinyin": "Chángchéng shì shìjiè zhùmíng de qíjì.",
        "english": "The Great Wall is a world-famous wonder."
      }
    ]
  },
  {
    "hanzi": "长江",
    "pinyin": "Cháng jiāng",
    "english": "Noun: Yangtze river",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "长江是中国最长的河流。",
        "pinyin": "Chángjiāng shì Zhōngguó zuì cháng de héliú.",
        "english": "The Yangtze River is the longest river in China."
      }
    ]
  },
  {
    "hanzi": "吵",
    "pinyin": "chǎo",
    "english": "Verb: to quarrel Adjective: noisy",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "别吵了，安静一点！",
        "pinyin": "Bié chǎo le, ānjìng yīdiǎn!",
        "english": "Stop arguing (or making noise), be quiet!"
      }
    ]
  },
  {
    "hanzi": "超过",
    "pinyin": "chāo guò",
    "english": "Verb: to surpass, to exceed",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他的身高已经超过他爸爸了。",
        "pinyin": "Tā de shēnggāo yǐjīng chāoguò tā bàba le.",
        "english": "His height has already surpassed his father's."
      }
    ]
  },
  {
    "hanzi": "成功",
    "pinyin": "chéng gōng",
    "english": "Noun: success Verb: to succeed",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "祝你考试成功！",
        "pinyin": "Zhù nǐ kǎoshì chénggōng!",
        "english": "Wishing you success in your exam!"
      }
    ]
  },
  {
    "hanzi": "诚实",
    "pinyin": "chéng shí",
    "english": "Adjective: honest, truthful",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "做人要诚实。",
        "pinyin": "Zuò rén yào chéngshí.",
        "english": "Be honest in life."
      }
    ]
  },
  {
    "hanzi": "成为",
    "pinyin": "chéng wéi",
    "english": "Verb: to become, to turn into",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她梦想成为一名医生。",
        "pinyin": "Tā mèngxiǎng chéngwéi yī míng yīshēng.",
        "english": "She dreams of becoming a doctor."
      }
    ]
  },
  {
    "hanzi": "乘坐",
    "pinyin": "chéng zuò",
    "english": "Verb: to ridein a vehicle",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "乘客请乘坐下一班地铁。",
        "pinyin": "Chéngkè qǐng chéngzuò xià yī bān dìtiě.",
        "english": "Passengers, please take the next subway train."
      }
    ]
  },
  {
    "hanzi": "吃惊",
    "pinyin": "chī jīng",
    "english": "Verb: to be startled, to be shocked, to be amazed",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "听到这个消息我非常吃惊。",
        "pinyin": "Tīngdào zhège xiāoxi wǒ fēicháng chījīng.",
        "english": "I was very surprised to hear this news."
      }
    ]
  },
  {
    "hanzi": "重新",
    "pinyin": "chóng xīn",
    "english": "Adverb: again",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "如果错了，你应该重新开始。",
        "pinyin": "Rúguǒ cuò le, nǐ yīnggāi chóngxīn kāishǐ.",
        "english": "If it is wrong, you should start over again."
      }
    ]
  },
  {
    "hanzi": "抽烟",
    "pinyin": "chōu yān",
    "english": "Verb: to smoke a cigarette, etc.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "医院里禁止抽烟。",
        "pinyin": "Yīyuàn lǐ jìnzhǐ chōuyān.",
        "english": "Smoking is prohibited in the hospital."
      }
    ]
  },
  {
    "hanzi": "出差",
    "pinyin": "chū chāi",
    "english": "Verb: to go on a business trip",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我下周要去上海出差。",
        "pinyin": "Wǒ xià zhōu yào qù Shànghǎi chūchāi.",
        "english": "I have to go to Shanghai for a business trip next week."
      }
    ]
  },
  {
    "hanzi": "出发",
    "pinyin": "chū fā",
    "english": "Verb: to leave, to set out",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们明天早上六点出发。",
        "pinyin": "Wǒmen míngtiān zǎoshang liù diǎn chūfā.",
        "english": "We will set off at 6 AM tomorrow morning."
      }
    ]
  },
  {
    "hanzi": "出生",
    "pinyin": "chū shēng",
    "english": "Verb: to be born",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她是在北京出生的。",
        "pinyin": "Tā shì zài Běijīng chūshēng de.",
        "english": "She was born in Beijing."
      }
    ]
  },
  {
    "hanzi": "传真",
    "pinyin": "chuán zhēn",
    "english": "Noun: fax",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请把这份文件传真给我。",
        "pinyin": "Qǐng bǎ zhè fèn wénjiàn chuánzhēn gěi wǒ.",
        "english": "Please fax this document to me."
      }
    ]
  },
  {
    "hanzi": "窗户",
    "pinyin": "chuāng hu",
    "english": "Noun: window",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请打开窗户通通风。",
        "pinyin": "Qǐng dǎkāi chuānghu tōng tōng fēng.",
        "english": "Please open the window to ventilate."
      }
    ]
  },
  {
    "hanzi": "词典",
    "pinyin": "cí diǎn",
    "english": "Noun: dictionary",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我买了一本词典。",
        "pinyin": "Wǒ mǎi le yī běn cídiǎn.",
        "english": "I bought a dictionary."
      }
    ]
  },
  {
    "hanzi": "从来",
    "pinyin": "cóng lái",
    "english": "Adverb: always, ever since, at all times",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我从来没去过那里。",
        "pinyin": "Wǒ cónglái méi qùguo nàlǐ.",
        "english": "I have never been there."
      }
    ]
  },
  {
    "hanzi": "粗心",
    "pinyin": "cū xīn",
    "english": "Adjective: careless, thoughtless",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他做事总是很粗心。",
        "pinyin": "Tā zuòshì zǒngshì hěn cūxīn.",
        "english": "He is always very careless in doing things."
      }
    ]
  },
  {
    "hanzi": "答案",
    "pinyin": "dá àn",
    "english": "Noun: answer, solution",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你知道这道题的答案吗？",
        "pinyin": "Nǐ zhīdào zhè dào tí de dá'àn ma?",
        "english": "Do you know the answer to this question?"
      }
    ]
  },
  {
    "hanzi": "打扮",
    "pinyin": "dǎ ban",
    "english": "Verb: to decorate, to dress up",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她今天打扮得很漂亮。",
        "pinyin": "Tā jīntiān dǎban de hěn piàoliang.",
        "english": "She dressed up very beautifully today."
      }
    ]
  },
  {
    "hanzi": "大概",
    "pinyin": "dà gài",
    "english": "Adverb: probably, roughly",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他大概半小时后会到。",
        "pinyin": "Tā dàgài bàn xiǎoshí hòu huì dào.",
        "english": "He will probably arrive about half an hour later."
      }
    ]
  },
  {
    "hanzi": "打扰",
    "pinyin": "dǎ rǎo",
    "english": "Verb: to disturb",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "对不起，打扰您一下。",
        "pinyin": "Duìbuqǐ, dǎrǎo nín yīxià.",
        "english": "Excuse me for disturbing you for a moment."
      }
    ]
  },
  {
    "hanzi": "大使馆",
    "pinyin": "dà shǐ guǎn",
    "english": "Noun: embassy",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我要去大使馆办签证。",
        "pinyin": "Wǒ yào qù dàshǐguǎn bàn qiānzhèng.",
        "english": "I need to go to the embassy to handle the visa application."
      }
    ]
  },
  {
    "hanzi": "打印",
    "pinyin": "dǎ yìn",
    "english": "Verb: to print, to seal, to stamp",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请帮我把这份报告打印出来。",
        "pinyin": "Qǐng bāng wǒ bǎ zhè fèn bàogào dǎyìn chūlai.",
        "english": "Please help me print out this report."
      }
    ]
  },
  {
    "hanzi": "大约",
    "pinyin": "dà yuē",
    "english": "Adverb: approximately",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们大约有二十个学生。",
        "pinyin": "Wǒmen dàyuē yǒu èrshí ge xuésheng.",
        "english": "We have approximately twenty students."
      }
    ]
  },
  {
    "hanzi": "打折",
    "pinyin": "dǎ zhé",
    "english": "Verb: to give discount",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这件衣服现在打八折。",
        "pinyin": "Zhè jiàn yīfu xiànzài dǎ bā zhé.",
        "english": "This piece of clothing is currently 20% off (80% price)."
      }
    ]
  },
  {
    "hanzi": "打针",
    "pinyin": "dǎ zhēn",
    "english": "Verb: to inject",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "医生说我需要打一针。",
        "pinyin": "Yīshēng shuō wǒ xūyào dǎ yī zhēn.",
        "english": "The doctor said I need to get an injection."
      }
    ]
  },
  {
    "hanzi": "戴",
    "pinyin": "dài",
    "english": "Verb: to put on, to wear, to respect, to support",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她喜欢戴一副黑色的眼镜。",
        "pinyin": "Tā xǐhuan dài yī fù hēisè de yǎnjìng.",
        "english": "She likes to wear a pair of black glasses."
      }
    ]
  },
  {
    "hanzi": "代表",
    "pinyin": "dài biǎo",
    "english": "Noun: representative Verb: to represent",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他代表公司发言。",
        "pinyin": "Tā dàibiǎo gōngsī fāyán.",
        "english": "He speaks on behalf of the company."
      }
    ]
  },
  {
    "hanzi": "大夫",
    "pinyin": "dài fu",
    "english": "Noun: doctor",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "您好，大夫，我肚子疼。",
        "pinyin": "Nín hǎo, dàifu, wǒ dùzi téng.",
        "english": "Hello, doctor, my stomach hurts."
      }
    ]
  },
  {
    "hanzi": "代替",
    "pinyin": "dài tì",
    "english": " Noun: replacement Verb: to replace, to substitute Relative Clause: instead of",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "谁能代替他？",
        "pinyin": "Shéi néng dàitì tā?",
        "english": "Who can replace him?"
      }
    ]
  },
  {
    "hanzi": "当",
    "pinyin": "dāng",
    "english": " Verb: to act as, to administer Auxiliary Verb: should, ought Adjective: equal Conjunction: when, during",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我长大想当一名老师。",
        "pinyin": "Wǒ zhǎngdà xiǎng dāng yī míng lǎoshī.",
        "english": "When I grow up, I want to be a teacher."
      }
    ]
  },
  {
    "hanzi": "当地",
    "pinyin": "dāng dì",
    "english": "Noun: locality Adjective: local",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们喜欢吃当地的食物。",
        "pinyin": "Wǒmen xǐhuān chī dāngdì de shíwù.",
        "english": "We like to eat local food."
      }
    ]
  },
  {
    "hanzi": "当时",
    "pinyin": "dāng shí",
    "english": "Time: at that time, then",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "当时我不知道发生了什么。",
        "pinyin": "Dāngshí wǒ bù zhīdào fāshēngle shénme.",
        "english": "At that time, I didn't know what happened."
      }
    ]
  },
  {
    "hanzi": "刀",
    "pinyin": "dāo",
    "english": "Noun: knife",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这把刀很锋利，用的时候要小心。",
        "pinyin": "Zhè bǎ dāo hěn fēnglì, yòng de shíhou yào xiǎoxīn.",
        "english": "This knife is very sharp; be careful when using it."
      }
    ]
  },
  {
    "hanzi": "到处",
    "pinyin": "dào chù",
    "english": "Adverb: everywhere, at all places",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "街上到处都是人。",
        "pinyin": "Jiē shang dàochù dōu shì rén.",
        "english": "There are people everywhere on the street."
      }
    ]
  },
  {
    "hanzi": "到底",
    "pinyin": "dào dǐ",
    "english": "Adverb: finally, in the end",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你到底想做什么？",
        "pinyin": "Nǐ dàodǐ xiǎng zuò shénme?",
        "english": "What exactly do you want to do?"
      }
    ]
  },
  {
    "hanzi": "道歉",
    "pinyin": "dào qiàn",
    "english": "Verb: to apologize",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你应该向他道歉。",
        "pinyin": "Nǐ yīnggāi xiàng tā dàoqiàn.",
        "english": "You should apologize to him."
      }
    ]
  },
  {
    "hanzi": "导游",
    "pinyin": "dǎo yóu",
    "english": "Noun: tour guide",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们的导游非常专业。",
        "pinyin": "Wǒmen de dǎoyóu fēicháng zhuānyè.",
        "english": "Our tour guide is very professional."
      }
    ]
  },
  {
    "hanzi": "得意",
    "pinyin": "dé yì",
    "english": "Adjective: pleased with oneself",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他考了满分，非常得意。",
        "pinyin": "Tā kǎo le mǎnfēn, fēicháng déyì.",
        "english": "He scored a perfect mark and was very pleased with himself."
      }
    ]
  },
  {
    "hanzi": "得",
    "pinyin": "děi",
    "english": "Auxiliary Verb: to have to",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他汉语说得很好。",
        "pinyin": "Tā Hànyǔ shuō de hěn hǎo.",
        "english": "He speaks Chinese very well."
      }
    ]
  },
  {
    "hanzi": "等",
    "pinyin": "děng",
    "english": "Particle: etc., and so on",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请在这里等我一下。",
        "pinyin": "Qǐng zài zhèlǐ děng wǒ yīxià.",
        "english": "Please wait for me here for a moment."
      }
    ]
  },
  {
    "hanzi": "底",
    "pinyin": "dǐ",
    "english": "Noun: background, end, bottom, base",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "瓶子底有很多沙子。",
        "pinyin": "Píngzi dǐ yǒu hěn duō shāzi.",
        "english": "There is a lot of sand at the bottom of the bottle."
      }
    ]
  },
  {
    "hanzi": "地球",
    "pinyin": "dì qiú",
    "english": "Noun: earth planet",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "地球是我们的家。",
        "pinyin": "Dìqiú shì wǒmen de jiā.",
        "english": "Earth is our home."
      }
    ]
  },
  {
    "hanzi": "地址",
    "pinyin": "dì zhǐ",
    "english": "Noun: address",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请告诉我你的地址。",
        "pinyin": "Qǐng gàosu wǒ nǐ de dìzhǐ.",
        "english": "Please tell me your address."
      }
    ]
  },
  {
    "hanzi": "掉",
    "pinyin": "diào",
    "english": "Verb: to fall, to drop, to lose, to turn",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我的钥匙掉在地上了。",
        "pinyin": "Wǒ de yàoshi diào zài dìshang le.",
        "english": "My keys fell onto the ground."
      }
    ]
  },
  {
    "hanzi": "调查",
    "pinyin": "diào chá",
    "english": " Noun: investigation, survey Verb: to investigate, to survey",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "警方正在调查此案。",
        "pinyin": "Jǐngfāng zhèngzài diàochá cǐ àn.",
        "english": "The police are investigating this case."
      }
    ]
  },
  {
    "hanzi": "丢",
    "pinyin": "diū",
    "english": "Verb: to lose, to throw",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我丢了手机。",
        "pinyin": "Wǒ diū le shǒujī.",
        "english": "I lost my phone."
      }
    ]
  },
  {
    "hanzi": "动作",
    "pinyin": "dòng zuò",
    "english": "Noun: movement",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他的动作很快。",
        "pinyin": "Tā de dòngzuò hěn kuài.",
        "english": "His movements are fast."
      }
    ]
  },
  {
    "hanzi": "堵车",
    "pinyin": "dǔ chē",
    "english": "Noun: traffic jam",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "路上堵车非常严重。",
        "pinyin": "Lùshang dǔchē fēicháng yánzhòng.",
        "english": "The traffic jam on the road is very serious."
      }
    ]
  },
  {
    "hanzi": "肚子",
    "pinyin": "dù zi",
    "english": "Noun: belly, abdomen",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我的肚子有点饿了。",
        "pinyin": "Wǒ de dùzi yǒudiǎn è le.",
        "english": "My stomach is a bit hungry."
      }
    ]
  },
  {
    "hanzi": "断",
    "pinyin": "duàn",
    "english": " Verb: to cut off, to break, to judge, to decide Adverb: absolutely, definitely",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "绳子断了。",
        "pinyin": "Shéngzi duàn le.",
        "english": "The rope broke."
      }
    ]
  },
  {
    "hanzi": "对",
    "pinyin": "duì",
    "english": "Relative Clause: for, to, towards",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你的答案是完全对的。",
        "pinyin": "Nǐ de dá'àn shì wánquán duì de.",
        "english": "Your answer is completely correct."
      }
    ]
  },
  {
    "hanzi": "对面",
    "pinyin": "duì miàn",
    "english": "Location: opposite",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "银行在超市对面。",
        "pinyin": "Yínháng zài chāoshì duìmiàn.",
        "english": "The bank is opposite the supermarket."
      }
    ]
  },
  {
    "hanzi": "顿",
    "pinyin": "dùn",
    "english": " Noun: pause Verb: to stop, to pause, to arrange Measure Word: for meals, beatings, etc.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "今天吃了两顿饭。",
        "pinyin": "Jīntiān chī le liǎng dùn fàn.",
        "english": "I ate two meals today."
      }
    ]
  },
  {
    "hanzi": "朵",
    "pinyin": "duǒ",
    "english": "Measure Word: for flowers, clouds, etc.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "花园里开了一朵花。",
        "pinyin": "Huāyuán lǐ kāi le yī duǒ huā.",
        "english": "A flower bloomed in the garden."
      }
    ]
  },
  {
    "hanzi": "而",
    "pinyin": "ér",
    "english": "Conjunction: and, but, yet",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他喜欢喝茶，而不是咖啡。",
        "pinyin": "Tā xǐhuān hē chá, ér bú shì kāfēi.",
        "english": "He likes drinking tea, rather than coffee."
      }
    ]
  },
  {
    "hanzi": "儿童",
    "pinyin": "ér tóng",
    "english": "Noun: child",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "公园里有很多玩耍的儿童。",
        "pinyin": "Gōngyuán lǐ yǒu hěn duō wánshuǎ de értóng.",
        "english": "There are many children playing in the park."
      }
    ]
  },
  {
    "hanzi": "发",
    "pinyin": "fā",
    "english": " Verb: to send out, to issue, to develop Measure Word: for gunshots",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请把文件发给我。",
        "pinyin": "Qǐng bǎ wénjiàn fā gěi wǒ.",
        "english": "Please send the document to me."
      }
    ]
  },
  {
    "hanzi": "法律",
    "pinyin": "fǎ lǜ",
    "english": "Noun: law",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们必须遵守法律。",
        "pinyin": "Wǒmen bìxū zūnshǒu fǎlǜ.",
        "english": "We must abide by the law."
      }
    ]
  },
  {
    "hanzi": "发生",
    "pinyin": "fā shēng",
    "english": "Verb: to happen, to occur, to take place",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "昨天发生了什么事？",
        "pinyin": "Zuótiān fāshēng le shénme shì?",
        "english": "What happened yesterday?"
      }
    ]
  },
  {
    "hanzi": "发展",
    "pinyin": "fā zhǎn",
    "english": " Noun: development, growth Verb: to develop, to grow",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个城市发展得很快。",
        "pinyin": "Zhè ge chéngshì fāzhǎn de hěn kuài.",
        "english": "This city is developing very fast."
      }
    ]
  },
  {
    "hanzi": "反对",
    "pinyin": "fǎn duì",
    "english": "Verb: to fight against, to oppose",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我反对这个计划。",
        "pinyin": "Wǒ fǎnduì zhège jìhuà.",
        "english": "I object to this plan."
      }
    ]
  },
  {
    "hanzi": "烦恼",
    "pinyin": "fán nǎo",
    "english": " Noun: worries Adjective: worried, troubled",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "不要为小事烦恼。",
        "pinyin": "Bú yào wèi xiǎoshì fánnǎo.",
        "english": "Don't worry about trifles."
      }
    ]
  },
  {
    "hanzi": "范围",
    "pinyin": "fàn wéi",
    "english": "Noun: scope limit, range",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个超出了我的知识范围。",
        "pinyin": "Zhège chāochūle wǒ de zhīshi fànwéi.",
        "english": "This is outside the scope of my knowledge."
      }
    ]
  },
  {
    "hanzi": "翻译",
    "pinyin": "fān yì",
    "english": " Noun: translation, translator Verb: to translate",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你能帮我翻译这段文字吗？",
        "pinyin": "Nǐ néng bāng wǒ fānyì zhè duàn wénzì ma?",
        "english": "Can you help me translate this passage?"
      }
    ]
  },
  {
    "hanzi": "反映",
    "pinyin": "fǎn yìng",
    "english": " Noun: reflection Verb: to reflect, to mirror",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这部电影反映了现实生活。",
        "pinyin": "Zhè bù diànyǐng fǎnyìng le xiànshí shēnghuó.",
        "english": "This movie reflects real life."
      }
    ]
  },
  {
    "hanzi": "方法",
    "pinyin": "fāng fǎ",
    "english": "Noun: method, way",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们需要找到更好的方法。",
        "pinyin": "Wǒmen xūyào zhǎodào gèng hǎo de fāngfǎ.",
        "english": "We need to find a better method."
      }
    ]
  },
  {
    "hanzi": "方面",
    "pinyin": "fāng miàn",
    "english": "Noun: aspect, respect",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个问题有很多方面。",
        "pinyin": "Zhège wèntí yǒu hěn duō fāngmiàn.",
        "english": "This issue has many aspects."
      }
    ]
  },
  {
    "hanzi": "放弃",
    "pinyin": "fàng qì",
    "english": "Verb: to give up",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "即使困难，也不要放弃。",
        "pinyin": "Jíshǐ kùnnan, yě bú yào fàngqì.",
        "english": "Even if it's difficult, don't give up."
      }
    ]
  },
  {
    "hanzi": "放暑假",
    "pinyin": "fàng shǔ jià",
    "english": "Verb: to take summer vacation",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "学生们快要放暑假了。",
        "pinyin": "Xuéshengmen kuài yào fàng shǔjià le.",
        "english": "Students are about to start their summer vacation."
      }
    ]
  },
  {
    "hanzi": "访问",
    "pinyin": "fǎng wèn",
    "english": " Noun: visit Verb: to visit, to interview",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我明天要去访问客户。",
        "pinyin": "Wǒ míngtiān yào qù fǎngwèn kèhù.",
        "english": "I am going to visit a client tomorrow."
      }
    ]
  },
  {
    "hanzi": "方向",
    "pinyin": "fāng xiàng",
    "english": "Noun: direction, orientation",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请告诉我正确的方向。",
        "pinyin": "Qǐng gàosuǒ wǒ zhèngquè de fāngxiàng.",
        "english": "Please tell me the correct direction."
      }
    ]
  },
  {
    "hanzi": "份",
    "pinyin": "fèn",
    "english": " Noun: part, share, portion, copy Measure Word: for newspaper, papers, reports, contracts",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请给我一份报纸。",
        "pinyin": "Qǐng gěi wǒ yī fèn bàozhǐ.",
        "english": "Please give me one newspaper."
      }
    ]
  },
  {
    "hanzi": "分之",
    "pinyin": "fēn zhī",
    "english": "Expression: used for fractions and percentages",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "百分之五十就是一半。",
        "pinyin": "Bǎifēn zhī wǔshí jiù shì yī bàn.",
        "english": "Fifty percent is half."
      }
    ]
  },
  {
    "hanzi": "丰富",
    "pinyin": "fēng fù",
    "english": "Adjective: rich, plentiful",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他的知识非常丰富。",
        "pinyin": "Tā de zhīshi fēicháng fēngfù.",
        "english": "His knowledge is very rich."
      }
    ]
  },
  {
    "hanzi": "风景",
    "pinyin": "fēng jǐng",
    "english": "Noun: scenery, landscape",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这里风景很美。",
        "pinyin": "Zhèlǐ fēngjǐng hěn měi.",
        "english": "The scenery here is beautiful."
      }
    ]
  },
  {
    "hanzi": "否则",
    "pinyin": "fǒu zé",
    "english": "Conjunction: otherwise",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你必须早点走，否则会迟到。",
        "pinyin": "Nǐ bìxū zǎodiǎn zǒu, fǒuzé huì chídào.",
        "english": "You must leave earlier, otherwise you will be late."
      }
    ]
  },
  {
    "hanzi": "富",
    "pinyin": "fù",
    "english": "Adjective: rich",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们希望能变得更富。",
        "pinyin": "Wǒmen xīwàng néng biànde gèng fù.",
        "english": "We hope to become richer."
      }
    ]
  },
  {
    "hanzi": "符合",
    "pinyin": "fú hé",
    "english": "Verb: to accord with, to conform to",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你的回答完全符合要求。",
        "pinyin": "Nǐ de huídá wánquán fúhé yāoqiú.",
        "english": "Your answer completely meets the requirements."
      }
    ]
  },
  {
    "hanzi": "父亲",
    "pinyin": "fù qīn",
    "english": "Noun: father",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他的父亲是一名教师。",
        "pinyin": "Tā de fùqīn shì yī míng jiàoshī.",
        "english": "His father is a teacher."
      }
    ]
  },
  {
    "hanzi": "复印",
    "pinyin": "fù yìn",
    "english": "Verb: to photo,copy",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请帮我复印这份文件。",
        "pinyin": "Qǐng bāng wǒ fùyìn zhè fèn wénjiàn.",
        "english": "Please help me photocopy this document."
      }
    ]
  },
  {
    "hanzi": "复杂",
    "pinyin": "fù zá",
    "english": "Adjective: complicated, complex",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个问题有点复杂。",
        "pinyin": "Zhège wèntí yǒu diǎn fùzá.",
        "english": "This problem is a bit complicated."
      }
    ]
  },
  {
    "hanzi": "负责",
    "pinyin": "fù zé",
    "english": "Verb: to be responsible for",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "谁负责这个项目？",
        "pinyin": "Shéi fùzé zhège xiàngmù?",
        "english": "Who is responsible for this project?"
      }
    ]
  },
  {
    "hanzi": "改变",
    "pinyin": "gǎi biàn",
    "english": "Verb: to change",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们需要改变计划。",
        "pinyin": "Wǒmen xūyào gǎibiàn jìhuà.",
        "english": "We need to change the plan."
      }
    ]
  },
  {
    "hanzi": "干",
    "pinyin": "gàn",
    "english": "Verb: to do, to work",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们明天开始干活。",
        "pinyin": "Wǒmen míngtiān kāishǐ gàn huó.",
        "english": "We will start working tomorrow."
      }
    ]
  },
  {
    "hanzi": "干杯",
    "pinyin": "gān bēi",
    "english": "Expression: Cheers!",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "来，为我们的友谊干杯！",
        "pinyin": "Lái, wèi wǒmen de yǒuyì gānbēi!",
        "english": "Come on, let's toast to our friendship!"
      }
    ]
  },
  {
    "hanzi": "感动",
    "pinyin": "gǎn dòng",
    "english": "Verb: to move sb., to be moved",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他的故事很让人感动。",
        "pinyin": "Tā de gùshi hěn ràng rén gǎndòng.",
        "english": "His story is very touching."
      }
    ]
  },
  {
    "hanzi": "感觉",
    "pinyin": "gǎn jué",
    "english": " Noun: feeling, sense Verb: to feel",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你感觉怎么样？",
        "pinyin": "Nǐ gǎnjué zěnmeyàng?",
        "english": "How do you feel?"
      }
    ]
  },
  {
    "hanzi": "感情",
    "pinyin": "gǎn qíng",
    "english": "Noun: emotion, feeling",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他们的感情非常好。",
        "pinyin": "Tāmen de gǎnqíng fēicháng hǎo.",
        "english": "Their relationship (feelings) is very good."
      }
    ]
  },
  {
    "hanzi": "感谢",
    "pinyin": "gǎn xiè",
    "english": " Noun: gratitude Verb: to thank, to be grateful",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我非常感谢你的帮助。",
        "pinyin": "Wǒ fēicháng gǎnxiè nǐ de bāngzhù.",
        "english": "I am very grateful for your help."
      }
    ]
  },
  {
    "hanzi": "干燥",
    "pinyin": "gān zào",
    "english": "Adjective: dry",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "冬天空气很干燥。",
        "pinyin": "Dōngtiān kōngqì hěn gānzào.",
        "english": "Winter air is dry."
      }
    ]
  },
  {
    "hanzi": "高级",
    "pinyin": "gāo jí",
    "english": "Adjective: high level, high grade, advanced",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这家餐厅提供高级服务。",
        "pinyin": "Zhè jiā cāntīng tígōng gāojí fúwù.",
        "english": "This restaurant offers high-level service."
      }
    ]
  },
  {
    "hanzi": "各",
    "pinyin": "gè",
    "english": "Pronoun: each, every",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请各小组讨论五分钟。",
        "pinyin": "Qǐng gè xiǎozǔ tǎolùn wǔ fēnzhōng.",
        "english": "Please have each group discuss for five minutes."
      }
    ]
  },
  {
    "hanzi": "工具",
    "pinyin": "gōng jù",
    "english": "Noun: tool, utensil",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "修理需要工具。",
        "pinyin": "Xiūlǐ xūyào gōngjù.",
        "english": "Repair needs tools."
      }
    ]
  },
  {
    "hanzi": "公里",
    "pinyin": "gōng lǐ",
    "english": "Noun: kilometer Measure Word: for km",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "还有三公里就到了。",
        "pinyin": "Hái yǒu sān gōnglǐ jiù dào le.",
        "english": "It's only three kilometers until we arrive."
      }
    ]
  },
  {
    "hanzi": "共同",
    "pinyin": "gòng tóng",
    "english": "Adjective: common, joint, together",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "成功是大家共同的愿望。",
        "pinyin": "Chénggōng shì dàjiā gòngtóng de yuànwàng.",
        "english": "Success is everyone's common wish."
      }
    ]
  },
  {
    "hanzi": "工资",
    "pinyin": "gōng zī",
    "english": "Noun: salary, wages",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你的新工作工资怎么样？",
        "pinyin": "Nǐ de xīn gōngzuò gōngzī zěnmeyàng?",
        "english": "How is the salary of your new job?"
      }
    ]
  },
  {
    "hanzi": "够",
    "pinyin": "gòu",
    "english": " Verb: to reach, to be enough Adjective: be enough Adverb: enough",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这些食物够我们吃了。",
        "pinyin": "Zhèxiē shíwù gòu wǒmen chī le.",
        "english": "This food is enough for us to eat."
      }
    ]
  },
  {
    "hanzi": "孤单",
    "pinyin": "gū dān",
    "english": "Adjective: lone, lonely",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "一个人住很孤单。",
        "pinyin": "Yī ge rén zhù hěn gūdān.",
        "english": "Living alone is lonely."
      }
    ]
  },
  {
    "hanzi": "估计",
    "pinyin": "gū jì",
    "english": "Verb: to estimate",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我估计他下午会来。",
        "pinyin": "Wǒ gūjì tā xiàwǔ huì lái.",
        "english": "I estimate he will come this afternoon."
      }
    ]
  },
  {
    "hanzi": "顾客",
    "pinyin": "gù kè",
    "english": "Noun: client, customer",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这家店有很多老顾客。",
        "pinyin": "Zhè jiā diàn yǒu hěn duō lǎo gùkè.",
        "english": "This store has many regular customers."
      }
    ]
  },
  {
    "hanzi": "鼓励",
    "pinyin": "gǔ lì",
    "english": "Verb: to encourage, to urge",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "老师鼓励我们要多练习。",
        "pinyin": "Lǎoshī gǔlì wǒmen yào duō liànxí.",
        "english": "The teacher encourages us to practice more."
      }
    ]
  },
  {
    "hanzi": "故意",
    "pinyin": "gù yì",
    "english": "Adverb: on purpose, deliberately",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他是故意这么做的。",
        "pinyin": "Tā shì gùyì zhème zuò de.",
        "english": "He did it on purpose."
      }
    ]
  },
  {
    "hanzi": "鼓掌",
    "pinyin": "gǔ zhǎng",
    "english": "Verb: to applaud",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "大家热烈鼓掌。",
        "pinyin": "Dàjiā rèliè gǔzhǎng.",
        "english": "Everyone applauded warmly."
      }
    ]
  },
  {
    "hanzi": "挂",
    "pinyin": "guà",
    "english": "Verb: to hang up",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请把外套挂起来。",
        "pinyin": "Qǐng bǎ wàitào guà qǐlái.",
        "english": "Please hang up your coat."
      }
    ]
  },
  {
    "hanzi": "关键",
    "pinyin": "guān jiàn",
    "english": "Noun: key, crucial point",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "细节是成功的关键。",
        "pinyin": "Xìjié shì chénggōng de guānjiàn.",
        "english": "Details are the key to success."
      }
    ]
  },
  {
    "hanzi": "管理",
    "pinyin": "guǎn lǐ",
    "english": "Noun: management Verb: to manage",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她负责管理这个项目。",
        "pinyin": "Tā fùzé guǎnlǐ zhège xiàngmù.",
        "english": "She is responsible for managing this project."
      }
    ]
  },
  {
    "hanzi": "观众",
    "pinyin": "guān zhòng",
    "english": "Noun: audience, spectators",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "观众们都非常激动。",
        "pinyin": "Guānzhòngmen dōu fēicháng jīdòng.",
        "english": "The audience was very excited."
      }
    ]
  },
  {
    "hanzi": "逛",
    "pinyin": "guàng",
    "english": "Verb: to stroll",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我喜欢周末去逛街。",
        "pinyin": "Wǒ xǐhuān zhōumò qù guàng jiē.",
        "english": "I like to go shopping (stroll the streets) on weekends."
      }
    ]
  },
  {
    "hanzi": "光",
    "pinyin": "guāng",
    "english": " Noun: light, ray Adjective: naked Adverb: only, merely",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "房间里光线很好。",
        "pinyin": "Fángjiān lǐ guāngxiàn hěn hǎo.",
        "english": "The lighting in the room is very good."
      }
    ]
  },
  {
    "hanzi": "广播",
    "pinyin": "guǎng bō",
    "english": "Noun: broadcasting Verb: to broadcast",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请收听天气广播。",
        "pinyin": "Qǐng shōutīng tiānqì guǎngbō.",
        "english": "Please listen to the weather broadcast."
      }
    ]
  },
  {
    "hanzi": "广告",
    "pinyin": "guǎng gào",
    "english": "Noun: advertisement Verb: to advertise",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "电视上有很多有趣的广告。",
        "pinyin": "Diànshì shàng yǒu hěn duō yǒuqù de guǎnggào.",
        "english": "There are many interesting advertisements on TV."
      }
    ]
  },
  {
    "hanzi": "规定",
    "pinyin": "guī dìng",
    "english": " Noun: regulations, provision Verb: to fix, to stipulate",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请遵守公司的规定。",
        "pinyin": "Qǐng zūnshǒu gōngsī de guīdìng.",
        "english": "Please abide by the company's rules."
      }
    ]
  },
  {
    "hanzi": "过",
    "pinyin": "guò",
    "english": "Verb: to pass, to cross, to spend time",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们一起过春节。",
        "pinyin": "Wǒmen yīqǐ guò Chūnjié.",
        "english": "We celebrate Spring Festival together."
      }
    ]
  },
  {
    "hanzi": "过程",
    "pinyin": "guò chéng",
    "english": "Noun: process, course",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "学习是一个漫长的过程。",
        "pinyin": "Xuéxí shì yí ge màncháng de guòchéng.",
        "english": "Learning is a long process."
      }
    ]
  },
  {
    "hanzi": "国际",
    "pinyin": "guó jì",
    "english": "Adjective: international",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他参加了一个国际会议。",
        "pinyin": "Tā cānjiā le yí ge guójì huìyì.",
        "english": "He attended an international conference."
      }
    ]
  },
  {
    "hanzi": "果然",
    "pinyin": "guǒ rán",
    "english": "Adverb: as expected",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他果然没来，和我想的一样。",
        "pinyin": "Tā guǒrán méi lái, hé wǒ xiǎng de yīyàng.",
        "english": "He didn't come, as expected (just like I thought)."
      }
    ]
  },
  {
    "hanzi": "害羞",
    "pinyin": "hài xiū",
    "english": "Adjective: shy",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她有点害羞，不敢说话。",
        "pinyin": "Tā yǒu diǎn hàixiū, bù gǎn shuōhuà.",
        "english": "She is a little shy and dare not speak."
      }
    ]
  },
  {
    "hanzi": "海洋",
    "pinyin": "hǎi yáng",
    "english": "Noun: ocean",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们喜欢在海洋边散步。",
        "pinyin": "Wǒmen xǐhuan zài hǎiyáng biān sànbù.",
        "english": "We like walking along the ocean."
      }
    ]
  },
  {
    "hanzi": "汗",
    "pinyin": "hàn",
    "english": "Noun: sweat",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "运动后我出了一身汗。",
        "pinyin": "Yùndòng hòu wǒ chū le yì shēn hàn.",
        "english": "I broke a sweat after exercising."
      }
    ]
  },
  {
    "hanzi": "寒假",
    "pinyin": "hán jià",
    "english": "Noun: winter vacation",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "寒假你有什么计划？",
        "pinyin": "Hánjià nǐ yǒu shénme jìhuà?",
        "english": "What plans do you have for the winter vacation?"
      }
    ]
  },
  {
    "hanzi": "航班",
    "pinyin": "háng bān",
    "english": "Noun: scheduled flight, flight number",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们的航班延误了两个小时。",
        "pinyin": "Wǒmen de hángbān yánwù le liǎng ge xiǎoshí.",
        "english": "Our flight was delayed by two hours."
      }
    ]
  },
  {
    "hanzi": "好处",
    "pinyin": "hǎo chu",
    "english": "Noun: benefit, advantage",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "多读书对你有很多好处。",
        "pinyin": "Duō dú shū duì nǐ yǒu hěn duō hǎochu.",
        "english": "Reading more books has many benefits for you."
      }
    ]
  },
  {
    "hanzi": "号码",
    "pinyin": "hào mǎ",
    "english": "Noun: number",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你的手机号码是多少？",
        "pinyin": "Nǐ de shǒujī hàomǎ shì duōshǎo?",
        "english": "What’s your phone number?"
      }
    ]
  },
  {
    "hanzi": "合格",
    "pinyin": "hé gé",
    "english": "Adjective: qualified",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "只有合格的产品才能出售。",
        "pinyin": "Zhǐyǒu hégé de chǎnpǐn cáinéng chūshòu.",
        "english": "Only qualified products can be sold."
      }
    ]
  },
  {
    "hanzi": "合适",
    "pinyin": "hé shì",
    "english": "Adjective: suitable, appropriate",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这件衣服对他来说很合适。",
        "pinyin": "Zhè jiàn yīfu duì tā lái shuō hěn héshì.",
        "english": "This piece of clothing is very suitable for him."
      }
    ]
  },
  {
    "hanzi": "盒子",
    "pinyin": "hé zi",
    "english": "Noun: box, case",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请把这些文件放进盒子里。",
        "pinyin": "Qǐng bǎ zhèxiē wénjiàn fàng jìn hézi lǐ.",
        "english": "Please put these documents into the box."
      }
    ]
  },
  {
    "hanzi": "厚",
    "pinyin": "hòu",
    "english": "Adjective: thick, deep",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "冬天需要穿一件厚外套。",
        "pinyin": "Dōngtiān xūyào chuān yí jiàn hòu wàitào.",
        "english": "You need to wear a thick coat in winter."
      }
    ]
  },
  {
    "hanzi": "后悔",
    "pinyin": "hòu huǐ",
    "english": "Verb: to regret, to repent",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "做了决定就不要后悔。",
        "pinyin": "Zuòle juédìng jiù bú yào hòuhuǐ.",
        "english": "Don't regret it once you have made a decision."
      }
    ]
  },
  {
    "hanzi": "猴子",
    "pinyin": "hóu zi",
    "english": "Noun: monkey",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "猴子喜欢吃香蕉。",
        "pinyin": "Hóuzi xǐhuan chī xiāngjiāo.",
        "english": "Monkeys like to eat bananas."
      }
    ]
  },
  {
    "hanzi": "护士",
    "pinyin": "hù shi",
    "english": "Noun: nurse",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "那位护士对病人非常耐心。",
        "pinyin": "Nà wèi hùshi duì bìngrén fēicháng nàixīn.",
        "english": "That nurse is very patient with patients."
      }
    ]
  },
  {
    "hanzi": "互相",
    "pinyin": "hù xiāng",
    "english": "Adverb: each other",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "朋友之间应该互相帮助。",
        "pinyin": "Péngyou zhī jiān yīnggāi hùxiāng bāngzhù.",
        "english": "Friends should help each other."
      }
    ]
  },
  {
    "hanzi": "怀疑",
    "pinyin": "huái yí",
    "english": " Noun: doubt, suspicion Verb: to doubt, to suspect",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我开始怀疑他的话是否真实。",
        "pinyin": "Wǒ kāishǐ huáiyí tā de huà shìfǒu zhēnshí.",
        "english": "I started to doubt whether his words were true."
      }
    ]
  },
  {
    "hanzi": "回忆",
    "pinyin": "huí yì",
    "english": " Noun: recollection Verb: to recall, to recollect",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "童年是美好的回忆。",
        "pinyin": "Tóngnián shì měihǎo de huíyì.",
        "english": "Childhood is a beautiful memory."
      }
    ]
  },
  {
    "hanzi": "火",
    "pinyin": "huǒ",
    "english": "Noun: fire",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "小心，别让孩子玩火。",
        "pinyin": "Xiǎoxīn, bié ràng háizi wán huǒ.",
        "english": "Be careful, don't let the child play with fire."
      }
    ]
  },
  {
    "hanzi": "获得",
    "pinyin": "huò dé",
    "english": "Verb: to obtain, to acquire",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他获得了这次比赛的第一名。",
        "pinyin": "Tā huòdéle zhè cì bǐsài de dì yī míng.",
        "english": "He won first place in this competition."
      }
    ]
  },
  {
    "hanzi": "活动",
    "pinyin": "huó dòng",
    "english": "Noun: activity Verb: to move about Adjective: active",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "周末我们组织了一次户外活动。",
        "pinyin": "Zhōumò wǒmen zǔzhīle yí cì hùwài huódòng.",
        "english": "We organized an outdoor activity this weekend."
      }
    ]
  },
  {
    "hanzi": "活泼",
    "pinyin": "huó pō",
    "english": "Adjective: lively, vivid",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "那个小女孩非常活泼可爱。",
        "pinyin": "Nà ge xiǎo nǚhái fēicháng huópō kě'ài.",
        "english": "That little girl is very lively and cute."
      }
    ]
  },
  {
    "hanzi": "寄",
    "pinyin": "jì",
    "english": "Verb: to send, to mail",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我明天要去邮局寄包裹。",
        "pinyin": "Wǒ míngtiān yào qù yóujú jì bāoguǒ.",
        "english": "I need to go to the post office to mail a package tomorrow."
      }
    ]
  },
  {
    "hanzi": "基础",
    "pinyin": "jī chǔ",
    "english": "Noun: base, foundation, basis",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "打好基础对学习非常重要。",
        "pinyin": "Dǎ hǎo jīchǔ duì xuéxí fēicháng zhòngyào.",
        "english": "Laying a good foundation is very important for studying."
      }
    ]
  },
  {
    "hanzi": "激动",
    "pinyin": "jī dòng",
    "english": "Verb: to excite Adjective: exciting",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "听到这个好消息，大家都很激动。",
        "pinyin": "Tīng dào zhège hǎo xiāoxi, dàjiā dōu hěn jīdòng.",
        "english": "Everyone was very excited to hear this good news."
      }
    ]
  },
  {
    "hanzi": "集合",
    "pinyin": "jí hé",
    "english": " Noun: congregation Verb: to gather, to assemble",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请大家五分钟后在大厅集合。",
        "pinyin": "Qǐng dàjiā wǔ fēnzhōng hòu zài dàtīng jíhé.",
        "english": "Please gather in the hall in five minutes."
      }
    ]
  },
  {
    "hanzi": "计划",
    "pinyin": "jì huà",
    "english": " Noun: plan, project, program Verb: to plan",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们正在计划下个月的旅行。",
        "pinyin": "Wǒmen zhèngzài jìhuà xià ge yuè de lǚxíng.",
        "english": "We are planning next month's trip."
      }
    ]
  },
  {
    "hanzi": "积极",
    "pinyin": "jī jí",
    "english": "Adjective: positive, active",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们应该积极参与社区活动。",
        "pinyin": "Wǒmen yīnggāi jījí cānyù shèqū huódòng.",
        "english": "We should actively participate in community activities."
      }
    ]
  },
  {
    "hanzi": "积累",
    "pinyin": "jī lěi",
    "english": "Noun: accumulation Verb: to accumulate",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "知识需要靠平时努力积累。",
        "pinyin": "Zhīshi xūyào kào píngshí nǔlì jīlěi.",
        "english": "Knowledge needs to be accumulated through daily effort."
      }
    ]
  },
  {
    "hanzi": "既然",
    "pinyin": "jì rán",
    "english": "Conjunction: this being the case",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "既然你来了，就坐下来喝杯茶吧。",
        "pinyin": "Jìrán nǐ láile, jiù zuò xiàlái hē bēi chá ba.",
        "english": "Since you are here, sit down and have a cup of tea."
      }
    ]
  },
  {
    "hanzi": "及时",
    "pinyin": "jí shí",
    "english": "Adjective: in time Adverb: without delay",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他及时赶到了机场。",
        "pinyin": "Tā jíshí gǎndàole jīchǎng.",
        "english": "He arrived at the airport just in time."
      }
    ]
  },
  {
    "hanzi": "即使",
    "pinyin": "jí shǐ",
    "english": "Conjunction: even if, even thoug",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "即使下雨，我们也照常出发。",
        "pinyin": "Jíshǐ xià yǔ, wǒmen yě zhàocháng chūfā.",
        "english": "Even if it rains, we will depart as planned."
      }
    ]
  },
  {
    "hanzi": "技术",
    "pinyin": "jì shù",
    "english": "Noun: technology, skill, technique",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他学习了新的编程技术。",
        "pinyin": "Tā xuéxíle xīn de biānchéng jìshù.",
        "english": "He learned new programming techniques."
      }
    ]
  },
  {
    "hanzi": "继续",
    "pinyin": "jì xù",
    "english": "Noun: continuation Verb: to continue, to go on",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请大家继续讨论这个问题。",
        "pinyin": "Qǐng dàjiā jìxù tǎolùn zhège wèntí.",
        "english": "Please everyone continue discussing this issue."
      }
    ]
  },
  {
    "hanzi": "记者",
    "pinyin": "jì zhě",
    "english": "Noun: reporter, journalist",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "记者采访明星。",
        "pinyin": "Jìzhě cǎifǎng míngxīng.",
        "english": "Reporters interview stars."
      }
    ]
  },
  {
    "hanzi": "假",
    "pinyin": "jiǎ",
    "english": "Adjective: fake, false",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我打算在寒假去看望父母。",
        "pinyin": "Wǒ dǎsuàn zài hánjià qù kànwàng fùmǔ.",
        "english": "I plan to visit my parents during the winter break."
      }
    ]
  },
  {
    "hanzi": "加班",
    "pinyin": "jiā bān",
    "english": "Verb: to work overtime",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "为了完成任务，他昨晚加班了。",
        "pinyin": "Wèile wánchéng rénwù, tā zuówǎn jiābānle.",
        "english": "In order to complete the task, he worked overtime last night."
      }
    ]
  },
  {
    "hanzi": "价格",
    "pinyin": "jià gé",
    "english": "Noun: price",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这家店的商品价格都很合理。",
        "pinyin": "Zhè jiā diàn de shāngpǐn jiàgé dōu hěn hélǐ.",
        "english": "The prices of goods in this store are very reasonable."
      }
    ]
  },
  {
    "hanzi": "家具",
    "pinyin": "jiā jù",
    "english": "Noun: furniture",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们正在挑选新的客厅家具。",
        "pinyin": "Wǒmen zhèngzài tiāoxuǎn xīn de kètīng jiājù.",
        "english": "We are selecting new living room furniture."
      }
    ]
  },
  {
    "hanzi": "加油站",
    "pinyin": "jiā yóu zhàn",
    "english": "Noun: gas station",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "车去加油站。",
        "pinyin": "Chē qù jiāyóu zhàn.",
        "english": "The car goes to the gas station."
      }
    ]
  },
  {
    "hanzi": "坚持",
    "pinyin": "jiān chí",
    "english": "Verb: to stick to, to persist in, to insist on",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "只要坚持下去，就一定能成功。",
        "pinyin": "Zhǐyào jiānchí xiàqù, jiù yīdìng néng chénggōng.",
        "english": "As long as you persist, you will definitely succeed."
      }
    ]
  },
  {
    "hanzi": "减肥",
    "pinyin": "jiǎn féi",
    "english": "Verb: to lose weight",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她在减肥。",
        "pinyin": "Tā zài jiǎnféi.",
        "english": "She’s losing weight."
      }
    ]
  },
  {
    "hanzi": "减少",
    "pinyin": "jiǎn shǎo",
    "english": "Verb: to reduce, to decrease",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们必须努力减少环境污染。",
        "pinyin": "Wǒmen bìxū nǔlì jiǎnshǎo huánjìng wūrǎn.",
        "english": "We must strive to reduce environmental pollution."
      }
    ]
  },
  {
    "hanzi": "降低",
    "pinyin": "jiàng dī",
    "english": "Verb: to reduce, to lower",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们需要降低生产成本。",
        "pinyin": "Wǒmen xūyào jiàngdī shēngchǎn chéngběn.",
        "english": "We need to reduce production costs."
      }
    ]
  },
  {
    "hanzi": "奖金",
    "pinyin": "jiǎng jīn",
    "english": " Noun: premium, award money, bonus",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "年底公司会发奖金。",
        "pinyin": "Niándǐ gōngsī huì fā jiǎngjīn.",
        "english": "The company will issue a bonus at the end of the year."
      }
    ]
  },
  {
    "hanzi": "将来",
    "pinyin": "jiāng lái",
    "english": "future Adverb: in the future",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "将来我想成为一名老师。",
        "pinyin": "Jiānglái wǒ xiǎng chéngwéi yī míng lǎoshī.",
        "english": "I want to become a teacher in the future."
      }
    ]
  },
  {
    "hanzi": "交",
    "pinyin": "jiāo",
    "english": " Verb: to hand over, to intersect, to associate with",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请在周五前交作业。",
        "pinyin": "Qǐng zài zhōuwǔ qián jiāo zuòyè.",
        "english": "Please submit your homework before Friday."
      }
    ]
  },
  {
    "hanzi": "骄傲",
    "pinyin": "jiāo ào",
    "english": "Verb: to be proud of sth. Adjective: arrogant, conceited",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她为自己的成就感到骄傲。",
        "pinyin": "Tā wèi zìjǐ de chéngjiù gǎndào jiāo'ào.",
        "english": "She feels proud of her achievements."
      }
    ]
  },
  {
    "hanzi": "交流",
    "pinyin": "jiāo liú",
    "english": "Noun: communication, exchange Verb: to exchange, to communicate",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们经常进行文化交流。",
        "pinyin": "Wǒmen jīngcháng jìnxíng wénhuà jiāoliú.",
        "english": "We often engage in cultural exchange."
      }
    ]
  },
  {
    "hanzi": "教授",
    "pinyin": "jiào shòu",
    "english": " Noun: professor Verb: to instruct, to lecture on",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这位教授很受学生欢迎。",
        "pinyin": "Zhè wèi jiàoshòu hěn shòu xuésheng huānyíng.",
        "english": "This professor is very popular among students."
      }
    ]
  },
  {
    "hanzi": "交通",
    "pinyin": "jiāo tōng",
    "english": "Noun: traffic",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这里的交通非常方便。",
        "pinyin": "Zhèlǐ de jiāotōng fēicháng fāngbiàn.",
        "english": "The transportation here is very convenient."
      }
    ]
  },
  {
    "hanzi": "教育",
    "pinyin": "jiào yù",
    "english": "Noun: educatione Verb: to teach",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "教育对孩子来说很重要。",
        "pinyin": "Jiàoyù duì háizi lái shuō hěn zhòngyào.",
        "english": "Education is very important for children."
      }
    ]
  },
  {
    "hanzi": "饺子",
    "pinyin": "jiǎo zi",
    "english": "Noun: dumpling",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我喜欢吃妈妈包的饺子。",
        "pinyin": "Wǒ xǐhuān chī māma bāo de jiǎozi.",
        "english": "I like eating the dumplings my mom makes."
      }
    ]
  },
  {
    "hanzi": "结果",
    "pinyin": "jié guǒ",
    "english": "Noun: result, outcome Conjunction: finally, at last",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "考试结果下周会公布。",
        "pinyin": "Kǎoshì jiéguǒ xià zhōu huì gōngbù.",
        "english": "The exam results will be announced next week."
      }
    ]
  },
  {
    "hanzi": "解释",
    "pinyin": "jiě shì",
    "english": "Noun: explanation Verb: to explain",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请你解释一下这个词的意思。",
        "pinyin": "Qǐng nǐ jiěshì yīxià zhège cí de yìsi.",
        "english": "Please explain the meaning of this word."
      }
    ]
  },
  {
    "hanzi": "接受",
    "pinyin": "jiē shòu",
    "english": "Verb: to accept, to receive",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他接受了这份工作邀请。",
        "pinyin": "Tā jiēshòu le zhè fèn gōngzuò yāoqǐng.",
        "english": "He accepted this job invitation."
      }
    ]
  },
  {
    "hanzi": "节约",
    "pinyin": "jié yuē",
    "english": "Verb: to economize, to conserve",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们应该节约用水用电。",
        "pinyin": "Wǒmen yīnggāi jiéyuē yòng shuǐ yòng diàn.",
        "english": "We should conserve water and electricity."
      }
    ]
  },
  {
    "hanzi": "尽管",
    "pinyin": "jǐn guǎn",
    "english": "Adverb: unhesitatingly Conjunction: in spite of, although, despite",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "尽管下雨，我们还是出门了。",
        "pinyin": "Jǐnguǎn xià yǔ, wǒmen háishì chū mén le.",
        "english": "Even though it was raining, we still went out."
      }
    ]
  },
  {
    "hanzi": "进行",
    "pinyin": "jìn xíng",
    "english": "Verb: to be in progress, be underway",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "会议正在顺利进行中。",
        "pinyin": "Huìyì zhèngzài shùnlì jìnxíng zhōng.",
        "english": "The meeting is currently proceeding smoothly."
      }
    ]
  },
  {
    "hanzi": "紧张",
    "pinyin": "jǐn zhāng",
    "english": "Adjective: nervous, tense, in short supply",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "第一次演讲，我感到很紧张。",
        "pinyin": "Dì yī cì yǎnjiǎng, wǒ gǎndào hěn jǐnzhāng.",
        "english": "I felt very nervous during the first speech."
      }
    ]
  },
  {
    "hanzi": "禁止",
    "pinyin": "jìn zhǐ",
    "english": "Verb: to prohibit, to forbid, to ban",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "公园里禁止吸烟。",
        "pinyin": "Gōngyuán lǐ jìnzhǐ xīyān.",
        "english": "Smoking is prohibited in the park."
      }
    ]
  },
  {
    "hanzi": "精彩",
    "pinyin": "jīng cǎi",
    "english": "Adjective: brilliant, excellent, splendid",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "昨天的表演非常精彩。",
        "pinyin": "Zuótiān de biǎoyǎn fēicháng jīngcǎi.",
        "english": "Yesterday's performance was very wonderful."
      }
    ]
  },
  {
    "hanzi": "警察",
    "pinyin": "jǐng chá",
    "english": "Noun: police",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "遇到危险时要找警察帮忙。",
        "pinyin": "Yù dào wēixiǎn shí yào zhǎo jǐngchá bāngmáng.",
        "english": "When encountering danger, you should ask the police for help."
      }
    ]
  },
  {
    "hanzi": "经济",
    "pinyin": "jīng jì",
    "english": "Noun: economy",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "学习经济学很有用。",
        "pinyin": "Xuéxí jīngjì xué hěn yǒu yòng.",
        "english": "Studying economics is very useful."
      }
    ]
  },
  {
    "hanzi": "京剧",
    "pinyin": "jīng jù",
    "english": "Noun: Beijing Opera",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我很喜欢看京剧。",
        "pinyin": "Wǒ hěn xǐhuān kàn Jīngjù.",
        "english": "I really like watching Peking opera."
      }
    ]
  },
  {
    "hanzi": "经历",
    "pinyin": "jīng lì",
    "english": "Noun: experience Verb: to experience",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这次旅行是一次难忘的经历。",
        "pinyin": "Zhè cì lǚxíng shì yī cì nánwàng de jīnglì.",
        "english": "This trip was an unforgettable experience."
      }
    ]
  },
  {
    "hanzi": "竟然",
    "pinyin": "jìng rán",
    "english": "Adverb: unexpectedly",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她竟然会说流利的中文！",
        "pinyin": "Tā jìngrán huì shuō liúlì de Zhōngwén!",
        "english": "She can actually speak fluent Chinese!"
      }
    ]
  },
  {
    "hanzi": "精神",
    "pinyin": "jīng shén",
    "english": "Noun: spirit, mind",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他看起来很有精神。",
        "pinyin": "Tā kàn qǐlái hěn yǒu jīngshén.",
        "english": "He looks very energetic."
      }
    ]
  },
  {
    "hanzi": "经验",
    "pinyin": "jīng yàn",
    "english": "Noun: experience Verb: to experience",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他在这方面有丰富的工作经验。",
        "pinyin": "Tā zài zhè fāngmiàn yǒu fēngfù de gōngzuò jīngyàn.",
        "english": "He has rich work experience in this area."
      }
    ]
  },
  {
    "hanzi": "竞争",
    "pinyin": "jìng zhēng",
    "english": "Noun: competition Verb: to compete",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "市场竞争非常激烈。",
        "pinyin": "Shìchǎng jìngzhēng fēicháng jīliè.",
        "english": "Market competition is very fierce."
      }
    ]
  },
  {
    "hanzi": "镜子",
    "pinyin": "jìng zi",
    "english": "Noun: mirror",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "早上出门前照一下镜子。",
        "pinyin": "Zǎoshang chūmén qián zhào yīxià jìngzi.",
        "english": "Look in the mirror before going out in the morning."
      }
    ]
  },
  {
    "hanzi": "究竟",
    "pinyin": "jiū jìng",
    "english": "Adverb: after all, actually",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你究竟想说什么？",
        "pinyin": "Nǐ jiūjìng xiǎng shuō shénme?",
        "english": "What exactly do you want to say?"
      }
    ]
  },
  {
    "hanzi": "举办",
    "pinyin": "jǔ bàn",
    "english": "Verb: to hold, to conduct",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "学校将举办一场晚会。",
        "pinyin": "Xuéxiào jiāng jǔbàn yī chǎng wǎnhuì.",
        "english": "The school will hold an evening party."
      }
    ]
  },
  {
    "hanzi": "拒绝",
    "pinyin": "jù jué",
    "english": "Verb: to refuse, to decline",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他拒绝了我的邀请。",
        "pinyin": "Tā jùjué le wǒ de yāoqǐng.",
        "english": "He refused my invitation."
      }
    ]
  },
  {
    "hanzi": "距离",
    "pinyin": "jù lí",
    "english": "Noun: distance Verb: to be apart from",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们家和学校的距离很近。",
        "pinyin": "Wǒmen jiā hé xuéxiào de jùlí hěn jìn.",
        "english": "The distance between my home and the school is very short."
      }
    ]
  },
  {
    "hanzi": "开玩笑",
    "pinyin": "kāi wán xiào",
    "english": "Verb: to play a joke, to make fun of",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "别生气，我只是开玩笑。",
        "pinyin": "Bié shēngqì, wǒ zhǐshì kāi wánxiào.",
        "english": "Don't be angry, I was just joking."
      }
    ]
  },
  {
    "hanzi": "看法",
    "pinyin": "kàn fǎ",
    "english": "Noun: view, opinion",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你对这件事有什么看法？",
        "pinyin": "Nǐ duì zhè jiàn shì yǒu shénme kànfǎ?",
        "english": "What is your opinion on this matter?"
      }
    ]
  },
  {
    "hanzi": "考虑",
    "pinyin": "kǎo lǜ",
    "english": " Noun: consideration Verb: to think over, to consider",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我需要时间好好考虑一下。",
        "pinyin": "Wǒ xūyào shíjiān hǎohǎo kǎolǜ yīxià.",
        "english": "I need some time to think it over carefully."
      }
    ]
  },
  {
    "hanzi": "可怜",
    "pinyin": "kě lián",
    "english": "Adjective: pitiful, poor, pathetic",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个孩子真可怜。",
        "pinyin": "Zhège háizi zhēn kělián.",
        "english": "This child is so pitiful."
      }
    ]
  },
  {
    "hanzi": "可是",
    "pinyin": "kě shì",
    "english": "Conjunction: but",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我想去可是太累。",
        "pinyin": "Wǒ xiǎng qù kěshì tài lèi.",
        "english": "I want to go but I’m too tired."
      }
    ]
  },
  {
    "hanzi": "咳嗽",
    "pinyin": "ké sou",
    "english": "Noun: cough Verb: to cough",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她感冒了，一直在咳嗽。",
        "pinyin": "Tā gǎnmào le, yīzhí zài késou.",
        "english": "She caught a cold and has been coughing constantly."
      }
    ]
  },
  {
    "hanzi": "可惜",
    "pinyin": "kě xī",
    "english": "Adjective: it is a pity, what a pity",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这么好的机会，放弃了真可惜。",
        "pinyin": "Zhème hǎo de jīhuì, fàngqì le zhēn kěxī.",
        "english": "It's truly a pity to give up such a good opportunity."
      }
    ]
  },
  {
    "hanzi": "科学",
    "pinyin": "kē xué",
    "english": "Noun: science Adjective: scientific",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "科学技术发展得很快。",
        "pinyin": "Kēxué jìshù fāzhǎn de hěn kuài.",
        "english": "Science and technology are developing quickly."
      }
    ]
  },
  {
    "hanzi": "肯定",
    "pinyin": "kěn dìng",
    "english": " Verb: to affirm, to confirm Adjective: certain, definite Adverb: certainly, definitely",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他肯定会来。",
        "pinyin": "Tā kěndìng huì lái.",
        "english": "He will definitely come."
      }
    ]
  },
  {
    "hanzi": "恐怕",
    "pinyin": "kǒng pà",
    "english": "Adverb: I'm afraid that",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "今天恐怕要下雨了。",
        "pinyin": "Jīntiān kǒngpà yào xià yǔ le.",
        "english": "I'm afraid it's going to rain today."
      }
    ]
  },
  {
    "hanzi": "空气",
    "pinyin": "kōng qì",
    "english": "Noun: air, atmosphere",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "空气很清新。",
        "pinyin": "Kōngqì hěn qīngxīn.",
        "english": "The air is fresh."
      }
    ]
  },
  {
    "hanzi": "苦",
    "pinyin": "kǔ",
    "english": "Adjective: bitter, miserable",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这药太苦了，我喝不下去。",
        "pinyin": "Zhè yào tài kǔ le, wǒ hē bù xiàqù.",
        "english": "This medicine is too bitter; I can't swallow it."
      }
    ]
  },
  {
    "hanzi": "宽",
    "pinyin": "kuān",
    "english": "Adjective: wide, broad",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这条路很宽，开车很方便。",
        "pinyin": "Zhè tiáo lù hěn kuān, kāichē hěn fāngbiàn.",
        "english": "This road is very wide, making driving convenient."
      }
    ]
  },
  {
    "hanzi": "困",
    "pinyin": "kùn",
    "english": "Adjective: sleepy, tired",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我昨天没睡好，现在很困。",
        "pinyin": "Wǒ zuótiān méi shuì hǎo, xiànzài hěn kùn.",
        "english": "I didn't sleep well yesterday, so I'm very sleepy now."
      }
    ]
  },
  {
    "hanzi": "困难",
    "pinyin": "kùn nan",
    "english": " Noun: difficulty, problem Adjective: difficult",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "即使遇到困难，我们也要坚持下去。",
        "pinyin": "Jíshǐ yù dào kùnnan, wǒmen yě yào jiānchí xiàqù.",
        "english": "Even if we encounter difficulties, we must persevere."
      }
    ]
  },
  {
    "hanzi": "辣",
    "pinyin": "là",
    "english": "Adjective: spicy",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个菜有点儿辣。",
        "pinyin": "Zhè ge cài yǒudiǎnr là.",
        "english": "This dish is a bit spicy."
      }
    ]
  },
  {
    "hanzi": "拉",
    "pinyin": "lā",
    "english": "Verb: to pull",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请你帮我拉一下门。",
        "pinyin": "Qǐng nǐ bāng wǒ lā yīxià mén.",
        "english": "Please help me pull the door."
      }
    ]
  },
  {
    "hanzi": "垃圾桶",
    "pinyin": "lā jī tǒng",
    "english": "Noun: rubbish bin",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请把垃圾扔进垃圾桶。",
        "pinyin": "Qǐng bǎ lājī rēng jìn lājītǒng.",
        "english": "Please throw the trash into the trash can."
      }
    ]
  },
  {
    "hanzi": "来不及",
    "pinyin": "lái bu jí",
    "english": "Verb: there's not enough time",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "现在走已经来不及了。",
        "pinyin": "Xiànzài zǒu yǐjīng lái bù jí le.",
        "english": "It is already too late to leave now."
      }
    ]
  },
  {
    "hanzi": "来得及",
    "pinyin": "lái de jí",
    "english": "Verb: there is still time to do sth.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "别担心，我们来得及赶上火车。",
        "pinyin": "Bié dānxīn, wǒmen lái de jí gǎnshàng huǒchē.",
        "english": "Don't worry, we have time to catch the train."
      }
    ]
  },
  {
    "hanzi": "懒",
    "pinyin": "lǎn",
    "english": "Adjective: lazy",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他今天很懒，不想工作。",
        "pinyin": "Tā jīntiān hěn lǎn, bù xiǎng gōngzuò.",
        "english": "He is very lazy today and doesn't want to work."
      }
    ]
  },
  {
    "hanzi": "浪费",
    "pinyin": "làng fèi",
    "english": "Verb: to waste",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "不要浪费食物。",
        "pinyin": "Bú yào làngfèi shíwù.",
        "english": "Don't waste food."
      }
    ]
  },
  {
    "hanzi": "浪漫",
    "pinyin": "làng màn",
    "english": "Adjective: romantic",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他喜欢看浪漫的电影。",
        "pinyin": "Tā xǐhuān kàn làngmàn de diànyǐng.",
        "english": "He likes watching romantic movies."
      }
    ]
  },
  {
    "hanzi": "老虎",
    "pinyin": "lǎo hǔ",
    "english": "Noun: tiger",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "老虎是一种凶猛的动物。",
        "pinyin": "Lǎohǔ shì yī zhǒng xiōngměng de dòngwù.",
        "english": "The tiger is a fierce animal."
      }
    ]
  },
  {
    "hanzi": "冷静",
    "pinyin": "lěng jìng",
    "english": "Adjective: calm, cool-headed, quite",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "遇到问题要保持冷静。",
        "pinyin": "Yù dào wèntí yào bǎochí lěngjìng.",
        "english": "You must stay calm when encountering problems."
      }
    ]
  },
  {
    "hanzi": "理发",
    "pinyin": "lǐ fà",
    "english": "Verb: to have a haircut",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我明天要去理发。",
        "pinyin": "Wǒ míngtiān yào qù lǐfà.",
        "english": "I am going to get a haircut tomorrow."
      }
    ]
  },
  {
    "hanzi": "厉害",
    "pinyin": "lì hai",
    "english": "Adjective: awesome, terrible, strict, severe, difficult to deal with",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你太厉害了，学习进步很快！",
        "pinyin": "Nǐ tài lìhai le, xuéxí jìnbù hěn kuài!",
        "english": "You are amazing, your study progress is very fast!"
      }
    ]
  },
  {
    "hanzi": "理解",
    "pinyin": "lǐ jiě",
    "english": " Noun: comprehension, understanding Verb: to comprehend, to understand",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我完全理解你的意思。",
        "pinyin": "Wǒ wánquán lǐjiě nǐ de yìsi.",
        "english": "I completely understand what you mean."
      }
    ]
  },
  {
    "hanzi": "礼貌",
    "pinyin": "lǐ mào",
    "english": "Noun: politeness, courtesy",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他说话很有礼貌。",
        "pinyin": "Tā shuōhuà hěn yǒu lǐmào.",
        "english": "He speaks very politely."
      }
    ]
  },
  {
    "hanzi": "力气",
    "pinyin": "lì qi",
    "english": "Noun: strength",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我没有力气搬这个箱子。",
        "pinyin": "Wǒ méi yǒu lìqi bān zhè ge xiāngzi.",
        "english": "I don't have the strength to move this box."
      }
    ]
  },
  {
    "hanzi": "例如",
    "pinyin": "lì rú",
    "english": "Adverb: for example",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我有很多爱好，例如跑步和游泳。",
        "pinyin": "Wǒ yǒu hěn duō àihào, lìrú pǎobù hé yóuyǒng.",
        "english": "I have many hobbies, for example, running and swimming."
      }
    ]
  },
  {
    "hanzi": "理想",
    "pinyin": "lǐ xiǎng",
    "english": "Noun: ideal, dream",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "成为医生是他的理想。",
        "pinyin": "Chéngwéi yīshēng shì tā de lǐxiǎng.",
        "english": "Becoming a doctor is his ideal."
      }
    ]
  },
  {
    "hanzi": "俩",
    "pinyin": "liǎ",
    "english": "Number: two people",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们俩是最好的朋友。",
        "pinyin": "Wǒmen liǎ shì zuì hǎo de péngyou.",
        "english": "The two of us are the best friends."
      }
    ]
  },
  {
    "hanzi": "连",
    "pinyin": "lián",
    "english": " Verb: to link, to join, to connect Adverb: even",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他连晚饭都没吃。",
        "pinyin": "Tā lián wǎnfàn dōu méi chī.",
        "english": "He didn't even eat dinner."
      }
    ]
  },
  {
    "hanzi": "联系",
    "pinyin": "lián xì",
    "english": " Noun: contact, connection Verb: to contact",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "如果你的有问题，请联系我。",
        "pinyin": "Rúguǒ nǐ de yǒu wèntí, qǐng liánxì wǒ.",
        "english": "If you have questions, please contact me."
      }
    ]
  },
  {
    "hanzi": "亮",
    "pinyin": "liàng",
    "english": " Verb: to shine, to show, to reveal Adjective: bright, clear, shiny",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "外面天亮了，该起床了。",
        "pinyin": "Wàimiàn tiān liàng le, gāi qǐchuáng le.",
        "english": "It's bright outside, time to get up."
      }
    ]
  },
  {
    "hanzi": "凉快",
    "pinyin": "liáng kuai",
    "english": "Adjective: pleasantly cool",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "夏天晚上这里很凉快。",
        "pinyin": "Xiàtiān wǎnshang zhèlǐ hěn liángkuai.",
        "english": "It is very cool here on summer evenings."
      }
    ]
  },
  {
    "hanzi": "另外",
    "pinyin": "lìng wài",
    "english": "Conjunction: in addition, morover, furthermore",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "另外，我们还需要买一些饮料。",
        "pinyin": "Lìngwài, wǒmen hái xūyào mǎi yī xiē yǐnliào.",
        "english": "In addition, we also need to buy some drinks."
      }
    ]
  },
  {
    "hanzi": "留",
    "pinyin": "liú",
    "english": "Verb: to keep, to remain, to stay, to leave a message, etc.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "谢谢你，请留下来吃饭吧。",
        "pinyin": "Xièxie nǐ, qǐng liú xiàlái chīfàn ba.",
        "english": "Thank you, please stay and eat."
      }
    ]
  },
  {
    "hanzi": "流泪",
    "pinyin": "liú lèi",
    "english": "Verb: to shed tears",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "感动得流泪。",
        "pinyin": "Gǎndòng de liú lèi.",
        "english": "Moved to tears."
      }
    ]
  },
  {
    "hanzi": "流利",
    "pinyin": "liú lì",
    "english": "Adjective: fluent",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她的中文说得很流利。",
        "pinyin": "Tā de Zhōngwén shuō de hěn liúlì.",
        "english": "Her Chinese is spoken very fluently."
      }
    ]
  },
  {
    "hanzi": "流行",
    "pinyin": "liú xíng",
    "english": " Verb: to spread Adjective: popular, fashionable",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这首歌最近非常流行。",
        "pinyin": "Zhè shǒu gē zuìjìn fēicháng liúxíng.",
        "english": "This song is very popular recently."
      }
    ]
  },
  {
    "hanzi": "律师",
    "pinyin": "lǜ shī",
    "english": "Noun: lawyer",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我想成为一名律师。",
        "pinyin": "Wǒ xiǎng chéngwéi yī míng lǜshī.",
        "english": "I want to become a lawyer."
      }
    ]
  },
  {
    "hanzi": "乱",
    "pinyin": "luàn",
    "english": " Noun: disorder Verb: to cause disorder Adjective: in a mess, confused",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "别把房间弄得这么乱。",
        "pinyin": "Bié bǎ fángjiān nòng de zhème luàn.",
        "english": "Don't make the room so messy."
      }
    ]
  },
  {
    "hanzi": "马虎",
    "pinyin": "mǎ hu",
    "english": "Adjective: careless, negligent, casual",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "做作业不要太马虎。",
        "pinyin": "Zuò zuòyè bù yào tài mǎhu.",
        "english": "Don't be too careless when doing homework."
      }
    ]
  },
  {
    "hanzi": "满",
    "pinyin": "mǎn",
    "english": " Verb: to fill, to satisfy Adjective: full, satisfied",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "杯子里的水是满的。",
        "pinyin": "Bēizi lǐ de shuǐ shì mǎn de.",
        "english": "The water in the cup is full."
      }
    ]
  },
  {
    "hanzi": "毛巾",
    "pinyin": "máo jīn",
    "english": "Noun: towel",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请给我一条干净的毛巾。",
        "pinyin": "Qǐng gěi wǒ yī tiáo gānjìng de máojīn.",
        "english": "Please give me a clean towel."
      }
    ]
  },
  {
    "hanzi": "美丽",
    "pinyin": "měi lì",
    "english": "Adjective: beautiful",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这里的风景非常美丽。",
        "pinyin": "Zhèlǐ de fēngjǐng fēicháng měilì.",
        "english": "The scenery here is very beautiful."
      }
    ]
  },
  {
    "hanzi": "梦",
    "pinyin": "mèng",
    "english": "Noun: dream",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我昨晚做了一个奇怪的梦。",
        "pinyin": "Wǒ zuówǎn zuòle yī gè qíguài de mèng.",
        "english": "I had a strange dream last night."
      }
    ]
  },
  {
    "hanzi": "密码",
    "pinyin": "mì mǎ",
    "english": "Noun: password",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请不要告诉别人你的密码。",
        "pinyin": "Qǐng bù yào gàosu biérén nǐ de mìmǎ.",
        "english": "Please do not tell others your password."
      }
    ]
  },
  {
    "hanzi": "免费",
    "pinyin": "miǎn fèi",
    "english": "Adjective: free of charge",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这次展览是免费参观的。",
        "pinyin": "Zhè cì zhǎnlǎn shì miǎnfèi cānguān de.",
        "english": "This exhibition is free to visit."
      }
    ]
  },
  {
    "hanzi": "民族",
    "pinyin": "mín zú",
    "english": "Noun: nationality, ethnic group",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "中国有五十六个民族。",
        "pinyin": "Zhōngguó yǒu wǔshíliù gè mínzú.",
        "english": "China has fifty-six ethnic groups."
      }
    ]
  },
  {
    "hanzi": "目的",
    "pinyin": "mù dì",
    "english": "Noun: purpose, aim",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你来这里的目的是什么？",
        "pinyin": "Nǐ lái zhèlǐ de mùdì shì shénme?",
        "english": "What is your purpose for coming here?"
      }
    ]
  },
  {
    "hanzi": "母亲",
    "pinyin": "mǔ qīn",
    "english": "Noun: mother",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "母亲节快乐。",
        "pinyin": "Mǔqīn jié kuàilè.",
        "english": "Happy Mother’s Day."
      }
    ]
  },
  {
    "hanzi": "耐心",
    "pinyin": "nài xīn",
    "english": "Noun: patience Adjective: patient",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "教孩子需要很大的耐心。",
        "pinyin": "Jiāo háizi xūyào hěn dà de nàixīn.",
        "english": "Teaching children requires great patience."
      }
    ]
  },
  {
    "hanzi": "难道",
    "pinyin": "nán dào",
    "english": "Adverb: don't tell me ..., is it possible that ...",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "难道你不想去旅行吗？",
        "pinyin": "Nándào nǐ bù xiǎng qù lǚxíng ma?",
        "english": "Don't tell me you don't want to travel?"
      }
    ]
  },
  {
    "hanzi": "难受",
    "pinyin": "nán shòu",
    "english": "Verb: to be difficult to bear",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我感觉肚子非常难受。",
        "pinyin": "Wǒ gǎnjué dùzi fēicháng nánshòu.",
        "english": "I feel very uncomfortable in my stomach."
      }
    ]
  },
  {
    "hanzi": "内",
    "pinyin": "nèi",
    "english": "Location: inside, inner",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请在五天内完成任务。",
        "pinyin": "Qǐng zài wǔ tiān nèi wánchéng rènwù.",
        "english": "Please complete the task within five days."
      }
    ]
  },
  {
    "hanzi": "能力",
    "pinyin": "néng lì",
    "english": "Noun: ability, capability",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他有很强的工作能力。",
        "pinyin": "Tā yǒu hěn qiáng de gōngzuò nénglì.",
        "english": "He has strong working ability."
      }
    ]
  },
  {
    "hanzi": "年龄",
    "pinyin": "nián líng",
    "english": "Noun: age of a person",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请问您的年龄是多大？",
        "pinyin": "Qǐng wèn nín de niánlíng shì duō dà?",
        "english": "May I ask what your age is?"
      }
    ]
  },
  {
    "hanzi": "弄",
    "pinyin": "nòng",
    "english": "Verb: to do, to make",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我不知道该怎么弄这个机器。",
        "pinyin": "Wǒ bù zhīdào gāi zěnme nòng zhège jīqì.",
        "english": "I don't know how to handle this machine."
      }
    ]
  },
  {
    "hanzi": "农村",
    "pinyin": "nóng cūn",
    "english": "Noun: village, rural area",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "很多年轻人离开了农村。",
        "pinyin": "Hěn duō niánqīngrén líkāile nóngcūn.",
        "english": "Many young people have left the countryside."
      }
    ]
  },
  {
    "hanzi": "暖和",
    "pinyin": "nuǎn huo",
    "english": "Adjective: warm",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "今天天气很暖和，适合出门。",
        "pinyin": "Jīntiān tiānqì hěn nuǎnhuo, shìhé chūmén.",
        "english": "The weather is warm today, suitable for going out."
      }
    ]
  },
  {
    "hanzi": "偶尔",
    "pinyin": "ǒu ěr",
    "english": "Adverb: occasionally",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我偶尔会去咖啡馆看书。",
        "pinyin": "Wǒ ǒu'ěr huì qù kāfēiguǎn kànshū.",
        "english": "I occasionally go to a café to read a book."
      }
    ]
  },
  {
    "hanzi": "排列",
    "pinyin": "pái liè",
    "english": " Noun: arrangement, permutation Verb: to arrange, to put in order",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请按顺序排列这些数字。",
        "pinyin": "Qǐng àn shùnxù páiliè zhèxiē shùzì.",
        "english": "Please arrange these numbers in order."
      }
    ]
  },
  {
    "hanzi": "判断",
    "pinyin": "pàn duàn",
    "english": "Noun: decision, judgement Verb: to decide, to judge",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们很难判断他是对是错。",
        "pinyin": "Wǒmen hěn nán pànduàn tā shì duì shì cuò.",
        "english": "It is hard for us to judge whether he is right or wrong."
      }
    ]
  },
  {
    "hanzi": "陪",
    "pinyin": "péi",
    "english": "Verb: to accompany",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我陪你一起去医院吧。",
        "pinyin": "Wǒ péi nǐ yīqǐ qù yīyuàn ba.",
        "english": "Let me accompany you to the hospital."
      }
    ]
  },
  {
    "hanzi": "皮肤",
    "pinyin": "pí fū",
    "english": "Noun: skin",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "夏天要注意保护皮肤。",
        "pinyin": "Xiàtiān yào zhùyì bǎohù pífū.",
        "english": "In summer, you must pay attention to protecting your skin."
      }
    ]
  },
  {
    "hanzi": "批评",
    "pinyin": "pī píng",
    "english": "Noun: criticism Verb: to criticize",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "老师批评了他上课迟到。",
        "pinyin": "Lǎoshī pīpíngle tā shàngkè chídào.",
        "english": "The teacher criticized him for being late for class."
      }
    ]
  },
  {
    "hanzi": "脾气",
    "pinyin": "pí qi",
    "english": "Noun: temperament, temper",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他脾气很好，很少生气。",
        "pinyin": "Tā píqi hěn hǎo, hěn shǎo shēngqì.",
        "english": "He has a very good temper and rarely gets angry."
      }
    ]
  },
  {
    "hanzi": "骗",
    "pinyin": "piàn",
    "english": "Verb: to cheat, to swindle",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他从来不骗人，很诚实。",
        "pinyin": "Tā cónglái bù piàn rén, hěn chéngshí.",
        "english": "He never lies to people; he is very honest."
      }
    ]
  },
  {
    "hanzi": "篇",
    "pinyin": "piān",
    "english": "Measure Word: for chapters, articles, etc.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这篇文章有三篇那么长。",
        "pinyin": "Zhè piān wénzhāng yǒu sān piān nàme cháng.",
        "english": "This article is as long as three chapters/pieces."
      }
    ]
  },
  {
    "hanzi": "乒乓球",
    "pinyin": "pīng pāng qiú",
    "english": "Noun: table tennis",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "打乒乓球需要很快的反应。",
        "pinyin": "Dǎ pīngpāngqiú xūyào hěn kuài de fǎnyìng.",
        "english": "Playing ping pong requires a very quick reaction."
      }
    ]
  },
  {
    "hanzi": "平时",
    "pinyin": "píng shí",
    "english": "Noun: in peacetime Adverb: normally",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我平时喜欢在家里看书。",
        "pinyin": "Wǒ píngshí xǐhuān zài jiālǐ kànshū.",
        "english": "I usually like reading books at home."
      }
    ]
  },
  {
    "hanzi": "瓶子",
    "pinyin": "píng zi",
    "english": "Noun: bottle",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个瓶子是空的，里面没有水。",
        "pinyin": "Zhège píngzi shì kōng de, lǐmiàn méiyǒu shuǐ.",
        "english": "This bottle is empty; there is no water inside."
      }
    ]
  },
  {
    "hanzi": "破",
    "pinyin": "pò",
    "english": " Verb: to break, to destroy Adjective: broken, damaged",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "不小心把裤子弄破了。",
        "pinyin": "Bù xiǎoxīn bǎ kùzi nòng pòle.",
        "english": "I accidentally ripped my pants."
      }
    ]
  },
  {
    "hanzi": "普遍",
    "pinyin": "pǔ biàn",
    "english": "Adjective: universal, general",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "手机支付现在很普遍。",
        "pinyin": "Shǒujī zhīfù xiànzài hěn pǔbiàn.",
        "english": "Mobile payment is very common now."
      }
    ]
  },
  {
    "hanzi": "其次",
    "pinyin": "qí cì",
    "english": " Adverb: next, secondary Conjunction: secondly",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "首先是质量，其次是价格。",
        "pinyin": "Shǒuxiān shì zhìliàng, qícì shì jiàgé.",
        "english": "First is quality, secondly is price."
      }
    ]
  },
  {
    "hanzi": "气候",
    "pinyin": "qì hòu",
    "english": "Noun: climate, atmosphere",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个地区气候温暖湿润。",
        "pinyin": "Zhège dìqū qìhòu wēnnuǎn shīrùn.",
        "english": "The climate in this region is warm and humid."
      }
    ]
  },
  {
    "hanzi": "起来",
    "pinyin": "qǐ lái",
    "english": "Verb: to stand up, to get up",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "天亮了，快点起来吧！",
        "pinyin": "Tiān liàngle, kuài diǎn qǐlái ba!",
        "english": "It's dawn, hurry up and get up!"
      }
    ]
  },
  {
    "hanzi": "其中",
    "pinyin": "qí zhōng",
    "english": "Adverb: among, in",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这里有很多水果，其中我最爱吃草莓。",
        "pinyin": "Zhèlǐ yǒu hěn duō shuǐguǒ, qízhōng wǒ zuì ài chī cǎoméi.",
        "english": "There are many fruits here, among which I love strawberries the most."
      }
    ]
  },
  {
    "hanzi": "千万",
    "pinyin": "qiān wàn",
    "english": " Number: 10 million Adjective: countless, many Adverb: must, be sure to",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你千万要记住这个地址。",
        "pinyin": "Nǐ qiānwàn yào jìzhù zhège dìzhǐ.",
        "english": "You absolutely must remember this address."
      }
    ]
  },
  {
    "hanzi": "签证",
    "pinyin": "qiān zhèng",
    "english": "Noun: visa",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "申请签证需要准备很多材料。",
        "pinyin": "Shēnqǐng qiānzhèng xūyào zhǔnbèi hěn duō cáiliào.",
        "english": "Applying for a visa requires preparing many documents."
      }
    ]
  },
  {
    "hanzi": "墙",
    "pinyin": "qiáng",
    "english": "Noun: wall",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请不要在墙上乱涂乱画。",
        "pinyin": "Qǐng bù yào zài qiáng shàng luàn tú luàn huà.",
        "english": "Please don't draw graffiti on the wall."
      }
    ]
  },
  {
    "hanzi": "桥",
    "pinyin": "qiáo",
    "english": "Noun: bridge",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "那座桥很长，连接着两岸。",
        "pinyin": "Nà zuò qiáo hěn cháng, liánjiēzhe liǎng'àn.",
        "english": "That bridge is very long, connecting the two banks."
      }
    ]
  },
  {
    "hanzi": "敲",
    "pinyin": "qiāo",
    "english": "Verb: to knock",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我听到有人在敲门。",
        "pinyin": "Wǒ tīngdào yǒu rén zài qiāo mén.",
        "english": "I heard someone knocking on the door."
      }
    ]
  },
  {
    "hanzi": "巧克力",
    "pinyin": "qiǎo kè lì",
    "english": "Noun: chocolate",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "小朋友们都喜欢吃巧克力。",
        "pinyin": "Xiǎopéngyǒumen dōu xǐhuān chī qiǎokèlì.",
        "english": "Children all like eating chocolate."
      }
    ]
  },
  {
    "hanzi": "亲戚",
    "pinyin": "qīn qi",
    "english": "Noun: relatives",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "春节期间，我们要去拜访亲戚。",
        "pinyin": "Chūnjié qíjiān, wǒmen yào qù bàifǎng qīnqi.",
        "english": "During the Spring Festival, we are going to visit relatives."
      }
    ]
  },
  {
    "hanzi": "轻",
    "pinyin": "qīng",
    "english": "Adjective: light, small in number, unimportant",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个包裹很轻，你可以自己拿。",
        "pinyin": "Zhège bāoguǒ hěn qīng, nǐ kěyǐ zìjǐ ná.",
        "english": "This package is very light, you can carry it yourself."
      }
    ]
  },
  {
    "hanzi": "请假",
    "pinyin": "qǐng jià",
    "english": "Verb: to ask for leave",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我今天身体不舒服，需要请假。",
        "pinyin": "Wǒ jīntiān shēntǐ bù shūfu, xūyào qǐngjià.",
        "english": "I don't feel well today, I need to ask for leave."
      }
    ]
  },
  {
    "hanzi": "请客",
    "pinyin": "qǐng kè",
    "english": "Verb: to invite sb. for dinner",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "今天我来请客，大家随便点。",
        "pinyin": "Jīntiān wǒ lái qǐngkè, dàjiā suíbiàn diǎn.",
        "english": "I'll treat today; everyone order whatever you like."
      }
    ]
  },
  {
    "hanzi": "情况",
    "pinyin": "qíng kuàng",
    "english": "Noun: circumstance, situation",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你了解目前的情况吗？",
        "pinyin": "Nǐ liǎojiě mùqián de qíngkuàng ma?",
        "english": "Do you understand the current situation?"
      }
    ]
  },
  {
    "hanzi": "轻松",
    "pinyin": "qīng sōng",
    "english": "Adjective: relaxed, easy",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我喜欢周末轻松地待在家里。",
        "pinyin": "Wǒ xǐhuān zhōumò qīngsōng de dāi zài jiālǐ.",
        "english": "I like to stay relaxed at home on the weekend."
      }
    ]
  },
  {
    "hanzi": "穷",
    "pinyin": "qióng",
    "english": "Adjective: poor",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "即使很穷，他也很乐观。",
        "pinyin": "Jíshǐ hěn qióng, tā yě hěn lèguān.",
        "english": "Even though he is very poor, he is still optimistic."
      }
    ]
  },
  {
    "hanzi": "取",
    "pinyin": "qǔ",
    "english": "Verb: to take, to get",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请你去快递站取一下包裹。",
        "pinyin": "Qǐng nǐ qù kuàidì zhàn qǔ yīxià bāoguǒ.",
        "english": "Please go to the courier station and pick up the package."
      }
    ]
  },
  {
    "hanzi": "区别",
    "pinyin": "qū bié",
    "english": "Noun: difference Verb: to distinguish",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这两种手机有什么区别？",
        "pinyin": "Zhè liǎng zhǒng shǒujī yǒu shénme qūbié?",
        "english": "What is the difference between these two kinds of cell phones?"
      }
    ]
  },
  {
    "hanzi": "全部",
    "pinyin": "quán bù",
    "english": "Adjective: whole, entire, complete",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我已经看完了书的全部内容。",
        "pinyin": "Wǒ yǐjīng kàn wánle shū de quánbù nèiróng.",
        "english": "I have already finished reading the entire content of the book."
      }
    ]
  },
  {
    "hanzi": "却",
    "pinyin": "què",
    "english": "Conjunction: but, yet",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他想帮忙，却不知道该怎么做。",
        "pinyin": "Tā xiǎng bāngmáng, què bù zhīdào gāi zěnme zuò.",
        "english": "He wanted to help, but he didn't know how to do it."
      }
    ]
  },
  {
    "hanzi": "缺点",
    "pinyin": "quē diǎn",
    "english": "Noun: weakness, shortcoming",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "每个人都有优点和缺点。",
        "pinyin": "Měi gèrén dōu yǒu yōudiǎn hé quēdiǎn.",
        "english": "Everyone has strengths and weaknesses."
      }
    ]
  },
  {
    "hanzi": "缺少",
    "pinyin": "quē shǎo",
    "english": " Noun: lack, shortage Verb: to lack, to be short of",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们现在缺少人手来完成这个项目。",
        "pinyin": "Wǒmen xiànzài quēshǎo rénshǒu lái wánchéng zhège xiàngmù.",
        "english": "We currently lack manpower to complete this project."
      }
    ]
  },
  {
    "hanzi": "确实",
    "pinyin": "què shí",
    "english": " Adjective: indeed, really Adverb: for sure, indeed",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这件事确实很奇怪，值得调查。",
        "pinyin": "Zhè jiàn shì quèshí hěn qíguài, zhídé diàochá.",
        "english": "This matter is indeed strange and worthy of investigation."
      }
    ]
  },
  {
    "hanzi": "然而",
    "pinyin": "rán ér",
    "english": "Conjunction: however, but",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他努力学习，然而成绩进步不大。",
        "pinyin": "Tā nǔlì xuéxí, rán'ér chéngjì jìnbù bù dà.",
        "english": "He studied hard; however, his grades didn't improve much."
      }
    ]
  },
  {
    "hanzi": "热闹",
    "pinyin": "rè nao",
    "english": "Adjective: lively, busy",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "节日期间，商场里非常热闹。",
        "pinyin": "Jiérì qíjiān, shāngchǎng lǐ fēicháng rènao.",
        "english": "During the festival, the shopping mall is very lively."
      }
    ]
  },
  {
    "hanzi": "任何",
    "pinyin": "rèn hé",
    "english": "Adjective: any, whichever, whatever",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "遇到任何问题都可以问我。",
        "pinyin": "Yù dào rènhé wèntí dōu kěyǐ wèn wǒ.",
        "english": "If you encounter any problems, you can ask me."
      }
    ]
  },
  {
    "hanzi": "任务",
    "pinyin": "rèn wu",
    "english": "Noun: mission, task",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们必须在周五前完成这项任务。",
        "pinyin": "Wǒmen bìxū zài Zhōuwǔ qián wánchéng zhè xiàng rènwu.",
        "english": "We must complete this task before Friday."
      }
    ]
  },
  {
    "hanzi": "扔",
    "pinyin": "rēng",
    "english": "Verb: to throw away",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请不要把垃圾随便扔在地上。",
        "pinyin": "Qǐng bùyào bǎ lājī suíbiàn rēng zài dìshàng.",
        "english": "Please do not throw trash randomly on the ground."
      }
    ]
  },
  {
    "hanzi": "仍然",
    "pinyin": "réng rán",
    "english": "Adverb: still, yet",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "虽然雨停了，天气仍然很冷。",
        "pinyin": "Suīrán yǔ tíngle, tiānqì réngrán hěn lěng.",
        "english": "Although the rain stopped, the weather is still very cold."
      }
    ]
  },
  {
    "hanzi": "日记",
    "pinyin": "rì jì",
    "english": "Noun: diary",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她每天晚上都有写日记的习惯。",
        "pinyin": "Tā měitiān wǎnshang dōu yǒu xiě rìjì de xíguàn.",
        "english": "She has the habit of writing a diary every night."
      }
    ]
  },
  {
    "hanzi": "入口",
    "pinyin": "rù kǒu",
    "english": "Noun: entrance",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "地铁入口就在前面，很容易找到。",
        "pinyin": "Dìtiě rùkǒu jiù zài qiánmian, hěn róngyì zhǎodào.",
        "english": "The subway entrance is right ahead, easy to find."
      }
    ]
  },
  {
    "hanzi": "软",
    "pinyin": "ruǎn",
    "english": "Adjective: soft",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这张床垫太软了，睡得不舒服。",
        "pinyin": "Zhè zhāng chuángdiàn tài ruǎn le, shuì de bù shūfu.",
        "english": "This mattress is too soft; it's uncomfortable to sleep on."
      }
    ]
  },
  {
    "hanzi": "散步",
    "pinyin": "sàn bù",
    "english": "Verb: to take/to go for a walk",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "吃完晚饭，我们喜欢出去散步。",
        "pinyin": "Chī wán wǎnfàn, wǒmen xǐhuan chūqù sànbù.",
        "english": "After dinner, we like to go out for a walk."
      }
    ]
  },
  {
    "hanzi": "森林",
    "pinyin": "sēn lín",
    "english": "Noun: forest",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这片森林里生活着许多动物。",
        "pinyin": "Zhè piàn sānlín lǐ shēnghuózhe xǔduō dòngwù.",
        "english": "Many animals live in this forest."
      }
    ]
  },
  {
    "hanzi": "沙发",
    "pinyin": "shā fā",
    "english": "Noun: sofa",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "那个新的红色沙发很舒服。",
        "pinyin": "Nàge xīn de hóngsè shāfā hěn shūfu.",
        "english": "That new red sofa is very comfortable."
      }
    ]
  },
  {
    "hanzi": "商量",
    "pinyin": "shāng liang",
    "english": "Verb: to consult, to discuss",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "遇到困难时，我们应该一起商量解决办法。",
        "pinyin": "Yù dào kùnnan shí, wǒmen yīnggāi yīqǐ shāngliang jiějué bànfǎ.",
        "english": "When encountering difficulties, we should discuss solutions together."
      }
    ]
  },
  {
    "hanzi": "伤心",
    "pinyin": "shāng xīn",
    "english": "Adjective: sad, grievous, brokenhearted",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "听到这个坏消息，她感到很伤心。",
        "pinyin": "Tīng dào zhège huài xiāoxi, tā gǎndào hěn shāngxīn.",
        "english": "Hearing the bad news, she felt very sad."
      }
    ]
  },
  {
    "hanzi": "稍微",
    "pinyin": "shāo wēi",
    "english": "Adverb: a little bit",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请你稍微等一下，我马上回来。",
        "pinyin": "Qǐng nǐ shāowēi děng yīxià, wǒ mǎshàng huílái.",
        "english": "Please wait a moment (slightly), I will be right back."
      }
    ]
  },
  {
    "hanzi": "社会",
    "pinyin": "shè huì",
    "english": "Noun: society",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们必须适应现代社会。",
        "pinyin": "Wǒmen bìxū shìyìng xiàndài shèhuì.",
        "english": "We must adapt to modern society."
      }
    ]
  },
  {
    "hanzi": "深",
    "pinyin": "shēn",
    "english": "Adjective: deep, dark color, etc.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这里的海水非常深。",
        "pinyin": "Zhèlǐ de hǎishuǐ fēicháng shēn.",
        "english": "The sea water here is very deep."
      }
    ]
  },
  {
    "hanzi": "申请",
    "pinyin": "shēn qǐng",
    "english": "Noun: application Verb: to apply for",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我已经向学校提交了申请。",
        "pinyin": "Wǒ yǐjīng xiàng xuéxiào tíjiāo le shēnqǐng.",
        "english": "I have already submitted the application to the school."
      }
    ]
  },
  {
    "hanzi": "甚至",
    "pinyin": "shèn zhì",
    "english": "Adverb: even",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他工作太忙了，甚至忘了吃饭。",
        "pinyin": "Tā gōngzuò tài máng le, shènzhì wàng le chī fàn.",
        "english": "He was too busy working, he even forgot to eat."
      }
    ]
  },
  {
    "hanzi": "剩",
    "pinyin": "shèng",
    "english": "Verb: to remain",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "盘子里还剩一些菜。",
        "pinyin": "Pánzi lǐ hái shèng yīxiē cài.",
        "english": "There are still some dishes left on the plate."
      }
    ]
  },
  {
    "hanzi": "省",
    "pinyin": "shěng",
    "english": " Noun: province Verb: to save, to omit",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他总是想办法省钱。",
        "pinyin": "Tā zǒng shì xiǎng bànfǎ shěng qián.",
        "english": "He always tries to find a way to save money."
      }
    ]
  },
  {
    "hanzi": "生活",
    "pinyin": "shēng huó",
    "english": "Noun: life Verb: to live",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我喜欢在农村生活。",
        "pinyin": "Wǒ xǐhuān zài nóngcūn shēnghuó.",
        "english": "I like living in the countryside."
      }
    ]
  },
  {
    "hanzi": "生命",
    "pinyin": "shēng mìng",
    "english": "Noun: life",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "保护生命是最重要的。",
        "pinyin": "Bǎohù shēngmìng shì zuì zhòngyào de.",
        "english": "Protecting life is the most important thing."
      }
    ]
  },
  {
    "hanzi": "失败",
    "pinyin": "shī bài",
    "english": " Noun: defeat, failure Verb: to lose, to be defeated",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "一次失败不代表永远失败。",
        "pinyin": "Yīcì shībài bù dàibiǎo yǒngyuǎn shībài.",
        "english": "One failure doesn't mean eternal failure."
      }
    ]
  },
  {
    "hanzi": "十分",
    "pinyin": "shí fēn",
    "english": "Adverb: very, completely, fully, utterly, absolutely",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我今天感觉十分疲惫。",
        "pinyin": "Wǒ jīntiān gǎnjué shífēn píyǎn.",
        "english": "I feel extremely tired today."
      }
    ]
  },
  {
    "hanzi": "师傅",
    "pinyin": "shī fu",
    "english": "Noun: master, teacher, used to respectfully address older men",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "师傅，麻烦帮我修一下电脑。",
        "pinyin": "Shīfu, máfan bāng wǒ xiū yīxià diànnǎo.",
        "english": "Master (Sir), please help me fix the computer."
      }
    ]
  },
  {
    "hanzi": "实际",
    "pinyin": "shí jì",
    "english": " Noun: reality, practice Adjective: realistic, practical",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们应该从实际出发考虑问题。",
        "pinyin": "Wǒmen yīnggāi cóng shíjì chūfā kǎolǜ wèntí.",
        "english": "We should consider issues starting from reality (a practical standpoint)."
      }
    ]
  },
  {
    "hanzi": "世纪",
    "pinyin": "shì jì",
    "english": "Noun: century",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们现在生活在二十一世纪。",
        "pinyin": "Wǒmen xiànzài shēnghuó zài èrshíyī shìjì.",
        "english": "We currently live in the 21st century."
      }
    ]
  },
  {
    "hanzi": "湿润",
    "pinyin": "shī rùn",
    "english": "Adjective: moist, humid",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "雨后的空气很湿润。",
        "pinyin": "Yǔ hòu de kōngqì hěn shīrùn.",
        "english": "The air after the rain is very moist."
      }
    ]
  },
  {
    "hanzi": "失望",
    "pinyin": "shī wàng",
    "english": "Noun: disappointment Verb: to lose hope Adjective: disappointed",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我对他的表现感到非常失望。",
        "pinyin": "Wǒ duì tā de biǎoxiàn gǎndào fēicháng shīwàng.",
        "english": "I feel very disappointed with his performance."
      }
    ]
  },
  {
    "hanzi": "适应",
    "pinyin": "shì yìng",
    "english": "Verb: to fit, to suit, to adabt",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你需要时间来适应新的环境。",
        "pinyin": "Nǐ xūyào shíjiān lái shìyìng xīn de huánjìng.",
        "english": "You need time to adapt to the new environment."
      }
    ]
  },
  {
    "hanzi": "使用",
    "pinyin": "shǐ yòng",
    "english": "Verb: to use",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请阅读说明书后再使用机器。",
        "pinyin": "Qǐng yuèdú shuōmíngshū hòu zài shǐyòng jīqì.",
        "english": "Please read the instructions before using the machine."
      }
    ]
  },
  {
    "hanzi": "实在",
    "pinyin": "shí zài",
    "english": " Adjective: real, true Adverb: really, in fact",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个价格实在太贵了。",
        "pinyin": "Zhè ge jiàgé shízài tài guì le.",
        "english": "This price is really too expensive."
      }
    ]
  },
  {
    "hanzi": "狮子",
    "pinyin": "shī zi",
    "english": "Noun: lion",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "狮子是很有力量的动物。",
        "pinyin": "Shīzi shì hěn yǒu lìliàng de dòngwù.",
        "english": "Lions are very powerful animals."
      }
    ]
  },
  {
    "hanzi": "收",
    "pinyin": "shōu",
    "english": "Verb: to accept, to receive",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你收到我的包裹了吗？",
        "pinyin": "Nǐ shōu dào wǒ de bāoguǒ le ma?",
        "english": "Did you receive my package?"
      }
    ]
  },
  {
    "hanzi": "受不了",
    "pinyin": "shòu bù liǎo",
    "english": "Adjective: unbearable",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我受不了这么热的天气。",
        "pinyin": "Wǒ shòu bù liǎo zhème rè de tiānqì.",
        "english": "I can't stand such hot weather."
      }
    ]
  },
  {
    "hanzi": "受到",
    "pinyin": "shòu dào",
    "english": "Verb: to receive, to suffer",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他受到了大家的欢迎。",
        "pinyin": "Tā shòudào le dàjiā de huānyíng.",
        "english": "He received everyone's welcome."
      }
    ]
  },
  {
    "hanzi": "首都",
    "pinyin": "shǒu dū",
    "english": "Noun: capital city",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "北京是中国的首都。",
        "pinyin": "Běijīng shì Zhōngguó de shǒudū.",
        "english": "Beijing is the capital of China."
      }
    ]
  },
  {
    "hanzi": "售货员",
    "pinyin": "shòu huò yuán",
    "english": "Noun: salesperson",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "那个售货员服务态度很好。",
        "pinyin": "Nàge shòuhuòyuán fúwù tàidù hěn hǎo.",
        "english": "That salesclerk has a very good service attitude."
      }
    ]
  },
  {
    "hanzi": "收入",
    "pinyin": "shōu rù",
    "english": " Noun: income, revenue Verb: to take in",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她的收入比我高得多。",
        "pinyin": "Tā de shōurù bǐ wǒ gāo de duō.",
        "english": "Her income is much higher than mine."
      }
    ]
  },
  {
    "hanzi": "收拾",
    "pinyin": "shōu shi",
    "english": "Verb: to put in order, to tidy up, to punish",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你什么时候能把房间收拾干净？",
        "pinyin": "Nǐ shénme shíhou néng bǎ fángjiān shōushi gānjìng?",
        "english": "When can you tidy up the room?"
      }
    ]
  },
  {
    "hanzi": "首先",
    "pinyin": "shǒu xiān",
    "english": "Adverb: first of all",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们首先要确定目标。",
        "pinyin": "Wǒmen shǒuxiān yào quèdìng mùbiāo.",
        "english": "We must first determine the goal."
      }
    ]
  },
  {
    "hanzi": "输",
    "pinyin": "shū",
    "english": "Verb: to transport, to lose, to be beaten",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "比赛结果我们输了。",
        "pinyin": "Bǐsài jiéguǒ wǒmen shū le.",
        "english": "We lost the game result."
      }
    ]
  },
  {
    "hanzi": "数量",
    "pinyin": "shù liàng",
    "english": "Noun: amount, quantity",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "产品的数量足够吗？",
        "pinyin": "Chǎnpǐn de shùliàng zúgòu ma?",
        "english": "Is the quantity of the product sufficient?"
      }
    ]
  },
  {
    "hanzi": "熟悉",
    "pinyin": "shú xī",
    "english": "Verb: to be familiar with",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我对我家附近的街道很熟悉。",
        "pinyin": "Wǒ duì wǒ jiā fùjìn de jiēdào hěn shúxī.",
        "english": "I am very familiar with the streets near my home."
      }
    ]
  },
  {
    "hanzi": "数字",
    "pinyin": "shù zì",
    "english": "Noun: figure, number",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请你写下你的电话数字。",
        "pinyin": "Qǐng nǐ xiě xià nǐ de diànhuà shùzì.",
        "english": "Please write down your phone number (digits)."
      }
    ]
  },
  {
    "hanzi": "帅",
    "pinyin": "shuài",
    "english": "Adjective: handsome, smart for men",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "那个男孩子长得很帅。",
        "pinyin": "Nàge nán háizi zhǎng de hěn shuài.",
        "english": "That boy looks very handsome."
      }
    ]
  },
  {
    "hanzi": "顺便",
    "pinyin": "shùn biàn",
    "english": "Adverb: on the way, in passing by",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我路过时顺便买点菜。",
        "pinyin": "Wǒ lùguò shí shùnbiàn mǎi diǎn cài.",
        "english": "When I pass by, I'll conveniently buy some groceries."
      }
    ]
  },
  {
    "hanzi": "顺利",
    "pinyin": "shùn lì",
    "english": "Adjective: smoothly",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "祝你工作一切顺利。",
        "pinyin": "Zhù nǐ gōngzuò yīqiè shùnlì.",
        "english": "I wish you all the best (everything smooth) in your work."
      }
    ]
  },
  {
    "hanzi": "顺序",
    "pinyin": "shùn xù",
    "english": "Noun: sequence, order",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请按照顺序排队等候。",
        "pinyin": "Qǐng ànzhào shùnxù páiduì děnghòu.",
        "english": "Please line up and wait according to the sequence."
      }
    ]
  },
  {
    "hanzi": "说明",
    "pinyin": "shuō míng",
    "english": "Noun: explanation, illustration Verb: to explain, to illustrate",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他详细地说明了原因。",
        "pinyin": "Tā xiángxì de shuōmíng le yuányīn.",
        "english": "He explained the reason in detail."
      }
    ]
  },
  {
    "hanzi": "硕士",
    "pinyin": "shuò shì",
    "english": "Noun: master's degree",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他现在正在读硕士学位。",
        "pinyin": "Tā xiànzài zhèngzài dú shuòshì xuéwèi.",
        "english": "He is currently studying for a Master's degree."
      }
    ]
  },
  {
    "hanzi": "死",
    "pinyin": "sǐ",
    "english": "Noun: death Verb: to die Adjective: dead",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "鱼离开了水就会死。",
        "pinyin": "Yú líkāi le shuǐ jiù huì sǐ.",
        "english": "Fish will die if they leave the water."
      }
    ]
  },
  {
    "hanzi": "速度",
    "pinyin": "sù dù",
    "english": "Noun: speed",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请你把车速放慢一点。",
        "pinyin": "Qǐng nǐ bǎ chēsù fàng màn yīdiǎn.",
        "english": "Please slow down your car speed a bit."
      }
    ]
  },
  {
    "hanzi": "塑料袋",
    "pinyin": "sù liào dài",
    "english": "Noun: plastic bag",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请少用一次性塑料袋。",
        "pinyin": "Qǐng shǎo yòng yīcìxìng sùliào dài.",
        "english": "Please use disposable plastic bags less often."
      }
    ]
  },
  {
    "hanzi": "酸",
    "pinyin": "suān",
    "english": "Adjective: sour",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这种水果吃起来很酸。",
        "pinyin": "Zhè zhǒng shuǐguǒ chī qǐlái hěn suān.",
        "english": "This kind of fruit tastes very sour."
      }
    ]
  },
  {
    "hanzi": "随便",
    "pinyin": "suí biàn",
    "english": "Adjective: random Adverb: as one wishes",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你随便坐，不用客气。",
        "pinyin": "Nǐ suíbiàn zuò, bú yòng kèqi.",
        "english": "Sit wherever you like, don't be polite."
      }
    ]
  },
  {
    "hanzi": "随着",
    "pinyin": "suí zhe",
    "english": "Relative Clause: along with, in the wake of",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "随着时间，一切都会改变。",
        "pinyin": "Suízhe shíjiān, yīqiè dōu huì gǎibiàn.",
        "english": "Along with time, everything will change."
      }
    ]
  },
  {
    "hanzi": "所有",
    "pinyin": "suǒ yǒu",
    "english": " Verb: to possess, to own Adjective: all",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我喜欢他所有的作品。",
        "pinyin": "Wǒ xǐhuān tā suǒyǒu de zuòpǐn.",
        "english": "I like all of his works."
      }
    ]
  },
  {
    "hanzi": "抬",
    "pinyin": "tái",
    "english": "Verb: to lift up, to raise, to carry",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请帮我把箱子抬起来。",
        "pinyin": "Qǐng bāng wǒ bǎ xiāngzi tái qǐlái.",
        "english": "Please help me lift the box up."
      }
    ]
  },
  {
    "hanzi": "趟",
    "pinyin": "tàng",
    "english": "Measure Word: for number of trips or runs made",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我周末去了北京一趟。",
        "pinyin": "Wǒ zhōumò qù le Běijīng yī tàng.",
        "english": "I went to Beijing this past weekend (one trip)."
      }
    ]
  },
  {
    "hanzi": "讨论",
    "pinyin": "tǎo lùn",
    "english": "Noun: discussion Verb: to discuss",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个问题值得我们讨论。",
        "pinyin": "Zhè ge wèntí zhídé wǒmen tǎolùn.",
        "english": "This issue is worth discussing."
      }
    ]
  },
  {
    "hanzi": "讨厌",
    "pinyin": "tǎo yàn",
    "english": " Verb: to hate Adjective: disgusting, nasty",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我讨厌下雨天出门。",
        "pinyin": "Wǒ tǎoyàn xià yǔ tiān chū mén.",
        "english": "I dislike going out on rainy days."
      }
    ]
  },
  {
    "hanzi": "特点",
    "pinyin": "tè diǎn",
    "english": "Noun: characteristic feature",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这种手机有什么特点？",
        "pinyin": "Zhè zhǒng shǒujī yǒu shénme tèdiǎn?",
        "english": "What are the characteristics of this type of mobile phone?"
      }
    ]
  },
  {
    "hanzi": "提供",
    "pinyin": "tí gōng",
    "english": "Verb: to offer, to supply, to provide",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们可以提供免费午餐。",
        "pinyin": "Wǒmen kěyǐ tígōng miǎnfèi wǔcān.",
        "english": "We can provide free lunch."
      }
    ]
  },
  {
    "hanzi": "提前",
    "pinyin": "tí qián",
    "english": "Verb: to bring forward Adjective: early Adverb: beforehand",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "会议提前了十分钟。",
        "pinyin": "Huìyì tíqián le shí fēnzhōng.",
        "english": "The meeting was moved up ten minutes."
      }
    ]
  },
  {
    "hanzi": "提醒",
    "pinyin": "tí xǐng",
    "english": "Verb: to remind, to call attention to",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请提醒我明天要开会。",
        "pinyin": "Qǐng tíxǐng wǒ míngtiān yào kāihuì.",
        "english": "Please remind me that we have a meeting tomorrow."
      }
    ]
  },
  {
    "hanzi": "填空",
    "pinyin": "tián kòng",
    "english": "Verb: to fill in questionnaire, etc.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这道题是让你做填空。",
        "pinyin": "Zhè dào tí shì ràng nǐ zuò tiánkòng.",
        "english": "This question asks you to do a fill-in-the-blank exercise."
      }
    ]
  },
  {
    "hanzi": "条件",
    "pinyin": "tiáo jiàn",
    "english": "Noun: condition, circumstances",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我接受这个条件。",
        "pinyin": "Wǒ jiēshòu zhè ge tiáojiàn.",
        "english": "I accept this condition."
      }
    ]
  },
  {
    "hanzi": "挺",
    "pinyin": "tǐng",
    "english": " Verb: to stick out, to stand straight Adverb: quite, very, rather Measure Word: for machine guns",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这件衣服挺好看的。",
        "pinyin": "Zhè jiàn yīfu tǐng hǎokàn de.",
        "english": "This piece of clothing is quite good-looking."
      }
    ]
  },
  {
    "hanzi": "通过",
    "pinyin": "tōng guò",
    "english": " Verb: to pass through, to get through Relative Clause: via, by",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们通过了考试。",
        "pinyin": "Wǒmen tōngguò le kǎoshì.",
        "english": "We passed the exam."
      }
    ]
  },
  {
    "hanzi": "同情",
    "pinyin": "tóng qíng",
    "english": " Noun: sympathy, compassion Verb: to sympathize",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我很同情他的遭遇。",
        "pinyin": "Wǒ hěn tóngqíng tā de zāoyù.",
        "english": "I sympathize deeply with what he has gone through."
      }
    ]
  },
  {
    "hanzi": "通知",
    "pinyin": "tōng zhī",
    "english": "Noun: notice Verb: to notify, to inform",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我会通知你结果的。",
        "pinyin": "Wǒ huì tōngzhī nǐ jiéguǒ de.",
        "english": "I will inform you of the result."
      }
    ]
  },
  {
    "hanzi": "推",
    "pinyin": "tuī",
    "english": "Verb: to push",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "门锁了，你得推开它。",
        "pinyin": "Mén suǒ le, nǐ děi tuī kāi tā.",
        "english": "The door is locked, you have to push it open."
      }
    ]
  },
  {
    "hanzi": "推迟",
    "pinyin": "tuī chí",
    "english": "Verb: to postpone, to defer",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "比赛因为下雨推迟了。",
        "pinyin": "Bǐsài yīnwèi xiàyǔ tuīchí le.",
        "english": "The game was postponed because of the rain."
      }
    ]
  },
  {
    "hanzi": "脱",
    "pinyin": "tuō",
    "english": "Verb: to take off, to shed",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "进屋前请脱鞋。",
        "pinyin": "Jìn wū qián qǐng tuō xié.",
        "english": "Please take off your shoes before entering the house."
      }
    ]
  },
  {
    "hanzi": "袜子",
    "pinyin": "wà zi",
    "english": "Noun: socks, stockings",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我每天都要换新的袜子。",
        "pinyin": "Wǒ měitiān dōu yào huàn xīn de wàzi.",
        "english": "I need to change into new socks every day."
      }
    ]
  },
  {
    "hanzi": "完全",
    "pinyin": "wán quán",
    "english": " Adjective: complete, whole, entire Relative Clause: towards, to",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我完全同意你的看法。",
        "pinyin": "Wǒ wánquán tóngyì nǐ de kànfǎ.",
        "english": "I completely agree with your point of view."
      }
    ]
  },
  {
    "hanzi": "网球",
    "pinyin": "wǎng qiú",
    "english": "Noun: tennis",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他周末喜欢打网球。",
        "pinyin": "Tā zhōumò xǐhuān dǎ wǎngqiú.",
        "english": "He likes to play tennis on the weekend."
      }
    ]
  },
  {
    "hanzi": "往往",
    "pinyin": "wǎng wǎng",
    "english": "Adverb: often",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她往往在早上跑步。",
        "pinyin": "Tā wǎngwǎng zài zǎoshang pǎobù.",
        "english": "She often runs in the morning."
      }
    ]
  },
  {
    "hanzi": "味道",
    "pinyin": "wèi dào",
    "english": "Noun: taste, flavour",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这道菜的味道真好。",
        "pinyin": "Zhè dào cài de wèidào zhēn hǎo.",
        "english": "The taste of this dish is really good."
      }
    ]
  },
  {
    "hanzi": "危险",
    "pinyin": "wēi xiǎn",
    "english": "Noun: danger Adjective: dangerous",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "在马路上玩耍是很危险的。",
        "pinyin": "Zài mǎlù shang wánshuǎ shì hěn wēixiǎn de.",
        "english": "Playing on the road is very dangerous."
      }
    ]
  },
  {
    "hanzi": "温度",
    "pinyin": "wēn dù",
    "english": "Noun: temperature",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "今天气温很高，温度超过了30度。",
        "pinyin": "Jīntiān qìwēn hěn gāo, wēndù chāoguò le sānshí dù.",
        "english": "The air temperature is very high today; the temperature exceeded 30 degrees."
      }
    ]
  },
  {
    "hanzi": "文章",
    "pinyin": "wén zhāng",
    "english": "Noun: article, essay",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这篇文章写得很好。",
        "pinyin": "Zhè piān wénzhāng xiě de hěn hǎo.",
        "english": "This article is very well written."
      }
    ]
  },
  {
    "hanzi": "无",
    "pinyin": "wú",
    "english": "Adverb: not",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "房间里空无一人。",
        "pinyin": "Fángjiān lǐ kōng wú yī rén.",
        "english": "There was no one in the room."
      }
    ]
  },
  {
    "hanzi": "误会",
    "pinyin": "wù huì",
    "english": "Noun: misunderstanding Verb: to misunderstand",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这只是一个误会。",
        "pinyin": "Zhè zhǐshì yīgè wùhuì.",
        "english": "This is just a misunderstanding."
      }
    ]
  },
  {
    "hanzi": "无聊",
    "pinyin": "wú liáo",
    "english": "Adjective: boring, bored",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "周末没事做，感觉很无聊。",
        "pinyin": "Zhōumò méi shì zuò, gǎnjué hěn wúliáo.",
        "english": "I have nothing to do on the weekend, I feel very bored."
      }
    ]
  },
  {
    "hanzi": "无论",
    "pinyin": "wú lùn",
    "english": "Conjunction: no matter how/what",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "无论发生什么，我都会帮你。",
        "pinyin": "Wúlùn fāshēng shénme, wǒ dōu huì bāng nǐ.",
        "english": "No matter what happens, I will help you."
      }
    ]
  },
  {
    "hanzi": "污染",
    "pinyin": "wū rǎn",
    "english": " Noun: pollution, contamination Verb: to pollute, to contaminate",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "严重的空气污染影响了健康。",
        "pinyin": "Yánzhòng de kōngqì wūrǎn yǐngxiǎngle jiànkāng.",
        "english": "Severe air pollution has affected health."
      }
    ]
  },
  {
    "hanzi": "吸引",
    "pinyin": "xī yǐn",
    "english": "Verb: to attract interest, customers, etc.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这首歌很吸引听众。",
        "pinyin": "Zhè shǒu gē hěn xīyǐn tīngzhòng.",
        "english": "This song attracts the audience."
      }
    ]
  },
  {
    "hanzi": "咸",
    "pinyin": "xián",
    "english": "Adjective: salty",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个菜有点太咸了。",
        "pinyin": "Zhège cài yǒudiǎn tài xiánle.",
        "english": "This dish is a little too salty."
      }
    ]
  },
  {
    "hanzi": "现代",
    "pinyin": "xiàn dài",
    "english": "Noun: modern times, the contemporary age",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "现代科技发展得非常快。",
        "pinyin": "Xiàndài kējì fāzhǎn de fēicháng kuài.",
        "english": "Modern technology is developing very fast."
      }
    ]
  },
  {
    "hanzi": "羡慕",
    "pinyin": "xiàn mù",
    "english": "Verb: to envy, to admire",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我很羡慕你的新工作。",
        "pinyin": "Wǒ hěn xiànmù nǐ de xīn gōngzuò.",
        "english": "I really envy your new job."
      }
    ]
  },
  {
    "hanzi": "限制",
    "pinyin": "xiàn zhì",
    "english": " Noun: restriction, limit Verb: to restrict, to limit",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们必须限制使用时间。",
        "pinyin": "Wǒmen bìxū xiànzhì shǐyòng shíjiān.",
        "english": "We must limit the usage time."
      }
    ]
  },
  {
    "hanzi": "响",
    "pinyin": "xiǎng",
    "english": " Noun: sound, noise Verb: to make a sound Adjective: loud, noisy",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "电话突然响了。",
        "pinyin": "Diànhuà túrán xiǎngle.",
        "english": "The phone suddenly rang."
      }
    ]
  },
  {
    "hanzi": "香",
    "pinyin": "xiāng",
    "english": "Adjective: fragrang",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这朵花闻起来很香。",
        "pinyin": "Zhè duǒ huā wén qǐlái hěn xiāng.",
        "english": "This flower smells very fragrant."
      }
    ]
  },
  {
    "hanzi": "相反",
    "pinyin": "xiāng fǎn",
    "english": "Adjective: opposite, contrary",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "结果和我们预期的正好相反。",
        "pinyin": "Jiéguǒ hé wǒmen yùqī de zhènghǎo xiāngfǎn.",
        "english": "The result was exactly the opposite of what we expected."
      }
    ]
  },
  {
    "hanzi": "详细",
    "pinyin": "xiáng xì",
    "english": "Adjective: detailed",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请提供更详细的资料。",
        "pinyin": "Qǐng tígōng gèng xiángxì de zīliào.",
        "english": "Please provide more detailed information."
      }
    ]
  },
  {
    "hanzi": "效果",
    "pinyin": "xiào guǒ",
    "english": "Noun: effect, result",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这种方法的效果非常好。",
        "pinyin": "Zhè zhǒng fāngfǎ de xiàoguǒ fēicháng hǎo.",
        "english": "The effect of this method is very good."
      }
    ]
  },
  {
    "hanzi": "消息",
    "pinyin": "xiāo xi",
    "english": "Noun: news, information",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我带来了一个好消息。",
        "pinyin": "Wǒ dài láile yīgè hǎo xiāoxi.",
        "english": "I brought a piece of good news."
      }
    ]
  },
  {
    "hanzi": "辛苦",
    "pinyin": "xīn kǔ",
    "english": "Adjective: hard, toilsome",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你今天工作辛苦了。",
        "pinyin": "Nǐ jīntiān gōngzuò xīnkǔle.",
        "english": "You worked hard today. (Thanks for your effort.)"
      }
    ]
  },
  {
    "hanzi": "心情",
    "pinyin": "xīn qíng",
    "english": "Noun: mood, state of mind",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "今天我的心情很愉快。",
        "pinyin": "Jīntiān wǒ de xīnqíng hěn yúkuài.",
        "english": "My mood is very pleasant today."
      }
    ]
  },
  {
    "hanzi": "行",
    "pinyin": "xíng",
    "english": " Verb: to walk, to go Adjective: capable, competent Expression: OK",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你现在走可以吗？行。",
        "pinyin": "Nǐ xiànzài zǒu kěyǐ ma? Xíng.",
        "english": "Can you leave now? Okay."
      }
    ]
  },
  {
    "hanzi": "醒",
    "pinyin": "xǐng",
    "english": "Verb: to wake up",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "闹钟一响我就醒了。",
        "pinyin": "Nàozhōng yī xiǎng wǒ jiù xǐng le.",
        "english": "I woke up as soon as the alarm clock rang."
      }
    ]
  },
  {
    "hanzi": "性别",
    "pinyin": "xìng bié",
    "english": "Noun: gender, sex",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请问你的性别是什么？",
        "pinyin": "Qǐngwèn nǐ de xìngbié shì shénme?",
        "english": "May I ask what your gender is?"
      }
    ]
  },
  {
    "hanzi": "兴奋",
    "pinyin": "xīng fèn",
    "english": "Noun: excitement Adjective: excited",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "孩子们对这次旅行感到非常兴奋。",
        "pinyin": "Háizimen duì zhè cì lǚxíng gǎndào fēicháng xīngfèn.",
        "english": "The children felt very excited about this trip."
      }
    ]
  },
  {
    "hanzi": "幸福",
    "pinyin": "xìng fú",
    "english": "Noun: happiness Adjective: happy",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "祝你生活幸福。",
        "pinyin": "Zhù nǐ shēnghuó xìngfú.",
        "english": "Wishing you a happy life."
      }
    ]
  },
  {
    "hanzi": "修",
    "pinyin": "xiū",
    "english": "Verb: to repair",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我的自行车坏了，需要修一下。",
        "pinyin": "Wǒ de zìxíngchē huàile, xūyào xiū yīxià.",
        "english": "My bicycle is broken and needs to be repaired."
      }
    ]
  },
  {
    "hanzi": "许多",
    "pinyin": "xǔ duō",
    "english": "Adjective: many, a lot of",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "教室里有许多学生。",
        "pinyin": "Jiàoshì lǐ yǒu xǔduō xuésheng.",
        "english": "There are many students in the classroom."
      }
    ]
  },
  {
    "hanzi": "血",
    "pinyin": "xuè",
    "english": "Noun: blood",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "献血是一种无私的行为。",
        "pinyin": "Xiànxuè shì yī zhǒng wúsī de xíngwèi.",
        "english": "Blood donation is a selfless act."
      }
    ]
  },
  {
    "hanzi": "牙膏",
    "pinyin": "yá gāo",
    "english": "Noun: toothpaste",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你早上用什么牌子的牙膏？",
        "pinyin": "Nǐ zǎoshang yòng shénme páizi de yágāo?",
        "english": "What brand of toothpaste do you use in the morning?"
      }
    ]
  },
  {
    "hanzi": "压力",
    "pinyin": "yā lì",
    "english": "Noun: pressure",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "工作压力太大让我喘不过气。",
        "pinyin": "Gōngzuò yālì tài dà ràng wǒ chuǎn bù guò qì.",
        "english": "The work pressure is too great, making me breathless."
      }
    ]
  },
  {
    "hanzi": "亚洲",
    "pinyin": "Yà zhōu",
    "english": "Noun: Asia",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "很多著名的城市都在亚洲。",
        "pinyin": "Hěn duō zhùmíng de chéngshì dōu zài Yàzhōu.",
        "english": "Many famous cities are in Asia."
      }
    ]
  },
  {
    "hanzi": "盐",
    "pinyin": "yán",
    "english": "Noun: salt",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这道菜盐放得太多了。",
        "pinyin": "Zhè dào cài yán fàng de tài duō le.",
        "english": "Too much salt was put in this dish."
      }
    ]
  },
  {
    "hanzi": "演出",
    "pinyin": "yǎn chū",
    "english": " Noun: performance, show Verb: to perform, to put on a show",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "昨晚的音乐演出非常成功。",
        "pinyin": "Zuówǎn de yīnyuè yǎnchū fēicháng chénggōng.",
        "english": "Last night's music performance was very successful."
      }
    ]
  },
  {
    "hanzi": "严格",
    "pinyin": "yán gé",
    "english": "Adjective: strict, rigorous",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们的老师对作业要求很严格。",
        "pinyin": "Wǒmen de lǎoshī duì zuòyè yāoqiú hěn yángé.",
        "english": "Our teacher is very strict about homework requirements."
      }
    ]
  },
  {
    "hanzi": "演员",
    "pinyin": "yǎn yuán",
    "english": "Noun: performer, actor",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她是一位著名的电影演员。",
        "pinyin": "Tā shì yī wèi zhùmíng de diànyǐng yǎnyuán.",
        "english": "She is a famous film actress."
      }
    ]
  },
  {
    "hanzi": "严重",
    "pinyin": "yán zhòng",
    "english": "Adjective: grave, serious, critical",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他的伤势看起来很严重。",
        "pinyin": "Tā de shāngshì kàn qǐlái hěn yánzhòng.",
        "english": "His injury looks very serious."
      }
    ]
  },
  {
    "hanzi": "养成",
    "pinyin": "yǎng chéng",
    "english": "Verb: to cultivate, to form, to acquire",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "养成早睡早起的好习惯。",
        "pinyin": "Yǎngchéng zǎoshuì zǎoqǐ de hǎo xíguàn.",
        "english": "Cultivate the good habit of sleeping early and waking up early."
      }
    ]
  },
  {
    "hanzi": "阳光",
    "pinyin": "yáng guāng",
    "english": "Noun: sunshine",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "阳光照在窗户上，感觉很温暖。",
        "pinyin": "Yángguāng zhào zài chuānghù shang, gǎnjué hěn wēnnuǎn.",
        "english": "The sunshine shines on the window, and it feels very warm."
      }
    ]
  },
  {
    "hanzi": "样子",
    "pinyin": "yàng zi",
    "english": "Noun: appearance, manner",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他看起来很累的样子。",
        "pinyin": "Tā kàn qǐlái hěn lèi de yàngzi.",
        "english": "He looks very tired."
      }
    ]
  },
  {
    "hanzi": "邀请",
    "pinyin": "yāo qǐng",
    "english": "Noun: invitation Verb: to invite",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我邀请他参加我的生日派对。",
        "pinyin": "Wǒ yāoqǐng tā cānjiā wǒ de shēngrì pàiduì.",
        "english": "I invited him to attend my birthday party."
      }
    ]
  },
  {
    "hanzi": "页",
    "pinyin": "yè",
    "english": " Noun: page, leaf Measure Word: for a page",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请翻到第十页。",
        "pinyin": "Qǐng fān dào dì shí yè.",
        "english": "Please turn to page ten."
      }
    ]
  },
  {
    "hanzi": "亿",
    "pinyin": "yì",
    "english": "Number: 100 million",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这座城市有几亿人口。",
        "pinyin": "Zhè zuò chéngshì yǒu jǐ yì rénkǒu.",
        "english": "This city has several hundred million people."
      }
    ]
  },
  {
    "hanzi": "以",
    "pinyin": "yǐ",
    "english": "Relative Clause: because of, so as to, in order to",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请以书面形式确认。",
        "pinyin": "Qǐng yǐ shūmiàn xíngshì quèrèn.",
        "english": "Please confirm in writing."
      }
    ]
  },
  {
    "hanzi": "意见",
    "pinyin": "yì jiàn",
    "english": "Noun: opinion, view, objection",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你有什么意见吗？",
        "pinyin": "Nǐ yǒu shénme yìjiàn ma?",
        "english": "Do you have any suggestions (or opinions)?"
      }
    ]
  },
  {
    "hanzi": "一切",
    "pinyin": "yí qiè",
    "english": "Pronoun: all, everything",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "一切都会好起来的。",
        "pinyin": "Yīqiè dōu huì hǎo qǐlái de.",
        "english": "Everything will get better."
      }
    ]
  },
  {
    "hanzi": "艺术",
    "pinyin": "yì shù",
    "english": "Noun: art",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她对艺术很感兴趣。",
        "pinyin": "Tā duì yìshù hěn gǎn xìngqù.",
        "english": "She is very interested in art."
      }
    ]
  },
  {
    "hanzi": "因此",
    "pinyin": "yīn cǐ",
    "english": "Conjunction: thus, consequently",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他生病了，因此没去上班。",
        "pinyin": "Tā shēngbìng le, yīncǐ méi qù shàngbān.",
        "english": "He was sick, therefore he didn't go to work."
      }
    ]
  },
  {
    "hanzi": "饮料",
    "pinyin": "yǐn liào",
    "english": "Noun: drink, beverage",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请喝饮料。",
        "pinyin": "Qǐng hē yǐnliào.",
        "english": "Please have a drink."
      }
    ]
  },
  {
    "hanzi": "引起",
    "pinyin": "yǐn qǐ",
    "english": "Verb: to give rise to, to lead to",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这件事引起了大家的注意。",
        "pinyin": "Zhè jiàn shì yǐnqǐ le dàjiā de zhùyì.",
        "english": "This matter attracted everyone's attention."
      }
    ]
  },
  {
    "hanzi": "印象",
    "pinyin": "yìn xiàng",
    "english": "Noun: impression",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我对他的印象很好。",
        "pinyin": "Wǒ duì tā de yìnxiàng hěn hǎo.",
        "english": "I have a good impression of him."
      }
    ]
  },
  {
    "hanzi": "赢",
    "pinyin": "yíng",
    "english": "Verb: to win, to beat",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们赢得了比赛！",
        "pinyin": "Wǒmen yíngdé le bǐsài!",
        "english": "We won the competition!"
      }
    ]
  },
  {
    "hanzi": "硬",
    "pinyin": "yìng",
    "english": "Adjective: hard, stiff, firm",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这块石头很硬。",
        "pinyin": "Zhè kuài shítou hěn yìng.",
        "english": "This stone is very hard."
      }
    ]
  },
  {
    "hanzi": "勇敢",
    "pinyin": "yǒng gǎn",
    "english": "Adjective: brave, courageous",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他是一个非常勇敢的人。",
        "pinyin": "Tā shì yīgè fēicháng yǒnggǎn de rén.",
        "english": "He is a very brave person."
      }
    ]
  },
  {
    "hanzi": "永远",
    "pinyin": "yǒng yuǎn",
    "english": "Adverb: forever, ever",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我会永远记住你。",
        "pinyin": "Wǒ huì yǒngyuǎn jìzhù nǐ.",
        "english": "I will remember you forever."
      }
    ]
  },
  {
    "hanzi": "由",
    "pinyin": "yóu",
    "english": "Relative Clause: due to, because of, by, from",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这件事由我来负责。",
        "pinyin": "Zhè jiàn shì yóu wǒ lái fùzé.",
        "english": "I will be responsible for this matter."
      }
    ]
  },
  {
    "hanzi": "优点",
    "pinyin": "yōu diǎn",
    "english": "Noun: merit, advantage, strong point",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "每个人都有自己的优点。",
        "pinyin": "Měi gèrén dōu yǒu zìjǐ de yōudiǎn.",
        "english": "Everyone has their own strengths."
      }
    ]
  },
  {
    "hanzi": "友好",
    "pinyin": "yǒu hǎo",
    "english": "Adjective: friendly",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他们对我非常友好。",
        "pinyin": "Tāmen duì wǒ fēicháng yǒuhǎo.",
        "english": "They are very friendly toward me."
      }
    ]
  },
  {
    "hanzi": "幽默",
    "pinyin": "yōu mò",
    "english": "Noun: humor Adjective: humorous",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他讲话很幽默。",
        "pinyin": "Tā jiǎnghuà hěn yōumò.",
        "english": "He speaks very humorously."
      }
    ]
  },
  {
    "hanzi": "尤其",
    "pinyin": "yóu qí",
    "english": "Adverb: especially, particularly",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我喜欢水果，尤其是苹果。",
        "pinyin": "Wǒ xǐhuān shuǐguǒ, yóuqí shì píngguǒ.",
        "english": "I like fruit, especially apples."
      }
    ]
  },
  {
    "hanzi": "有趣",
    "pinyin": "yǒu qù",
    "english": "Adjective: interesting",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这本书读起来很有趣。",
        "pinyin": "Zhè běn shū dú qǐlái hěn yǒuqù.",
        "english": "This book is very interesting to read."
      }
    ]
  },
  {
    "hanzi": "优秀",
    "pinyin": "yōu xiù",
    "english": "Adjective: outstanding, excellent",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这份报告写得很优秀。",
        "pinyin": "Zhè fèn bàogào xiě de hěn yōuxiù.",
        "english": "This report is written very well (is excellent)."
      }
    ]
  },
  {
    "hanzi": "友谊",
    "pinyin": "yǒu yì",
    "english": "Noun: friendship",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们的友谊持续了十年。",
        "pinyin": "Wǒmen de yǒuyì chíxù le shí nián.",
        "english": "Our friendship lasted ten years."
      }
    ]
  },
  {
    "hanzi": "由于",
    "pinyin": "yóu yú",
    "english": "Relative Clause: due to, because of",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "由于下雨，我们取消了野餐。",
        "pinyin": "Yóuyú xiàyǔ, wǒmen qǔxiāo le yěcān.",
        "english": "Due to the rain, we canceled the picnic."
      }
    ]
  },
  {
    "hanzi": "愉快",
    "pinyin": "yú kuài",
    "english": "Adjective: happy, cheerful",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "祝你周末愉快！",
        "pinyin": "Zhù nǐ zhōumò yúkuài!",
        "english": "Wish you a pleasant weekend! (Have a nice weekend!)"
      }
    ]
  },
  {
    "hanzi": "羽毛球",
    "pinyin": "yǔ máo qiú",
    "english": "Noun: badminton",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我最喜欢的运动是打羽毛球。",
        "pinyin": "Wǒ zuì xǐhuān de yùndòng shì dǎ yǔmáoqiú.",
        "english": "My favorite sport is playing badminton."
      }
    ]
  },
  {
    "hanzi": "于是",
    "pinyin": "yú shì",
    "english": "Conjunction: as a result, consequently",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "天气变冷了，于是我加了件衣服。",
        "pinyin": "Tiānqì biàn lěng le, yúshì wǒ jiā le jiàn yīfu.",
        "english": "The weather turned cold, so I put on another layer of clothing."
      }
    ]
  },
  {
    "hanzi": "预习",
    "pinyin": "yù xí",
    "english": "Verb: to prepare for a lesson",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "上课前要先预习。",
        "pinyin": "Shàng kè qián yào xiān yùxí.",
        "english": "You must preview the lesson before class."
      }
    ]
  },
  {
    "hanzi": "原来",
    "pinyin": "yuán lái",
    "english": " Adjective: former, original Adverb: as it turns out",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "原来他就是我的邻居啊！",
        "pinyin": "Yuánlái tā jiù shì wǒ de línjū a!",
        "english": "So he is my neighbor! (It turns out...)"
      }
    ]
  },
  {
    "hanzi": "原谅",
    "pinyin": "yuán liàng",
    "english": "Verb: to excuse, to forgive",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请原谅我迟到了。",
        "pinyin": "Qǐng yuánliàng wǒ chídào le.",
        "english": "Please forgive me for being late."
      }
    ]
  },
  {
    "hanzi": "原因",
    "pinyin": "yuán yīn",
    "english": "Noun: reason, cause",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我正在寻找问题的原因。",
        "pinyin": "Wǒ zhèngzài xúnzhǎo wèntí de yuányīn.",
        "english": "I am looking for the reason for the problem."
      }
    ]
  },
  {
    "hanzi": "阅读",
    "pinyin": "yuè dú",
    "english": "Noun: reading Verb: to read",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "每天阅读对学习很有帮助。",
        "pinyin": "Měitiān yuèdú duì xuéxí hěn yǒu bāngzhù.",
        "english": "Reading every day is very helpful for studying."
      }
    ]
  },
  {
    "hanzi": "约会",
    "pinyin": "yuē huì",
    "english": "Noun: appointment, engagement, date",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们约会的时间是下午三点。",
        "pinyin": "Wǒmen yuēhuì de shíjiān shì xiàwǔ sān diǎn.",
        "english": "Our appointment time is three o'clock in the afternoon."
      }
    ]
  },
  {
    "hanzi": "允许",
    "pinyin": "yǔn xǔ",
    "english": "Verb: to permit, to allow",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这里不允许吸烟。",
        "pinyin": "Zhèlǐ bù yǔnxǔ xīyān.",
        "english": "Smoking is not allowed here."
      }
    ]
  },
  {
    "hanzi": "杂志",
    "pinyin": "zá zhì",
    "english": "Noun: magazine",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她喜欢看时尚杂志。",
        "pinyin": "Tā xǐhuān kàn shíshàng zázhì.",
        "english": "She likes reading fashion magazines."
      }
    ]
  },
  {
    "hanzi": "咱们",
    "pinyin": "zán men",
    "english": "Pronoun: we, us",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "咱们走吧，时间不早了。",
        "pinyin": "Zánmen zǒu ba, shíjiān bù zǎo le.",
        "english": "Let's go, it's getting late. (Inclusive 'we')"
      }
    ]
  },
  {
    "hanzi": "暂时",
    "pinyin": "zàn shí",
    "english": "Adjective: temporary",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们暂时休息一下。",
        "pinyin": "Wǒmen zànshí xiūxi yīxià.",
        "english": "Let's rest temporarily (for a while)."
      }
    ]
  },
  {
    "hanzi": "脏",
    "pinyin": "zāng",
    "english": "Adjective: dirty",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你的手太脏了，快去洗。",
        "pinyin": "Nǐ de shǒu tài zāng le, kuài qù xǐ.",
        "english": "Your hands are too dirty, go wash them quickly."
      }
    ]
  },
  {
    "hanzi": "责任",
    "pinyin": "zé rèn",
    "english": "Noun: duty, responsibility",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他承担了所有的责任。",
        "pinyin": "Tā chéngdānle suǒyǒu de zérèn.",
        "english": "He took on all the responsibility."
      }
    ]
  },
  {
    "hanzi": "增加",
    "pinyin": "zēng jiā",
    "english": "Verb: to increase, to raise",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个月收入增加了不少。",
        "pinyin": "Zhège yuè shōurù zēngjiā le bù shǎo.",
        "english": "Income increased significantly this month."
      }
    ]
  },
  {
    "hanzi": "招聘",
    "pinyin": "zhāo pìn",
    "english": "Noun: recruitment Verb: to recruit",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们公司正在招聘新员工。",
        "pinyin": "Wǒmen gōngsī zhèngzài zhāopìn xīn yuángōng.",
        "english": "Our company is currently recruiting new employees."
      }
    ]
  },
  {
    "hanzi": "真正",
    "pinyin": "zhēn zhèng",
    "english": "Adjective: genuine, real, true",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他是一个真正善良的人。",
        "pinyin": "Tā shì yīgè zhēnzhèng shànliáng de rén.",
        "english": "He is a truly kind person."
      }
    ]
  },
  {
    "hanzi": "正常",
    "pinyin": "zhèng cháng",
    "english": "Adjective: regular, normal, ordinary",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "一切都恢复正常了。",
        "pinyin": "Yīqiè dōu huīfù zhèngcháng le.",
        "english": "Everything has returned to normal."
      }
    ]
  },
  {
    "hanzi": "整理",
    "pinyin": "zhěng lǐ",
    "english": "Verb: to arrange, to tidy up",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我需要整理我的房间。",
        "pinyin": "Wǒ xūyào zhěnglǐ wǒ de fángjiān.",
        "english": "I need to tidy up my room."
      }
    ]
  },
  {
    "hanzi": "证明",
    "pinyin": "zhèng míng",
    "english": " Noun: proof, certificate, testimonial Verb: to prove, to testify",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你能证明这是真的吗？",
        "pinyin": "Nǐ néng zhèngmíng zhè shì zhēn de ma?",
        "english": "Can you prove this is true?"
      }
    ]
  },
  {
    "hanzi": "正式",
    "pinyin": "zhèng shì",
    "english": "Adjective: formal, official",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "明天是正式的会议。",
        "pinyin": "Míngtiān shì zhèngshì de huìyì.",
        "english": "Tomorrow is the official meeting."
      }
    ]
  },
  {
    "hanzi": "指",
    "pinyin": "zhǐ",
    "english": " Noun: finger Verb: to point at or to, to indicate",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他指着地图上的一个地方。",
        "pinyin": "Tā zhǐzhe dìtú shang de yī gè dìfāng.",
        "english": "He pointed to a place on the map."
      }
    ]
  },
  {
    "hanzi": "之",
    "pinyin": "zhī",
    "english": " Pronoun: I, he, she it, … Particle: similar to 的",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "百年之好。",
        "pinyin": "Bǎinián zhī hǎo.",
        "english": "A hundred years of happy marriage. (A set phrase)"
      }
    ]
  },
  {
    "hanzi": "支持",
    "pinyin": "zhī chí",
    "english": " Noun: support, backing Verb: to support, to back",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我会永远支持你的决定。",
        "pinyin": "Wǒ huì yǒngyuǎn zhīchí nǐ de juédìng.",
        "english": "I will always support your decision."
      }
    ]
  },
  {
    "hanzi": "值得",
    "pinyin": "zhí dé",
    "english": "Verb: to be worth, to deserve",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这部电影很值得一看。",
        "pinyin": "Zhè bù diànyǐng hěn zhídé yī kàn.",
        "english": "This movie is very worth watching."
      }
    ]
  },
  {
    "hanzi": "只好",
    "pinyin": "zhǐ hǎo",
    "english": "Adverb: have to",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "下雨了，我们只好取消野餐。",
        "pinyin": "Xià yǔ le, wǒmen zhǐhǎo qǔxiāo yěcān.",
        "english": "It's raining, so we had no choice but to cancel the picnic."
      }
    ]
  },
  {
    "hanzi": "直接",
    "pinyin": "zhí jiē",
    "english": "Adjective: direct, immediate",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你可以直接问他。",
        "pinyin": "Nǐ kěyǐ zhíjiē wèn tā.",
        "english": "You can ask him directly."
      }
    ]
  },
  {
    "hanzi": "至少",
    "pinyin": "zhì shǎo",
    "english": "Adverb: at least",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你至少应该提前告诉我。",
        "pinyin": "Nǐ zhìshǎo yīnggāi tíqián gàosù wǒ.",
        "english": "You should at least tell me in advance."
      }
    ]
  },
  {
    "hanzi": "知识",
    "pinyin": "zhī shi",
    "english": "Noun: knowledge",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "学习新知识非常重要。",
        "pinyin": "Xuéxí xīn zhīshi fēicháng zhòngyào.",
        "english": "Learning new knowledge is extremely important."
      }
    ]
  },
  {
    "hanzi": "植物",
    "pinyin": "zhí wù",
    "english": "Noun: plant",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这个公园里有很多稀有植物。",
        "pinyin": "Zhège gōngyuán lǐ yǒu hěn duō xīyǒu zhíwù.",
        "english": "There are many rare plants in this park."
      }
    ]
  },
  {
    "hanzi": "只要",
    "pinyin": "zhǐ yào",
    "english": "Conjunction: if only, as long as",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "只要努力，你就能成功。",
        "pinyin": "Zhǐyào nǔlì, nǐ jiù néng chénggōng.",
        "english": "As long as you work hard, you will succeed."
      }
    ]
  },
  {
    "hanzi": "职业",
    "pinyin": "zhí yè",
    "english": "Noun: occupation, profession",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他的职业是一名老师。",
        "pinyin": "Tā de zhíyè shì yī míng lǎoshī.",
        "english": "His profession is a teacher."
      }
    ]
  },
  {
    "hanzi": "制造",
    "pinyin": "zhì zào",
    "english": "Verb: to make, to manufacture",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这家工厂制造汽车零件。",
        "pinyin": "Zhè jiā gōngchǎng zhìzào qìchē língjiàn.",
        "english": "This factory manufactures car parts."
      }
    ]
  },
  {
    "hanzi": "重点",
    "pinyin": "zhòng diǎn",
    "english": "Noun: emphasis, focal point, priority",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请你抓住问题的重点。",
        "pinyin": "Qǐng nǐ zhuāzhù wèntí de zhòngdiǎn.",
        "english": "Please grasp the key point of the problem."
      }
    ]
  },
  {
    "hanzi": "重视",
    "pinyin": "zhòng shì",
    "english": "Verb: to value, to attach importance to",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们必须重视环境保护。",
        "pinyin": "Wǒmen bìxū zhòngshì huánjìng bǎohù.",
        "english": "We must attach importance to environmental protection."
      }
    ]
  },
  {
    "hanzi": "中文",
    "pinyin": "Zhōng wén",
    "english": "Noun: Chinese language",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我正在努力学习中文。",
        "pinyin": "Wǒ zhèngzài nǔlì xuéxí Zhōngwén.",
        "english": "I am currently working hard to study Chinese."
      }
    ]
  },
  {
    "hanzi": "周围",
    "pinyin": "zhōu wéi",
    "english": " Noun: surroundings, environment Adverb: around, about",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我喜欢周围安静的环境。",
        "pinyin": "Wǒ xǐhuān zhōuwéi ānjìng de huánjìng.",
        "english": "I like the quiet environment of the surroundings."
      }
    ]
  },
  {
    "hanzi": "猪",
    "pinyin": "zhū",
    "english": "Noun: pig",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "猪肉是常见的肉类。",
        "pinyin": "Zhūròu shì chángjiàn de ròulèi.",
        "english": "Pork is a common type of meat."
      }
    ]
  },
  {
    "hanzi": "主动",
    "pinyin": "zhǔ dòng",
    "english": "Verb: to take the initiative Adjective: active",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她总是主动帮助别人。",
        "pinyin": "Tā zǒng shì zhǔdòng bāngzhù biérén.",
        "english": "She always takes the initiative to help others."
      }
    ]
  },
  {
    "hanzi": "祝贺",
    "pinyin": "zhù hè",
    "english": "Noun: congratulations  Verb: to congratulate",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们祝贺他获得了成功。",
        "pinyin": "Wǒmen zhùhè tā huòdéle chénggōng.",
        "english": "We congratulate him on achieving success."
      }
    ]
  },
  {
    "hanzi": "逐渐",
    "pinyin": "zhú jiàn",
    "english": "Adverb: gradually",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "天气逐渐变冷。",
        "pinyin": "Tiānqì zhújiàn biàn lěng.",
        "english": "The weather gradually gets cold."
      }
    ]
  },
  {
    "hanzi": "著名",
    "pinyin": "zhù míng",
    "english": "Adjective: famous, well-known",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "她是一位著名的画家。",
        "pinyin": "Tā shì yī wèi zhùmíng de huàjiā.",
        "english": "She is a famous painter."
      }
    ]
  },
  {
    "hanzi": "主意",
    "pinyin": "zhǔ yi",
    "english": "Noun: idea, plan, decision",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这是一个不错的好主意。",
        "pinyin": "Zhè shì yī gè bùcuò de hǎo zhǔyì.",
        "english": "This is quite a good idea."
      }
    ]
  },
  {
    "hanzi": "赚",
    "pinyin": "zhuàn",
    "english": "Verb: to earn, to make a profit",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他今年赚了很多钱。",
        "pinyin": "Tā jīnnián zhuànle hěn duō qián.",
        "english": "He earned a lot of money this year."
      }
    ]
  },
  {
    "hanzi": "专门",
    "pinyin": "zhuān mén",
    "english": " Adjective: special, specialized Adverb: specialized",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我专门为你准备了晚餐。",
        "pinyin": "Wǒ zhuānmén wèi nǐ zhǔnbèile wǎncān.",
        "english": "I specifically prepared dinner for you."
      }
    ]
  },
  {
    "hanzi": "专业",
    "pinyin": "zhuān yè",
    "english": "Noun: speciality, major, field of study",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你的大学专业是什么？",
        "pinyin": "Nǐ de dàxué zhuānyè shì shénme?",
        "english": "What is your college major?"
      }
    ]
  },
  {
    "hanzi": "自然",
    "pinyin": "zì rán",
    "english": "Noun: nature Adjective: natural",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们要保护自然环境。",
        "pinyin": "Wǒmen yào bǎohù zìrán huánjìng.",
        "english": "We must protect the natural environment."
      }
    ]
  },
  {
    "hanzi": "仔细",
    "pinyin": "zǐ xì",
    "english": "Adjective: careful, attentive, cautious",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请仔细检查这份文件。",
        "pinyin": "Qǐng zǐxì jiǎnchá zhè fèn wénjiàn.",
        "english": "Please carefully check this document."
      }
    ]
  },
  {
    "hanzi": "总结",
    "pinyin": "zǒng jié",
    "english": "Noun: summary Verb: to sum up",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请在会议结束时做个总结。",
        "pinyin": "Qǐng zài huìyì jiéshù shí zuò ge zǒngjié.",
        "english": "Please make a summary at the end of the meeting."
      }
    ]
  },
  {
    "hanzi": "租",
    "pinyin": "zū",
    "english": "Verb: to rent, to hire",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们打算在北京租一套公寓。",
        "pinyin": "Wǒmen dǎsuàn zài Běijīng zū yī tào gōngyù.",
        "english": "We plan to rent an apartment in Beijing."
      }
    ]
  },
  {
    "hanzi": "组成",
    "pinyin": "zǔ chéng",
    "english": " Noun: composition Verb: to form, to compose, to constitute",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "我们的团队由五个人组成。",
        "pinyin": "Wǒmen de tuánduì yóu wǔ gè rén zǔchéng.",
        "english": "Our team is composed of five people."
      }
    ]
  },
  {
    "hanzi": "嘴",
    "pinyin": "zuǐ",
    "english": "Noun: mouth",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "他的嘴巴很大。",
        "pinyin": "Tā de zuǐbā hěn dà.",
        "english": "His mouth is very big."
      }
    ]
  },
  {
    "hanzi": "最好",
    "pinyin": "zuì hǎo",
    "english": "Adverb: it would be best, had better",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "你最好现在就走。",
        "pinyin": "Nǐ zuìhǎo xiànzài jiù zǒu.",
        "english": "You had better leave right now."
      }
    ]
  },
  {
    "hanzi": "座",
    "pinyin": "zuò",
    "english": " Noun: seat Measure Word: for cities, buildings, mountains, etc.",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "那座山非常高。",
        "pinyin": "Nà zuò shān fēicháng gāo.",
        "english": "That mountain is extremely tall."
      }
    ]
  },
  {
    "hanzi": "座位",
    "pinyin": "zuò wèi",
    "english": "Noun: seat, place",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "请找个空座位坐下。",
        "pinyin": "Qǐng zhǎo gè kòng zuòwèi zuò xià.",
        "english": "Please find an empty seat and sit down."
      }
    ]
  },
  {
    "hanzi": "作者",
    "pinyin": "zuò zhě",
    "english": "Noun: author, writer",
    "hsk": "HSK 4",
    "exampleSentences": [
      {
        "chinese": "这本书的作者是谁？",
        "pinyin": "Zhè běn shū de zuòzhě shì shéi?",
        "english": "Who is the author of this book?"
      }
    ]
  },
  {
    "hanzi": "唉",
    "pinyin": "āi",
    "english": "Particle: uh sigh",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "唉，真让人失望。",
        "pinyin": "Ài, zhēn ràng rén shīwàng.",
        "english": "Alas, it is truly disappointing."
      }
    ]
  },
  {
    "hanzi": "爱护",
    "pinyin": "ài hù",
    "english": "Verb: to cherish, to take good care of",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们要爱护环境。",
        "pinyin": "Wǒmen yào àihù huánjìng.",
        "english": "We must protect the environment."
      }
    ]
  },
  {
    "hanzi": "爱惜",
    "pinyin": "ài xī",
    "english": "Verb: to cherish, to treasure",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们应该爱惜粮食。",
        "pinyin": "Wǒmen yīnggāi àixī liángshí.",
        "english": "We should cherish (not waste) food."
      }
    ]
  },
  {
    "hanzi": "爱心",
    "pinyin": "ài xīn",
    "english": "Noun: tender feelings; affections",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她很有爱心。",
        "pinyin": "Tā hěn yǒu àixīn.",
        "english": "She is very compassionate (full of love)."
      }
    ]
  },
  {
    "hanzi": "岸",
    "pinyin": "àn",
    "english": "Noun: shore, beach, coast",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "船靠在岸边。",
        "pinyin": "Chuán kào zài ànbiān.",
        "english": "The boat is leaning against the shore."
      }
    ]
  },
  {
    "hanzi": "安装",
    "pinyin": "ān zhuāng",
    "english": " Noun: installation Verb: to install, to mount",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我正在安装软件。",
        "pinyin": "Wǒ zhèngzài ānzhuāng ruǎnjiàn.",
        "english": "I am installing the software."
      }
    ]
  },
  {
    "hanzi": "把握",
    "pinyin": "bǎ wò",
    "english": "Noun: assurance Verb: to grasp, to hold",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我有把握能成功。",
        "pinyin": "Wǒ yǒu bǎwò néng chénggōng.",
        "english": "I am confident I can succeed."
      }
    ]
  },
  {
    "hanzi": "摆",
    "pinyin": "bǎi",
    "english": "Noun: pendulum Verb: to put, to place, to arragne",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请把花瓶摆在桌子上。",
        "pinyin": "Qǐng bǎ huāpíng bǎi zài zhuōzi shang.",
        "english": "Please place the vase on the table."
      }
    ]
  },
  {
    "hanzi": "办理",
    "pinyin": "bàn lǐ",
    "english": "Verb: to handle, to conduct",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我需要办理签证。",
        "pinyin": "Wǒ xūyào bànlǐ qiānzhèng.",
        "english": "I need to apply for a visa."
      }
    ]
  },
  {
    "hanzi": "棒",
    "pinyin": "bàng",
    "english": " Noun: stick, club Adjective: strong, capable, good Measure Word: for legs of relay race",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你的中文说得真棒！",
        "pinyin": "Nǐ de Zhōngwén shuō de zhēn bàng!",
        "english": "Your Chinese is spoken really well!"
      }
    ]
  },
  {
    "hanzi": "傍晚",
    "pinyin": "bàng wǎn",
    "english": "Time: towards evening, at nightfall",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们傍晚出发。",
        "pinyin": "Wǒmen bàngwǎn chūfā.",
        "english": "We will depart in the evening (dusk)."
      }
    ]
  },
  {
    "hanzi": "薄",
    "pinyin": "báo",
    "english": "Adjective: thin",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这张纸很薄，容易破。",
        "pinyin": "Zhè zhāng zhǐ hěn báo, róngyì pò.",
        "english": "This paper is very thin; it tears easily."
      }
    ]
  },
  {
    "hanzi": "宝贝",
    "pinyin": "bǎo bèi",
    "english": "Noun: darling, baby",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的小狗是我的宝贝。",
        "pinyin": "Wǒ de xiǎogǒu shì wǒ de bǎobèi.",
        "english": "My puppy is my darling (treasure)."
      }
    ]
  },
  {
    "hanzi": "保持",
    "pinyin": "bǎo chí",
    "english": "Verb: to keep, to maintain, to preserve",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请保持房间整洁。",
        "pinyin": "Qǐng bǎochí fángjiān zhěngjié.",
        "english": "Please keep the room tidy."
      }
    ]
  },
  {
    "hanzi": "保存",
    "pinyin": "bǎo cún",
    "english": "Verb: to conserve, to keep, to save IT",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "记得点击保存文件。",
        "pinyin": "Jìde diǎnjī bǎocún wénjiàn.",
        "english": "Remember to click save the file."
      }
    ]
  },
  {
    "hanzi": "宝贵",
    "pinyin": "bǎo guì",
    "english": "Adjective: valuable, precious",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们要珍惜宝贵的学习机会。",
        "pinyin": "Wǒmen yào zhēnxī bǎoguì de xuéxí jīhuì.",
        "english": "We must cherish precious learning opportunities."
      }
    ]
  },
  {
    "hanzi": "包裹",
    "pinyin": "bāo guǒ",
    "english": "Noun: parcel, package Verb: to wrap up",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我收到了一个包裹。",
        "pinyin": "Wǒ shōu dào le yīgè bāoguǒ.",
        "english": "I received a package."
      }
    ]
  },
  {
    "hanzi": "包含",
    "pinyin": "bāo hán",
    "english": "Verb: to contain, to emobdy, to include",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "价格包含早餐。",
        "pinyin": "Jiàgé bāohán zǎocān.",
        "english": "The price includes breakfast."
      }
    ]
  },
  {
    "hanzi": "包子",
    "pinyin": "bāo zi",
    "english": "Noun: steamed stuffed bun",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我早餐想吃一个包子。",
        "pinyin": "Wǒ zǎocān xiǎng chī yí ge bāozi.",
        "english": "I want to eat a steamed bun for breakfast."
      }
    ]
  },
  {
    "hanzi": "背",
    "pinyin": "bèi",
    "english": "Noun: back Verb: to learn by heart",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "学生们正在背课文。",
        "pinyin": "Xuéshēngmen zhèngzài bèi kèwén.",
        "english": "The students are memorizing the text."
      }
    ]
  },
  {
    "hanzi": "悲观",
    "pinyin": "bēi guān",
    "english": "Adjective: pessimistic",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他对待生活总是很悲观。",
        "pinyin": "Tā duìdài shēnghuó zǒngshì hěn bēiguān.",
        "english": "He is always very pessimistic about life."
      }
    ]
  },
  {
    "hanzi": "本质",
    "pinyin": "běn zhì",
    "english": "Noun: essence, nature",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "要解决问题，必须了解其本质。",
        "pinyin": "Yào jiějué wèntí, bìxū liǎojiě qí běnzhì.",
        "english": "To solve the problem, you must understand its essence."
      }
    ]
  },
  {
    "hanzi": "彼此",
    "pinyin": "bǐ cǐ",
    "english": "Pronoun: each other, one another",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们都很关心彼此。",
        "pinyin": "Wǒmen dōu hěn guānxīn bǐcǐ.",
        "english": "We all care about each other."
      }
    ]
  },
  {
    "hanzi": "毕竟",
    "pinyin": "bì jìng",
    "english": "Adverb: after all, in the end",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "毕竟，他努力了很久。",
        "pinyin": "Bìjìng, tā nǔlì le hěn jiǔ.",
        "english": "After all, he has worked hard for a long time."
      }
    ]
  },
  {
    "hanzi": "避免",
    "pinyin": "bì miǎn",
    "english": "Verb: to avoid, to prevent",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你应该避免吃太多甜食。",
        "pinyin": "Nǐ yīnggāi bìmiǎn chī tài duō tiánshí.",
        "english": "You should avoid eating too many sweets."
      }
    ]
  },
  {
    "hanzi": "必然",
    "pinyin": "bì rán",
    "english": "Adjective: inevitable, certain",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "失败并非是成功的必然结局。",
        "pinyin": "Shībài bìng fēi shì chénggōng de bìrán jiéjú.",
        "english": "Failure is not necessarily the inevitable outcome of success."
      }
    ]
  },
  {
    "hanzi": "比如",
    "pinyin": "bǐ rú",
    "english": "Adverb: for example",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢很多水果，比如苹果和香蕉。",
        "pinyin": "Wǒ xǐhuān hěn duō shuǐguǒ, bǐrú píngguǒ hé xiāngjiāo.",
        "english": "I like many fruits, for example, apples and bananas."
      }
    ]
  },
  {
    "hanzi": "必需",
    "pinyin": "bì xū",
    "english": "Verb: to really need, to be essential, must",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "水和食物是生存的必需品。",
        "pinyin": "Shuǐ hé shíwù shì shēngcún de bìxūpǐn.",
        "english": "Water and food are necessities for survival."
      }
    ]
  },
  {
    "hanzi": "必要",
    "pinyin": "bì yào",
    "english": "Adjective: necessary, essential",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你没有必要向他道歉。",
        "pinyin": "Nǐ méiyǒu bìyào xiàng tā dàoqiàn.",
        "english": "It is not necessary for you to apologize to him."
      }
    ]
  },
  {
    "hanzi": "便",
    "pinyin": "biàn",
    "english": " Verb: to relieve oneself Adjective: convenient, handy Adverb: then, in that case",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "若你同意，我便开始准备。",
        "pinyin": "Ruò nǐ tóngyì, wǒ biàn kāishǐ zhǔnbèi.",
        "english": "If you agree, then I will start preparing."
      }
    ]
  },
  {
    "hanzi": "编辑",
    "pinyin": "biān jí",
    "english": "Noun: editor, compiler Verb: to edit, to compile",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她是一名专业的书籍编辑。",
        "pinyin": "Tā shì yī míng zhuānyè de shūjí biānjí.",
        "english": "She is a professional book editor."
      }
    ]
  },
  {
    "hanzi": "辩论",
    "pinyin": "biàn lùn",
    "english": "Noun: debate, argument Verb: to debate, to argue",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们正在进行一场激烈的辩论。",
        "pinyin": "Tāmen zhèngzài jìnxíng yī chǎng jīliè de biànlùn.",
        "english": "They are currently engaged in a fierce debate."
      }
    ]
  },
  {
    "hanzi": "鞭炮",
    "pinyin": "biān pào",
    "english": "Noun: firecrackers",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "春节时，家家户户放鞭炮。",
        "pinyin": "Chūnjié shí, jiājiā hùhù fàng biānpào.",
        "english": "During the Spring Festival, every household sets off firecrackers."
      }
    ]
  },
  {
    "hanzi": "标点",
    "pinyin": "biāo diǎn",
    "english": "Noun: punctuation, punctuation mark",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "写句子时要注意使用正确的标点符号。",
        "pinyin": "Xiě jùzi shí yào zhùyì shǐyòng zhèngquè de biāodiǎn symbol.",
        "english": "When writing sentences, pay attention to using correct punctuation marks."
      }
    ]
  },
  {
    "hanzi": "表面",
    "pinyin": "biǎo miàn",
    "english": "Noun: surface, outside, appearance",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请把桌子表面擦干净。",
        "pinyin": "Qǐng bǎ zhuōzi biǎomiàn cā gānjìng.",
        "english": "Please wipe the surface of the table clean."
      }
    ]
  },
  {
    "hanzi": "表明",
    "pinyin": "biǎo míng",
    "english": "Verb: to show, to indicate, to make clear",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的沉默表明他不同意这个计划。",
        "pinyin": "Tā de chénmò biǎomíng tā bù tóngyì zhège jìhuà.",
        "english": "His silence indicates that he disagrees with this plan."
      }
    ]
  },
  {
    "hanzi": "表现",
    "pinyin": "biǎo xiàn",
    "english": "Verb: to show, to express, to display",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他在考试中的表现非常出色。",
        "pinyin": "Tā zài kǎoshì zhōng de biǎoxiàn fēicháng chūsè.",
        "english": "His performance in the exam was outstanding."
      }
    ]
  },
  {
    "hanzi": "标志",
    "pinyin": "biāo zhì",
    "english": "Noun: symbol, sign Verb: to symbolize, to indicate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个红色的圆圈是禁止停车的标志。",
        "pinyin": "Zhège hóngsè de yuánquān shì jìnzhǐ tíngchē de biāozhì.",
        "english": "This red circle is the sign for no parking."
      }
    ]
  },
  {
    "hanzi": "丙",
    "pinyin": "bǐng",
    "english": "Number: thirdly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的答案是丙。",
        "pinyin": "Tā de dá'àn shì Bǐng.",
        "english": "His answer is C (the third option)."
      }
    ]
  },
  {
    "hanzi": "病毒",
    "pinyin": "bìng dú",
    "english": "Noun: virus",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这种病毒传播得非常快。",
        "pinyin": "Zhè zhǒng bìngdú chuánbō dé fēicháng kuài.",
        "english": "This type of virus spreads very quickly."
      }
    ]
  },
  {
    "hanzi": "玻璃",
    "pinyin": "bō li",
    "english": "Noun: glass",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "小心，这块玻璃很锋利。",
        "pinyin": "Xiǎoxīn, zhè kuài bōli hěn fēnglì.",
        "english": "Be careful, this piece of glass is very sharp."
      }
    ]
  },
  {
    "hanzi": "博物馆",
    "pinyin": "bó wù guǎn",
    "english": "Noun: museum",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "每年我都会去一次历史博物馆。",
        "pinyin": "Měi nián wǒ dōu huì qù yī cì lìshǐ bówùguǎn.",
        "english": "I go to the history museum once every year."
      }
    ]
  },
  {
    "hanzi": "不安",
    "pinyin": "bù ān",
    "english": "Adjective: disturbed, uneasy",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "等待结果时，他感到十分不安。",
        "pinyin": "Děngdài jiéguǒ shí, tā gǎndào shífēn bù'ān.",
        "english": "While waiting for the results, he felt extremely uneasy."
      }
    ]
  },
  {
    "hanzi": "补充",
    "pinyin": "bǔ chōng",
    "english": "Noun: supplement Verb: to supplement, to complement Adjective: additional, supplementary",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我需要补充一些维生素C。",
        "pinyin": "Wǒ xūyào bǔchōng yīxiē wéishēngsù C.",
        "english": "I need to supplement some Vitamin C."
      }
    ]
  },
  {
    "hanzi": "不得了",
    "pinyin": "bù dé liǎo",
    "english": " Adjective: disastrous, terrible Adverb: extremely, terribly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "听到这个消息，他高兴得不得了。",
        "pinyin": "Tīng dào zhège xiāoxī, tā gāoxìng de bùdéliǎo.",
        "english": "Upon hearing this news, he was extremely happy."
      }
    ]
  },
  {
    "hanzi": "不断",
    "pinyin": "bú duàn",
    "english": "Adverb: continuous, unceasing",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "随着科技发展，生活水平不断提高。",
        "pinyin": "Suízhe kē jì fāzhǎn, shēnghuó shuǐpíng búduàn tígāo.",
        "english": "With the development of science and technology, living standards are constantly improving."
      }
    ]
  },
  {
    "hanzi": "不见得",
    "pinyin": "bú jiàn dé",
    "english": "Adverb: not necessarily, not likely",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "有钱人不见得都快乐。",
        "pinyin": "Yǒu qián rén bújiàndé dōu kuàilè.",
        "english": "Rich people are not necessarily all happy."
      }
    ]
  },
  {
    "hanzi": "部门",
    "pinyin": "bù mén",
    "english": "Noun: department, branch",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个部门负责处理客户投诉。",
        "pinyin": "Zhège bùmén fùzé chǔlǐ kèhù tóusù.",
        "english": "This department is responsible for handling customer complaints."
      }
    ]
  },
  {
    "hanzi": "不耐烦",
    "pinyin": "bú nài fán",
    "english": "Noun: impatience Adjective: impatient",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他说话很不耐烦。",
        "pinyin": "Tā shuō huà hěn bù nàifán.",
        "english": "He speaks impatiently."
      }
    ]
  },
  {
    "hanzi": "财产",
    "pinyin": "cái chǎn",
    "english": "Noun: property, possession",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们正在分割共同的财产。",
        "pinyin": "Tāmen zhèngzài fēngē gòngtóng de cáichǎn.",
        "english": "They are dividing their common assets."
      }
    ]
  },
  {
    "hanzi": "参考",
    "pinyin": "cān kǎo",
    "english": " Noun: consultation, reference Verb: to consult, to refer to",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "写作时，你可以参考这本书的观点。",
        "pinyin": "Xiězuò shí, nǐ kěyǐ cānkǎo zhè běn shū de guāndiǎn.",
        "english": "When writing, you can consult the views in this book."
      }
    ]
  },
  {
    "hanzi": "惭愧",
    "pinyin": "cán kuì",
    "english": "Adjective: ashamed",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "因为迟到，他感到非常惭愧。",
        "pinyin": "Yīnwèi chídào, tā gǎndào fēicháng cánkuì.",
        "english": "He felt very ashamed because he was late."
      }
    ]
  },
  {
    "hanzi": "餐厅",
    "pinyin": "cān tīng",
    "english": "Noun: restaurant",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "学校餐厅提供午餐。",
        "pinyin": "Xuéxiào cāntīng tígōng wǔcān.",
        "english": "The school cafeteria provides lunch."
      }
    ]
  },
  {
    "hanzi": "参与",
    "pinyin": "cān yù",
    "english": "Verb: to participate in, to attach oneself to",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "鼓励学生积极参与课堂讨论。",
        "pinyin": "Gǔlì xuéshēng jījí cānyù kètáng tǎolùn.",
        "english": "Encourage students to actively participate in class discussions."
      }
    ]
  },
  {
    "hanzi": "操场",
    "pinyin": "cāo chǎng",
    "english": "Noun: playground, sports field",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们在操场上跑步。",
        "pinyin": "Wǒmen zài cāochǎng shang pǎobù.",
        "english": "We are running on the sports field."
      }
    ]
  },
  {
    "hanzi": "操心",
    "pinyin": "cāo xīn",
    "english": "Verb: to worry about, to take pains",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这件事你不用操心了。",
        "pinyin": "Zhè jiàn shì nǐ bú yòng cāoxīn le.",
        "english": "You don't need to worry about this matter anymore."
      }
    ]
  },
  {
    "hanzi": "厕所",
    "pinyin": "cè suǒ",
    "english": "Noun: toilet",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "厕所往左拐就到了。",
        "pinyin": "Cèsuǒ wǎng zuǒ guǎi jiù dào le.",
        "english": "The restroom is just around the corner to the left."
      }
    ]
  },
  {
    "hanzi": "测验",
    "pinyin": "cè yàn",
    "english": " Noun: test, examination Verb: to test",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "明天有一个数学测验。",
        "pinyin": "Míngtiān yǒu yīgè shùxué cèyàn.",
        "english": "There is a math quiz tomorrow."
      }
    ]
  },
  {
    "hanzi": "曾经",
    "pinyin": "céng jīng",
    "english": "Adverb: once, former, previously",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我曾经见过他一面。",
        "pinyin": "Wǒ céngjīng jiànguò tā yī miàn.",
        "english": "I once met him."
      }
    ]
  },
  {
    "hanzi": "插",
    "pinyin": "chā",
    "english": "Verb: to insert, to stick in",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请把花插到瓶子里。",
        "pinyin": "Qǐng bǎ huā chā dào píngzi lǐ.",
        "english": "Please put the flowers into the vase."
      }
    ]
  },
  {
    "hanzi": "差别",
    "pinyin": "chā bié",
    "english": "Noun: difference",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这两者之间没有太大差别。",
        "pinyin": "Zhè liǎng zhě zhī jiān méiyǒu tài dà chābié.",
        "english": "There is not much difference between these two."
      }
    ]
  },
  {
    "hanzi": "拆",
    "pinyin": "chāi",
    "english": "Verb: open, tear down",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "房子要拆了，请搬出去。",
        "pinyin": "Fángzi yào chāi le, qǐng bān chūqù.",
        "english": "The house is going to be torn down, please move out."
      }
    ]
  },
  {
    "hanzi": "产品",
    "pinyin": "chǎn pǐn",
    "english": "Noun: product, goods",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这种产品质量很好。",
        "pinyin": "Zhè zhǒng chǎnpǐn zhìliàng hěn hǎo.",
        "english": "The quality of this product is very good."
      }
    ]
  },
  {
    "hanzi": "产生",
    "pinyin": "chǎn shēng",
    "english": "Verb: to produce, to come about",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个问题会产生严重的后果。",
        "pinyin": "Zhè ge wèntí huì chǎnshēng yánzhòng de hòuguǒ.",
        "english": "This problem will cause serious consequences."
      }
    ]
  },
  {
    "hanzi": "常识",
    "pinyin": "cháng shí",
    "english": "Noun: common sense, general knowledge",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一个基本的常识。",
        "pinyin": "Zhè shì yīgè jīběn de chángshí.",
        "english": "This is a piece of basic common sense."
      }
    ]
  },
  {
    "hanzi": "长途",
    "pinyin": "cháng tú",
    "english": "Noun: long distance",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我不喜欢坐长途火车。",
        "pinyin": "Wǒ bù xǐhuān zuò chángtú huǒchē.",
        "english": "I don't like taking long-distance trains."
      }
    ]
  },
  {
    "hanzi": "朝",
    "pinyin": "cháo",
    "english": " Noun: dynasty, imperial or royal court Relative Clause: towards, facing",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的窗户朝南开。",
        "pinyin": "Tā de chuānghu cháo nán kāi.",
        "english": "His window faces south."
      }
    ]
  },
  {
    "hanzi": "炒",
    "pinyin": "chǎo",
    "english": "Verb: to fry",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我今晚想吃炒饭。",
        "pinyin": "Wǒ jīn wǎn xiǎng chī chǎofàn.",
        "english": "I want to eat fried rice tonight."
      }
    ]
  },
  {
    "hanzi": "抄",
    "pinyin": "chāo",
    "english": "Verb: to copy, to plagiarize",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请不要抄袭别人的作业。",
        "pinyin": "Qǐng búyào chāoxí biérén de zuòyè.",
        "english": "Please do not plagiarize others' homework."
      }
    ]
  },
  {
    "hanzi": "彻底",
    "pinyin": "chè dǐ",
    "english": "Adjective: thorough",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他彻底忘记了这件事。",
        "pinyin": "Tā chèdǐ wàngjì le zhè jiàn shì.",
        "english": "He completely forgot this matter."
      }
    ]
  },
  {
    "hanzi": "车库",
    "pinyin": "chē kù",
    "english": "Noun: garage",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "车库里停了两辆车。",
        "pinyin": "Chēkù lǐ tíng le liǎng liàng chē.",
        "english": "Two cars are parked in the garage."
      }
    ]
  },
  {
    "hanzi": "趁",
    "pinyin": "chèn",
    "english": "Verb: to take advantage of",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "趁热吃，不然就凉了。",
        "pinyin": "Chèn rè chī, bùrán jiù liáng le.",
        "english": "Eat it while it's hot, otherwise it will get cold."
      }
    ]
  },
  {
    "hanzi": "沉默",
    "pinyin": "chén mò",
    "english": " Noun: silence, hush Verb: to keep silent Adjective: silent, uncommunicative",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "听到这个消息后，大家都沉默了。",
        "pinyin": "Tīngdào zhège xiāoxī hòu, dàjiā dōu chénmò le.",
        "english": "After hearing this news, everyone fell silent."
      }
    ]
  },
  {
    "hanzi": "乘",
    "pinyin": "chéng",
    "english": "Verb: to ride on, to multiply",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "每天早上我乘地铁去上班。",
        "pinyin": "Měitiān zǎoshang wǒ chéng dìtiě qù shàngbān.",
        "english": "Every morning I take the subway to work."
      }
    ]
  },
  {
    "hanzi": "称",
    "pinyin": "chēng",
    "english": "Verb: to weigh, to name, to state",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们都称她为王老师。",
        "pinyin": "Wǒmen dōu chēng tā wèi Wáng lǎoshī.",
        "english": "We all call her Teacher Wang."
      }
    ]
  },
  {
    "hanzi": "承担",
    "pinyin": "chéng dān",
    "english": "Verb: to undertake, to shoulder, to take responsibility, etc.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他必须承担这次失败的责任。",
        "pinyin": "Tā bìxū chéngdān zhè cì shībài de zérèn.",
        "english": "He must bear the responsibility for this failure."
      }
    ]
  },
  {
    "hanzi": "程度",
    "pinyin": "chéng dù",
    "english": "Noun: degree, extent, level",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个问题复杂到什么程度？",
        "pinyin": "Zhè ge wèntí fùzá dào shénme chéngdù?",
        "english": "To what extent is this problem complex?"
      }
    ]
  },
  {
    "hanzi": "诚恳",
    "pinyin": "chéng kěn",
    "english": "Adjective: sincere, honest",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他说话总是很诚恳。",
        "pinyin": "Tā shuōhuà zǒngshì hěn chéngkěn.",
        "english": "He always speaks very sincerely."
      }
    ]
  },
  {
    "hanzi": "承认",
    "pinyin": "chéng rèn",
    "english": " Noun: recognition Verb: to admit, to recognize, to acknowledge",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他承认自己犯了一个错误。",
        "pinyin": "Tā chéngrèn zìjǐ fànle yīgè cuòwù.",
        "english": "He admitted that he made a mistake."
      }
    ]
  },
  {
    "hanzi": "程序",
    "pinyin": "chéng xù",
    "english": "Noun: procedure, process, program IT",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请按照这个程序操作。",
        "pinyin": "Qǐng ànzhào zhè ge chéngxù cāozuò.",
        "english": "Please operate according to this procedure."
      }
    ]
  },
  {
    "hanzi": "称赞",
    "pinyin": "chēng zàn",
    "english": "Verb: to praise, to acclaim, to commend",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "老师称赞他的画画得很好。",
        "pinyin": "Lǎoshī chēngzàn tā de huà huà de hěn hǎo.",
        "english": "The teacher praised his painting as being very good."
      }
    ]
  },
  {
    "hanzi": "吃亏",
    "pinyin": "chī kuī",
    "english": "Verb: to suffer losses, to lose out",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "做生意不能总怕吃亏。",
        "pinyin": "Zuò shēngyì bù néng zǒng pà chīkuī.",
        "english": "When doing business, you can't always be afraid of suffering losses."
      }
    ]
  },
  {
    "hanzi": "持续",
    "pinyin": "chí xù",
    "english": "Verb: to continue, to persist",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这场雨持续了三天。",
        "pinyin": "Zhè chǎng yǔ chíxù le sān tiān.",
        "english": "This rain lasted for three days."
      }
    ]
  },
  {
    "hanzi": "尺子",
    "pinyin": "chǐ zi",
    "english": "Noun: ruler",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你能把尺子借我用一下吗？",
        "pinyin": "Nǐ néng bǎ chǐzi jiè wǒ yòng yīxià ma?",
        "english": "Can you lend me your ruler for a moment?"
      }
    ]
  },
  {
    "hanzi": "冲",
    "pinyin": "chōng",
    "english": "Verb: to flush, to head for",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请把咖啡用热水冲开。",
        "pinyin": "Qǐng bǎ kāfēi yòng rè shuǐ chōng kāi.",
        "english": "Please mix the coffee using hot water (brew the coffee)."
      }
    ]
  },
  {
    "hanzi": "充分",
    "pinyin": "chōng fèn",
    "english": "Adjective: ample, full, abundant",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们需要充分的准备时间。",
        "pinyin": "Wǒmen xūyào chōngfèn de zhǔnbèi shíjiān.",
        "english": "We need ample preparation time."
      }
    ]
  },
  {
    "hanzi": "重复",
    "pinyin": "chóng fù",
    "english": "Verb: to repeat, to duplicate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请不要重复刚才说的话。",
        "pinyin": "Qǐng bù yào chóngfù gāngcái shuō de huà.",
        "english": "Please do not repeat what you just said."
      }
    ]
  },
  {
    "hanzi": "充满",
    "pinyin": "chōng mǎn",
    "english": "Verb: brimming with, full of",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的脸上充满自信。",
        "pinyin": "Tā de liǎn shang chōngmǎn zìxìn.",
        "english": "His face is full of confidence."
      }
    ]
  },
  {
    "hanzi": "宠物",
    "pinyin": "chǒng wù",
    "english": "Noun: pet",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她养了一只可爱的宠物狗。",
        "pinyin": "Tā yǎng le yī zhī kě'ài de chǒngwù gǒu.",
        "english": "She keeps a lovely pet dog."
      }
    ]
  },
  {
    "hanzi": "臭",
    "pinyin": "chòu",
    "english": "Adjective: smelly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "那个垃圾桶的味道很臭。",
        "pinyin": "Nà ge lèsè tǒng de wèidào hěn chòu.",
        "english": "The smell of that trash can is very foul (smelly)."
      }
    ]
  },
  {
    "hanzi": "丑",
    "pinyin": "chǒu",
    "english": " Noun: clown Adjective: ugly, bad-looking",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这种颜色搭配起来太丑了。",
        "pinyin": "Zhè zhǒng yánsè dāpèi qǐlai tài chǒu le.",
        "english": "This color combination looks too ugly."
      }
    ]
  },
  {
    "hanzi": "抽屉",
    "pinyin": "chōu ti",
    "english": "Noun: drawer",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "把这些文件放在第一个抽屉里。",
        "pinyin": "Bǎ zhè xiē wénjiàn fàng zài dì yī ge chōutì lǐ.",
        "english": "Put these documents in the first drawer."
      }
    ]
  },
  {
    "hanzi": "抽象",
    "pinyin": "chōu xiàng",
    "english": "Adjective: abstract",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "哲学是一个很抽象的领域。",
        "pinyin": "Zhéxué shì yī ge hěn chōuxiàng de lǐngyù.",
        "english": "Philosophy is a very abstract field."
      }
    ]
  },
  {
    "hanzi": "出版",
    "pinyin": "chū bǎn",
    "english": "Verb: to publish",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这本书去年出版了。",
        "pinyin": "Zhè běn shū qùnián chūbǎn le.",
        "english": "This book was published last year."
      }
    ]
  },
  {
    "hanzi": "除非",
    "pinyin": "chú fēi",
    "english": "Conjunction: only if, unless",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "除非下雨，我们才取消野餐。",
        "pinyin": "Chúfēi xià yǔ, wǒmen cái qǔxiāo yěcān.",
        "english": "We will only cancel the picnic if it rains."
      }
    ]
  },
  {
    "hanzi": "出口",
    "pinyin": "chū kǒu",
    "english": "Noun: exit, export",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请问安全出口在哪里？",
        "pinyin": "Qǐngwèn ānquán chūkǒu zài nǎli?",
        "english": "Excuse me, where is the safety exit?"
      }
    ]
  },
  {
    "hanzi": "处理",
    "pinyin": "chǔ lǐ",
    "english": "Verb: to deal with, to handle, to cope with",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个问题应该怎么处理？",
        "pinyin": "Zhè ge wèntí yīnggāi zěnme chǔlǐ?",
        "english": "How should this problem be handled?"
      }
    ]
  },
  {
    "hanzi": "出色",
    "pinyin": "chū sè",
    "english": "Adjective: outstanding, remarkable",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的工作表现非常出色。",
        "pinyin": "Tā de gōngzuò biǎoxiàn fēicháng chūsè.",
        "english": "His work performance is outstanding."
      }
    ]
  },
  {
    "hanzi": "传说",
    "pinyin": "chuán shuō",
    "english": " Noun: legend, folklore Verb: it is said, that…",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个村子流传着一个古老的传说。",
        "pinyin": "Zhè ge cūnzi liúchuánzhe yī ge gǔlǎo de chuánshuō.",
        "english": "An ancient legend circulates in this village."
      }
    ]
  },
  {
    "hanzi": "传统",
    "pinyin": "chuán tǒng",
    "english": "Noun: tradition Adjective: traditional",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "春节是中国最重要的传统节日。",
        "pinyin": "Chūnjié shì Zhōngguó zuì zhòngyào de chuántǒng jiérì.",
        "english": "The Spring Festival is China's most important traditional holiday."
      }
    ]
  },
  {
    "hanzi": "闯",
    "pinyin": "chuǎng",
    "english": "Verb: to rush, to break through, to charge",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他闯进了会议室。",
        "pinyin": "Tā chuǎng jìnle huìyìshì.",
        "english": "He barged into the conference room."
      }
    ]
  },
  {
    "hanzi": "窗帘",
    "pinyin": "chuāng lián",
    "english": "Noun: window curtains",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请帮我把窗帘拉上。",
        "pinyin": "Qǐng bāng wǒ bǎ chuānglián lā shàng.",
        "english": "Please help me draw the curtains."
      }
    ]
  },
  {
    "hanzi": "创造",
    "pinyin": "chuàng zào",
    "english": " Noun: creation Verb: to create, to produce",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们要创造更好的未来。",
        "pinyin": "Wǒmen yào chuàngzào gèng hǎo de wèilái.",
        "english": "We must create a better future."
      }
    ]
  },
  {
    "hanzi": "吹",
    "pinyin": "chuī",
    "english": "Verb: to blow, to boast, to fail",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你能把气球吹起来吗？",
        "pinyin": "Nǐ néng bǎ qìqiú chuī qǐlái ma?",
        "english": "Can you blow up the balloon?"
      }
    ]
  },
  {
    "hanzi": "刺激",
    "pinyin": "cì jī",
    "english": " Noun: stimulus, provocation Verb: to provoke, to stimulate, to excite",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这部电影的场面很刺激。",
        "pinyin": "Zhè bù diànyǐng de chǎngmiàn hěn cìjī.",
        "english": "The scenes in this movie are very exciting (stimulating)."
      }
    ]
  },
  {
    "hanzi": "此外",
    "pinyin": "cǐ wài",
    "english": "Conjunction: besides, moreover",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的工作能力强，此外人品也很好。",
        "pinyin": "Tā de gōngzuò nénglì qiáng, cǐwài rénpǐn yě hěn hǎo.",
        "english": "His work ability is strong; besides, his character is also very good."
      }
    ]
  },
  {
    "hanzi": "次要",
    "pinyin": "cì yào",
    "english": "Adjective: secondary, subordinate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这件事是次要的，我们先处理主要问题。",
        "pinyin": "Zhè jiàn shì shì cìyào de, wǒmen xiān chǔlǐ zhǔyào wèntí.",
        "english": "This matter is secondary; let's deal with the main problem first."
      }
    ]
  },
  {
    "hanzi": "辞职",
    "pinyin": "cí zhí",
    "english": "Verb: to resign",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她决定下个月辞职。",
        "pinyin": "Tā juédìng xià gè yuè cízhí.",
        "english": "She decided to resign next month."
      }
    ]
  },
  {
    "hanzi": "从而",
    "pinyin": "cóng ér",
    "english": "Conjunction: thus, thereby",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他努力学习，从而通过了考试。",
        "pinyin": "Tā nǔlì xuéxí, cóng'ér tōngguòle kǎoshì.",
        "english": "He studied hard, thereby passing the exam."
      }
    ]
  },
  {
    "hanzi": "从前",
    "pinyin": "cóng qián",
    "english": "Time: previously, formerly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "从前这里是一个小渔村。",
        "pinyin": "Cóngqián zhèlǐ shì yī gè xiǎo yú cūn.",
        "english": "This used to be a small fishing village."
      }
    ]
  },
  {
    "hanzi": "从事",
    "pinyin": "cóng shì",
    "english": "Verb: to engage in, to do formal",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她从事教育工作十年了。",
        "pinyin": "Tā cóngshì jiàoyù gōngzuò shí nián le.",
        "english": "She has been engaged in education work for ten years."
      }
    ]
  },
  {
    "hanzi": "醋",
    "pinyin": "cù",
    "english": "Noun: vinegar",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "吃饺子时，我喜欢蘸点醋。",
        "pinyin": "Chī jiǎozi shí, wǒ xǐhuān zhàn diǎn cù.",
        "english": "When eating dumplings, I like to dip them in some vinegar."
      }
    ]
  },
  {
    "hanzi": "促进",
    "pinyin": "cù jìn",
    "english": "Verb: to promote, to advance",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这项政策有助于促进经济发展。",
        "pinyin": "Zhè xiàng zhèngcè yǒu zhù yú cùjìn jīngjì fāzhǎn.",
        "english": "This policy helps promote economic development."
      }
    ]
  },
  {
    "hanzi": "促使",
    "pinyin": "cù shǐ",
    "english": "Verb: to urge, to push, to promote",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "压力促使他更快地做出决定。",
        "pinyin": "Yālì cùshǐ tā gèng kuài de zuò chū juédìng.",
        "english": "Pressure prompted him to make a decision faster."
      }
    ]
  },
  {
    "hanzi": "催",
    "pinyin": "cuī",
    "english": "Verb: to urge, to press",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "妈妈催我快点起床。",
        "pinyin": "Māma cuī wǒ kuài diǎn qǐchuáng.",
        "english": "Mom urged me to get up quickly."
      }
    ]
  },
  {
    "hanzi": "存在",
    "pinyin": "cún zài",
    "english": "Verb: to exist",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们必须承认问题的存在。",
        "pinyin": "Wǒmen bìxū chéngrèn wèntí de cúnzài.",
        "english": "We must acknowledge the existence of the problem."
      }
    ]
  },
  {
    "hanzi": "错误",
    "pinyin": "cuò wù",
    "english": "Noun: error, mistake",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个计算结果是错误的。",
        "pinyin": "Zhè gè jìsuàn jiéguǒ shì cuòwù de.",
        "english": "This calculation result is incorrect."
      }
    ]
  },
  {
    "hanzi": "达到",
    "pinyin": "dá dào",
    "english": "Verb: to achieve, to reach, to attain",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他终于达到了自己的目标。",
        "pinyin": "Tā zhōngyú dádào le zìjǐ de mùbiāo.",
        "english": "He finally achieved his own goal."
      }
    ]
  },
  {
    "hanzi": "大方",
    "pinyin": "dà fang",
    "english": "Adjective: generous, of good taste",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他请客总是很大方。",
        "pinyin": "Tā qǐng kè zǒng shì hěn dàfang.",
        "english": "He is always very generous when treating people."
      }
    ]
  },
  {
    "hanzi": "打工",
    "pinyin": "dǎ gōng",
    "english": "Noun: a part time job Verb: to work temporary or casual",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他暑假在咖啡店打工。",
        "pinyin": "Tā shǔjià zài kāfēi diàn dǎgōng.",
        "english": "He works part-time at a coffee shop during the summer vacation."
      }
    ]
  },
  {
    "hanzi": "大型",
    "pinyin": "dà xíng",
    "english": "Adjective: large-scale",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这次活动是一个大型的会议。",
        "pinyin": "Zhè cì huódòng shì yī gè dàxíng de huìyì.",
        "english": "This event is a large-scale conference."
      }
    ]
  },
  {
    "hanzi": "答应",
    "pinyin": "dā ying",
    "english": "Verb: to agree, to promise, to respond",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他答应了明天帮我的忙。",
        "pinyin": "Tā dāying le míngtiān bāng wǒ de máng.",
        "english": "He promised to help me tomorrow."
      }
    ]
  },
  {
    "hanzi": "打招呼",
    "pinyin": "dǎ zhāo hu",
    "english": "Verb: to greet sbd., to give prior notice",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "见到老师要主动打招呼。",
        "pinyin": "Jiàndào lǎoshī yào zhǔdòng dǎ zhāohu.",
        "english": "When you see a teacher, you should proactively greet them."
      }
    ]
  },
  {
    "hanzi": "呆",
    "pinyin": "dāi",
    "english": " Verb: to stay Adjective: dull, foolish, stupid",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我打算在北京多呆几天。",
        "pinyin": "Wǒ dǎsuàn zài Běijīng duō dāi jǐ tiān.",
        "english": "I plan to stay in Beijing for a few more days."
      }
    ]
  },
  {
    "hanzi": "贷款",
    "pinyin": "dài kuǎn",
    "english": "Noun: loan Verb: to provide a loan",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "银行批准了我的购房贷款。",
        "pinyin": "Yínháng pīzhǔn le wǒ de gòufáng dàikuǎn.",
        "english": "The bank approved my housing loan."
      }
    ]
  },
  {
    "hanzi": "待遇",
    "pinyin": "dài yù",
    "english": "Noun: treatment, pay, salary",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这家公司的待遇很好。",
        "pinyin": "Zhè jiā gōngsī de dàiyù hěn hǎo.",
        "english": "The benefits at this company are very good."
      }
    ]
  },
  {
    "hanzi": "淡",
    "pinyin": "dàn",
    "english": "Adjective: mild, rather tasteless, light in color",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这汤的味道有点淡。",
        "pinyin": "Zhè tāng de wèidào yǒudiǎn dàn.",
        "english": "The taste of this soup is a bit light (bland)."
      }
    ]
  },
  {
    "hanzi": "单纯",
    "pinyin": "dān chún",
    "english": "Adjective: pure, simple",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的想法很单纯。",
        "pinyin": "Tā de xiǎngfǎ hěn dānchún.",
        "english": "His thoughts are very simple/pure."
      }
    ]
  },
  {
    "hanzi": "单调",
    "pinyin": "dān diào",
    "english": "Adjective: monotonous, dull",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这种生活太单调了。",
        "pinyin": "Zhè zhǒng shēnghuó tài dāndiào le.",
        "english": "This kind of life is too monotonous."
      }
    ]
  },
  {
    "hanzi": "单独",
    "pinyin": "dān dú",
    "english": "Adjective: alone, solo",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我想单独跟你谈谈。",
        "pinyin": "Wǒ xiǎng dāndú gēn nǐ tántan.",
        "english": "I want to talk to you alone."
      }
    ]
  },
  {
    "hanzi": "担任",
    "pinyin": "dān rèn",
    "english": "Verb: to hold the post of, to serve as",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他将担任项目经理。",
        "pinyin": "Tā jiāng dānrèn xiàngmù jīnglǐ.",
        "english": "He will assume the role of project manager."
      }
    ]
  },
  {
    "hanzi": "单位",
    "pinyin": "dān wèi",
    "english": "Noun: unit",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你的工作单位在哪里？",
        "pinyin": "Nǐ de gōngzuò dānwèi zài nǎlǐ?",
        "english": "Where is your workplace (work unit)?"
      }
    ]
  },
  {
    "hanzi": "胆小鬼",
    "pinyin": "dǎn xiǎo guǐ",
    "english": "Noun: coward",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "别当个胆小鬼，勇敢一点！",
        "pinyin": "Bié dāng ge dǎnxiǎoguǐ, yǒnggǎn yīdiǎn!",
        "english": "Don't be a coward, be a little brave!"
      }
    ]
  },
  {
    "hanzi": "挡",
    "pinyin": "dǎng",
    "english": "Verb: to block, to hinder, to obstruct",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "树挡住了路。",
        "pinyin": "Shù dǎng zhù le lù.",
        "english": "The tree blocked the road."
      }
    ]
  },
  {
    "hanzi": "倒",
    "pinyin": "dào",
    "english": "Verb: to pour, to reverse Adverb: on the contrary, instead",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请给我倒一杯水。",
        "pinyin": "Qǐng gěi wǒ dào yī bēi shuǐ.",
        "english": "Please pour me a glass of water."
      }
    ]
  },
  {
    "hanzi": "岛",
    "pinyin": "dǎo",
    "english": "Noun: island",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "那个岛很美丽。",
        "pinyin": "Nàge dǎo hěn měilì.",
        "english": "That island is very beautiful."
      }
    ]
  },
  {
    "hanzi": "倒霉",
    "pinyin": "dǎo méi",
    "english": "Verb: to have bad luck",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "今天真倒霉，手机丢了。",
        "pinyin": "Jīntiān zhēn dǎoméi, shǒujī diū le.",
        "english": "What bad luck today, I lost my phone."
      }
    ]
  },
  {
    "hanzi": "导致",
    "pinyin": "dǎo zhì",
    "english": "Verb: to lead to, to create, to bring about",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "粗心导致了这次错误。",
        "pinyin": "Cūxīn dǎozhì le zhè cì cuòwù.",
        "english": "Carelessness led to this mistake."
      }
    ]
  },
  {
    "hanzi": "等待",
    "pinyin": "děng dài",
    "english": "Verb: to wait for, to await",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们正在等待他的回复。",
        "pinyin": "Wǒmen zhèngzài děngdài tā de huífù.",
        "english": "We are waiting for his reply."
      }
    ]
  },
  {
    "hanzi": "登记",
    "pinyin": "dēng jì",
    "english": "Verb: to register",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请先在这里登记你的信息。",
        "pinyin": "Qǐng xiān zài zhèlǐ dēngjì nǐ de xìnxī.",
        "english": "Please register your information here first."
      }
    ]
  },
  {
    "hanzi": "登机牌",
    "pinyin": "dēng jī pái",
    "english": "Noun: boarding pass",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请出示您的登机牌。",
        "pinyin": "Qǐng chūshì nín de dēngjīpái.",
        "english": "Please show your boarding pass."
      }
    ]
  },
  {
    "hanzi": "递",
    "pinyin": "dì",
    "english": "Verb: to pass, to hand over",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请把那本书递给我。",
        "pinyin": "Qǐng bǎ nà běn shū dì gěi wǒ.",
        "english": "Please hand that book to me."
      }
    ]
  },
  {
    "hanzi": "滴",
    "pinyin": "dī",
    "english": " Verb: to drip, to drop Measure Word: for a drop",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "水龙头在滴水。",
        "pinyin": "Shuǐlóngtóu zài dī shuǐ.",
        "english": "The faucet is dripping water."
      }
    ]
  },
  {
    "hanzi": "地道",
    "pinyin": "dì dao",
    "english": "Adjective: authentic, genuine, real",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这家餐馆的菜很地道。",
        "pinyin": "Zhè jiā cānguǎn de cài hěn dìdao.",
        "english": "The food at this restaurant is very authentic."
      }
    ]
  },
  {
    "hanzi": "地理",
    "pinyin": "dì lǐ",
    "english": "Noun: geography",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我对地理课很感兴趣。",
        "pinyin": "Wǒ duì dìlǐ kè hěn gǎnxìngqù.",
        "english": "I am very interested in geography class."
      }
    ]
  },
  {
    "hanzi": "的确",
    "pinyin": "dí què",
    "english": "Adverb: really, indeed",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你的建议的确很有用。",
        "pinyin": "Nǐ de jiànyì díquè hěn yǒuyòng.",
        "english": "Your suggestion is indeed very useful."
      }
    ]
  },
  {
    "hanzi": "敌人",
    "pinyin": "dí rén",
    "english": "Noun: enemy",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们必须面对强大的敌人。",
        "pinyin": "Wǒmen bìxū miànduì qiángdà de dírén.",
        "english": "We must face a powerful enemy."
      }
    ]
  },
  {
    "hanzi": "地位",
    "pinyin": "dì wèi",
    "english": "Noun: position, status",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他在公司里的地位很高。",
        "pinyin": "Tā zài gōngsī lǐ de dìwèi hěn gāo.",
        "english": "His position/status in the company is high."
      }
    ]
  },
  {
    "hanzi": "电池",
    "pinyin": "diàn chí",
    "english": "Noun: battery, electric cell",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个遥控器需要换新电池了。",
        "pinyin": "Zhège yáokòngqì xūyào huàn xīn diànchí le.",
        "english": "This remote control needs a new battery."
      }
    ]
  },
  {
    "hanzi": "电台",
    "pinyin": "diàn tái",
    "english": "Noun: broadcasting station, radio station",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "很多司机喜欢听电台广播。",
        "pinyin": "Hěn duō sījī xǐhuān tīng diàntái guǎngbō.",
        "english": "Many drivers like listening to radio broadcasts."
      }
    ]
  },
  {
    "hanzi": "点心",
    "pinyin": "diǎn xin",
    "english": "Noun: light refreshments, Dimsum Cantonese",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "下午茶时间，我们吃点心。",
        "pinyin": "Xiàwǔ chá shíjiān, wǒmen chī diǎnxīn.",
        "english": "We eat snacks during afternoon tea time."
      }
    ]
  },
  {
    "hanzi": "钓",
    "pinyin": "diào",
    "english": "Verb: to fish",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "爸爸周末喜欢去河边钓鱼。",
        "pinyin": "Bàba zhōumò xǐhuān qù hé biān diào yú.",
        "english": "Dad likes to go fishing by the river on weekends."
      }
    ]
  },
  {
    "hanzi": "顶",
    "pinyin": "dǐng",
    "english": " Noun: top, roof Verb: to carry on the head Adverb: most, extremely, highly Measure Word: for caps, hats, tents, etc.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她头顶着一本书走路。",
        "pinyin": "Tā tóu dǐng zhe yī běn shū zǒulù.",
        "english": "She walked with a book balanced on her head."
      }
    ]
  },
  {
    "hanzi": "丁",
    "pinyin": "dīng",
    "english": "Number: fourth",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "丁医生今天休息。",
        "pinyin": "Dīng yīshēng jīntiān xiūxi.",
        "english": "Doctor Ding is off today."
      }
    ]
  },
  {
    "hanzi": "逗",
    "pinyin": "dòu",
    "english": "Verb: to stay, to pause, to tease",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "那只小狗的行为很逗人。",
        "pinyin": "Nà zhǐ xiǎogǒu de xíngwéi hěn dòurén.",
        "english": "That puppy's behavior is very amusing."
      }
    ]
  },
  {
    "hanzi": "豆腐",
    "pinyin": "dòu fu",
    "english": "Noun: tofu",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "妈妈经常用豆腐做菜。",
        "pinyin": "Māma jīngcháng yòng dòufu zuò cài.",
        "english": "Mom often cooks dishes using tofu."
      }
    ]
  },
  {
    "hanzi": "度过",
    "pinyin": "dù guò",
    "english": "Verb: to spend, to pass",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们在海边度过了愉快的周末。",
        "pinyin": "Wǒmen zài hǎibiān dùguò le yúkuài de zhōumò.",
        "english": "We spent a pleasant weekend by the sea."
      }
    ]
  },
  {
    "hanzi": "独立",
    "pinyin": "dú lì",
    "english": "Noun: independence Verb: to stand alone Adjective: independent",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她大学毕业后就经济独立了。",
        "pinyin": "Tā dàxué bìyè hòu jiù jīngjì dúlì le.",
        "english": "She became financially independent after graduating from university."
      }
    ]
  },
  {
    "hanzi": "独特",
    "pinyin": "dú tè",
    "english": "Adjective: unique, distinct",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的设计风格非常独特。",
        "pinyin": "Tā de shèjì fēnggé fēicháng dútè.",
        "english": "His design style is very unique."
      }
    ]
  },
  {
    "hanzi": "短信",
    "pinyin": "duǎn xìn",
    "english": "Noun: text message",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我给你发短信了。",
        "pinyin": "Wǒ gěi nǐ fā duǎnxìn le.",
        "english": "I sent you a text."
      }
    ]
  },
  {
    "hanzi": "对比",
    "pinyin": "duì bǐ",
    "english": " Noun: contrast, comparison Verb: to contrast, to compare",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们应该对比两种方案的优缺点。",
        "pinyin": "Wǒmen yīnggāi duìbǐ liǎng zhǒng fāng'àn de yōu quēdiǎn.",
        "english": "We should compare the advantages and disadvantages of the two proposals."
      }
    ]
  },
  {
    "hanzi": "对待",
    "pinyin": "duì dài",
    "english": " Noun: treatment Verb: to treat, to approach",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们应该平等对待每个人。",
        "pinyin": "Wǒmen yīnggāi píngděng duìdài měi gè rén.",
        "english": "We should treat everyone equally."
      }
    ]
  },
  {
    "hanzi": "对象",
    "pinyin": "duì xiàng",
    "english": "Noun: lover, partner, target, object",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的新对象非常善良。",
        "pinyin": "Tā de xīn duìxiàng fēicháng shànliáng.",
        "english": "His new partner (boyfriend/girlfriend) is very kind."
      }
    ]
  },
  {
    "hanzi": "对于",
    "pinyin": "duì yú",
    "english": "Pronoun: regarding, as far as sth. is concerned",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "对于这个问题，你怎么看？",
        "pinyin": "Duìyú zhè ge wèntí, nǐ zěnme kàn?",
        "english": "Regarding this question, what is your view?"
      }
    ]
  },
  {
    "hanzi": "吨",
    "pinyin": "dūn",
    "english": "Measure Word: for a ton",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这艘船能装载五百吨货物。",
        "pinyin": "Zhè sōu chuán néng zhuāngzài wǔbǎi dūn huòwù.",
        "english": "This ship can carry five hundred tons of goods."
      }
    ]
  },
  {
    "hanzi": "蹲",
    "pinyin": "dūn",
    "english": "Verb: to squat",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "休息时他喜欢蹲在地上。",
        "pinyin": "Xiūxi shí tā xǐhuān dūn zài dìshàng.",
        "english": "He likes to squat on the ground when resting."
      }
    ]
  },
  {
    "hanzi": "躲藏",
    "pinyin": "duǒ cáng",
    "english": "Verb: to hide oneself",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "孩子们喜欢玩捉迷藏，互相躲藏。",
        "pinyin": "Háizi men xǐhuān wán zhuōmícáng, hùxiāng duǒcáng.",
        "english": "Children like to play hide-and-seek, hiding from each other."
      }
    ]
  },
  {
    "hanzi": "多亏",
    "pinyin": "duō kuī",
    "english": "Adverb: luckily, thanks to",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "多亏你的帮忙，我才能完成任务。",
        "pinyin": "Duōkuī nǐ de bāngmáng, wǒ cái néng wánchéng rènwù.",
        "english": "Thanks to your help, I was able to complete the task."
      }
    ]
  },
  {
    "hanzi": "多余",
    "pinyin": "duō yú",
    "english": "Adjective: unnecessary, surplus, needless",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这些信息是多余的，可以删除。",
        "pinyin": "Zhèxiē xìnxī shì duōyú de, kěyǐ shānchú.",
        "english": "This information is redundant and can be deleted."
      }
    ]
  },
  {
    "hanzi": "恶劣",
    "pinyin": "è liè",
    "english": "Adjective: very bad, vile, disgusting",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "恶劣的天气影响了飞行计划。",
        "pinyin": "Èliè de tiānqì yǐngxiǎng le fēixíng jìhuà.",
        "english": "The terrible weather affected the flight plan."
      }
    ]
  },
  {
    "hanzi": "发达",
    "pinyin": "fā dá",
    "english": " Verb: to develop Adjective: developed country, etc.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "中国经济很发达。",
        "pinyin": "Zhōngguó jīngjì hěn fādá.",
        "english": "China’s economy is developed."
      }
    ]
  },
  {
    "hanzi": "发挥",
    "pinyin": "fā huī",
    "english": "Verb: to develop skill, ability, idea, etc., to give play to",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你要充分发挥自己的能力。",
        "pinyin": "Nǐ yào chōngfèn fāhuī zìjǐ de nénglì.",
        "english": "You must fully utilize your own abilities."
      }
    ]
  },
  {
    "hanzi": "罚款",
    "pinyin": "fá kuǎn",
    "english": " Noun: fine, penalty Verb: to fine",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "违反交通规则会被罚款。",
        "pinyin": "Wéifǎn jiāotōng guīzé huì bèi fákuǎn.",
        "english": "Violating traffic rules will result in a fine."
      }
    ]
  },
  {
    "hanzi": "翻",
    "pinyin": "fān",
    "english": "Verb: to turn over, to flip over",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请把书翻到第三页。",
        "pinyin": "Qǐng bǎ shū fān dào dì sān yè.",
        "english": "Please turn the book to page three."
      }
    ]
  },
  {
    "hanzi": "繁荣",
    "pinyin": "fán róng",
    "english": "Adjective: flourishing, prosperous, booming",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们希望国家经济繁荣发展。",
        "pinyin": "Wǒmen xīwàng guójiā jīngjì fánróng fāzhǎn.",
        "english": "We hope the national economy develops prosperously."
      }
    ]
  },
  {
    "hanzi": "反应",
    "pinyin": "fǎn yìng",
    "english": " Noun: reaction, response Verb: to react, to respond",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的反应很快。",
        "pinyin": "Wǒmen qù nà jiā fàn guǎn chī fàn ba.",
        "english": "His reaction is fast."
      }
    ]
  },
  {
    "hanzi": "反正",
    "pinyin": "fǎn zhèng",
    "english": "Adverb: anyway, whatever happens",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "反正我现在很闲，不如一起去吧。",
        "pinyin": "Fǎnzhèng wǒ xiànzài hěn xián, bùrú yīqǐ qù ba.",
        "english": "I'm free right now anyway, why don't we go together?"
      }
    ]
  },
  {
    "hanzi": "方",
    "pinyin": "fāng",
    "english": " Noun: square, direction, side Measure Word: for square things",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们讨论了解决问题的方方面面。",
        "pinyin": "Wǒmen tǎolùn le jiějué wèntí de fāngfāngmiànmiàn.",
        "english": "We discussed all aspects of solving the problem."
      }
    ]
  },
  {
    "hanzi": "妨碍",
    "pinyin": "fáng ài",
    "english": "Verb: to hinder, to obstruct",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请不要大声说话，以免妨碍他人工作。",
        "pinyin": "Qǐng bùyào dàshēng shuōhuà, yǐmiǎn fáng'ài tārén gōngzuò.",
        "english": "Please do not talk loudly, so as not to hinder the work of others."
      }
    ]
  },
  {
    "hanzi": "方案",
    "pinyin": "fāng àn",
    "english": "Noun: plan, program, scheme",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "经理同意了我们提出的新方案。",
        "pinyin": "Jīnglǐ tóngyì le wǒmen tíchū de xīn fāng'àn.",
        "english": "The manager agreed to the new proposal we put forward."
      }
    ]
  },
  {
    "hanzi": "仿佛",
    "pinyin": "fǎng fú",
    "english": "Adverb: to seem as if",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "远处的灯光仿佛天上的星星。",
        "pinyin": "Yuǎnchù de dēngguāng fǎngfú tiānshàng de xīngxing.",
        "english": "The distant lights look like stars in the sky."
      }
    ]
  },
  {
    "hanzi": "方式",
    "pinyin": "fāng shì",
    "english": "Noun: way, pattern, manner",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "每种学习都有其独特的方式。",
        "pinyin": "Měi zhǒng xuéxí dōu yǒu qí dú tè de fāngshì.",
        "english": "Every type of learning has its unique method."
      }
    ]
  },
  {
    "hanzi": "放松",
    "pinyin": "fàng sōng",
    "english": "Verb: to relax, to loosen",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "周末我要放松。",
        "pinyin": "Zhōumò wǒ yào fàngsōng.",
        "english": "I want to relax on the weekend."
      }
    ]
  },
  {
    "hanzi": "非",
    "pinyin": "fēi",
    "english": " Adjective: wrong, mistaken Adverb: not, non-, un-",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这件事是非做不可的。",
        "pinyin": "Zhè jiàn shì fēi zuò bù kě de.",
        "english": "This matter absolutely must be done."
      }
    ]
  },
  {
    "hanzi": "废话",
    "pinyin": "fèi huà",
    "english": "Expression: nonsense, useless statement",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "别说废话了，快点开始工作。",
        "pinyin": "Bié shuō fèihuà le, kuài diǎn kāishǐ gōngzuò.",
        "english": "Stop talking nonsense, start working quickly."
      }
    ]
  },
  {
    "hanzi": "费用",
    "pinyin": "fèi yong",
    "english": "Noun: expenses, cost",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "旅行费用很高。",
        "pinyin": "Lǚxíng fèiyòng hěn gāo.",
        "english": "Travel costs are high."
      }
    ]
  },
  {
    "hanzi": "肥皂",
    "pinyin": "féi zào",
    "english": "Noun: soap",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请给我一块肥皂洗手。",
        "pinyin": "Qǐng gěi wǒ yī kuài féizào xǐ shǒu.",
        "english": "Please give me a bar of soap to wash my hands."
      }
    ]
  },
  {
    "hanzi": "分别",
    "pinyin": "fēn bié",
    "english": " Noun: difference Verb: to leave each other, to distinguish Adverb: separate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们分别三年了。",
        "pinyin": "Wǒmen fēnbié sān nián le.",
        "english": "We’ve been apart for three years."
      }
    ]
  },
  {
    "hanzi": "分布",
    "pinyin": "fēn bù",
    "english": "Verb: to distribute, to be distributed",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "人口分布不均。",
        "pinyin": "Rénkǒu fēnbù bù jūn.",
        "english": "Population is unevenly distributed."
      }
    ]
  },
  {
    "hanzi": "奋斗",
    "pinyin": "fèn dòu",
    "english": "Verb: to fight for, to strive for",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们要为美好的未来而奋斗。",
        "pinyin": "Wǒmen yào wèi měihǎo de wèilái ér fèndòu.",
        "english": "We must strive for a beautiful future."
      }
    ]
  },
  {
    "hanzi": "纷纷",
    "pinyin": "fēn fēn",
    "english": "Adverb: one after another",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "人们纷纷离开。",
        "pinyin": "Rénmen fēnfēn líkāi.",
        "english": "People left one after another."
      }
    ]
  },
  {
    "hanzi": "分配",
    "pinyin": "fēn pèi",
    "english": "Verb: to assign, to allocate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "老师把任务分配给了我们。",
        "pinyin": "Lǎoshī bǎ rènwu fēnpèi gěi le wǒmen.",
        "english": "The teacher assigned the tasks to us."
      }
    ]
  },
  {
    "hanzi": "分析",
    "pinyin": "fēn xī",
    "english": "Noun: analysis Verb: to analyze",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请分析这个问题。",
        "pinyin": "Qǐng fēnxī zhège wèntí.",
        "english": "Please analyze this issue."
      }
    ]
  },
  {
    "hanzi": "讽刺",
    "pinyin": "fěng cì",
    "english": " Noun: irony, sarcasm Verb: to mock",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的话带有强烈的讽刺意味。",
        "pinyin": "Tā de huà dài yǒu qiángliè de fěngcì yìwèi.",
        "english": "His words carried a strong sense of sarcasm."
      }
    ]
  },
  {
    "hanzi": "疯狂",
    "pinyin": "fēng kuáng",
    "english": " Noun: madness Adjective: crazy, mad",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "球迷们疯狂欢呼。",
        "pinyin": "Qiúmí men fēngkuáng huānhū.",
        "english": "Fans cheered crazily."
      }
    ]
  },
  {
    "hanzi": "风俗",
    "pinyin": "fēng sú",
    "english": "Noun: social custom",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "中国风俗很多。",
        "pinyin": "Zhōngguó fēngsú hěn duō.",
        "english": "China has many customs."
      }
    ]
  },
  {
    "hanzi": "风险",
    "pinyin": "fēng xiǎn",
    "english": "Noun: risk,l venture",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "投资都有一定的风险。",
        "pinyin": "Tóuzī dōu yǒu yīdìng de fēngxiǎn.",
        "english": "All investments have certain risks."
      }
    ]
  },
  {
    "hanzi": "否定",
    "pinyin": "fǒu dìng",
    "english": " Noun: negation Verb: to negate, to deny",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他否定了所有的指控。",
        "pinyin": "Tā fǒudìng le suǒyǒu de zhǐkòng.",
        "english": "He denied all the accusations."
      }
    ]
  },
  {
    "hanzi": "服从",
    "pinyin": "fú cóng",
    "english": "Verb: to obey, to submit",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "士兵必须服从命令。",
        "pinyin": "Shìbīng bìxū fúcóng mìnglìng.",
        "english": "Soldiers must obey orders."
      }
    ]
  },
  {
    "hanzi": "辅导",
    "pinyin": "fǔ dǎo",
    "english": " Noun: coaching Verb: to tutor, to coach",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "老师辅导我数学。",
        "pinyin": "Lǎoshī fǔdǎo wǒ shùxué.",
        "english": "The teacher coaches me in math."
      }
    ]
  },
  {
    "hanzi": "付款",
    "pinyin": "fù kuǎn",
    "english": "Noun: payment Verb: to pay",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请问我应该在哪里付款？",
        "pinyin": "Qǐngwèn wǒ yīnggāi zài nǎlǐ fùkuǎn?",
        "english": "Excuse me, where should I make the payment?"
      }
    ]
  },
  {
    "hanzi": "妇女",
    "pinyin": "fù nǚ",
    "english": "Noun: woman",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "3月8日是国际妇女节。",
        "pinyin": "Sān yuè bā rì shì Guójì Fùnǚ Jié.",
        "english": "March 8th is International Women's Day."
      }
    ]
  },
  {
    "hanzi": "复制",
    "pinyin": "fù zhì",
    "english": "Verb: to copy, to reproduce",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这份文件需要复制三份。",
        "pinyin": "Zhè fèn wénjiàn xūyào fùzhì sān fèn.",
        "english": "This document needs to be copied three times."
      }
    ]
  },
  {
    "hanzi": "服装",
    "pinyin": "fú zhuāng",
    "english": "Noun: clothing, dress",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "服装店在二楼。",
        "pinyin": "Fúzhuāng diàn zài èr lóu.",
        "english": "The clothing store is on the second floor."
      }
    ]
  },
  {
    "hanzi": "盖",
    "pinyin": "gài",
    "english": "Noun: cover Verb: to cover",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "记得把锅盖盖好。",
        "pinyin": "Jìde bǎ guō gài gài hǎo.",
        "english": "Remember to cover the pot lid tightly."
      }
    ]
  },
  {
    "hanzi": "改革",
    "pinyin": "gǎi gé",
    "english": "Noun: reform Verb: to reform",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "教育改革势在必行。",
        "pinyin": "Jiàoyù gǎigé shì zài bì xíng.",
        "english": "Educational reform is imperative."
      }
    ]
  },
  {
    "hanzi": "改进",
    "pinyin": "gǎi jìn",
    "english": "Noun: improvement Verb: to improve",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "产品需要改进。",
        "pinyin": "Chǎnpǐn xūyào gǎijìn.",
        "english": "The product needs improvement."
      }
    ]
  },
  {
    "hanzi": "概括",
    "pinyin": "gài kuò",
    "english": "Noun: summary Verb: to summarize; to generalize",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请你用几句话概括一下主要内容。",
        "pinyin": "Qǐng nǐ yòng jǐ jù huà gàikuò yīxià zhǔyào nèiróng.",
        "english": "Please summarize the main content in a few sentences."
      }
    ]
  },
  {
    "hanzi": "概念",
    "pinyin": "gài niàn",
    "english": "Noun: concept, idea",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们首先要弄清楚基本概念。",
        "pinyin": "Wǒmen shǒuxiān yào nòng qīngchu jīběn gàiniàn.",
        "english": "We must first clarify the basic concepts."
      }
    ]
  },
  {
    "hanzi": "改善",
    "pinyin": "gǎi shàn",
    "english": "Noun: improvement Verb: to improve",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们需要改善服务质量。",
        "pinyin": "Wǒmen xūyào gǎishàn fúwù zhìliàng.",
        "english": "We need to improve the quality of service."
      }
    ]
  },
  {
    "hanzi": "干脆",
    "pinyin": "gān cuì",
    "english": " Adjective: clear-cut, straightforward Adverb: simply, you might as well",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "如果你不喜欢，干脆拒绝好了。",
        "pinyin": "Rúguǒ nǐ bù xǐhuan, gāncuì jùjué hǎo le.",
        "english": "If you don't like it, just refuse."
      }
    ]
  },
  {
    "hanzi": "感激",
    "pinyin": "gǎn jī",
    "english": "Verb: to feel grateful, to be thankful",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我很感激你的帮助。",
        "pinyin": "Wǒ hěn gǎnjī nǐ de bāngzhù.",
        "english": "I’m very grateful for your help."
      }
    ]
  },
  {
    "hanzi": "感受",
    "pinyin": "gǎn shòu",
    "english": " Noun: feeling, perception Verb: to sense, to feel",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "分享你的感受。",
        "pinyin": "Fēnxiǎng nǐ de gǎnshòu.",
        "english": "Share your impressions."
      }
    ]
  },
  {
    "hanzi": "感想",
    "pinyin": "gǎn xiǎng",
    "english": "Noun: impressions, reflections",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "听完演讲，你有什么感想？",
        "pinyin": "Tīng wán yǎnjiǎng, nǐ yǒu shénme gǎnxiǎng?",
        "english": "After listening to the speech, what are your thoughts?"
      }
    ]
  },
  {
    "hanzi": "钢铁",
    "pinyin": "gāng tiě",
    "english": "Noun: steel",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这座桥是用钢铁建成的。",
        "pinyin": "Zhè zuò qiáo shì yòng gāngtiě jiànchéng de.",
        "english": "This bridge is built using steel."
      }
    ]
  },
  {
    "hanzi": "搞",
    "pinyin": "gǎo",
    "english": "Verb: to do, to make",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "别搞乱房间。",
        "pinyin": "Bié gǎo luàn fángjiān.",
        "english": "Don’t mess up the room."
      }
    ]
  },
  {
    "hanzi": "告别",
    "pinyin": "gào bié",
    "english": "Verb: to leave, to say good-bye to",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他和家人告别后离开了家乡。",
        "pinyin": "Tā hé jiārén gàobié hòu líkāi le jiāxiāng.",
        "english": "He left his hometown after bidding farewell to his family."
      }
    ]
  },
  {
    "hanzi": "高档",
    "pinyin": "gāo dàng",
    "english": "Adjective: top grade",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一家很高档的餐厅。",
        "pinyin": "Zhè shì yī jiā hěn gāodàng de cāntīng.",
        "english": "This is a very high-grade restaurant."
      }
    ]
  },
  {
    "hanzi": "高速公路",
    "pinyin": "gāo sù gōng lù",
    "english": "Noun: highway",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "从这里上高速公路。",
        "pinyin": "Cóng zhèlǐ shàng gāosù gōnglù.",
        "english": "Get onto the highway from here."
      }
    ]
  },
  {
    "hanzi": "隔壁",
    "pinyin": "gé bì",
    "english": "Location: next door",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "隔壁住着老李。",
        "pinyin": "Gébì zhù zhe Lǎo Lǐ.",
        "english": "Old Li lives next door."
      }
    ]
  },
  {
    "hanzi": "个别",
    "pinyin": "gè bié",
    "english": "Adjective: exceptional, very few, individual",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "个别学生没来。",
        "pinyin": "Gèbié xuésheng méi lái.",
        "english": "A few students didn’t come."
      }
    ]
  },
  {
    "hanzi": "胳膊",
    "pinyin": "gē bo",
    "english": "Noun: arm",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的胳膊有点儿疼。",
        "pinyin": "Wǒ de gēbo yǒudiǎnr téng.",
        "english": "My arm hurts a little."
      }
    ]
  },
  {
    "hanzi": "个人",
    "pinyin": "gè rén",
    "english": "Noun: individual Adjective: individual",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是个人问题。",
        "pinyin": "Zhè shì gèrén wèntí.",
        "english": "This is a personal issue."
      }
    ]
  },
  {
    "hanzi": "个性",
    "pinyin": "gè xìng",
    "english": "Noun: personality, character",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他个性很开朗。",
        "pinyin": "Tā gèxìng hěn kāilǎng.",
        "english": "He has an outgoing personality."
      }
    ]
  },
  {
    "hanzi": "根",
    "pinyin": "gēn",
    "english": " Noun: root, origin Measure Word: for long, slender objects",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他手里拿着一根很长的绳子。",
        "pinyin": "Tā shǒu lǐ názhe yī gēn hěn cháng de shéngzi.",
        "english": "He is holding a very long rope in his hand."
      }
    ]
  },
  {
    "hanzi": "根本",
    "pinyin": "gēn běn",
    "english": " Noun: foundation, root Adjective: fundamental, simply, basic",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这不是根本问题，只是表面现象。",
        "pinyin": "Zhè bú shì gēnběn wèntí, zhǐ shì biǎomiàn xiànxiàng.",
        "english": "This is not the fundamental problem, it's just a surface phenomenon."
      }
    ]
  },
  {
    "hanzi": "功夫",
    "pinyin": "gōng fu",
    "english": "Noun: time, skill, labor, workmanship, kung fu",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他学中国功夫。",
        "pinyin": "Tā xué Zhōngguó gōngfu.",
        "english": "He learns Chinese kung fu."
      }
    ]
  },
  {
    "hanzi": "公开",
    "pinyin": "gōng kāi",
    "english": " Verb: to publish, to make public Adjective: public",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这件事需要在网上公开讨论。",
        "pinyin": "Zhè jiàn shì xūyào zài wǎngshàng gōngkāi tǎolùn.",
        "english": "This matter needs to be publicly discussed online."
      }
    ]
  },
  {
    "hanzi": "功能",
    "pinyin": "gōng néng",
    "english": "Noun: function, feature",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这款手机有很多新的功能。",
        "pinyin": "Zhè kuǎn shǒujī yǒu hěn duō xīn de gōngnéng.",
        "english": "This mobile phone has many new functions."
      }
    ]
  },
  {
    "hanzi": "公平",
    "pinyin": "gōng píng",
    "english": "Adjective: fair, impartial",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们需要一个公平的竞争环境。",
        "pinyin": "Wǒmen xūyào yī gè gōngpíng de jìngzhēng huánjìng.",
        "english": "We need a fair competitive environment."
      }
    ]
  },
  {
    "hanzi": "贡献",
    "pinyin": "gòng xiàn",
    "english": " Noun: contribution Verb: to contribute, to dedicate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "科学技术对社会发展有巨大贡献。",
        "pinyin": "Kēxué jìshù duì shèhuì fāzhǎn yǒu jùdà gòngxiàn.",
        "english": "Science and technology have made huge contributions to social development."
      }
    ]
  },
  {
    "hanzi": "公寓",
    "pinyin": "gōng yù",
    "english": "Noun: block of flats",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他在市中心买了一套小公寓。",
        "pinyin": "Tā zài shìzhōngxīn mǎi le yī tào xiǎo gōngyù.",
        "english": "He bought a small apartment in the city center."
      }
    ]
  },
  {
    "hanzi": "构成",
    "pinyin": "gòu chéng",
    "english": "Verb: to compose, to constitute, to configure IT",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这些元素共同构成了这个系统。",
        "pinyin": "Zhèxiē yuánsù gòngtóng gòuchéng le zhège xìtǒng.",
        "english": "These elements jointly form this system."
      }
    ]
  },
  {
    "hanzi": "沟通",
    "pinyin": "gōu tōng",
    "english": "Verb: to communicate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "良好的沟通是解决问题的关键。",
        "pinyin": "Liánghǎo de gōutōng shì jiějué wèntí de guānjiàn.",
        "english": "Good communication is the key to solving problems."
      }
    ]
  },
  {
    "hanzi": "古代",
    "pinyin": "gǔ dài",
    "english": "Time: ancient times",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我对古代历史非常感兴趣。",
        "pinyin": "Wǒ duì gǔdài lìshǐ fēicháng gǎn xìngqù.",
        "english": "I am very interested in ancient history."
      }
    ]
  },
  {
    "hanzi": "固定",
    "pinyin": "gù dìng",
    "english": " Verb: to fasten, to fix Adjective: fixed, set, regular",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "座位是固定的。",
        "pinyin": "Zuòwèi shì gùdìng de.",
        "english": "Seats are fixed."
      }
    ]
  },
  {
    "hanzi": "姑姑",
    "pinyin": "gū gu",
    "english": "Noun: aunt paternal",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "姑姑来我家做客。",
        "pinyin": "Gūgu lái wǒ jiā zuò kè.",
        "english": "Aunt came to visit."
      }
    ]
  },
  {
    "hanzi": "古老",
    "pinyin": "gǔ lǎo",
    "english": "Adjective: ancient, age-old",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这座城市有很多古老的建筑。",
        "pinyin": "Zhè zuò chéngshì yǒu hěn duō gǔlǎo de jiànzhù.",
        "english": "This city has many ancient buildings."
      }
    ]
  },
  {
    "hanzi": "姑娘",
    "pinyin": "gū niang",
    "english": "Noun: girl, young woman, daughter",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "那个穿红裙子的姑娘是谁？",
        "pinyin": "Nàgè chuān hóng qúnzi de gūniang shì shéi?",
        "english": "Who is that girl wearing the red dress?"
      }
    ]
  },
  {
    "hanzi": "股票",
    "pinyin": "gǔ piào",
    "english": "Noun: share, stock",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他买了很多股票。",
        "pinyin": "Tā mǎi le hěn duō gǔpiào.",
        "english": "He bought many stocks."
      }
    ]
  },
  {
    "hanzi": "固体",
    "pinyin": "gù tǐ",
    "english": "Noun: solid body",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "冰是水的固体形式。",
        "pinyin": "Bīng shì shuǐ de gùtǐ xíngshì.",
        "english": "Ice is the solid form of water."
      }
    ]
  },
  {
    "hanzi": "骨头",
    "pinyin": "gǔ tou",
    "english": "Noun: bone, strong character",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "鸡骨头别吃。",
        "pinyin": "Jī gǔtou bié chī.",
        "english": "Don’t eat chicken bones."
      }
    ]
  },
  {
    "hanzi": "鼓舞",
    "pinyin": "gǔ wǔ",
    "english": " Noun: encouragement Verb: to inspire, to animate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的成功鼓舞了很多人。",
        "pinyin": "Tā de chénggōng gǔwǔ le hěn duō rén.",
        "english": "His success inspired many people."
      }
    ]
  },
  {
    "hanzi": "雇佣",
    "pinyin": "gù yōng",
    "english": "Verb: to employ, to hire",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们公司决定雇佣一名新员工。",
        "pinyin": "Wǒmen gōngsī juédìng gùyōng yī míng xīn yuángōng.",
        "english": "Our company decided to hire a new employee."
      }
    ]
  },
  {
    "hanzi": "官",
    "pinyin": "guān",
    "english": "Noun: officer, government official",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他以前是一名政府官员。",
        "pinyin": "Tā yǐqián shì yī míng zhèngfǔ guānyuán.",
        "english": "He used to be a government official."
      }
    ]
  },
  {
    "hanzi": "关闭",
    "pinyin": "guān bì",
    "english": "Verb: to close, to shut",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请在离开前关闭所有的灯。",
        "pinyin": "Qǐng zài líkāi qián guānbì suǒyǒu de dēng.",
        "english": "Please turn off (close) all the lights before leaving."
      }
    ]
  },
  {
    "hanzi": "观察",
    "pinyin": "guān chá",
    "english": " Noun: observation Verb: to observe, to watch, to survey",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们需要仔细观察周围的环境。",
        "pinyin": "Wǒmen xūyào zǐxì guānchá zhōuwéi de huánjìng.",
        "english": "We need to carefully observe the surrounding environment."
      }
    ]
  },
  {
    "hanzi": "观点",
    "pinyin": "guān diǎn",
    "english": "Noun: point of view, viewpoint, standpoint",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我不同意你的观点。",
        "pinyin": "Wǒ bù tóngyì nǐ de guāndiǎn.",
        "english": "I don't agree with your viewpoint."
      }
    ]
  },
  {
    "hanzi": "管子",
    "pinyin": "guǎn zi",
    "english": "Noun: tube, pipe",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这根管子漏水了，需要修理。",
        "pinyin": "Zhè gēn guǎnzi lòu shuǐle, xūyào xiūlǐ.",
        "english": "This pipe is leaking and needs to be repaired."
      }
    ]
  },
  {
    "hanzi": "光明",
    "pinyin": "guāng míng",
    "english": " Noun: light, radiance Adjective: light, bright",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们相信未来是光明的。",
        "pinyin": "Wǒmen xiāngxìn wèilái shì guāngmíng de.",
        "english": "We believe the future is bright."
      }
    ]
  },
  {
    "hanzi": "光盘",
    "pinyin": "guāng pán",
    "english": "Noun: CD, DVD",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "音乐在光盘里。",
        "pinyin": "Yīnyuè zài guāngpán lǐ.",
        "english": "The music is on the CD."
      }
    ]
  },
  {
    "hanzi": "光荣",
    "pinyin": "guāng róng",
    "english": " Noun: honor, glory Adjective: glorious, honorable",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一项光荣的任务。",
        "pinyin": "Zhè shì yī xiàng guāngróng de rènwu.",
        "english": "This is an honorable mission."
      }
    ]
  },
  {
    "hanzi": "规矩",
    "pinyin": "guī ju",
    "english": "Noun: rule, custom, manner, practices",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "无论在哪里都要遵守规矩。",
        "pinyin": "Wúlùn zài nǎlǐ dōu yào zūnshǒu guījǔ.",
        "english": "You must follow the rules no matter where you are."
      }
    ]
  },
  {
    "hanzi": "规律",
    "pinyin": "guī lǜ",
    "english": "Noun: law, regular pattern",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "学习需要找到适合自己的规律。",
        "pinyin": "Xuéxí xūyào zhǎodào shìhé zìjǐ de guīlǜ.",
        "english": "Learning requires finding a pattern that suits oneself."
      }
    ]
  },
  {
    "hanzi": "规模",
    "pinyin": "guī mó",
    "english": "Noun: scale, scope, size, extent",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这次展览的规模很大。",
        "pinyin": "Zhè cì zhǎnlǎn de guīmó hěn dà.",
        "english": "The scale of this exhibition is very large."
      }
    ]
  },
  {
    "hanzi": "柜台",
    "pinyin": "guì tái",
    "english": "Noun: sales counter, bar",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请到收银柜台付款。",
        "pinyin": "Qǐng dào shōuyín guìtái fù kuǎn.",
        "english": "Please go to the cashier counter to pay."
      }
    ]
  },
  {
    "hanzi": "滚",
    "pinyin": "gǔn",
    "english": "Verb: to boil, to roll",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "水已经烧滚了，可以泡茶了。",
        "pinyin": "Shuǐ yǐjīng shāo gǔnle, kěyǐ pào chá le.",
        "english": "The water is already boiling; we can make tea now."
      }
    ]
  },
  {
    "hanzi": "锅",
    "pinyin": "guō",
    "english": "Noun: pot, pan",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "晚餐我们在锅里煮了面条。",
        "pinyin": "Wǎncān wǒmen zài guō lǐ zhǔle miàntiáo.",
        "english": "We boiled noodles in the pot for dinner."
      }
    ]
  },
  {
    "hanzi": "过分",
    "pinyin": "guò fèn",
    "english": "Adjective: excessive, undue",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你的要求有点过分了。",
        "pinyin": "Nǐ de yāoqiú yǒudiǎn guòfèn le.",
        "english": "Your request is a bit excessive."
      }
    ]
  },
  {
    "hanzi": "国籍",
    "pinyin": "guó jí",
    "english": "Noun: nationality, citizenship",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你的国籍是什么？",
        "pinyin": "Nǐ de guójí shì shénme?",
        "english": "What is your nationality?"
      }
    ]
  },
  {
    "hanzi": "国庆节",
    "pinyin": "Guó qìng jié",
    "english": "Noun: National Day October 1st",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "国庆节我们有七天的假期。",
        "pinyin": "Guóqìngjié wǒmen yǒu qī tiān de jiàqī.",
        "english": "We have a seven-day holiday for National Day."
      }
    ]
  },
  {
    "hanzi": "哈",
    "pinyin": "hā",
    "english": "O: haha, laughter",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "哈哈太好笑了。",
        "pinyin": "Hāhā tài hǎo xiào le.",
        "english": "Haha"
      }
    ]
  },
  {
    "hanzi": "海鲜",
    "pinyin": "hǎi xiān",
    "english": "Noun: seafood",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这家餐厅的海鲜非常新鲜。",
        "pinyin": "Zhè jiā cāntīng de hǎixiān fēicháng xīnxiān.",
        "english": "The seafood at this restaurant is very fresh."
      }
    ]
  },
  {
    "hanzi": "喊",
    "pinyin": "hǎn",
    "english": "Verb: to shout, to yell",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "别在图书馆里大喊大叫。",
        "pinyin": "Bié zài túshūguǎn lǐ dà hǎn dà jiào.",
        "english": "Don't shout loudly in the library."
      }
    ]
  },
  {
    "hanzi": "行业",
    "pinyin": "háng yè",
    "english": "Noun: business, industry, profession",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "旅游行业最近发展很快。",
        "pinyin": "Lǚyóu hángyè zuìjìn fāzhǎn hěn kuài.",
        "english": "The tourism industry has developed very quickly recently."
      }
    ]
  },
  {
    "hanzi": "豪华",
    "pinyin": "háo huá",
    "english": "Adjective: luxurious",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一栋非常豪华的别墅。",
        "pinyin": "Zhè shì yī dòng fēicháng háohuá de biéshù.",
        "english": "This is a very luxurious villa."
      }
    ]
  },
  {
    "hanzi": "好奇",
    "pinyin": "hào qí",
    "english": "Adjective: curious, inquisitive",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "孩子们总是对世界充满好奇。",
        "pinyin": "Háizimen zǒng shì duì shìjiè chōngmǎn hàoqí.",
        "english": "Children are always full of curiosity about the world."
      }
    ]
  },
  {
    "hanzi": "何必",
    "pinyin": "hé bì",
    "english": "Adverb: there is no need to",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "何必这么生气？",
        "pinyin": "Hé bì zhème shēngqì?",
        "english": "Why get so angry?"
      }
    ]
  },
  {
    "hanzi": "合法",
    "pinyin": "hé fǎ",
    "english": "Adjective: legal, legitimate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "所有交易都必须是合法的。",
        "pinyin": "Suǒyǒu jiāoyì dōu bìxū shì héfǎ de.",
        "english": "All transactions must be legal."
      }
    ]
  },
  {
    "hanzi": "合理",
    "pinyin": "hé lǐ",
    "english": "Adjective: reasonable, rational",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的建议听起来很合理。",
        "pinyin": "Tā de jiànyì tīng qǐlái hěn hélǐ.",
        "english": "His suggestion sounds very reasonable."
      }
    ]
  },
  {
    "hanzi": "和平",
    "pinyin": "hé píng",
    "english": "Noun: peace",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "世界需要和平。",
        "pinyin": "Shìjiè xūyào hépíng.",
        "english": "The world needs peace."
      }
    ]
  },
  {
    "hanzi": "合同",
    "pinyin": "hé tong",
    "english": "Noun: contract",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们签了三年的合同。",
        "pinyin": "Wǒmen qiānle sān nián de hétong.",
        "english": "We signed a three-year contract."
      }
    ]
  },
  {
    "hanzi": "核心",
    "pinyin": "hé xīn",
    "english": "Noun: core",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个问题是本次会议的核心。",
        "pinyin": "Zhège wèntí shì běncì huìyì de héxīn.",
        "english": "This issue is the core of this meeting."
      }
    ]
  },
  {
    "hanzi": "合影",
    "pinyin": "hé yǐng",
    "english": "Noun: group photo",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "大家一起来张合影吧。",
        "pinyin": "Dàjiā yìqǐ lái zhāng héyǐng ba.",
        "english": "Let's all take a group photo together."
      }
    ]
  },
  {
    "hanzi": "合作",
    "pinyin": "hé zuò",
    "english": " Noun: cooperation Verb: to cooperate, to work together",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们合作完成项目。",
        "pinyin": "Wǒmen hézuò wánchéng xiàngmù.",
        "english": "We cooperate to finish the project."
      }
    ]
  },
  {
    "hanzi": "恨",
    "pinyin": "hèn",
    "english": "Noun: hate Verb: to hate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她不再恨任何人了。",
        "pinyin": "Tā bù zài hèn rènhé rén le.",
        "english": "She no longer hates anyone."
      }
    ]
  },
  {
    "hanzi": "后果",
    "pinyin": "hòu guǒ",
    "english": "Noun: consequence, aftermath",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你必须承担这个后果。",
        "pinyin": "Nǐ bìxū chéngdān zhège hòuguǒ.",
        "english": "You must bear this consequence."
      }
    ]
  },
  {
    "hanzi": "壶",
    "pinyin": "hú",
    "english": " Noun: pot, kettle Measure Word: for bottled liquid",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "给我来一壶热茶。",
        "pinyin": "Gěi wǒ lái yì hú rè chá.",
        "english": "Get me a pot of hot tea."
      }
    ]
  },
  {
    "hanzi": "蝴蝶",
    "pinyin": "hú dié",
    "english": "Noun: butterfly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "一只漂亮的蝴蝶停在花上。",
        "pinyin": "Yì zhī piàoliang de húdié tíng zài huā shang.",
        "english": "A beautiful butterfly stopped on the flower."
      }
    ]
  },
  {
    "hanzi": "胡说",
    "pinyin": "hú shuō",
    "english": "Verb: to talk nonsense",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "别胡说八道。",
        "pinyin": "Bié hú shuō bā dào.",
        "english": "Don’t talk nonsense."
      }
    ]
  },
  {
    "hanzi": "胡同",
    "pinyin": "hú tòng",
    "english": "Noun: lane, alley",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这条胡同里有很多老房子。",
        "pinyin": "Zhè tiáo hútòng lǐ yǒu hěn duō lǎo fángzi.",
        "english": "There are many old houses in this alley."
      }
    ]
  },
  {
    "hanzi": "糊涂",
    "pinyin": "hú tu",
    "english": "Adjective: confused, muddled",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我早上还没睡醒，有点糊涂。",
        "pinyin": "Wǒ zǎoshang hái méi shuì xǐng, yǒudiǎn hútu.",
        "english": "I haven't woken up yet this morning, I'm a bit muddled."
      }
    ]
  },
  {
    "hanzi": "滑冰",
    "pinyin": "huá bīng",
    "english": "Noun: skating Verb: to skate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "寒假的时候我们去滑冰吧。",
        "pinyin": "Hánjià de shíhou wǒmen qù huábīng ba.",
        "english": "Let's go ice skating during the winter holiday."
      }
    ]
  },
  {
    "hanzi": "划船",
    "pinyin": "huá chuán",
    "english": " Noun: rowing, rowing boat Verb: to row a boat",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "公园里可以划船。",
        "pinyin": "Gōngyuán lǐ kěyǐ huáchuán.",
        "english": "You can row boats in the park."
      }
    ]
  },
  {
    "hanzi": "话题",
    "pinyin": "huà tí",
    "english": "Noun: topic",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们的讨论换了一个话题。",
        "pinyin": "Tāmen de tǎolùn huànle yí ge huàtí.",
        "english": "Their discussion changed to a different topic."
      }
    ]
  },
  {
    "hanzi": "化学",
    "pinyin": "huà xué",
    "english": "Noun: chemistry",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他对化学很感兴趣。",
        "pinyin": "Tā duì huàxué hěn gǎn xìngqù.",
        "english": "He is very interested in chemistry."
      }
    ]
  },
  {
    "hanzi": "怀念",
    "pinyin": "huái niàn",
    "english": "Verb: to cherish the memory of, to think of",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我很怀念大学时光。",
        "pinyin": "Wǒ hěn huáiniàn dàxué shíguāng.",
        "english": "I really miss my university days."
      }
    ]
  },
  {
    "hanzi": "缓解",
    "pinyin": "huǎn jiě",
    "english": "Verb: to ease, to blunt, to help relieve a crisis",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "药物可以帮助缓解疼痛。",
        "pinyin": "Yàowù kěyǐ bāngzhù huǎnjiě téngtòng.",
        "english": "Medication can help relieve pain."
      }
    ]
  },
  {
    "hanzi": "皇帝",
    "pinyin": "huáng dì",
    "english": "Noun: emperor",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "中国历史上有许多著名的皇帝。",
        "pinyin": "Zhōngguó lìshǐ shang yǒu xǔduō zhùmíng de huángdì.",
        "english": "There were many famous emperors in Chinese history."
      }
    ]
  },
  {
    "hanzi": "黄金",
    "pinyin": "huáng jīn",
    "english": "Noun: gold",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "黄金是一种贵金属。",
        "pinyin": "Huángjīn shì yì zhǒng guì jīnshǔ.",
        "english": "Gold is a precious metal."
      }
    ]
  },
  {
    "hanzi": "慌张",
    "pinyin": "huāng zhāng",
    "english": "Adjective: confused, flustered",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "听到警报声，他显得很慌张。",
        "pinyin": "Tīng dào jǐngbào shēng, tā xiǎnde hěn huāngzhāng.",
        "english": "Hearing the alarm, he seemed very flustered."
      }
    ]
  },
  {
    "hanzi": "挥",
    "pinyin": "huī",
    "english": "Verb: to wave, to brandish, to wipe away",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他向我挥手告别。",
        "pinyin": "Tā xiàng wǒ huī shǒu gàobié.",
        "english": "He waved goodbye to me."
      }
    ]
  },
  {
    "hanzi": "灰",
    "pinyin": "huī",
    "english": " Noun: ash, dust Adjective: gray",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这件衣服的颜色是浅灰色的。",
        "pinyin": "Zhè jiàn yīfu de yánsè shì qiǎn huīsè de.",
        "english": "The color of this clothing is light gray."
      }
    ]
  },
  {
    "hanzi": "恢复",
    "pinyin": "huī fù",
    "english": "Verb: to recover, to restore",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "身体恢复得很快。",
        "pinyin": "Shēntǐ huīfù de hěn kuài.",
        "english": "The body recovers quickly."
      }
    ]
  },
  {
    "hanzi": "汇率",
    "pinyin": "huì lǜ",
    "english": "Noun: exchange rate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请问今天的美元汇率是多少？",
        "pinyin": "Qǐngwèn jīntiān de Měiyuán huìlǜ shì duōshao?",
        "english": "May I ask what today's US dollar exchange rate is?"
      }
    ]
  },
  {
    "hanzi": "灰心",
    "pinyin": "huī xīn",
    "english": "Verb: to lose heart, to be discouraged",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "失败别灰心。",
        "pinyin": "Shībài bié huīxīn.",
        "english": "Don’t be discouraged by failure."
      }
    ]
  },
  {
    "hanzi": "婚礼",
    "pinyin": "hūn lǐ",
    "english": "Noun: wedding",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们下个月举行婚礼。",
        "pinyin": "Tāmen xià gè yuè jǔxíng hūnlǐ.",
        "english": "They are holding their wedding next month."
      }
    ]
  },
  {
    "hanzi": "伙伴",
    "pinyin": "huǒ bàn",
    "english": "Noun: partner, companion, mate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他是我最好的学习伙伴。",
        "pinyin": "Tā shì wǒ zuì hǎo de xuéxí huǒbàn.",
        "english": "He is my best study partner."
      }
    ]
  },
  {
    "hanzi": "火柴",
    "pinyin": "huǒ chái",
    "english": "Noun: match for fire",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "点火用火柴。",
        "pinyin": "Diǎn huǒ yòng huǒchái.",
        "english": "Light a fire with matches."
      }
    ]
  },
  {
    "hanzi": "基本",
    "pinyin": "jī běn",
    "english": "Adjective: basic, fundamental",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你需要掌握基本知识。",
        "pinyin": "Nǐ xūyào zhǎngwò jīběn zhīshi.",
        "english": "You need to grasp the basic knowledge."
      }
    ]
  },
  {
    "hanzi": "激烈",
    "pinyin": "jī liè",
    "english": "Adjective: intense, fierce",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "比赛进行得非常激烈。",
        "pinyin": "Bǐsài jìnxíng de fēicháng jīliè.",
        "english": "The competition proceeded very fiercely."
      }
    ]
  },
  {
    "hanzi": "记录",
    "pinyin": "jì lù",
    "english": "Noun: record",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请把重要的事情记录下来。",
        "pinyin": "Qǐng bǎ zhòngyào de shìqing jìlù xiàlai.",
        "english": "Please record the important matters."
      }
    ]
  },
  {
    "hanzi": "纪律",
    "pinyin": "jì lǜ",
    "english": "Noun: discipline",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "严格遵守学校纪律。",
        "pinyin": "Yángé zūnshǒu xuéxiào jìlǜ.",
        "english": "Strictly abide by school discipline."
      }
    ]
  },
  {
    "hanzi": "急忙",
    "pinyin": "jí máng",
    "english": "Adjective: hasty, in a hurry",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "听到电话响，她急忙跑过去接。",
        "pinyin": "Tīng dào diànhuà xiǎng, tā jímáng pǎo guòqù jiē.",
        "english": "Hearing the phone ring, she rushed over to answer it."
      }
    ]
  },
  {
    "hanzi": "纪念",
    "pinyin": "jì niàn",
    "english": "Noun: commemoration Verb: to commemorate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这张照片很有纪念意义。",
        "pinyin": "Zhè zhāng zhàopiàn hěn yǒu jìniàn yìyì.",
        "english": "This photo has great commemorative significance."
      }
    ]
  },
  {
    "hanzi": "机器",
    "pinyin": "jī qì",
    "english": "Noun: machine",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这台机器操作起来很方便。",
        "pinyin": "Zhè tái jīqì cāozuò qǐlai hěn fāngbiàn.",
        "english": "This machine is very convenient to operate."
      }
    ]
  },
  {
    "hanzi": "肌肉",
    "pinyin": "jī ròu",
    "english": "Noun: muscle",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "锻炼有助于增加肌肉。",
        "pinyin": "Duànliàn yǒu zhù yú zēngjiā jīròu.",
        "english": "Exercise helps increase muscle mass."
      }
    ]
  },
  {
    "hanzi": "计算",
    "pinyin": "jì suàn",
    "english": " Noun: calculation Verb: to count, to calculate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这需要精确地计算。",
        "pinyin": "Zhè xūyào jīngquè de jìsuàn.",
        "english": "This requires precise calculation."
      }
    ]
  },
  {
    "hanzi": "集体",
    "pinyin": "jí tǐ",
    "english": "Noun: collective",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们要维护集体的荣誉。",
        "pinyin": "Wǒmen yào wéihù jítǐ de róngyù.",
        "english": "We must protect the collective's honor."
      }
    ]
  },
  {
    "hanzi": "集中",
    "pinyin": "jí zhōng",
    "english": "Verb: to concentrate, to focus",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请集中注意力听讲。",
        "pinyin": "Qǐng jízhōng zhùyì lì tīng jiǎng.",
        "english": "Please concentrate your attention on listening."
      }
    ]
  },
  {
    "hanzi": "嫁",
    "pinyin": "jià",
    "english": "Verb: to marry woman men",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她嫁给外国人。",
        "pinyin": "Tā jià gěi wàiguórén.",
        "english": "She married a foreigner."
      }
    ]
  },
  {
    "hanzi": "甲",
    "pinyin": "jiǎ",
    "english": "Number: firstly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "甲、乙、丙是三个等级。",
        "pinyin": "Jiǎ, yǐ, bǐng shì sān ge děngjí.",
        "english": "A, B, and C are the three grades."
      }
    ]
  },
  {
    "hanzi": "嘉宾",
    "pinyin": "jiā bīn",
    "english": "Noun: honoured guest",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们邀请了几位重要嘉宾。",
        "pinyin": "Wǒmen yāoqǐngle jǐ wèi zhòngyào jiābīn.",
        "english": "We invited several important honored guests."
      }
    ]
  },
  {
    "hanzi": "假如",
    "pinyin": "jiǎ rú",
    "english": "Conjunction: if",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "假如明天天气好，我们就去爬山。",
        "pinyin": "Jiǎrú míngtiān tiānqì hǎo, wǒmen jiù qù páshān.",
        "english": "If the weather is good tomorrow, we will go hiking."
      }
    ]
  },
  {
    "hanzi": "驾驶",
    "pinyin": "jià shǐ",
    "english": "Verb: to drive, to pilot",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他正在学习驾驶汽车。",
        "pinyin": "Tā zhèngzài xuéxí jiàshǐ qìchē.",
        "english": "He is learning to drive a car."
      }
    ]
  },
  {
    "hanzi": "家庭",
    "pinyin": "jiā tíng",
    "english": "Noun: family, household",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "家庭和睦是很重要的。",
        "pinyin": "Jiātíng hémù shì hěn zhòngyào de.",
        "english": "Family harmony is very important."
      }
    ]
  },
  {
    "hanzi": "家务",
    "pinyin": "jiā wù",
    "english": "Noun: housework",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "孩子们应该分担家务。",
        "pinyin": "Háizimen yīnggāi fēndān jiāwù.",
        "english": "Children should share the housework."
      }
    ]
  },
  {
    "hanzi": "价值",
    "pinyin": "jià zhí",
    "english": "Noun: value, worth",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "知识的价值是无法衡量的。",
        "pinyin": "Zhīshi de jiàzhí shì wúfǎ héngliáng de.",
        "english": "The value of knowledge is immeasurable."
      }
    ]
  },
  {
    "hanzi": "艰巨",
    "pinyin": "jiān jù",
    "english": "Adjective: arduous, formidable",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这项任务非常艰巨。",
        "pinyin": "Zhè xiàng rènwù fēicháng jiānjù.",
        "english": "This task is very arduous."
      }
    ]
  },
  {
    "hanzi": "艰苦",
    "pinyin": "jiān kǔ",
    "english": "Adjective: difficult, hard",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们过着艰苦的生活。",
        "pinyin": "Tāmen guòzhe jiānkǔ de shēnghuó.",
        "english": "They lead a difficult life."
      }
    ]
  },
  {
    "hanzi": "建立",
    "pinyin": "jiàn lì",
    "english": "Verb: to build, to establish",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们正在努力建立新的合作关系。",
        "pinyin": "Wǒmen zhèngzài nǔlì jiànlì xīn de hézuò guānxi.",
        "english": "We are working hard to establish a new cooperative relationship."
      }
    ]
  },
  {
    "hanzi": "简历",
    "pinyin": "jiǎn lì",
    "english": "Noun: CV, resume",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你把简历发给我吧。",
        "pinyin": "Nǐ bǎ jiǎnlì fā gěi wǒ ba.",
        "english": "Please send your resume to me."
      }
    ]
  },
  {
    "hanzi": "键盘",
    "pinyin": "jiàn pán",
    "english": "Noun: keyboard",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "键盘坏了打不了字。",
        "pinyin": "Jiànpán huài le dǎ bù liǎo zì.",
        "english": "The keyboard is broken"
      }
    ]
  },
  {
    "hanzi": "建设",
    "pinyin": "jiàn shè",
    "english": " Noun: construction Verb: to build, to construct",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "城市建设需要很长时间。",
        "pinyin": "Chéngshì jiànshè xūyào hěn cháng shíjiān.",
        "english": "Urban construction requires a long time."
      }
    ]
  },
  {
    "hanzi": "建议",
    "pinyin": "jiàn yì",
    "english": "Noun: suggestion Verb: to suggest",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我建议你休息一下。",
        "pinyin": "Wǒ jiànyì nǐ xiūxi yīxià.",
        "english": "I suggest you take a rest."
      }
    ]
  },
  {
    "hanzi": "简直",
    "pinyin": "jiǎn zhí",
    "english": "Adverb: simply, totally",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个问题简直太简单了。",
        "pinyin": "Zhè ge wèntí jiǎnzhí tài jiǎndān le.",
        "english": "This question is simply too easy."
      }
    ]
  },
  {
    "hanzi": "讲究",
    "pinyin": "jiǎng jiu",
    "english": " Verb: to pay attention to Adjective: exquisite, tasteful",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他做菜非常讲究。",
        "pinyin": "Tā zuò cài fēicháng jiǎngjiu.",
        "english": "He is very particular about his cooking."
      }
    ]
  },
  {
    "hanzi": "酱油",
    "pinyin": "jiàng yóu",
    "english": "Noun: soy sauce",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "煮面时要放点酱油。",
        "pinyin": "Zhǔ miàn shí yào fàng diǎn jiàngyóu.",
        "english": "You must add some soy sauce when cooking noodles."
      }
    ]
  },
  {
    "hanzi": "讲座",
    "pinyin": "jiǎng zuò",
    "english": "Noun: lecture",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "今天的讲座很有意思。",
        "pinyin": "Jīntiān de jiǎngzuò hěn yǒu yìsi.",
        "english": "Today's lecture (seminar) was very interesting."
      }
    ]
  },
  {
    "hanzi": "教材",
    "pinyin": "jiào cái",
    "english": "Noun: teaching material",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是我们新的中文教材。",
        "pinyin": "Zhè shì wǒmen xīn de Zhōngwén jiàocái.",
        "english": "This is our new Chinese textbook."
      }
    ]
  },
  {
    "hanzi": "角度",
    "pinyin": "jiǎo dù",
    "english": "Noun: angle, point of view",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请从不同角度看这个问题。",
        "pinyin": "Qǐng cóng bù tóng jiǎodù kàn zhè ge wèntí.",
        "english": "Please look at this problem from different angles."
      }
    ]
  },
  {
    "hanzi": "交换",
    "pinyin": "jiāo huàn",
    "english": " Noun: exchange Verb: to exchange, to swap, to switch",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们交换礼物。",
        "pinyin": "Wǒmen jiāohuàn lǐwù.",
        "english": "We exchange gifts."
      }
    ]
  },
  {
    "hanzi": "交际",
    "pinyin": "jiāo jì",
    "english": " Noun: communication, social intercourse Verb: socialize",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她的交际能力很强。",
        "pinyin": "Tā de jiāojì nénglì hěn qiáng.",
        "english": "Her social skills are very strong."
      }
    ]
  },
  {
    "hanzi": "郊区",
    "pinyin": "jiāo qū",
    "english": "Noun: suburbs",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我住在城市的郊区。",
        "pinyin": "Wǒ zhù zài chéngshì de jiāoqū.",
        "english": "I live in the suburbs of the city."
      }
    ]
  },
  {
    "hanzi": "节",
    "pinyin": "jié",
    "english": " Noun: festival, holiday, segmet, joint, part Verb: to save, to economize Measure Word: for segments",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们今天只有两节课。",
        "pinyin": "Wǒmen jīntiān zhǐyǒu liǎng jié kè.",
        "english": "We only have two class periods today."
      }
    ]
  },
  {
    "hanzi": "届",
    "pinyin": "jiè",
    "english": " Verb: to become due Measure Word: for events, meetings, etc.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这次会议是第十五届年会。",
        "pinyin": "Zhè cì huìyì shì dì shíwǔ jiè niánhuì.",
        "english": "This meeting is the fifteenth annual conference."
      }
    ]
  },
  {
    "hanzi": "接触",
    "pinyin": "jiē chù",
    "english": "Verb: to touch, to contact, to get in touch with",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我很少接触体育运动。",
        "pinyin": "Wǒ hěn shǎo jiēchù tǐyù yùndòng.",
        "english": "I rarely engage in sports."
      }
    ]
  },
  {
    "hanzi": "接待",
    "pinyin": "jiē dài",
    "english": "Verb: to receive visitor",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "经理负责接待这位重要的客人。",
        "pinyin": "Jīnglǐ fùzé jiēdài zhè wèi zhòngyào de kèren.",
        "english": "The manager is responsible for receiving this important guest."
      }
    ]
  },
  {
    "hanzi": "阶段",
    "pinyin": "jiē duàn",
    "english": "Noun: stage, section, phase",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们目前处于学习的初级阶段。",
        "pinyin": "Wǒmen mùqián chǔyú xuéxí de chūjí jiēduàn.",
        "english": "We are currently in the beginner stage of learning."
      }
    ]
  },
  {
    "hanzi": "结构",
    "pinyin": "jié gòu",
    "english": "Noun: structure, makeup, composition",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这种房子的结构很稳固。",
        "pinyin": "Zhè zhǒng fángzi de jiégòu hěn wěngù.",
        "english": "The structure of this type of house is very stable."
      }
    ]
  },
  {
    "hanzi": "结合",
    "pinyin": "jié hé",
    "english": " Noun: binding Verb: to combine, to link, to integrate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们应该把理论和实践结合起来。",
        "pinyin": "Wǒmen yīnggāi bǎ lǐlùn hé shíjiàn jiéhé qǐlai.",
        "english": "We should combine theory and practice."
      }
    ]
  },
  {
    "hanzi": "接近",
    "pinyin": "jiē jìn",
    "english": "Verb: to near, to approach, to be close to",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "考试接近了。",
        "pinyin": "Kǎoshì jiējìn le.",
        "english": "The exam is approaching."
      }
    ]
  },
  {
    "hanzi": "借口",
    "pinyin": "jiè kǒu",
    "english": "Noun: excuse, pretext",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "不要为你的迟到找借口。",
        "pinyin": "Bú yào wèi nǐ de chídào zhǎo jièkǒu.",
        "english": "Don't look for an excuse for your lateness."
      }
    ]
  },
  {
    "hanzi": "结论",
    "pinyin": "jié lùn",
    "english": "Noun: conclusion",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "经过分析，我们得出了一个重要的结论。",
        "pinyin": "Jīngguò fēnxī, wǒmen déchūle yí gè zhòngyào de jiélùn.",
        "english": "After analysis, we drew an important conclusion."
      }
    ]
  },
  {
    "hanzi": "节省",
    "pinyin": "jié shěng",
    "english": "Verb: to save, to economize, to use sparingly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们可以节省一些水电费。",
        "pinyin": "Wǒmen kěyǐ jiéshěng yì xiē shuǐdiànfèi.",
        "english": "We can save some money on utilities (water and electricity bills)."
      }
    ]
  },
  {
    "hanzi": "结实",
    "pinyin": "jiē shi",
    "english": "Adjective: solid, durable, sturdy",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这张椅子看起来很结实。",
        "pinyin": "Zhè zhāng yǐzi kàn qǐlái hěn jiēshi.",
        "english": "This chair looks very sturdy."
      }
    ]
  },
  {
    "hanzi": "接着",
    "pinyin": "jiē zhe",
    "english": " Verb: to follow, to carry on ",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他吃完饭，接着就去上班了。",
        "pinyin": "Tā chī wán fàn, jiēzhe jiù qù shàngbān le.",
        "english": "After he finished eating, he immediately went to work."
      }
    ]
  },
  {
    "hanzi": "戒指",
    "pinyin": "jiè zhi",
    "english": "Noun: ring for finger",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "结婚戒指很漂亮。",
        "pinyin": "Jiéhūn jièzhi hěn piàoliang.",
        "english": "The wedding ring is beautiful."
      }
    ]
  },
  {
    "hanzi": "紧",
    "pinyin": "jǐn",
    "english": "Adjective: thight, tense, urgent",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "鞋太紧了。",
        "pinyin": "Xié tài jǐn le.",
        "english": "The shoes are too tight."
      }
    ]
  },
  {
    "hanzi": "进步",
    "pinyin": "jìn bù",
    "english": " Noun: progress, improvement Verb: to improve, make progress",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你的中文学习进步很快。",
        "pinyin": "Nǐ de Zhōngwén xuéxí jìnbù hěn kuài.",
        "english": "Your Chinese learning progress is very fast."
      }
    ]
  },
  {
    "hanzi": "近代",
    "pinyin": "jìn dài",
    "english": "Time: modern times",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们正在学习中国近代史。",
        "pinyin": "Wǒmen zhèngzài xuéxí Zhōngguó jìndàishǐ.",
        "english": "We are studying modern Chinese history."
      }
    ]
  },
  {
    "hanzi": "进口",
    "pinyin": "jìn kǒu",
    "english": "Noun: import Verb: to import",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们的公司主要进口水果。",
        "pinyin": "Wǒmen de gōngsī zhǔyào jìnkǒu shuǐguǒ.",
        "english": "Our company mainly imports fruit."
      }
    ]
  },
  {
    "hanzi": "尽力",
    "pinyin": "jìn lì",
    "english": "Verb: to do all one can",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "无论结果如何，我们都要尽力。",
        "pinyin": "Wúlùn jiéguǒ rúhé, wǒmen dōu yào jìnlì.",
        "english": "No matter what the outcome, we must do our best."
      }
    ]
  },
  {
    "hanzi": "尽量",
    "pinyin": "jǐn liàng",
    "english": "Adverb: to the best of one's ability",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "尽量早点来。",
        "pinyin": "Jǐnliàng zǎo diǎn lái.",
        "english": "Come as early as possible."
      }
    ]
  },
  {
    "hanzi": "金属",
    "pinyin": "jīn shǔ",
    "english": "Noun: metal",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这种金属非常坚硬。",
        "pinyin": "Zhè zhǒng jīnshǔ fēicháng jiānyìng.",
        "english": "This type of metal is very hard."
      }
    ]
  },
  {
    "hanzi": "敬爱",
    "pinyin": "jìng ài",
    "english": "Verb: to respect and love",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们敬爱老师。",
        "pinyin": "Wǒmen jìng’ài lǎoshī.",
        "english": "We respect and love our teacher."
      }
    ]
  },
  {
    "hanzi": "经典",
    "pinyin": "jīng diǎn",
    "english": " Noun: classics, scriptures Adjective: classical",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这本书是一部文学经典。",
        "pinyin": "Zhè běn shū shì yí bù wénxué jīngdiǎn.",
        "english": "This book is a literary classic."
      }
    ]
  },
  {
    "hanzi": "精力",
    "pinyin": "jīng lì",
    "english": "Noun: energy",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他把所有的精力都投入到工作中。",
        "pinyin": "Tā bǎ suǒyǒu de jīnglì dōu tóurù dào gōngzuò zhōng.",
        "english": "He puts all his energy into his work."
      }
    ]
  },
  {
    "hanzi": "景色",
    "pinyin": "jǐng sè",
    "english": "Noun: scenery, view, landscape",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "山顶的景色美极了。",
        "pinyin": "Shāndǐng de jǐngsè měi jí le.",
        "english": "The view from the top of the mountain is extremely beautiful."
      }
    ]
  },
  {
    "hanzi": "经营",
    "pinyin": "jīng yíng",
    "english": "Verb: to run, to operate, to engage in business, etc.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这家餐厅经营得很好。",
        "pinyin": "Zhè jiā cāntīng jīngyíng de hěn hǎo.",
        "english": "This restaurant is managed very well."
      }
    ]
  },
  {
    "hanzi": "救",
    "pinyin": "jiù",
    "english": "Verb: to relieve, to rescue",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "医生尽力救活了那个病人。",
        "pinyin": "Yīshēng jìnlì jiù huó le nà ge bìngrén.",
        "english": "The doctor tried his best to save the patient's life."
      }
    ]
  },
  {
    "hanzi": "酒吧",
    "pinyin": "jiǔ bā",
    "english": "Noun: bar, pub",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "晚上我们去酒吧。",
        "pinyin": "Wǎnshang wǒmen qù jiǔbā.",
        "english": "We go to the bar at night."
      }
    ]
  },
  {
    "hanzi": "舅舅",
    "pinyin": "jiù jiu",
    "english": "Noun: uncle maternal",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的舅舅是位中学老师。",
        "pinyin": "Wǒ de jiùjiu shì wèi zhōngxué lǎoshī.",
        "english": "My maternal uncle is a middle school teacher."
      }
    ]
  },
  {
    "hanzi": "具备",
    "pinyin": "jù bèi",
    "english": "Verb: to possess, to have",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你具备成为队长的条件。",
        "pinyin": "Nǐ jùbèi chéngwéi duìzhǎng de tiáojiàn.",
        "english": "You possess the qualifications to become captain."
      }
    ]
  },
  {
    "hanzi": "巨大",
    "pinyin": "jù dà",
    "english": "Adjective: huge enormous",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这次地震造成了巨大的损失。",
        "pinyin": "Zhè cì dìzhèn zàochéngle jùdà de sǔnshī.",
        "english": "This earthquake caused enormous losses."
      }
    ]
  },
  {
    "hanzi": "聚会",
    "pinyin": "jù huì",
    "english": " Noun: party, gathering Verb: to party, to get together",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "周末有同学聚会。",
        "pinyin": "Zhōumò yǒu tóngxué jùhuì.",
        "english": "Classmate party this weekend."
      }
    ]
  },
  {
    "hanzi": "俱乐部",
    "pinyin": "jù lè bù",
    "english": "Noun: club",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我周末会去健身俱乐部。",
        "pinyin": "Wǒ zhōumò huì qù jiànshēn jùlèbù.",
        "english": "I will go to the fitness club on the weekend."
      }
    ]
  },
  {
    "hanzi": "居然",
    "pinyin": "jū rán",
    "english": "Adverb: unexpectedly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他居然忘了我的生日。",
        "pinyin": "Tā jūrán wàngle wǒ de shēngrì.",
        "english": "He actually forgot my birthday."
      }
    ]
  },
  {
    "hanzi": "据说",
    "pinyin": "jù shuō",
    "english": "Adverb: it is said, reportedly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "据说他已经出国了。",
        "pinyin": "Jùshuō tā yǐjīng chūguó le.",
        "english": "It is said that he has already gone abroad."
      }
    ]
  },
  {
    "hanzi": "具体",
    "pinyin": "jù tǐ",
    "english": "Adjective: concrete, specific",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请你讲讲具体的计划。",
        "pinyin": "Qǐng nǐ jiǎng jiǎng jùtǐ de jìhuà.",
        "english": "Please tell me the specific plan."
      }
    ]
  },
  {
    "hanzi": "桔子",
    "pinyin": "jú zi",
    "english": "Noun: tangerine",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢吃甜甜的桔子。",
        "pinyin": "Wǒ xǐhuān chī tián tián de júzi.",
        "english": "I like eating sweet tangerines."
      }
    ]
  },
  {
    "hanzi": "卷",
    "pinyin": "juǎn",
    "english": " Noun: roll Verb: to roll Measure Word: for roll, spool",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请把纸卷起来。",
        "pinyin": "Qǐng bǎ zhǐ juǎn qǐlái.",
        "english": "Please roll up the paper."
      }
    ]
  },
  {
    "hanzi": "捐",
    "pinyin": "juān",
    "english": " Noun: tax, contribution Verb: to contribute, to donate, to give up",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他向慈善机构捐了一大笔钱。",
        "pinyin": "Tā xiàng císhàn jīgòu juānle yī dà bǐ qián.",
        "english": "He donated a large sum of money to the charity."
      }
    ]
  },
  {
    "hanzi": "绝对",
    "pinyin": "jué duì",
    "english": "Adjective: absolute, unconditional",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们绝对不能迟到。",
        "pinyin": "Wǒmen juéduì bù néng chídào.",
        "english": "We absolutely cannot be late."
      }
    ]
  },
  {
    "hanzi": "决赛",
    "pinyin": "jué sài",
    "english": "Noun: final competition",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "明天我们有篮球决赛。",
        "pinyin": "Míngtiān wǒmen yǒu lánqiú juésài.",
        "english": "We have the basketball finals tomorrow."
      }
    ]
  },
  {
    "hanzi": "角色",
    "pinyin": "jué sè",
    "english": "Noun: character in a book, play, et",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她演的是一个重要的角色。",
        "pinyin": "Tā yǎn de shì yīgè zhòngyào de juésè.",
        "english": "The role she plays is an important one."
      }
    ]
  },
  {
    "hanzi": "卡车",
    "pinyin": "kǎ chē",
    "english": "Noun: truck, lorry",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "卡车装满货物。",
        "pinyin": "Kǎchē zhuāng mǎn huòwù.",
        "english": "The truck is full of goods."
      }
    ]
  },
  {
    "hanzi": "开发",
    "pinyin": "kāi fā",
    "english": "Verb: to develop e.g. IT, to exploit a resource",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "开发新产品。",
        "pinyin": "Kāifā xīn chǎnpǐn.",
        "english": "Develop new products."
      }
    ]
  },
  {
    "hanzi": "开放",
    "pinyin": "kāi fàng",
    "english": "Verb: to open up for public, etc.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个公园全年对公众开放。",
        "pinyin": "Zhège gōngyuán quánnián duì gōngzhòng kāifàng.",
        "english": "This park is open to the public all year round."
      }
    ]
  },
  {
    "hanzi": "开幕式",
    "pinyin": "kāi mù shì",
    "english": "Noun: opening ceremony",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "奥运会的开幕式非常精彩。",
        "pinyin": "Àoyùnhuì de kāimùshì fēicháng jīngcǎi.",
        "english": "The opening ceremony of the Olympics was very exciting."
      }
    ]
  },
  {
    "hanzi": "开心",
    "pinyin": "kāi xīn",
    "english": " Verb: to feel happy, to make fun of sb. Adjective: happy",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "今天很开心。",
        "pinyin": "Jīntiān hěn kāixīn.",
        "english": "Very happy today."
      }
    ]
  },
  {
    "hanzi": "砍",
    "pinyin": "kǎn",
    "english": "Verb: to chop, to cut down",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "农民在砍伐旧树。",
        "pinyin": "Nóngmín zài kǎnfá jiù shù.",
        "english": "The farmers are cutting down old trees."
      }
    ]
  },
  {
    "hanzi": "看不起",
    "pinyin": "kàn bu qǐ",
    "english": "Verb: to look down upon",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们不应该看不起任何人。",
        "pinyin": "Wǒmen bù yīnggāi kànbùqǐ rènhé rén.",
        "english": "We should not look down upon anyone."
      }
    ]
  },
  {
    "hanzi": "抗议",
    "pinyin": "kàng yì",
    "english": "Verb: to protest",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们组织了一场和平抗议。",
        "pinyin": "Tāmen zǔzhīle yī chǎng hépíng kàngyì.",
        "english": "They organized a peaceful protest."
      }
    ]
  },
  {
    "hanzi": "烤鸭",
    "pinyin": "kǎo yā",
    "english": "Noun: roast duck",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "北京烤鸭有名。",
        "pinyin": "Běijīng kǎoyā yǒumíng.",
        "english": "Beijing roast duck is famous."
      }
    ]
  },
  {
    "hanzi": "克",
    "pinyin": "kè",
    "english": " Verb: to subdue, to restrain Measure Word: 1 gram",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这枚戒指重五克。",
        "pinyin": "Zhè méi jièzhǐ zhòng wǔ kè.",
        "english": "This ring weighs five grams."
      }
    ]
  },
  {
    "hanzi": "颗",
    "pinyin": "kē",
    "english": "Measure Word: for grain, pearls, teeth, stars, etc.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我买了一颗钻石戒指。",
        "pinyin": "Wǒ mǎi le yī kē zuànshí jièzhǐ.",
        "english": "I bought a diamond ring."
      }
    ]
  },
  {
    "hanzi": "课程",
    "pinyin": "kè chéng",
    "english": "Noun: course, class",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这门课程非常有趣。",
        "pinyin": "Zhè mén kèchéng fēicháng yǒuqù.",
        "english": "This course is very interesting."
      }
    ]
  },
  {
    "hanzi": "克服",
    "pinyin": "kè fú",
    "english": "Verb: to overcome, to conquer, to put up with",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们必须克服这些困难。",
        "pinyin": "Wǒmen bìxū kèfú zhèxiē kùnnán.",
        "english": "We must overcome these difficulties."
      }
    ]
  },
  {
    "hanzi": "客观",
    "pinyin": "kè guān",
    "english": "Adjective: objective, impartial",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们需要一个客观的评价。",
        "pinyin": "Wǒmen xūyào yīgè kèguān de píngjià.",
        "english": "We need an objective evaluation."
      }
    ]
  },
  {
    "hanzi": "可见",
    "pinyin": "kě jiàn",
    "english": "Conjunction: it is obvious that, it can clearly be seen that",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他今天没来，可见他病得不轻。",
        "pinyin": "Tā jīntiān méi lái, kějiàn tā bìng de bù qīng.",
        "english": "He didn't come today, so it is obvious that his illness is serious."
      }
    ]
  },
  {
    "hanzi": "可靠",
    "pinyin": "kě kào",
    "english": "Adjective: reliable, dependable",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他是一个非常可靠的人。",
        "pinyin": "Tā shì yīgè fēicháng kěkào de rén.",
        "english": "He is a very reliable person."
      }
    ]
  },
  {
    "hanzi": "刻苦",
    "pinyin": "kè kǔ",
    "english": "Adjective: hardworking, assiduous",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他学习非常刻苦。",
        "pinyin": "Tā xuéxí fēicháng kèkǔ.",
        "english": "He studies very assiduously."
      }
    ]
  },
  {
    "hanzi": "可怕",
    "pinyin": "kě pà",
    "english": "Adjective: awful, terrible",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "夜晚森林很可怕。",
        "pinyin": "Yèwǎn sēnlín hěn kěpà.",
        "english": "The forest at night is terrible."
      }
    ]
  },
  {
    "hanzi": "客厅",
    "pinyin": "kè tīng",
    "english": "Noun: living room",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们在客厅里看电视。",
        "pinyin": "Wǒmen zài kètīng lǐ kàn diànshì.",
        "english": "We are watching TV in the living room."
      }
    ]
  },
  {
    "hanzi": "空间",
    "pinyin": "kōng jiān",
    "english": "Noun: space",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "房间里没有多余的空间了。",
        "pinyin": "Fángjiān lǐ méiyǒu duōyú de kōngjiān le.",
        "english": "There is no extra space left in the room."
      }
    ]
  },
  {
    "hanzi": "空闲",
    "pinyin": "kòng xián",
    "english": "Noun: leisure Adjective: idle",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你空闲的时候喜欢做什么？",
        "pinyin": "Nǐ kòngxián de shíhou xǐhuān zuò shénme?",
        "english": "What do you like to do in your free time?"
      }
    ]
  },
  {
    "hanzi": "控制",
    "pinyin": "kòng zhì",
    "english": "Noun: control Verb: to control",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请控制好你的情绪。",
        "pinyin": "Qǐng kòngzhì hǎo nǐ de qíngxù.",
        "english": "Please control your emotions well."
      }
    ]
  },
  {
    "hanzi": "口味",
    "pinyin": "kǒu wèi",
    "english": "Noun: taste, flavour",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的口味比较清淡。",
        "pinyin": "Wǒ de kǒuwèi bǐjiào qīngdàn.",
        "english": "My preference for flavor is relatively light."
      }
    ]
  },
  {
    "hanzi": "夸",
    "pinyin": "kuā",
    "english": "Verb: to praise, to boast",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "老师夸他进步很大。",
        "pinyin": "Lǎoshī kuā tā jìnbù hěn dà.",
        "english": "The teacher praised him for making great progress."
      }
    ]
  },
  {
    "hanzi": "会计",
    "pinyin": "kuài jì",
    "english": "Noun: accountant, accounting",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他是一家公司的会计。",
        "pinyin": "Tā shì yī jiā gōngsī de kuàijì.",
        "english": "He is an accountant at a company."
      }
    ]
  },
  {
    "hanzi": "矿泉水",
    "pinyin": "kuàng quán shuǐ",
    "english": "Noun: mineral water",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请给我一瓶矿泉水。",
        "pinyin": "Qǐng gěi wǒ yī píng kuàngquánshuǐ.",
        "english": "Please give me a bottle of mineral water."
      }
    ]
  },
  {
    "hanzi": "来自",
    "pinyin": "lái zì",
    "english": "Verb: to come from",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他来自上海。",
        "pinyin": "Tā láizì Shànghǎi.",
        "english": "He comes from Shanghai."
      }
    ]
  },
  {
    "hanzi": "拦",
    "pinyin": "lán",
    "english": "Verb: to block, to hinder",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "别拦着我。",
        "pinyin": "Bié lán zhe wǒ.",
        "english": "Don’t block me."
      }
    ]
  },
  {
    "hanzi": "烂",
    "pinyin": "làn",
    "english": " Verb: to rot Adjective: rotten, mushy, soft",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "苹果烂了不能吃。",
        "pinyin": "Píngguǒ làn le bùnéng chī.",
        "english": "The apple is rotten"
      }
    ]
  },
  {
    "hanzi": "狼",
    "pinyin": "láng",
    "english": "Noun: wolf",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "森林里有狼。",
        "pinyin": "Sēnlín lǐ yǒu láng.",
        "english": "There are wolves in the forest."
      }
    ]
  },
  {
    "hanzi": "老百姓",
    "pinyin": "lǎo bǎi xìng",
    "english": "Noun: ordinary people",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "政策是为了老百姓服务的。",
        "pinyin": "Zhèngcè shì wèile lǎobǎixìng fúwù de.",
        "english": "The policy is intended to serve the common people."
      }
    ]
  },
  {
    "hanzi": "老板",
    "pinyin": "lǎo bǎn",
    "english": "Noun: boss, owner",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的老板今天不在办公室。",
        "pinyin": "Wǒ de lǎobǎn jīntiān bú zài bàngōngshì.",
        "english": "My boss is not in the office today."
      }
    ]
  },
  {
    "hanzi": "劳动",
    "pinyin": "láo dòng",
    "english": "Noun: work, labour",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "劳动最光荣。",
        "pinyin": "Láodòng zuì guāngróng.",
        "english": "Labor is glorious."
      }
    ]
  },
  {
    "hanzi": "劳驾",
    "pinyin": "láo jià",
    "english": "Expression: excuse me",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "劳驾让一下。",
        "pinyin": "Láojià ràng yīxià.",
        "english": "Excuse me"
      }
    ]
  },
  {
    "hanzi": "姥姥",
    "pinyin": "lǎo lao",
    "english": "Noun: grandmother mother's mum",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我姥姥做饭好吃。",
        "pinyin": "Wǒ lǎolao zuò fàn hǎo chī.",
        "english": "My grandma cooks well."
      }
    ]
  },
  {
    "hanzi": "老实",
    "pinyin": "lǎo shi",
    "english": "Adjective: honest, sincere",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他是一个非常老实的人。",
        "pinyin": "Tā shì yīgè fēicháng lǎoshí de rén.",
        "english": "He is a very honest person."
      }
    ]
  },
  {
    "hanzi": "老鼠",
    "pinyin": "lǎo shǔ",
    "english": "Noun: rat, mouse",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "家里有老鼠。",
        "pinyin": "Jiā lǐ yǒu lǎoshǔ.",
        "english": "There’s a mouse in the house."
      }
    ]
  },
  {
    "hanzi": "乐观",
    "pinyin": "lè guān",
    "english": "Adjective: optimistic, hopeful",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们要保持乐观的态度。",
        "pinyin": "Wǒmen yào bǎochí lèguān de tàidù.",
        "english": "We must maintain an optimistic attitude."
      }
    ]
  },
  {
    "hanzi": "雷",
    "pinyin": "léi",
    "english": "Noun: thunder",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "刚才打了一声很大的雷。",
        "pinyin": "Gāngcái dǎ le yī shēng hěn dà de léi.",
        "english": "There was a very loud clap of thunder just now."
      }
    ]
  },
  {
    "hanzi": "类",
    "pinyin": "lèi",
    "english": " Noun: sort, kind, category Measure Word: for sorts, types, categories, etc.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这类问题很难。",
        "pinyin": "Zhè lèi wèntí hěn nán.",
        "english": "This type of problem is hard."
      }
    ]
  },
  {
    "hanzi": "梨",
    "pinyin": "lí",
    "english": "Noun: pear",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "梨很甜。",
        "pinyin": "Lí hěn tián.",
        "english": "Pears are sweet."
      }
    ]
  },
  {
    "hanzi": "离婚",
    "pinyin": "lí hūn",
    "english": "Noun: divorce Verb: to divorce from",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们决定和平离婚。",
        "pinyin": "Tāmen juédìng hépíng líhūn.",
        "english": "They decided to divorce peacefully."
      }
    ]
  },
  {
    "hanzi": "立刻",
    "pinyin": "lì kè",
    "english": "Adverb: immediately, at once",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我要求你立刻停止。",
        "pinyin": "Wǒ yāoqiú nǐ lìkè tíngzhǐ.",
        "english": "I demand you stop immediately."
      }
    ]
  },
  {
    "hanzi": "力量",
    "pinyin": "lì liàng",
    "english": "Noun: power, force, strength",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "团结就是力量。",
        "pinyin": "Tuánjié jiùshì lìliàng.",
        "english": "Unity is strength."
      }
    ]
  },
  {
    "hanzi": "理论",
    "pinyin": "lǐ lùn",
    "english": "Noun: theory",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这只是一个理论，还需要验证。",
        "pinyin": "Zhè zhǐshì yīgè lǐlùn, hái xūyào yànzhèng.",
        "english": "This is just a theory; it still needs verification."
      }
    ]
  },
  {
    "hanzi": "厘米",
    "pinyin": "lí mǐ",
    "english": "Measure Word: centimeter",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这块木板有十厘米厚。",
        "pinyin": "Zhè kuài mùbǎn yǒu shí límǐ hòu.",
        "english": "This piece of wood is ten centimeters thick."
      }
    ]
  },
  {
    "hanzi": "利润",
    "pinyin": "lì rùn",
    "english": "Noun: profit",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "公司的利润今年增加了。",
        "pinyin": "Gōngsī de lìrùn jīnnián zēngjiā le.",
        "english": "The company's profit increased this year."
      }
    ]
  },
  {
    "hanzi": "利息",
    "pinyin": "lì xī",
    "english": "Noun: interest on a loan",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "银行存款有利息收入。",
        "pinyin": "Yínháng cúnkuǎn yǒu lìxī shōurù.",
        "english": "Bank deposits generate interest income."
      }
    ]
  },
  {
    "hanzi": "利益",
    "pinyin": "lì yì",
    "english": "Noun: benefit",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "考虑个人利益。",
        "pinyin": "Kǎolǜ gèrén lìyì.",
        "english": "Consider personal benefits."
      }
    ]
  },
  {
    "hanzi": "利用",
    "pinyin": "lì yòng",
    "english": "Verb: to make use of, to utilize",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "利用时间学习。",
        "pinyin": "Lìyòng shíjiān xuéxí.",
        "english": "Use time to study."
      }
    ]
  },
  {
    "hanzi": "理由",
    "pinyin": "lǐ yóu",
    "english": "Noun: reason, justification",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请给我一个合理的理由。",
        "pinyin": "Qǐng gěi wǒ yīgè hélǐ de lǐyóu.",
        "english": "Please give me a reasonable reason."
      }
    ]
  },
  {
    "hanzi": "联合",
    "pinyin": "lián hé",
    "english": " Noun: alliance, union Verb: to unite, to join Adjective: combined, joint",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们联合起来完成了任务。",
        "pinyin": "Wǒmen liánhé qǐlái wánchéngle rènwu.",
        "english": "We united to complete the task."
      }
    ]
  },
  {
    "hanzi": "良好",
    "pinyin": "liáng hǎo",
    "english": "Adjective: good, favorable, fine",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他与同事保持着良好关系。",
        "pinyin": "Tā yǔ tóngshì bǎochí zhe liánghǎo guānxì.",
        "english": "He maintains good relations with his colleagues."
      }
    ]
  },
  {
    "hanzi": "粮食",
    "pinyin": "liáng shi",
    "english": "Noun: food, cereals",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们必须节约粮食。",
        "pinyin": "Wǒmen bìxū jiéyuē liángshi.",
        "english": "We must save grain/food."
      }
    ]
  },
  {
    "hanzi": "了不起",
    "pinyin": "liǎo bu qǐ",
    "english": "Adjective: amazing, extraordnary",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他这么快就学会了中文，真了不起！",
        "pinyin": "Tā zhème kuài jiù xuéhuì le Zhōngwén, zhēn liǎobuqǐ!",
        "english": "It's truly amazing that he learned Chinese so quickly!"
      }
    ]
  },
  {
    "hanzi": "临时",
    "pinyin": "lín shí",
    "english": "Adjective: temporary",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们临时决定去野餐。",
        "pinyin": "Wǒmen línshí juédìng qù yěcān.",
        "english": "We decided spontaneously to go for a picnic."
      }
    ]
  },
  {
    "hanzi": "铃",
    "pinyin": "líng",
    "english": "Noun: bell",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "门铃响了。",
        "pinyin": "Ménlíng xiǎng le.",
        "english": "The doorbell rang."
      }
    ]
  },
  {
    "hanzi": "领导",
    "pinyin": "lǐng dǎo",
    "english": " Noun: leader, leadership Verb: to lead",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "好的领导能激励团队。",
        "pinyin": "Hǎo de lǐngdǎo néng jīlì tuánduì.",
        "english": "A good leader can motivate the team."
      }
    ]
  },
  {
    "hanzi": "灵活",
    "pinyin": "líng huó",
    "english": "Adjective: flexible, agile, nimble",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的思维非常灵活。",
        "pinyin": "Tā de sīwéi fēicháng línghuó.",
        "english": "His thinking is very flexible."
      }
    ]
  },
  {
    "hanzi": "零钱",
    "pinyin": "líng qián",
    "english": "Noun: change money",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "找零钱给我。",
        "pinyin": "Zhǎo língqián gěi wǒ.",
        "english": "Give me change."
      }
    ]
  },
  {
    "hanzi": "零食",
    "pinyin": "líng shí",
    "english": "Noun: snack",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "小孩喜欢吃各种零食。",
        "pinyin": "Xiǎohái xǐhuān chī gè zhǒng língshí.",
        "english": "Children like to eat all kinds of snacks."
      }
    ]
  },
  {
    "hanzi": "领域",
    "pinyin": "lǐng yù",
    "english": "Noun: field, domain, area, territory",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他已经进入了新的研究领域。",
        "pinyin": "Tā yǐjīng jìnrù le xīn de yánjiū lǐngyù.",
        "english": "He has entered a new field of research."
      }
    ]
  },
  {
    "hanzi": "流传",
    "pinyin": "liú chuán",
    "english": "Verb: to spread, to circulate, to hand down",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个故事已经流传了很久。",
        "pinyin": "Zhège gùshi yǐjīng liúchuánle hěn jiǔ.",
        "english": "This story has been circulating for a long time."
      }
    ]
  },
  {
    "hanzi": "浏览",
    "pinyin": "liú lǎn",
    "english": "Verb: to skim over, to browse, to surf IT",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢每天早上浏览新闻。",
        "pinyin": "Wǒ xǐhuān měitiān zǎoshang liúlǎn xīnwén.",
        "english": "I like to browse the news every morning."
      }
    ]
  },
  {
    "hanzi": "龙",
    "pinyin": "lóng",
    "english": "Noun: dragon",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "龙是中国传统文化的象征。",
        "pinyin": "Lóng shì Zhōngguó chuántǒng wénhuà de xiàngzhēng.",
        "english": "The dragon is a symbol of traditional Chinese culture."
      }
    ]
  },
  {
    "hanzi": "漏",
    "pinyin": "lòu",
    "english": "Verb: to leak",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "房顶漏水了，需要修理。",
        "pinyin": "Fángdǐng lòu shuǐ le, xūyào xiūlǐ.",
        "english": "The roof is leaking and needs repair."
      }
    ]
  },
  {
    "hanzi": "露",
    "pinyin": "lù",
    "english": " Noun: dew, syrup, nectar Verb: to uncover, to expose, to reveal",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "草地上还有清晨的露水。",
        "pinyin": "Cǎodì shang hái yǒu qīngchén de lùshuǐ.",
        "english": "There is still morning dew on the grass."
      }
    ]
  },
  {
    "hanzi": "陆地",
    "pinyin": "lù dì",
    "english": "Noun: land, dry land",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "大部分动物生活在陆地上。",
        "pinyin": "Dàbùfèn dòngwù shēnghuó zài lùdì shang.",
        "english": "Most animals live on land."
      }
    ]
  },
  {
    "hanzi": "陆续",
    "pinyin": "lù xù",
    "english": "Adverb: one after another, bit by bit",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "客人陆续到来。",
        "pinyin": "Kèren lùxù dàolái.",
        "english": "Guests arrive one by one."
      }
    ]
  },
  {
    "hanzi": "录音",
    "pinyin": "lù yīn",
    "english": "Noun: sound recording Verb: to record",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请把这段对话录音下来。",
        "pinyin": "Qǐng bǎ zhè duàn duìhuà lùyīn xiàlái.",
        "english": "Please record this conversation."
      }
    ]
  },
  {
    "hanzi": "轮流",
    "pinyin": "lún liú",
    "english": "Verb: to alternate, to take turns",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们轮流值班。",
        "pinyin": "Wǒmen lúnliú zhíbān.",
        "english": "We take turns on duty."
      }
    ]
  },
  {
    "hanzi": "论文",
    "pinyin": "lùn wén",
    "english": "Noun: paper, thesis",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "写毕业论文。",
        "pinyin": "Xiě bìyè lùnwén.",
        "english": "Write a graduation thesis."
      }
    ]
  },
  {
    "hanzi": "落后",
    "pinyin": "luò hòu",
    "english": "Verb: to fall behind, to lag",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "技术不能落后。",
        "pinyin": "Jìshù bùnéng luòhòu.",
        "english": "Technology must not lag."
      }
    ]
  },
  {
    "hanzi": "逻辑",
    "pinyin": "luó ji",
    "english": "Noun: logic",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "逻辑很清晰。",
        "pinyin": "Luóji hěn qīngxī.",
        "english": "The logic is clear."
      }
    ]
  },
  {
    "hanzi": "骂",
    "pinyin": "mà",
    "english": " Noun: abuse Verb: to abuse, to curse",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "老师不应该骂学生。",
        "pinyin": "Lǎoshī bù yìnggāi mà xuésheng.",
        "english": "Teachers should not scold students."
      }
    ]
  },
  {
    "hanzi": "麦克风",
    "pinyin": "mài kè fēng",
    "english": "Noun: microphone",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "麦克风没声音。",
        "pinyin": "Màikèfēng méi shēngyīn.",
        "english": "The microphone has no sound."
      }
    ]
  },
  {
    "hanzi": "馒头",
    "pinyin": "mán tou",
    "english": "Noun: steamed bun",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "早餐吃馒头。",
        "pinyin": "Zǎocān chī mántou.",
        "english": "Eat steamed buns for breakfast."
      }
    ]
  },
  {
    "hanzi": "满足",
    "pinyin": "mǎn zú",
    "english": "Verb: to satisfy",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "满足客户需求。",
        "pinyin": "Mǎnzú kèhù xūqiú.",
        "english": "Satisfy client needs."
      }
    ]
  },
  {
    "hanzi": "毛",
    "pinyin": "máo",
    "english": " Noun: hair, down Measure Word: for 0.1 RMB",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这只狗的毛很软。",
        "pinyin": "Zhè zhī gǒu de máo hěn ruǎn.",
        "english": "This dog's fur is very soft."
      }
    ]
  },
  {
    "hanzi": "毛病",
    "pinyin": "máo bìng",
    "english": "Noun: defect, fault, trouble",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的电脑出毛病了。",
        "pinyin": "Tā de diànnǎo chū máobìng le.",
        "english": "His computer is acting up (has a fault)."
      }
    ]
  },
  {
    "hanzi": "矛盾",
    "pinyin": "máo dùn",
    "english": "Noun: contradiction Adjective: contradictory",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们的说法互相矛盾。",
        "pinyin": "Tāmen de shuōfǎ hùxiāng máodùn.",
        "english": "Their statements contradict each other."
      }
    ]
  },
  {
    "hanzi": "冒险",
    "pinyin": "mào xiǎn",
    "english": "Verb: to take a risk",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "徒步穿越沙漠是很冒险的。",
        "pinyin": "Túbù chuānyuè shāmò shì hěn màoxiǎn de.",
        "english": "Trekking across the desert is very adventurous/risky."
      }
    ]
  },
  {
    "hanzi": "贸易",
    "pinyin": "mào yì",
    "english": "Noun: trade",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "国际贸易很重要。",
        "pinyin": "Guójì màoyì hěn zhòngyào.",
        "english": "International trade is important."
      }
    ]
  },
  {
    "hanzi": "魅力",
    "pinyin": "mèi lì",
    "english": "Noun: charm, fascination",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的演讲充满了个人魅力。",
        "pinyin": "Tā de yǎnjiǎng chōngmǎn le gèrén mèilì.",
        "english": "His speech was full of personal charm."
      }
    ]
  },
  {
    "hanzi": "眉毛",
    "pinyin": "méi mao",
    "english": "Noun: eyebrow",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "眉毛很浓。",
        "pinyin": "Méimao hěn nóng.",
        "english": "Eyebrows are thick."
      }
    ]
  },
  {
    "hanzi": "美术",
    "pinyin": "měi shù",
    "english": "Noun: fine arts, art",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她在大学里学的是美术。",
        "pinyin": "Tā zài dàxué lǐ xué de shì měishù.",
        "english": "She studies fine arts at university."
      }
    ]
  },
  {
    "hanzi": "煤炭",
    "pinyin": "méi tàn",
    "english": "Noun: coal",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "煤炭是一种重要的能源。",
        "pinyin": "Méitàn shì yī zhǒng zhòngyào de néngyuán.",
        "english": "Coal is an important source of energy."
      }
    ]
  },
  {
    "hanzi": "蜜蜂",
    "pinyin": "mì fēng",
    "english": "Noun: honeybee",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "蜜蜂采蜜。",
        "pinyin": "Mìfēng cǎi mì.",
        "english": "Bees collect honey."
      }
    ]
  },
  {
    "hanzi": "迷路",
    "pinyin": "mí lù",
    "english": "Verb: to get lost, to lose the way",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们在森林里迷路了。",
        "pinyin": "Wǒmen zài sēnlín lǐ mílù le.",
        "english": "We got lost in the forest."
      }
    ]
  },
  {
    "hanzi": "秘密",
    "pinyin": "mì mì",
    "english": " Noun: secret Adjective: secret, confidential",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是我的秘密。",
        "pinyin": "Zhè shì wǒ de mìmì.",
        "english": "This is my secret."
      }
    ]
  },
  {
    "hanzi": "密切",
    "pinyin": "mì qiè",
    "english": "Adjective: close, intimate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这两件事有着密切的关系。",
        "pinyin": "Zhè liǎng jiàn shì yǒu zhe mìqiè de guānxi.",
        "english": "These two things have a close relationship."
      }
    ]
  },
  {
    "hanzi": "谜语",
    "pinyin": "mí yǔ",
    "english": "Noun: riddle",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "猜个谜语吧。",
        "pinyin": "Cāi gè míyǔ ba.",
        "english": "Guess a riddle."
      }
    ]
  },
  {
    "hanzi": "面对",
    "pinyin": "miàn duì",
    "english": "Verb: to face, to confront",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们必须勇敢地面对挑战。",
        "pinyin": "Wǒmen bìxū yǒnggǎn de miànduì tiǎozhàn.",
        "english": "We must bravely face the challenge."
      }
    ]
  },
  {
    "hanzi": "面积",
    "pinyin": "miàn jī",
    "english": "Noun: area",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个房间的面积有多大？",
        "pinyin": "Zhège fángjiān de miànjī yǒu duō dà?",
        "english": "How large is the area of this room?"
      }
    ]
  },
  {
    "hanzi": "面临",
    "pinyin": "miàn lín",
    "english": "Verb: to face sth., to be confronted with",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "面临巨大挑战。",
        "pinyin": "Miànlín jùdà tiǎozhàn.",
        "english": "Face huge challenges."
      }
    ]
  },
  {
    "hanzi": "秒",
    "pinyin": "miǎo",
    "english": "Time: second",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "等我三十秒，我马上就好。",
        "pinyin": "Děng wǒ sānshí miǎo, wǒ mǎshàng jiù hǎo.",
        "english": "Wait for me thirty seconds, I'll be ready immediately."
      }
    ]
  },
  {
    "hanzi": "苗条",
    "pinyin": "miáo tiao",
    "english": "Adjective: slim, slender, graceful",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "身材很苗条。",
        "pinyin": "Shēncái hěn miáotiao.",
        "english": "Slim figure."
      }
    ]
  },
  {
    "hanzi": "描写",
    "pinyin": "miáo xiě",
    "english": " Noun: description Verb: to describe, to depict, to portray",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "文章描写很生动。",
        "pinyin": "Wénzhāng miáoxiě hěn shēngdòng.",
        "english": "The article describes vividly."
      }
    ]
  },
  {
    "hanzi": "命令",
    "pinyin": "mìng lìng",
    "english": " Noun: order, command Verb: to order, to command",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他接到命令立刻出发。",
        "pinyin": "Tā jiē dào mìnglìng lìkè chūfā.",
        "english": "He received the order and set off immediately."
      }
    ]
  },
  {
    "hanzi": "名牌",
    "pinyin": "míng pái",
    "english": "Noun: famous brand",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她只买名牌衣服。",
        "pinyin": "Tā zhǐ mǎi míngpái yīfu.",
        "english": "She only buys designer clothes (famous brand clothes)."
      }
    ]
  },
  {
    "hanzi": "名片",
    "pinyin": "míng piàn",
    "english": "Noun: business card",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "交换名片。",
        "pinyin": "Jiāohuàn míngpiàn.",
        "english": "Exchange business cards."
      }
    ]
  },
  {
    "hanzi": "明确",
    "pinyin": "míng què",
    "english": "Adjective: clear, definite, explicit",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请给我一个明确的答复。",
        "pinyin": "Qǐng gěi wǒ yī ge míngquè de dáfù.",
        "english": "Please give me a clear answer."
      }
    ]
  },
  {
    "hanzi": "明显",
    "pinyin": "míng xiǎn",
    "english": "Adjective: clear, obvious",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的进步很明显。",
        "pinyin": "Tā de jìnbù hěn míngxiǎn.",
        "english": "His progress is very obvious."
      }
    ]
  },
  {
    "hanzi": "命运",
    "pinyin": "mìng yùn",
    "english": "Noun: fate, destiny",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "每个人都有自己的命运。",
        "pinyin": "Měi ge rén dōu yǒu zìjǐ de mìngyùn.",
        "english": "Everyone has their own destiny."
      }
    ]
  },
  {
    "hanzi": "摸",
    "pinyin": "mō",
    "english": "Verb: to touch, to feel with the hand, to grope",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "不要随便摸展览品。",
        "pinyin": "Bú yào suíbiàn mō zhǎnlǎnpǐn.",
        "english": "Do not randomly touch the exhibits."
      }
    ]
  },
  {
    "hanzi": "模仿",
    "pinyin": "mó fǎng",
    "english": "Verb: to imitate, to copy",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "孩子通过模仿学习语言。",
        "pinyin": "Háizi tōngguò mófǎng xuéxí yǔyán.",
        "english": "Children learn language through imitation."
      }
    ]
  },
  {
    "hanzi": "陌生",
    "pinyin": "mò shēng",
    "english": "Adjective: strange, unfamiliar",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我对这个地方感到很陌生。",
        "pinyin": "Wǒ duì zhège dìfang gǎndào hěn mòshēng.",
        "english": "I feel very unfamiliar with this place."
      }
    ]
  },
  {
    "hanzi": "摩托车",
    "pinyin": "mó tuō chē",
    "english": "Noun: motorbike",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "骑摩托车很快。",
        "pinyin": "Qí mótuōchē hěn kuài.",
        "english": "Riding a motorcycle is fast."
      }
    ]
  },
  {
    "hanzi": "某",
    "pinyin": "mǒu",
    "english": "Pronoun: some, certain",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "某天会下雨。",
        "pinyin": "Mǒu tiān huì xià yǔ.",
        "english": "It will rain on a certain day."
      }
    ]
  },
  {
    "hanzi": "目标",
    "pinyin": "mù biāo",
    "english": "Noun: goal, target, objective",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "设定目标努力。",
        "pinyin": "Shèdìng mùbiāo nǔlì.",
        "english": "Set goals and work hard."
      }
    ]
  },
  {
    "hanzi": "目录",
    "pinyin": "mù lù",
    "english": "Noun: catalog, table of contents",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "查看目录找章节。",
        "pinyin": "Chákàn mùlù zhǎo zhāngjié.",
        "english": "Check the catalog for chapters."
      }
    ]
  },
  {
    "hanzi": "目前",
    "pinyin": "mù qián",
    "english": "Time: at present, now",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "目前我们正在讨论这个问题。",
        "pinyin": "Mùqián wǒmen zhèngzài tǎolùn zhè ge wèntí.",
        "english": "Currently, we are discussing this issue."
      }
    ]
  },
  {
    "hanzi": "木头",
    "pinyin": "mù tou",
    "english": "Noun: log of wood, blockhead",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这张桌子是用木头做的。",
        "pinyin": "Zhè zhāng zhuōzi shì yòng mùtou zuò de.",
        "english": "This table is made of wood."
      }
    ]
  },
  {
    "hanzi": "哪怕",
    "pinyin": "nǎ pà",
    "english": "Conjunction: even if",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "哪怕下雨也去。",
        "pinyin": "Nǎpà xià yǔ yě qù.",
        "english": "Go even if it rains."
      }
    ]
  },
  {
    "hanzi": "难怪",
    "pinyin": "nán guài",
    "english": "Expression: no wonder that",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "难怪他这么累。",
        "pinyin": "Nánguài tā zhème lèi.",
        "english": "No wonder he’s so tired."
      }
    ]
  },
  {
    "hanzi": "难看",
    "pinyin": "nán kàn",
    "english": "Adjective: ugly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "字写得难看。",
        "pinyin": "Zì xiě de nánkàn.",
        "english": "The writing is ugly."
      }
    ]
  },
  {
    "hanzi": "脑袋",
    "pinyin": "nǎo dai",
    "english": "Noun: head, skull, brain",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "脑袋很疼。",
        "pinyin": "Nǎodai hěn téng.",
        "english": "My head hurts."
      }
    ]
  },
  {
    "hanzi": "嫩",
    "pinyin": "nèn",
    "english": "Adjective: tender, soft, inexperienced",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "肉很嫩好吃。",
        "pinyin": "Ròu hěn nèn hǎo chī.",
        "english": "The meat is tender and delicious."
      }
    ]
  },
  {
    "hanzi": "能干",
    "pinyin": "néng gàn",
    "english": "Adjective: able, capable, competent",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她很能干。",
        "pinyin": "Tā hěn nénggàn.",
        "english": "She’s very capable."
      }
    ]
  },
  {
    "hanzi": "能源",
    "pinyin": "néng yuán",
    "english": "Noun: energy, energy source",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "节约能源很重要。",
        "pinyin": "Jiēyuē néngyuán hěn zhòngyào.",
        "english": "Saving energy is important."
      }
    ]
  },
  {
    "hanzi": "念",
    "pinyin": "niàn",
    "english": "Verb: to read aloud",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "大声念课文。",
        "pinyin": "Dàshēng niàn kèwén.",
        "english": "Read the text aloud."
      }
    ]
  },
  {
    "hanzi": "年纪",
    "pinyin": "nián jì",
    "english": "Noun: age",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "年纪大了要休息。",
        "pinyin": "Niánjì dà le yào xiūxi.",
        "english": "Rest when older."
      }
    ]
  },
  {
    "hanzi": "派",
    "pinyin": "pài",
    "english": " Noun: school, group, pi π Verb: to send, to assign",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "老板派他去上海出差。",
        "pinyin": "Lǎobǎn pài tā qù Shànghǎi chūchāi.",
        "english": "The boss dispatched him to Shanghai for a business trip."
      }
    ]
  },
  {
    "hanzi": "拍",
    "pinyin": "pāi",
    "english": "Verb: to clap, to slap, to take a photo",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们一起拍一张照片吧。",
        "pinyin": "Wǒmen yīqǐ pāi yī zhāng zhàopiàn ba.",
        "english": "Let's take a picture together."
      }
    ]
  },
  {
    "hanzi": "盼望",
    "pinyin": "pàn wàng",
    "english": "Verb: to hope for, to look forward to",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我盼望早日见到你。",
        "pinyin": "Wǒ pànwàng zǎorì jiàndào nǐ.",
        "english": "I look forward to seeing you soon."
      }
    ]
  },
  {
    "hanzi": "配合",
    "pinyin": "pèi hé",
    "english": "Verb: to coordinate, to cooperate, to fit",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "大家要配合医生治疗。",
        "pinyin": "Dàjiā yào pèihé yīshēng zhìliáo.",
        "english": "Everyone must cooperate with the doctor's treatment."
      }
    ]
  },
  {
    "hanzi": "盆",
    "pinyin": "pén",
    "english": " Noun: basin, tub, pot Measure Word: for approx. 128 liters",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请你把这盆花搬到外面去。",
        "pinyin": "Qǐng nǐ bǎ zhè pén huā bān dào wàimiàn qù.",
        "english": "Please move this potted flower outside."
      }
    ]
  },
  {
    "hanzi": "批",
    "pinyin": "pī",
    "english": " Verb: to criticize Measure Word: for batches, lots, etc.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这批货的质量很好。",
        "pinyin": "Zhè pī huò de zhìliàng hěn hǎo.",
        "english": "The quality of this batch of goods is very good."
      }
    ]
  },
  {
    "hanzi": "批准",
    "pinyin": "pī zhǔn",
    "english": "Verb: to approve, to ratify",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "公司的申请终于被批准了。",
        "pinyin": "Gōngsī de shēnqǐng zhōngyú bèi pīzhǔn le.",
        "english": "The company's application was finally approved."
      }
    ]
  },
  {
    "hanzi": "凭",
    "pinyin": "píng",
    "english": " Noun: proof Verb: to rely on, to lean against Relative Clause: according to, on the basis of",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "凭这张票可以入场。",
        "pinyin": "Píng zhè zhāng piào kěyǐ rùchǎng.",
        "english": "You can enter based on this ticket."
      }
    ]
  },
  {
    "hanzi": "平等",
    "pinyin": "píng děng",
    "english": "Noun: equality Adjective: equal",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们争取男女平等。",
        "pinyin": "Wǒmen zhēngqǔ nán nǚ píngděng.",
        "english": "We strive for gender equality."
      }
    ]
  },
  {
    "hanzi": "破坏",
    "pinyin": "pò huài",
    "english": " Noun: destruction, damage Verb: to destroy, to break",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请不要破坏环境。",
        "pinyin": "Qǐng bú yào pòhuài huánjìng.",
        "english": "Please do not damage the environment."
      }
    ]
  },
  {
    "hanzi": "迫切",
    "pinyin": "pò qiè",
    "english": "Adjective: urgent, pressing",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个问题需要迫切解决。",
        "pinyin": "Zhè ge wèntí xūyào pòqiè jiějué.",
        "english": "This problem urgently needs to be solved."
      }
    ]
  },
  {
    "hanzi": "期待",
    "pinyin": "qī dài",
    "english": "Noun: expectation Verb: to look forward to",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我很期待这次的合作。",
        "pinyin": "Wǒ hěn qīdài zhè cì de hézuò.",
        "english": "I really look forward to this collaboration."
      }
    ]
  },
  {
    "hanzi": "启发",
    "pinyin": "qǐ fā",
    "english": " Noun: inspiration, enlightenment Verb: to inspire, to enlighten",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的话给了我很大的启发。",
        "pinyin": "Tā de huà gěi le wǒ hěn dà de qǐ fā.",
        "english": "His words gave me a lot of inspiration."
      }
    ]
  },
  {
    "hanzi": "气氛",
    "pinyin": "qì fēn",
    "english": "Noun: atmosphere, mood",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "派对的气氛非常热烈。",
        "pinyin": "Pài duì de qì fēn fēi cháng rè liè.",
        "english": "The atmosphere of the party was very enthusiastic."
      }
    ]
  },
  {
    "hanzi": "期间",
    "pinyin": "qī jiān",
    "english": "Noun: period of time, period",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "在会议期间，请保持安静。",
        "pinyin": "Zài huìyì qíjiān, qǐng bǎochí ānjìng.",
        "english": "Please remain quiet during the meeting."
      }
    ]
  },
  {
    "hanzi": "企图",
    "pinyin": "qǐ tú",
    "english": "Noun: attempt Verb: to attempt",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他企图逃避责任。",
        "pinyin": "Tā qǐ tú táo bì zé rèn.",
        "english": "He attempted to evade responsibility."
      }
    ]
  },
  {
    "hanzi": "企业",
    "pinyin": "qǐ yè",
    "english": "Noun: enterprise, company",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一家大型跨国企业。",
        "pinyin": "Zhè shì yī jiā dà xíng kuà guó qǐ yè.",
        "english": "This is a large multinational enterprise."
      }
    ]
  },
  {
    "hanzi": "汽油",
    "pinyin": "qì yóu",
    "english": "Noun: gas, gasoline",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "汽车快没汽油了，需要加油。",
        "pinyin": "Qì chē kuài méi qì yóu le, xū yào jiā yóu.",
        "english": "The car is almost out of gas and needs refueling."
      }
    ]
  },
  {
    "hanzi": "欠",
    "pinyin": "qiàn",
    "english": "Verb: to owe Adjective: deficient",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你还欠我十块钱呢。",
        "pinyin": "Nǐ hái qiàn wǒ shí kuài qián ne.",
        "english": "You still owe me ten yuan."
      }
    ]
  },
  {
    "hanzi": "浅",
    "pinyin": "qiǎn",
    "english": "Adjective: shallow, light",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "湖水很浅，可以直接走过去。",
        "pinyin": "Hú shuǐ hěn qiǎn, kě yǐ zhí jiē zǒu guò qù.",
        "english": "The lake water is very shallow; you can walk straight across."
      }
    ]
  },
  {
    "hanzi": "牵",
    "pinyin": "qiān",
    "english": "Verb: to pull, to lead, to hold hands",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "妈妈牵着孩子的手过马路。",
        "pinyin": "Mā ma qiān zhe hái zi de shǒu guò mǎ lù.",
        "english": "The mother held the child's hand while crossing the road."
      }
    ]
  },
  {
    "hanzi": "前途",
    "pinyin": "qián tú",
    "english": "Noun: prospect, future",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他对自己的前途充满信心。",
        "pinyin": "Tā duì zì jǐ de qián tú chōng mǎn xìn xīn.",
        "english": "He is full of confidence in his future prospects."
      }
    ]
  },
  {
    "hanzi": "抢",
    "pinyin": "qiǎng",
    "english": "Verb: to grab, to rob",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "那个小偷偷了钱包就抢着跑了。",
        "pinyin": "Nà ge xiǎo tōu tōu le qián bāo jiù qiǎng zhe pǎo le.",
        "english": "That thief stole the wallet and then rushed to run away."
      }
    ]
  },
  {
    "hanzi": "强烈",
    "pinyin": "qiáng liè",
    "english": "Adjective: intense, strong, violent",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他表达了强烈的反对意见。",
        "pinyin": "Tā biǎo dá le qiáng liè de fǎn duì yì jiàn.",
        "english": "He expressed strong opposing opinions."
      }
    ]
  },
  {
    "hanzi": "瞧",
    "pinyin": "qiáo",
    "english": "Verb: to look at, to see",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你快瞧，那边的风景多美！",
        "pinyin": "Nǐ kuài qiáo, nà biān de fēng jǐng duō měi!",
        "english": "Look quickly, how beautiful the scenery over there is!"
      }
    ]
  },
  {
    "hanzi": "巧妙",
    "pinyin": "qiǎo miào",
    "english": "Adjective: ingenious, clever",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个问题被他巧妙地解决了。",
        "pinyin": "Zhè ge wèn tí bèi tā qiǎo miào de jiě jué le.",
        "english": "This problem was cleverly solved by him."
      }
    ]
  },
  {
    "hanzi": "切",
    "pinyin": "qiē",
    "english": "Verb: to cut, to chop",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请你把苹果切成小块。",
        "pinyin": "Qǐng nǐ bǎ píng guǒ qiē chéng xiǎo kuài.",
        "english": "Please cut the apple into small pieces."
      }
    ]
  },
  {
    "hanzi": "亲爱",
    "pinyin": "qīn ài",
    "english": "Adjective: dear, beloved",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "亲爱的朋友们，大家好！",
        "pinyin": "Qīn 'ài de péng yǒu men, dà jiā hǎo!",
        "english": "Dear friends, hello everyone!"
      }
    ]
  },
  {
    "hanzi": "勤奋",
    "pinyin": "qín fèn",
    "english": "Adjective: hardworking, diligent",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他学习非常勤奋，成绩一直很好。",
        "pinyin": "Tā xué xí fēi cháng qín fèn, chéng jì yī zhí hěn hǎo.",
        "english": "He studies very diligently, and his grades have always been good."
      }
    ]
  },
  {
    "hanzi": "亲切",
    "pinyin": "qīn qiè",
    "english": " Noun: friendliness, hospitality Adjective: kind, cordial, amiable",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她的笑容总是那么亲切。",
        "pinyin": "Tā de xiào róng zǒng shì nà me qīn qiè.",
        "english": "Her smile is always so cordial."
      }
    ]
  },
  {
    "hanzi": "亲自",
    "pinyin": "qīn zì",
    "english": "Adverb: personally",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "经理亲自接待了那位客户。",
        "pinyin": "Jīng lǐ qīn zì jiē dài le nà wèi kè hù.",
        "english": "The manager personally received that client."
      }
    ]
  },
  {
    "hanzi": "清淡",
    "pinyin": "qīng dàn",
    "english": "Adjective: light food",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "医生建议我吃一些清淡的食物。",
        "pinyin": "Yī shēng jiàn yì wǒ chī yī xiē qīng dàn de shí wù.",
        "english": "The doctor suggested I eat some light food."
      }
    ]
  },
  {
    "hanzi": "庆祝",
    "pinyin": "qìng zhù",
    "english": "Verb: to celebrate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们决定今晚庆祝他的生日。",
        "pinyin": "Wǒ men jué dìng jīn wǎn qìng zhù tā de shēng rì.",
        "english": "We decided to celebrate his birthday tonight."
      }
    ]
  },
  {
    "hanzi": "娶",
    "pinyin": "qǔ",
    "english": "Verb: to marry men -> woman",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他决定娶她为妻。",
        "pinyin": "Tā juédìng qǔ tā wéi qī.",
        "english": "He decided to marry her."
      }
    ]
  },
  {
    "hanzi": "趋势",
    "pinyin": "qū shì",
    "english": "Noun: trend, tendency",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们需要关注最新的市场趋势。",
        "pinyin": "Wǒ men xū yào guān zhù zuì xīn de shì chǎng qū shì.",
        "english": "We need to pay attention to the latest market trends."
      }
    ]
  },
  {
    "hanzi": "劝",
    "pinyin": "quàn",
    "english": "Verb: to advise, to persuade, to encourage",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "老师劝他不要放弃。",
        "pinyin": "Lǎoshī quàn tā búyào fàngqì.",
        "english": "The teacher advised him not to give up."
      }
    ]
  },
  {
    "hanzi": "圈",
    "pinyin": "quān",
    "english": " Noun: circle, ring, loop Measure Word: for loops, laps, etc.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请你在重点词上画个圈。",
        "pinyin": "Qǐng nǐ zài zhòngdiǎn cí shang huà ge quān.",
        "english": "Please draw a circle around the key words."
      }
    ]
  },
  {
    "hanzi": "权利",
    "pinyin": "quán lì",
    "english": "Noun: right, privilege",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "每个公民都有投票的权利。",
        "pinyin": "Měi ge gōngmín dōu yǒu tóupiào de quánlì.",
        "english": "Every citizen has the right to vote."
      }
    ]
  },
  {
    "hanzi": "权力",
    "pinyin": "quán lì",
    "english": "Noun: power, authority",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "州长拥有很大的权力。",
        "pinyin": "Zhōuzhǎng yǒngyǒu hěn dà de quánlì.",
        "english": "The governor holds great power."
      }
    ]
  },
  {
    "hanzi": "缺乏",
    "pinyin": "quē fá",
    "english": " Noun: shortage Verb: to be short of, to lack",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们缺乏实践经验。",
        "pinyin": "Wǒmen quēfá shíjiàn jīngyàn.",
        "english": "We lack practical experience."
      }
    ]
  },
  {
    "hanzi": "确认",
    "pinyin": "què rèn",
    "english": " Noun: confirmation Verb: to confirm, to verify",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请你确认一下订单信息。",
        "pinyin": "Qǐng nǐ què'rèn yīxià dìngdān xìnxī.",
        "english": "Please confirm the order details."
      }
    ]
  },
  {
    "hanzi": "燃烧",
    "pinyin": "rán shāo",
    "english": "Verb: to burn, to kindle",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "木头正在火堆里燃烧。",
        "pinyin": "Mùtou zhèngzài huǒduī lǐ ránshāo.",
        "english": "The wood is burning in the bonfire."
      }
    ]
  },
  {
    "hanzi": "绕",
    "pinyin": "rào",
    "english": "Verb: to wind, to coil around, to go around",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "汽车绕着湖边行驶。",
        "pinyin": "Qìchē rào zhe hú biān xíngshǐ.",
        "english": "The car drove around the lake shore."
      }
    ]
  },
  {
    "hanzi": "热烈",
    "pinyin": "rè liè",
    "english": "Adjective: warm welcome, etc., enthusiastic",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "大家对他的到来表示热烈欢迎。",
        "pinyin": "Dàjiā duì tā de dàolái biǎoshì rèliè huānyíng.",
        "english": "Everyone gave him a warm welcome upon his arrival."
      }
    ]
  },
  {
    "hanzi": "忍不住",
    "pinyin": "rěn bu zhù",
    "english": "Verb: cannot help, unable to bear",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "听到笑话，他忍不住笑了。",
        "pinyin": "Tīng dào xiàohuà, tā rěnbuzhù xiào le.",
        "english": "Hearing the joke, he couldn't help but laugh."
      }
    ]
  },
  {
    "hanzi": "人才",
    "pinyin": "rén cái",
    "english": "Noun: talent, talented person",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "公司急需各类专业人才。",
        "pinyin": "Gōngsī jíxū gèlèi zhuānyè réncái.",
        "english": "The company urgently needs all kinds of professional talent."
      }
    ]
  },
  {
    "hanzi": "人口",
    "pinyin": "rén kǒu",
    "english": "Noun: population",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个城市的人口非常密集。",
        "pinyin": "Zhège chéngshì de rénkǒu fēicháng mìjí.",
        "english": "The population of this city is very dense."
      }
    ]
  },
  {
    "hanzi": "人类",
    "pinyin": "rén lèi",
    "english": "Noun: humanity, mankind",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "人类正在努力探索宇宙。",
        "pinyin": "Rénlèi zhèngzài nǔlì tànsuǒ yǔzhòu.",
        "english": "Mankind is striving to explore the universe."
      }
    ]
  },
  {
    "hanzi": "人生",
    "pinyin": "rén shēng",
    "english": "Noun: life, human life",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "享受人生中的每一个时刻。",
        "pinyin": "Xiǎngshòu rénshēng zhōng de měi yī gè shíkè.",
        "english": "Enjoy every moment in life."
      }
    ]
  },
  {
    "hanzi": "人事",
    "pinyin": "rén shì",
    "english": "Noun: human affairs, personnel",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这件事归人事部门管理。",
        "pinyin": "Zhè jiàn shì guī rénshì bùmén guǎnlǐ.",
        "english": "This matter is handled by the personnel department."
      }
    ]
  },
  {
    "hanzi": "人物",
    "pinyin": "rén wù",
    "english": "Noun: character, protagonist",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他是历史上的重要人物。",
        "pinyin": "Tā shì lìshǐ shang de zhòngyào rénwù.",
        "english": "He is an important figure in history."
      }
    ]
  },
  {
    "hanzi": "人员",
    "pinyin": "rén yuán",
    "english": "Noun: staff, personnel",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "所有工作人员员都必须佩戴胸牌。",
        "pinyin": "Suǒyǒu gōngzuò rényuán dōu bìxū pèidài xiōngpái.",
        "english": "All staff members must wear badges."
      }
    ]
  },
  {
    "hanzi": "日常",
    "pinyin": "rì cháng",
    "english": "Adjective: daily",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "保持良好的日常习惯很重要。",
        "pinyin": "Bǎochí liánghǎo de rìcháng xíguàn hěn zhòngyào.",
        "english": "Maintaining good daily habits is very important."
      }
    ]
  },
  {
    "hanzi": "日程",
    "pinyin": "rì chéng",
    "english": "Noun: schedule",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请把今天的日程安排发给我。",
        "pinyin": "Qǐng bǎ jīntiān de rìchéng ānpái fā gěi wǒ.",
        "english": "Please send me today's schedule."
      }
    ]
  },
  {
    "hanzi": "如何",
    "pinyin": "rú hé",
    "english": "Adverb: how, in what way",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你认为我们应该如何解决这个问题？",
        "pinyin": "Nǐ rènwéi wǒmen yīnggāi rúhé jiějué zhège wèntí?",
        "english": "How do you think we should solve this problem?"
      }
    ]
  },
  {
    "hanzi": "如今",
    "pinyin": "rú jīn",
    "english": "Time: nowadays",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "如今，科技发展得非常快。",
        "pinyin": "Rújīn, kē jì fāzhǎn de fēicháng kuài.",
        "english": "Nowadays, technology is developing very fast."
      }
    ]
  },
  {
    "hanzi": "弱",
    "pinyin": "ruò",
    "english": "Adjective: weak",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他身体很弱，需要多锻炼。",
        "pinyin": "Tā shēntǐ hěn ruò, xūyào duō duànliàn.",
        "english": "His body is very weak; he needs to exercise more."
      }
    ]
  },
  {
    "hanzi": "嗓子",
    "pinyin": "sǎng zi",
    "english": "Noun: throat, voice",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我今天嗓子有点疼，说不出话。",
        "pinyin": "Wǒ jīntiān sǎngzi yǒudiǎn téng, shuō bu chū huà.",
        "english": "My throat hurts a bit today, so I can't speak."
      }
    ]
  },
  {
    "hanzi": "沙滩",
    "pinyin": "shā tān",
    "english": "Noun: beach",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们去沙滩上晒太阳吧。",
        "pinyin": "Wǒmen qù shātān shang shài tàiyáng ba.",
        "english": "Let's go sunbathe on the beach."
      }
    ]
  },
  {
    "hanzi": "晒",
    "pinyin": "shài",
    "english": "Verb: to share files, to dry in the sun, to sunbathe",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "妈妈喜欢把被子拿出去晒一晒。",
        "pinyin": "Māma xǐhuān bǎ bèizi ná chūqù shài yī shài.",
        "english": "Mom likes to take the quilt out to dry in the sun."
      }
    ]
  },
  {
    "hanzi": "删除",
    "pinyin": "shān chú",
    "english": "Verb: to delete",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请你把这个文件删除掉。",
        "pinyin": "Qǐng nǐ bǎ zhège wénjiàn shānchú diào.",
        "english": "Please delete this file."
      }
    ]
  },
  {
    "hanzi": "善良",
    "pinyin": "shàn liáng",
    "english": "Adjective: kindhearted, good, honest",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她是一个非常善良的女孩。",
        "pinyin": "Tā shì yīgè fēicháng shànliáng de nǚhái.",
        "english": "She is a very kind girl."
      }
    ]
  },
  {
    "hanzi": "善于",
    "pinyin": "shàn yú",
    "english": "Verb: to be good at",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他善于解决复杂的问题。",
        "pinyin": "Tā shànyú jiějué fùzá de wèntí.",
        "english": "He is good at solving complex problems."
      }
    ]
  },
  {
    "hanzi": "勺子",
    "pinyin": "sháo zi",
    "english": "Noun: spoon",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请给我一个干净的勺子。",
        "pinyin": "Qǐng gěi wǒ yīgè gānjìng de sháozi.",
        "english": "Please give me a clean spoon."
      }
    ]
  },
  {
    "hanzi": "蛇",
    "pinyin": "shé",
    "english": "Noun: snake",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "森林里有很多种类的蛇。",
        "pinyin": "Sēnlín lǐ yǒu hěn duō zhǒnglèi de shé.",
        "english": "There are many types of snakes in the forest."
      }
    ]
  },
  {
    "hanzi": "设备",
    "pinyin": "shè bèi",
    "english": "Noun: equipment, facilities",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这间教室的设备都很新。",
        "pinyin": "Zhè jiān jiàoshì de shèbèi dōu hěn xīn.",
        "english": "The equipment in this classroom is all new."
      }
    ]
  },
  {
    "hanzi": "舍不得",
    "pinyin": "shě bu de",
    "english": "Verb: reluctant to give up or let go",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "孩子舍不得离开他的玩具。",
        "pinyin": "Háizi shě bu de líkāi tā de wánjù.",
        "english": "The child hates to part with his toy."
      }
    ]
  },
  {
    "hanzi": "设计",
    "pinyin": "shè jì",
    "english": " Noun: design, plan Verb: to design, to plan",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的设计理念非常独特。",
        "pinyin": "Tā de shèjì lǐniàn fēicháng dú tè.",
        "english": "His design concept is very unique."
      }
    ]
  },
  {
    "hanzi": "射击",
    "pinyin": "shè jī",
    "english": "Verb: to shoot, to fire a gun",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "射击是一项需要高度专注的运动。",
        "pinyin": "Shèjī shì yī xiàng xūyào gāodù zhuānzhù de yùndòng.",
        "english": "Shooting is a sport that requires a high degree of concentration."
      }
    ]
  },
  {
    "hanzi": "摄影",
    "pinyin": "shè yǐng",
    "english": "Verb: to take a photo, to shoot a movie",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我对摄影很感兴趣。",
        "pinyin": "Wǒ duì shèyǐng hěn gǎn xìngqù.",
        "english": "I am very interested in photography."
      }
    ]
  },
  {
    "hanzi": "伸",
    "pinyin": "shēn",
    "english": "Verb: to stretch, to extend",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他伸出手臂，向我打招呼。",
        "pinyin": "Tā shēn chū shǒubì, xiàng wǒ dǎ zhāohu.",
        "english": "He stretched out his arm to greet me."
      }
    ]
  },
  {
    "hanzi": "身材",
    "pinyin": "shēn cái",
    "english": "Noun: figure, stature",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她的身材保持得非常好。",
        "pinyin": "Tā de shēncái bǎochí de fēicháng hǎo.",
        "english": "Her figure is maintained very well."
      }
    ]
  },
  {
    "hanzi": "身份",
    "pinyin": "shēn fèn",
    "english": "Noun: identity, status",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请出示你的身份证明。",
        "pinyin": "Qǐng chūshì nǐ de shēnfèn zhèngmíng.",
        "english": "Please show your proof of identity."
      }
    ]
  },
  {
    "hanzi": "神话",
    "pinyin": "shén huà",
    "english": "Noun: fairy tale, myth",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "古希腊神话非常有名。",
        "pinyin": "Gǔ Xīlà shénhuà fēicháng yǒumíng.",
        "english": "Ancient Greek mythology is very famous."
      }
    ]
  },
  {
    "hanzi": "神经",
    "pinyin": "shén jīng",
    "english": "Noun: nerve",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "长期熬夜会影响你的神经系统。",
        "pinyin": "Chángqī áoyè huì yǐngxiǎng nǐ de shénjīng xìtǒng.",
        "english": "Staying up late for a long time will affect your nervous system."
      }
    ]
  },
  {
    "hanzi": "深刻",
    "pinyin": "shēn kè",
    "english": "Adjective: profound, deep",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这本书给我留下了深刻的印象。",
        "pinyin": "Zhè běn shū gěi wǒ liú xiàle shēnkè de yìnxiàng.",
        "english": "This book left a deep impression on me."
      }
    ]
  },
  {
    "hanzi": "胜利",
    "pinyin": "shèng lì",
    "english": "Noun: victory, triumph",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "经过努力，我们终于取得了胜利。",
        "pinyin": "Jīngguò nǔlì, wǒmen zhōngyú qǔdé le shènglì.",
        "english": "After hard work, we finally achieved victory."
      }
    ]
  },
  {
    "hanzi": "诗",
    "pinyin": "shī",
    "english": "Noun: poem",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢读唐代的诗。",
        "pinyin": "Wǒ xǐhuān dú Tángdài de shī.",
        "english": "I like reading Tang Dynasty poetry."
      }
    ]
  },
  {
    "hanzi": "时代",
    "pinyin": "shí dài",
    "english": "Time: time, era, epoch",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们生活在一个科技高速发展的时代。",
        "pinyin": "Wǒmen shēnghuó zài yī gè kējì gāosù fāzhǎn de shídài.",
        "english": "We live in an era of rapidly developing technology."
      }
    ]
  },
  {
    "hanzi": "是否",
    "pinyin": "shì fǒu",
    "english": "Conjunction: whether or not",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请告诉我你是否愿意参加。",
        "pinyin": "Qǐng gàosù wǒ nǐ shìfǒu yuànyì cānjiā.",
        "english": "Please tell me whether or not you are willing to participate."
      }
    ]
  },
  {
    "hanzi": "实践",
    "pinyin": "shí jiàn",
    "english": "Verb: to practice, to carry out",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "理论需要通过实践来检验。",
        "pinyin": "Lǐlùn xūyào tōngguò shíjiàn lái jiǎnyàn.",
        "english": "Theory needs to be tested through practice."
      }
    ]
  },
  {
    "hanzi": "失眠",
    "pinyin": "shī mián",
    "english": "Noun: insomnia Verb: be unable to sleep",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我昨晚失眠了，只睡了三个小时。",
        "pinyin": "Wǒ zuówǎn shīmián le, zhǐ shuì le sān gè xiǎoshí.",
        "english": "I suffered from insomnia last night and only slept for three hours."
      }
    ]
  },
  {
    "hanzi": "失去",
    "pinyin": "shī qù",
    "english": "Verb: to lose sth.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "不要失去学习的机会。",
        "pinyin": "Bú yào shīqù xuéxí de jīhuì.",
        "english": "Don't lose the opportunity to study."
      }
    ]
  },
  {
    "hanzi": "事实",
    "pinyin": "shì shí",
    "english": "Noun: fact",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是不争的事实。",
        "pinyin": "Zhè shì bù zhēng de shìshí.",
        "english": "This is an undeniable fact."
      }
    ]
  },
  {
    "hanzi": "食物",
    "pinyin": "shí wù",
    "english": "Noun: food",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "保持健康需要摄入营养食物。",
        "pinyin": "Bǎochí jiànkāng xūyào shèrù yíngyǎng shíwù.",
        "english": "Maintaining health requires consuming nutritious food."
      }
    ]
  },
  {
    "hanzi": "事物",
    "pinyin": "shì wù",
    "english": "Noun: thing, object",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们要从多方面去看待事物。",
        "pinyin": "Wǒmen yào cóng duō fāngmiàn qù kàndài shìwù.",
        "english": "We need to look at things from multiple perspectives."
      }
    ]
  },
  {
    "hanzi": "实习",
    "pinyin": "shí xí",
    "english": " Noun: practice, internship Verb: to practice",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她在一家大公司实习。",
        "pinyin": "Tā zài yī jiā dà gōngsī shíxí.",
        "english": "She is doing an internship at a large company."
      }
    ]
  },
  {
    "hanzi": "实现",
    "pinyin": "shí xiàn",
    "english": "Verb: to realize, to achieve, to bring about",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们必须努力去实现我们的目标。",
        "pinyin": "Wǒmen bìxū nǔlì qù shíxiàn wǒmen de mùbiāo.",
        "english": "We must work hard to achieve our goals."
      }
    ]
  },
  {
    "hanzi": "事先",
    "pinyin": "shì xiān",
    "english": "Adverb: in advance, beforehand",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "如果你需要帮助，请事先告诉我。",
        "pinyin": "Rúguǒ nǐ xūyào bāngzhù, qǐng shìxiān gàosù wǒ.",
        "english": "If you need help, please tell me beforehand."
      }
    ]
  },
  {
    "hanzi": "失业",
    "pinyin": "shī yè",
    "english": "Noun: unemployment Verb: to lose one's job Adjective: unemployed",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "经济不好，很多人面临失业。",
        "pinyin": "Jīngjì bù hǎo, hěn duō rén miànlín shīyè.",
        "english": "The economy is poor, and many people are facing unemployment."
      }
    ]
  },
  {
    "hanzi": "寿命",
    "pinyin": "shòu mìng",
    "english": "Noun: life span, life expectancy",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "随着医疗发展，人类的寿命越来越长。",
        "pinyin": "Suízhe yīliáo fāzhǎn, rénlèi de shòumìng yuè lái yuè cháng.",
        "english": "With the development of medicine, human lifespan is getting longer and longer."
      }
    ]
  },
  {
    "hanzi": "手术",
    "pinyin": "shǒu shù",
    "english": "Noun: operation, surgery",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "医生决定给她做手术。",
        "pinyin": "Yīshēng juédìng gěi tā zuò shǒushù.",
        "english": "The doctor decided to perform surgery on her."
      }
    ]
  },
  {
    "hanzi": "手套",
    "pinyin": "shǒu tào",
    "english": "Noun: gloves",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "冬天出门一定要戴手套。",
        "pinyin": "Dōngtiān chūmén yīdìng yào dài shǒutào.",
        "english": "You must wear gloves when going out in winter."
      }
    ]
  },
  {
    "hanzi": "手续",
    "pinyin": "shǒu xù",
    "english": "Noun: procedure, formality",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "办理入学需要完成很多手续。",
        "pinyin": "Bànlǐ rùxué xūyào wánchéng hěn duō shǒuxù.",
        "english": "Handling enrollment requires completing many procedures."
      }
    ]
  },
  {
    "hanzi": "熟练",
    "pinyin": "shú liàn",
    "english": "Adjective: skilled, practiced, proficient",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她熟练地操作着机器。",
        "pinyin": "Tā shúliàn de cāozuò zhe jīqì.",
        "english": "She skillfully operated the machine."
      }
    ]
  },
  {
    "hanzi": "数码",
    "pinyin": "shù mǎ",
    "english": "Noun: number, figure Adjective: digital",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我买了一个数码相机。",
        "pinyin": "Wǒ mǎi le yī gè shùmǎ xiàngjī.",
        "english": "I bought a digital camera."
      }
    ]
  },
  {
    "hanzi": "属于",
    "pinyin": "shǔ yú",
    "english": "Verb: to belong to, to be part of",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这本书属于图书馆。",
        "pinyin": "Zhè běn shū shǔyú túshūguǎn.",
        "english": "This book belongs to the library."
      }
    ]
  },
  {
    "hanzi": "甩",
    "pinyin": "shuǎi",
    "english": "Verb: to throw, to swing, to move back and forth",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他使劲把水甩干。",
        "pinyin": "Tā shǐjìn bǎ shuǐ shuǎi gān.",
        "english": "He forcefully shook off the water until it was dry."
      }
    ]
  },
  {
    "hanzi": "摔",
    "pinyin": "shuāi",
    "english": "Verb: to fall, to throw down",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "小心，别摔倒了。",
        "pinyin": "Xiǎoxīn, bié shuāidǎo le.",
        "english": "Be careful not to fall down."
      }
    ]
  },
  {
    "hanzi": "双方",
    "pinyin": "shuāng fāng",
    "english": "Noun: both sides  Adjective: bilateral",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "双方同意了合作计划。",
        "pinyin": "Shuāngfāng tóngyì le hézuò jìhuà.",
        "english": "Both parties agreed to the cooperation plan."
      }
    ]
  },
  {
    "hanzi": "税",
    "pinyin": "shuì",
    "english": "Noun: tax, duty",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "购物时要交增值税。",
        "pinyin": "Gòuwù shí yào jiāo zēngzhíshuì.",
        "english": "Value-added tax must be paid when shopping."
      }
    ]
  },
  {
    "hanzi": "说服",
    "pinyin": "shuō fú",
    "english": "Verb: to persuade, to convince",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我花了好长时间才说服他。",
        "pinyin": "Wǒ huā le hǎo cháng shíjiān cái shuōfú tā.",
        "english": "It took me a long time to persuade him."
      }
    ]
  },
  {
    "hanzi": "丝毫",
    "pinyin": "sī háo",
    "english": "Adjective: the slightes amount or degree, very little",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我对此事丝毫不知情。",
        "pinyin": "Wǒ duì cǐ shì sīháo bù zhīqíng.",
        "english": "I am completely unaware of this matter (not the slightest bit informed)."
      }
    ]
  },
  {
    "hanzi": "似乎",
    "pinyin": "sì hū",
    "english": "Adverb: apparently, it seems as if, seemingly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "天气似乎要下雨了。",
        "pinyin": "Tiānqì sìhū yào xiàyǔ le.",
        "english": "It seems like the weather is going to rain."
      }
    ]
  },
  {
    "hanzi": "思想",
    "pinyin": "sī xiǎng",
    "english": "Noun: idea, thought, thinking",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的思想非常开放。",
        "pinyin": "Tā de sīxiǎng fēicháng kāifàng.",
        "english": "His thoughts are very open."
      }
    ]
  },
  {
    "hanzi": "碎",
    "pinyin": "suì",
    "english": "Verb: to break into pieces Adjective: broken into pieces",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "盘子掉在地上摔碎了。",
        "pinyin": "Pánzi diào zài dìshang shuāi suì le.",
        "english": "The plate fell on the floor and smashed."
      }
    ]
  },
  {
    "hanzi": "随时",
    "pinyin": "suí shí",
    "english": "Adverb: at all time, at any time",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "如果遇到问题，可以随时联系我。",
        "pinyin": "Rúguǒ yù dào wèntí, kěyǐ suíshí liánxì wǒ.",
        "english": "If you encounter a problem, you can contact me at any time."
      }
    ]
  },
  {
    "hanzi": "损失",
    "pinyin": "sǔn shī",
    "english": "Noun: loss, damage Verb: to lose, to damage",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这次事故造成了巨大的损失。",
        "pinyin": "Zhè cì shìgù zàochéng le jùdà de sǔnshī.",
        "english": "This accident caused huge losses."
      }
    ]
  },
  {
    "hanzi": "锁",
    "pinyin": "suǒ",
    "english": "Noun: lock Verb: to lock up",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "出门前别忘了锁门。",
        "pinyin": "Chūmén qián bié wàng le suǒ mén.",
        "english": "Don't forget to lock the door before going out."
      }
    ]
  },
  {
    "hanzi": "缩短",
    "pinyin": "suō duǎn",
    "english": "Verb: to curtail, to cut down",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们需要缩短会议时间。",
        "pinyin": "Wǒmen xūyào suōduǎn huìyì shíjiān.",
        "english": "We need to shorten the meeting time."
      }
    ]
  },
  {
    "hanzi": "台阶",
    "pinyin": "tái jiē",
    "english": "Noun: stairs, step",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "小心，这个台阶有点高。",
        "pinyin": "Xiǎoxīn, zhège táijiē yǒudiǎn gāo.",
        "english": "Be careful, this step is a bit high."
      }
    ]
  },
  {
    "hanzi": "谈判",
    "pinyin": "tán pàn",
    "english": " Noun: negotiation, talks Verb: to negotiate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们正在进行一项重要的谈判。",
        "pinyin": "Tāmen zhèngzài jìnxíng yī xiàng zhòngyào de tánpàn.",
        "english": "They are conducting an important negotiation."
      }
    ]
  },
  {
    "hanzi": "坦率",
    "pinyin": "tǎn shuài",
    "english": "Adjective: frank, open, candid",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他说话总是非常坦率。",
        "pinyin": "Tā shuōhuà zǒngshì fēicháng tǎnshuài.",
        "english": "He is always very frank when he speaks."
      }
    ]
  },
  {
    "hanzi": "烫",
    "pinyin": "tàng",
    "english": "Verb: to burn, to iron Adjective: hot food, etc.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "小心碗很烫，不要摸。",
        "pinyin": "Xiǎoxīn wǎn hěn tàng, bú yào mō.",
        "english": "Be careful, the bowl is very hot, don't touch it."
      }
    ]
  },
  {
    "hanzi": "桃",
    "pinyin": "táo",
    "english": "Noun: peach",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "夏天我喜欢吃甜甜的桃子。",
        "pinyin": "Xiàtiān wǒ xǐhuān chī tiántián de táozi.",
        "english": "I like eating sweet peaches in the summer."
      }
    ]
  },
  {
    "hanzi": "逃",
    "pinyin": "táo",
    "english": "Verb: to escape, to run away, to flee",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "那个小偷已经逃走了。",
        "pinyin": "Nàgè xiǎotōu yǐjīng táo zǒu le.",
        "english": "That thief has already escaped."
      }
    ]
  },
  {
    "hanzi": "特殊",
    "pinyin": "tè shū",
    "english": "Adjective: special, unusual",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个任务需要特殊处理。",
        "pinyin": "Zhège rènwu xūyào tèshū chǔlǐ.",
        "english": "This task requires special handling."
      }
    ]
  },
  {
    "hanzi": "提",
    "pinyin": "tí",
    "english": "Verb: to carry, to raise",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请你不要再提这件事了。",
        "pinyin": "Qǐng nǐ bù yào zài tí zhè jiàn shì le.",
        "english": "Please don't bring up this matter again."
      }
    ]
  },
  {
    "hanzi": "体会",
    "pinyin": "tǐ huì",
    "english": "Verb: to know through experience, to experience",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "只有亲身经历才能体会到。",
        "pinyin": "Zhǐyǒu qīnshēn jīnglì cáinéng tǐhuì dào.",
        "english": "Only through personal experience can one truly understand (it)."
      }
    ]
  },
  {
    "hanzi": "体贴",
    "pinyin": "tǐ tiē",
    "english": "Adjective: considerate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她是一个非常体贴的人。",
        "pinyin": "Tā shì yīgè fēicháng tǐtiē de rén.",
        "english": "She is a very considerate person."
      }
    ]
  },
  {
    "hanzi": "体现",
    "pinyin": "tǐ xiàn",
    "english": "Verb: to embody, to incarnate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的行为体现了他的决心。",
        "pinyin": "Tā de xíngwéi tǐxiàn le tā de juéxīn.",
        "english": "His behavior reflects his determination."
      }
    ]
  },
  {
    "hanzi": "同时",
    "pinyin": "tóng shí",
    "english": "Time: at the same time, simultaneously",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们必须同时开始工作。",
        "pinyin": "Wǒmen bìxū tóngshí kāishǐ gōngzuò.",
        "english": "We must start working at the same time."
      }
    ]
  },
  {
    "hanzi": "卫生间",
    "pinyin": "wèi shēng jiān",
    "english": "Noun: bathroom, WC",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "卫生间在哪里？",
        "pinyin": "Wèishēngjiān zài nǎlǐ?",
        "english": "Where is the restroom?"
      }
    ]
  },
  {
    "hanzi": "系",
    "pinyin": "xì",
    "english": "Noun: system, department",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我是中文系的学生。",
        "pinyin": "Wǒ shì Zhōngwén xì de xuésheng.",
        "english": "I am a student in the Chinese Department."
      }
    ]
  },
  {
    "hanzi": "细节",
    "pinyin": "xì jié",
    "english": "Noun: detail, particulars",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们必须注意合同上的细节。",
        "pinyin": "Wǒmen bìxū zhùyì hétong shang de xìjié.",
        "english": "We must pay attention to the details on the contract."
      }
    ]
  },
  {
    "hanzi": "系统",
    "pinyin": "xì tǒng",
    "english": "Noun: system",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "电脑系统需要更新了。",
        "pinyin": "Diànnǎo xìtǒng xūyào gēngxīn le.",
        "english": "The computer system needs to be updated."
      }
    ]
  },
  {
    "hanzi": "瞎",
    "pinyin": "xiā",
    "english": "Adjective: blind Adverb: groundlessly, foolishly, aimlessly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他只是瞎猜，并没有证据。",
        "pinyin": "Tā zhǐshì xiā cāi, bìng méiyǒu zhèngjù.",
        "english": "He was just guessing blindly; there was no evidence."
      }
    ]
  },
  {
    "hanzi": "下载",
    "pinyin": "xià zài",
    "english": "Verb: to download",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个文件下载速度很快。",
        "pinyin": "Zhège wénjiàn xiàzài sùdù hěn kuài.",
        "english": "The download speed for this file is very fast."
      }
    ]
  },
  {
    "hanzi": "项",
    "pinyin": "xiàng",
    "english": "Noun: neck, point, item Measure Word: for tasks, events, etc.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一项重要的任务。",
        "pinyin": "Zhè shì yī xiàng zhòngyào de rènwu.",
        "english": "This is an important task."
      }
    ]
  },
  {
    "hanzi": "相处",
    "pinyin": "xiāng chǔ",
    "english": "Verb: to get along with each other",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们相处得非常融洽。",
        "pinyin": "Wǒmen xiāngchǔ dé fēicháng róngqià.",
        "english": "We get along very harmoniously."
      }
    ]
  },
  {
    "hanzi": "相当",
    "pinyin": "xiāng dāng",
    "english": "Verb: be quivalent to Adjective: apropriate Adverb: quite, rather, fairly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的中文水平相当不错。",
        "pinyin": "Tā de Zhōngwén shuǐpíng xiāngdāng búcuò.",
        "english": "His Chinese level is quite good."
      }
    ]
  },
  {
    "hanzi": "相对",
    "pinyin": "xiāng duì",
    "english": "Verb: to face each other Adverb: relatively, comperatively",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个问题是相对容易的。",
        "pinyin": "Zhè ge wèntí shì xiāngduì róngyì de.",
        "english": "This question is comparatively easy."
      }
    ]
  },
  {
    "hanzi": "相关",
    "pinyin": "xiāng guān",
    "english": "Noun: correlation, dependence Verb: to be interrelated",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们的研究课题是相关的。",
        "pinyin": "Tāmen de yánjiū kètí shì xiāngguān de.",
        "english": "Their research topics are related."
      }
    ]
  },
  {
    "hanzi": "享受",
    "pinyin": "xiǎng shòu",
    "english": "Noun: enjoyment, pleasure Verb: to enjoy",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我很享受假期的时光。",
        "pinyin": "Wǒ hěn xiǎngshòu jiàqī de shíguāng.",
        "english": "I really enjoy the time during the holiday."
      }
    ]
  },
  {
    "hanzi": "相似",
    "pinyin": "xiāng sì",
    "english": "Verb: to resemble, to be similar to",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们的想法非常相似。",
        "pinyin": "Tāmen de xiǎngfǎ fēicháng xiāngsì.",
        "english": "Their ideas are very similar."
      }
    ]
  },
  {
    "hanzi": "象征",
    "pinyin": "xiàng zhēng",
    "english": "Noun: symbol Verb: to symbolize, to stand for",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "和平鸽象征着和平。",
        "pinyin": "Hépíng gē xiàngzhēngzhe hépíng.",
        "english": "The dove of peace symbolizes peace."
      }
    ]
  },
  {
    "hanzi": "小吃",
    "pinyin": "xiǎo chī",
    "english": "Noun: snack, refreshments",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "夜市里有很多美味的小吃。",
        "pinyin": "Yèshì lǐ yǒu hěn duō měiwèi de xiǎochī.",
        "english": "There are many delicious snacks in the night market."
      }
    ]
  },
  {
    "hanzi": "消费",
    "pinyin": "xiāo fèi",
    "english": "Noun: consumption",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们要合理地消费。",
        "pinyin": "Wǒmen yào hélǐ de xiāofèi.",
        "english": "We need to consume rationally."
      }
    ]
  },
  {
    "hanzi": "消化",
    "pinyin": "xiāo huà",
    "english": "Noun: digestion Verb: to digest",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "吃太快不容易消化。",
        "pinyin": "Chī tài kuài bù róngyì xiāohuà.",
        "english": "Eating too fast is not easy to digest."
      }
    ]
  },
  {
    "hanzi": "小伙子",
    "pinyin": "xiǎo huǒ zi",
    "english": "Noun: young fellow",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "那个小伙子跑得真快。",
        "pinyin": "Nàge xiǎohuǒzi pǎo de zhēn kuài.",
        "english": "That young man runs really fast."
      }
    ]
  },
  {
    "hanzi": "效率",
    "pinyin": "xiào lǜ",
    "english": "Noun: efficiency",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "提高工作效率很重要。",
        "pinyin": "Tígāo gōngzuò xiàolǜ hěn zhòngyào.",
        "english": "Improving work efficiency is very important."
      }
    ]
  },
  {
    "hanzi": "销售",
    "pinyin": "xiāo shòu",
    "english": "Noun: sales Verb: to sell",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这种产品销售得很好。",
        "pinyin": "Zhè zhǒng chǎnpǐn xiāoshòu de hěn hǎo.",
        "english": "This type of product sells very well."
      }
    ]
  },
  {
    "hanzi": "斜",
    "pinyin": "xié",
    "english": "Adjective: inclined, slanting, oblique",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这张画挂得有点斜。",
        "pinyin": "Zhè zhāng huà guà de yǒudiǎn xié.",
        "english": "This painting is hung a bit crooked/slanted."
      }
    ]
  },
  {
    "hanzi": "歇",
    "pinyin": "xiē",
    "english": "Verb: to rest",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "工作累了就该歇一歇。",
        "pinyin": "Gōngzuò lèi le jiù gāi xiē yī xiē.",
        "english": "If you are tired from work, you should take a rest."
      }
    ]
  },
  {
    "hanzi": "信封",
    "pinyin": "xìn fēng",
    "english": "Noun: envelope",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我把信放进了信封里。",
        "pinyin": "Wǒ bǎ xìn fàng jìnle xìnfēng lǐ.",
        "english": "I put the letter inside the envelope."
      }
    ]
  },
  {
    "hanzi": "信息",
    "pinyin": "xìn xī",
    "english": "Noun: information, news",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请给我你的联系信息。",
        "pinyin": "Qǐng gěi wǒ nǐ de liánxì xìnxī.",
        "english": "Please give me your contact information."
      }
    ]
  },
  {
    "hanzi": "宣传",
    "pinyin": "xuān chuán",
    "english": "Noun: propaganda Verb: to propagte, to disseminate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "公司正在宣传新产品。",
        "pinyin": "Gōngsī zhèngzài xuānchuán xīn chǎnpǐn.",
        "english": "The company is promoting the new product."
      }
    ]
  },
  {
    "hanzi": "选举",
    "pinyin": "xuǎn jǔ",
    "english": "Noun: election Verb: to elect",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "明天将举行总统选举。",
        "pinyin": "Míngtiān jiāng jǔxíng zǒngtǒng xuǎnjǔ.",
        "english": "The presidential election will be held tomorrow."
      }
    ]
  },
  {
    "hanzi": "学期",
    "pinyin": "xué qī",
    "english": "Noun: term, semester",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个学期马上就要结束了。",
        "pinyin": "Zhège xuéqī mǎshàng jiù yào jiéshù le.",
        "english": "This semester is about to end soon."
      }
    ]
  },
  {
    "hanzi": "学问",
    "pinyin": "xué wen",
    "english": "Noun: knowledge",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的学问非常深厚。",
        "pinyin": "Tā de xuéwèn fēicháng shēnhòu.",
        "english": "His scholarship (knowledge) is very profound."
      }
    ]
  },
  {
    "hanzi": "迅速",
    "pinyin": "xùn sù",
    "english": "Adjective: rapid, speedy, quick",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "事情发展得非常迅速。",
        "pinyin": "Shìqíng fāzhǎn de fēicháng xùnsù.",
        "english": "Things developed very rapidly."
      }
    ]
  },
  {
    "hanzi": "延长",
    "pinyin": "yán cháng",
    "english": "Verb: to prolong, to extend",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "会议时间延长了半小时。",
        "pinyin": "Huìyì shíjiān yánchángle bàn xiǎoshí.",
        "english": "The meeting time was extended by half an hour."
      }
    ]
  },
  {
    "hanzi": "宴会",
    "pinyin": "yàn huì",
    "english": "Noun: banquet, feast",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "今晚有一个盛大的宴会。",
        "pinyin": "Jīnwǎn yǒu yīgè shèngdà de yànhuì.",
        "english": "There is a grand banquet tonight."
      }
    ]
  },
  {
    "hanzi": "严肃",
    "pinyin": "yán sù",
    "english": "Adjective: solemn, serious",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "老师的表情非常严肃。",
        "pinyin": "Lǎoshī de biǎoqíng fēicháng yánsù.",
        "english": "The teacher's expression was very serious."
      }
    ]
  },
  {
    "hanzi": "摇",
    "pinyin": "yáo",
    "english": "Verb: to shake, to sway",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "婴儿在摇篮里摇晃着。",
        "pinyin": "Yīng'ér zài yáolán lǐ yáohuàngzhe.",
        "english": "The baby is rocking in the cradle."
      }
    ]
  },
  {
    "hanzi": "腰",
    "pinyin": "yāo",
    "english": "Noun: waist, lower back",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他弯下了腰去捡东西。",
        "pinyin": "Tā wān xiàle yāo qù jiǎn dōngxī.",
        "english": "He bent down to pick up something."
      }
    ]
  },
  {
    "hanzi": "要是",
    "pinyin": "yào shi",
    "english": "Conjunction: if, in case",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "要是你喜欢，我就买给你。",
        "pinyin": "Yàoshi nǐ xǐhuān, wǒ jiù mǎi gěi nǐ.",
        "english": "If you like it, I will buy it for you."
      }
    ]
  },
  {
    "hanzi": "夜",
    "pinyin": "yè",
    "english": "Noun: night",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "昨天夜里下了一场雨。",
        "pinyin": "Zuótiān yèlǐ xiàle yī chǎng yǔ.",
        "english": "It rained last night."
      }
    ]
  },
  {
    "hanzi": "业务",
    "pinyin": "yè wù",
    "english": "Noun: business, professional work",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们公司业务发展很快。",
        "pinyin": "Wǒmen gōngsī yèwù fāzhǎn hěn kuài.",
        "english": "Our company's business is developing quickly."
      }
    ]
  },
  {
    "hanzi": "乙",
    "pinyin": "yǐ",
    "english": "Number: secondly",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的成绩是乙等。",
        "pinyin": "Tā de chéngjì shì yǐ děng.",
        "english": "His grade is B (second level)."
      }
    ]
  },
  {
    "hanzi": "移动",
    "pinyin": "yí dòng",
    "english": "Noun: movement Verb: to move, to shift Adjective: mobile, portable",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请不要移动桌子上的文件。",
        "pinyin": "Qǐng bù yào yídòng zhuōzi shang de wénjiàn.",
        "english": "Please do not move the documents on the table."
      }
    ]
  },
  {
    "hanzi": "遗憾",
    "pinyin": "yí hàn",
    "english": "Verb: to regret Adjective: regrettable",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "没能参加他的婚礼，我感到很遗憾。",
        "pinyin": "Méi néng cānjiā tā de hūnlǐ, wǒ gǎndào hěn yíhàn.",
        "english": "I feel very regretful that I couldn't attend his wedding."
      }
    ]
  },
  {
    "hanzi": "以及",
    "pinyin": "yǐ jí",
    "english": "Conjunction: as well as",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们需要笔、纸以及橡皮。",
        "pinyin": "Wǒmen xūyào bǐ, zhǐ yǐjí xiàngpí.",
        "english": "We need pens, paper, and erasers."
      }
    ]
  },
  {
    "hanzi": "以来",
    "pinyin": "yǐ lái",
    "english": "Adverb: since",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "自从去年以来，变化很大。",
        "pinyin": "Zìcóng qùnián yǐlái, biànhuà hěn dà.",
        "english": "Since last year, there have been great changes."
      }
    ]
  },
  {
    "hanzi": "议论",
    "pinyin": "yì lùn",
    "english": "Noun: discussion Verb: to discuss, to comment on",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们正在议论这个新的政策。",
        "pinyin": "Tāmen zhèngzài yìlùn zhège xīn de zhèngcè.",
        "english": "They are discussing this new policy."
      }
    ]
  },
  {
    "hanzi": "移民",
    "pinyin": "yí mín",
    "english": " Noun: immigrant Verb: to immigrate, to migrate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "很多家庭选择移民到国外。",
        "pinyin": "Hěn duō jiātíng xuǎnzé yímín dào guówài.",
        "english": "Many families choose to immigrate abroad."
      }
    ]
  },
  {
    "hanzi": "依然",
    "pinyin": "yī rán",
    "english": "Adverb: still, as before",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "尽管困难重重，他依然坚持下来了。",
        "pinyin": "Jǐnguǎn kùnnan chóngchóng, tā yīrán jiānchí xiàláile.",
        "english": "Although there were many difficulties, he still persisted."
      }
    ]
  },
  {
    "hanzi": "意外",
    "pinyin": "yì wài",
    "english": " Noun: accident Adjective: unexpected, accidental",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "发生了一场小小的意外。",
        "pinyin": "Fāshēngle yī chǎng xiǎoxiǎo de yìwài.",
        "english": "A minor accident occurred."
      }
    ]
  },
  {
    "hanzi": "义务",
    "pinyin": "yì wù",
    "english": "Noun: duty, obligation Adjective: voluntary",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "教育是每个公民的义务。",
        "pinyin": "Jiàoyù shì měi gè gōngmín de yìwù.",
        "english": "Education is the obligation of every citizen."
      }
    ]
  },
  {
    "hanzi": "银",
    "pinyin": "yín",
    "english": "Noun: silver Adjective: silver colour",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她喜欢戴银色的项链。",
        "pinyin": "Tā xǐhuān dài yínsè de xiàngliàn.",
        "english": "She likes to wear a silver necklace."
      }
    ]
  },
  {
    "hanzi": "因素",
    "pinyin": "yīn sù",
    "english": "Noun: element, factor",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "成功有很多因素。",
        "pinyin": "Chénggōng yǒu hěn duō yīnsù.",
        "english": "There are many factors for success."
      }
    ]
  },
  {
    "hanzi": "英俊",
    "pinyin": "yīng jùn",
    "english": "Adjective: handsome and smart",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "那个演员长得非常英俊。",
        "pinyin": "Nàge yǎnyuán zhǎng de fēicháng yīngjùn.",
        "english": "That actor is extremely handsome."
      }
    ]
  },
  {
    "hanzi": "英雄",
    "pinyin": "yīng xióng",
    "english": "Noun: hero",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他是大家心目中的英雄。",
        "pinyin": "Tā shì dàjiā xīnmù zhōng de yīngxióng.",
        "english": "He is the hero in everyone's eyes."
      }
    ]
  },
  {
    "hanzi": "拥抱",
    "pinyin": "yōng bào",
    "english": "Verb: to embrace, to hug",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他们见面时热情地拥抱了。",
        "pinyin": "Tāmen jiànmiàn shí rèqíng de yǒngbào le.",
        "english": "They hugged warmly when they met."
      }
    ]
  },
  {
    "hanzi": "用途",
    "pinyin": "yòng tú",
    "english": "Noun: application, use, purpos",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这种工具的用途很广。",
        "pinyin": "Zhè zhǒng gōngjù de yòngtú hěn guǎng.",
        "english": "The uses of this tool are very broad."
      }
    ]
  },
  {
    "hanzi": "邮局",
    "pinyin": "yóu jú",
    "english": "Noun: post office",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "邮局下午五点关门。",
        "pinyin": "Yóujú xiàwǔ wǔ diǎn guānmén.",
        "english": "The post office closes at five in the afternoon."
      }
    ]
  },
  {
    "hanzi": "油炸",
    "pinyin": "yóu zhá",
    "english": "Verb: to deep fry",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "油炸食品对健康不好。",
        "pinyin": "Yóuzhá shípǐn duì jiànkāng bù hǎo.",
        "english": "Deep-fried food is not good for health."
      }
    ]
  },
  {
    "hanzi": "预报",
    "pinyin": "yù bào",
    "english": "Noun: forecast",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "天气预报说今天会下雨。",
        "pinyin": "Tiānqì yùbào shuō jīntiān huì xià yǔ.",
        "english": "The weather forecast says it will rain today."
      }
    ]
  },
  {
    "hanzi": "娱乐",
    "pinyin": "yú lè",
    "english": "Noun: amusement, entertainment Verb: to amuse, to entertain",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "体育活动是一种很好的娱乐方式。",
        "pinyin": "Tǐyù huódòng shì yī zhǒng hěn hǎo de yúlè fāngshì.",
        "english": "Sports activities are a very good form of entertainment."
      }
    ]
  },
  {
    "hanzi": "与其",
    "pinyin": "yǔ qí",
    "english": "Conjunction: rather than",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "与其等待，不如现在行动。",
        "pinyin": "Yǔqí děngdài, bùrú xiànzài xíngdòng.",
        "english": "Rather than waiting, it's better to act now."
      }
    ]
  },
  {
    "hanzi": "语气",
    "pinyin": "yǔ qì",
    "english": "Noun: tone, manner of speaking",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请注意你说话的语气。",
        "pinyin": "Qǐng zhùyì nǐ shuōhuà de yǔqì.",
        "english": "Please pay attention to the tone of your voice."
      }
    ]
  },
  {
    "hanzi": "元旦",
    "pinyin": "Yuán dàn",
    "english": "Noun: New Year's Day",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "元旦是每年的第一天。",
        "pinyin": "Yuándàn shì měi nián de dì yī tiān.",
        "english": "New Year's Day is the first day of every year."
      }
    ]
  },
  {
    "hanzi": "缘故",
    "pinyin": "yuán gù",
    "english": "Noun: reason, cause",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "因为生病的缘故，她没来上班。",
        "pinyin": "Yīnwèi shēngbìng de yuángù, tā méi lái shàngbān.",
        "english": "Due to illness, she did not come to work."
      }
    ]
  },
  {
    "hanzi": "原则",
    "pinyin": "yuán zé",
    "english": "Noun: principle",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们必须坚持自己的原则。",
        "pinyin": "Wǒmen bìxū jiānchí zìjǐ de yuánzé.",
        "english": "We must stick to our principles."
      }
    ]
  },
  {
    "hanzi": "晕",
    "pinyin": "yūn",
    "english": "Verb: to pass out, to faint Adjective: dizzy, faint, confused",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我有点头晕，想躺一会儿。",
        "pinyin": "Wǒ yǒu diǎn tóuyūn, xiǎng tǎng yīhuǐr.",
        "english": "I feel a little dizzy and want to lie down for a while."
      }
    ]
  },
  {
    "hanzi": "再三",
    "pinyin": "zài sān",
    "english": "Adverb: again and again",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我再三强调了安全的重要性。",
        "pinyin": "Wǒ zàisān qiángdiào le ānquán de zhòngyào xìng.",
        "english": "I repeatedly emphasized the importance of safety."
      }
    ]
  },
  {
    "hanzi": "摘",
    "pinyin": "zhāi",
    "english": "Verb: to pick, to pluck, to take off glasses, etc.",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们去果园摘苹果吧。",
        "pinyin": "Wǒmen qù guǒyuán zhāi píngguǒ ba.",
        "english": "Let's go to the orchard to pick apples."
      }
    ]
  },
  {
    "hanzi": "展览",
    "pinyin": "zhǎn lǎn",
    "english": "Noun: exhibition Verb: to exhibit",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个周末有一个艺术展览。",
        "pinyin": "Zhège zhōumò yǒu yīgè yìshù zhǎnlǎn.",
        "english": "There is an art exhibition this weekend."
      }
    ]
  },
  {
    "hanzi": "招待",
    "pinyin": "zhāo dài",
    "english": " Noun: reception Verb: to entertain guests, to serve, to receive",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们应该热情地招待客人。",
        "pinyin": "Wǒmen yīnggāi rèqíng de zhāodài kèren.",
        "english": "We should warmly entertain the guests."
      }
    ]
  },
  {
    "hanzi": "召开",
    "pinyin": "zhào kāi",
    "english": "Verb: to convene, to convoke, to call together",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "经理决定召开紧急会议。",
        "pinyin": "Jīnglǐ juédìng zhàokāi jǐnjí huìyì.",
        "english": "The manager decided to convene an emergency meeting."
      }
    ]
  },
  {
    "hanzi": "哲学",
    "pinyin": "zhé xué",
    "english": "Noun: philosophy",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我对西方哲学很感兴趣。",
        "pinyin": "Wǒ duì xīfāng zhéxué hěn gǎn xìngqù.",
        "english": "I am very interested in Western philosophy."
      }
    ]
  },
  {
    "hanzi": "阵",
    "pinyin": "zhèn",
    "english": "Noun: disposition of troops Conjunction: for short periods or events",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "刚才刮过一阵大风。",
        "pinyin": "Gāngcái guā guò yī zhèn dà fēng.",
        "english": "A gust of strong wind just blew past."
      }
    ]
  },
  {
    "hanzi": "针对",
    "pinyin": "zhēn duì",
    "english": "Verb: to be aimed at, to be directed against",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个计划是针对年轻人设计的。",
        "pinyin": "Zhège jìhuà shì zhēnduì niánqīng rén shèjì de.",
        "english": "This plan is designed specifically for young people."
      }
    ]
  },
  {
    "hanzi": "真理",
    "pinyin": "zhēn lǐ",
    "english": "Noun: truth",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "科学追求的是客观真理。",
        "pinyin": "Kēxué zhuīqiú de shì kèguān zhēnlǐ.",
        "english": "Science pursues objective truth."
      }
    ]
  },
  {
    "hanzi": "枕头",
    "pinyin": "zhěn tou",
    "english": "Noun: pillow",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我喜欢睡软一点的枕头。",
        "pinyin": "Wǒ xǐhuān shuì ruǎn yīdiǎn de zhěntou.",
        "english": "I like sleeping on a slightly softer pillow."
      }
    ]
  },
  {
    "hanzi": "珍惜",
    "pinyin": "zhēn xī",
    "english": "Verb: to value, to cherish",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们要珍惜时间，努力学习。",
        "pinyin": "Wǒmen yào zhēnxī shíjiān, nǔlì xuéxí.",
        "english": "We must cherish time and study hard."
      }
    ]
  },
  {
    "hanzi": "政府",
    "pinyin": "zhèng fǔ",
    "english": "Noun: government",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "政府发布了新的经济政策。",
        "pinyin": "Zhèngfǔ fābù le xīn de jīngjì zhèngcè.",
        "english": "The government released a new economic policy."
      }
    ]
  },
  {
    "hanzi": "政治",
    "pinyin": "zhèng zhì",
    "english": "Noun: politics",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们在谈论国际政治。",
        "pinyin": "Wǒmen zài tánlùn guójì zhèngzhì.",
        "english": "We are discussing international politics."
      }
    ]
  },
  {
    "hanzi": "直",
    "pinyin": "zhí",
    "english": "Verb: to straighten Adjective: straight, direct",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请你沿着这条路一直走。",
        "pinyin": "Qǐng nǐ yánzhe zhè tiáo lù yīzhí zǒu.",
        "english": "Please walk straight along this road."
      }
    ]
  },
  {
    "hanzi": "支",
    "pinyin": "zhī",
    "english": " Noun: branch, division Verb: to support Measure Word: for stick-like objects",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我买了一支新钢笔。",
        "pinyin": "Wǒ mǎi le yī zhī xīn gāngbǐ.",
        "english": "I bought a new pen."
      }
    ]
  },
  {
    "hanzi": "指导",
    "pinyin": "zhǐ dǎo",
    "english": "Noun: guidance Verb: to guide, to direct",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "老师指导我们完成了实验报告。",
        "pinyin": "Lǎoshī zhǐdǎo wǒmen wánchéngle shíyàn bàogào.",
        "english": "The teacher guided us in completing the lab report."
      }
    ]
  },
  {
    "hanzi": "制定",
    "pinyin": "zhì dìng",
    "english": "Verb: to formulate, to work out, to draw up",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们需要制定一个详细的计划。",
        "pinyin": "Wǒmen xūyào zhìdìng yī gè xiángxì de jìhuà.",
        "english": "We need to formulate a detailed plan."
      }
    ]
  },
  {
    "hanzi": "制度",
    "pinyin": "zhì dù",
    "english": "Noun: system",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个新的管理制度很有效。",
        "pinyin": "Zhège xīn de guǎnlǐ zhìdù hěn yǒuxiào.",
        "english": "This new management system is very effective."
      }
    ]
  },
  {
    "hanzi": "指挥",
    "pinyin": "zhǐ huī",
    "english": "Noun: conductor Verb: to conduct, to command, to direct",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "谁来指挥这次的演出？",
        "pinyin": "Shéi lái zhǐhuī zhè cì de yǎnchū?",
        "english": "Who will conduct this performance?"
      }
    ]
  },
  {
    "hanzi": "至今",
    "pinyin": "zhì jīn",
    "english": "Time: until now, until today",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这个问题至今还没有解决。",
        "pinyin": "Zhè ge wèntí zhìjīn hái méiyǒu jiějué.",
        "english": "This problem has not been solved up till now."
      }
    ]
  },
  {
    "hanzi": "至于",
    "pinyin": "zhì yú",
    "english": "Conjunction: to go so far as to, with regard to",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "至于结果如何，我们拭目以待。",
        "pinyin": "Zhìyú jiéguǒ rúhé, wǒmen shìmùyǐdài.",
        "english": "As for the result, we will wait and see."
      }
    ]
  },
  {
    "hanzi": "制作",
    "pinyin": "zhì zuò",
    "english": "Verb: to make, to manufacture, to produce",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的爱好是制作木雕。",
        "pinyin": "Tā de àihào shì zhìzuò mùdiāo.",
        "english": "His hobby is making wood carvings."
      }
    ]
  },
  {
    "hanzi": "中介",
    "pinyin": "zhōng jiè",
    "english": "Noun: agency, agent",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我通过房屋中介找到了这套公寓。",
        "pinyin": "Wǒ tōngguò fángwū zhōngjiè zhǎodàole zhè tào gōngyù.",
        "english": "I found this apartment through a real estate agency."
      }
    ]
  },
  {
    "hanzi": "重量",
    "pinyin": "zhòng liàng",
    "english": "Noun: weight",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请告诉我这个包裹的重量。",
        "pinyin": "Qǐng gàosu wǒ zhège bāoguǒ de zhòngliàng.",
        "english": "Please tell me the weight of this package."
      }
    ]
  },
  {
    "hanzi": "逐步",
    "pinyin": "zhú bù",
    "english": "Adverb: step by step",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的汉语水平正在逐步提高。",
        "pinyin": "Tā de Hànyǔ shuǐpíng zhèngzài zhúbù tígāo.",
        "english": "His Chinese level is progressively improving."
      }
    ]
  },
  {
    "hanzi": "注册",
    "pinyin": "zhù cè",
    "english": "Verb: to register",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你需要先在网上注册。",
        "pinyin": "Nǐ xūyào xiān zài wǎngshàng zhùcè.",
        "english": "You need to register online first."
      }
    ]
  },
  {
    "hanzi": "祝福",
    "pinyin": "zhù fú",
    "english": "Verb: to bless, to wish well",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "祝你生日快乐，送上我的祝福。",
        "pinyin": "Zhù nǐ shēngrì kuàilè, sòng shàng wǒ de zhùfú.",
        "english": "Happy birthday, I send you my blessings."
      }
    ]
  },
  {
    "hanzi": "主观",
    "pinyin": "zhǔ guān",
    "english": "Adjective: subjectiv",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这只是你主观的看法。",
        "pinyin": "Zhè zhǐshì nǐ zhǔguān de kànfǎ.",
        "english": "This is just your subjective opinion."
      }
    ]
  },
  {
    "hanzi": "主张",
    "pinyin": "zhǔ zhāng",
    "english": "Noun: viewpoint, stand Verb: to advocate, to stand for",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们主张和平解决争端。",
        "pinyin": "Wǒmen zhǔzhāng hépíng jiějué zhēngduān.",
        "english": "We advocate for the peaceful resolution of disputes."
      }
    ]
  },
  {
    "hanzi": "竹子",
    "pinyin": "zhú zi",
    "english": "Noun: bamboo",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "熊猫喜欢吃竹子。",
        "pinyin": "Xióngmāo xǐhuān chī zhúzi.",
        "english": "Pandas like to eat bamboo."
      }
    ]
  },
  {
    "hanzi": "转变",
    "pinyin": "zhuǎn biàn",
    "english": "Noun: change Verb: to change, to transform",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的态度发生了很大转变。",
        "pinyin": "Tā de tàidù fāshēng le hěn dà zhuǎnbiàn.",
        "english": "His attitude underwent a major transformation."
      }
    ]
  },
  {
    "hanzi": "转告",
    "pinyin": "zhuǎn gào",
    "english": "Verb: to pass on a message, etc. , to transmit",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请你把这个消息转告给李明。",
        "pinyin": "Qǐng nǐ bǎ zhège xiāoxi zhuǎngào gěi Lǐ Míng.",
        "english": "Please relay this news to Li Ming."
      }
    ]
  },
  {
    "hanzi": "专家",
    "pinyin": "zhuān jiā",
    "english": "Noun: expert, specialist",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他是一位历史方面的专家。",
        "pinyin": "Tā shì yī wèi lìshǐ fāngmiàn de zhuānjiā.",
        "english": "He is an expert in history."
      }
    ]
  },
  {
    "hanzi": "装饰",
    "pinyin": "zhuāng shì",
    "english": "Noun: decoration Verb: to decorate",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们用彩灯装饰房间。",
        "pinyin": "Wǒmen yòng cǎidēng zhuāngshì fángjiān.",
        "english": "We decorate the room with colored lights."
      }
    ]
  },
  {
    "hanzi": "追求",
    "pinyin": "zhuī qiú",
    "english": "Verb: to pursue, to seek after",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们应该追求更高的目标。",
        "pinyin": "Wǒmen yīnggāi zhuīqiú gèng gāo de mùbiāo.",
        "english": "We should pursue higher goals."
      }
    ]
  },
  {
    "hanzi": "资格",
    "pinyin": "zī gé",
    "english": "Noun: qualifications",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他有参加这次比赛的资格。",
        "pinyin": "Tā yǒu cānjiā zhè cì bǐsài de zīgé.",
        "english": "He has the qualifications to participate in this competition."
      }
    ]
  },
  {
    "hanzi": "资金",
    "pinyin": "zī jīn",
    "english": "Noun: funds, capital",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们需要更多的启动资金。",
        "pinyin": "Wǒmen xūyào gèng duō de qǐdòng zījīn.",
        "english": "We need more startup funds."
      }
    ]
  },
  {
    "hanzi": "自觉",
    "pinyin": "zì jué",
    "english": "Adjective: aware, conscious, on one's own initiative",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "学生们自觉地保持教室安静。",
        "pinyin": "Xuéshengmen zìjué de bǎochí jiàoshì ānjìng.",
        "english": "The students voluntarily keep the classroom quiet."
      }
    ]
  },
  {
    "hanzi": "资料",
    "pinyin": "zī liào",
    "english": "Noun: material, data, resources, profile IT",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "请把会议资料准备好。",
        "pinyin": "Qǐng bǎ huìyì zīliào zhǔnbèi hǎo.",
        "english": "Please prepare the meeting materials."
      }
    ]
  },
  {
    "hanzi": "字幕",
    "pinyin": "zì mù",
    "english": "Noun: caption, subtitle",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "电影配有中英文字幕。",
        "pinyin": "Diànyǐng pèi yǒu zhōng-yīngwén zìmù.",
        "english": "The movie is equipped with Chinese and English subtitles."
      }
    ]
  },
  {
    "hanzi": "姿势",
    "pinyin": "zī shì",
    "english": "Noun: gesture, posture, pose",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "保持正确的坐姿势很重要。",
        "pinyin": "Bǎochí zhèngquè de zuò zīshì hěn zhòngyào.",
        "english": "Maintaining the correct sitting posture is very important."
      }
    ]
  },
  {
    "hanzi": "自私",
    "pinyin": "zì sī",
    "english": "Adjective: selfish",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他的行为非常自私。",
        "pinyin": "Tā de xíngwéi fēicháng zìsī.",
        "english": "His behavior is very selfish."
      }
    ]
  },
  {
    "hanzi": "自信",
    "pinyin": "zì xìn",
    "english": "Noun: self-confidence Adjective: self-confident",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "她对自己的能力很自信。",
        "pinyin": "Tā duì zìjǐ de nénglì hěn zìxìn.",
        "english": "She is very confident in her abilities."
      }
    ]
  },
  {
    "hanzi": "咨询",
    "pinyin": "zī xún",
    "english": "Noun: consultation",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "如果你有问题，可以咨询专业人士。",
        "pinyin": "Rúguǒ yǒu wèntí, kěyǐ zīxún zhuānyè rénshì.",
        "english": "If you have problems, you can consult a professional."
      }
    ]
  },
  {
    "hanzi": "自由",
    "pinyin": "zì yóu",
    "english": "Noun: free liberty Adjective: free",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们珍惜言论自由的权利。",
        "pinyin": "Wǒmen zhēnxī yánlùn zìyóu de quánlì.",
        "english": "We cherish the right to freedom of speech."
      }
    ]
  },
  {
    "hanzi": "自愿",
    "pinyin": "zì yuàn",
    "english": "Adjective: voluntary",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他自愿参加了这次活动。",
        "pinyin": "Tā zìyuàn cānjiā le zhè cì huódòng.",
        "english": "He voluntarily participated in this activity."
      }
    ]
  },
  {
    "hanzi": "资源",
    "pinyin": "zī yuán",
    "english": "Noun: resources",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "保护自然资源是我们的责任。",
        "pinyin": "Bǎohù zìrán zīyuán shì wǒmen de zérèn.",
        "english": "Protecting natural resources is our responsibility."
      }
    ]
  },
  {
    "hanzi": "总裁",
    "pinyin": "zǒng cái",
    "english": "Noun: general director",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他是这家公司的总裁。",
        "pinyin": "Tā shì zhè jiā gōngsī de zǒngcái.",
        "english": "He is the president of this company."
      }
    ]
  },
  {
    "hanzi": "总共",
    "pinyin": "zǒng gòng",
    "english": "Adverb: altogether, in total",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们总共需要十个苹果。",
        "pinyin": "Wǒmen zǒnggòng xūyào shí ge píngguǒ.",
        "english": "We need ten apples in total."
      }
    ]
  },
  {
    "hanzi": "综合",
    "pinyin": "zōng hé",
    "english": "Noun: Synthese Verb: to integrate, to sum up Adjective: synthesized, integrated",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一份综合报告。",
        "pinyin": "Zhè shì yī fèn zōnghé bàogào.",
        "english": "This is a comprehensive report."
      }
    ]
  },
  {
    "hanzi": "宗教",
    "pinyin": "zōng jiào",
    "english": "Noun: religion",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他对世界宗教很感兴趣。",
        "pinyin": "Tā duì shìjiè zōngjiào hěn gǎn xìngqù.",
        "english": "He is very interested in world religions."
      }
    ]
  },
  {
    "hanzi": "总理",
    "pinyin": "zǒng lǐ",
    "english": "Noun: premier, prime minister",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "哪个国家有总理？",
        "pinyin": "Nǎge guójiā yǒu zǒnglǐ?",
        "english": "Which country has a prime minister?"
      }
    ]
  },
  {
    "hanzi": "总算",
    "pinyin": "zǒng suàn",
    "english": "Adverb: finally, in the end, at long last",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "等了很久，你总算来了。",
        "pinyin": "Děngle hěn jiǔ, nǐ zǒngsuàn láile.",
        "english": "After waiting for a long time, you finally came."
      }
    ]
  },
  {
    "hanzi": "总统",
    "pinyin": "zǒng tǒng",
    "english": "Noun: president of a country",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "美国总统住在白宫。",
        "pinyin": "Měiguó zǒngtǒng zhù zài Báigōng.",
        "english": "The US President lives in the White House."
      }
    ]
  },
  {
    "hanzi": "总之",
    "pinyin": "zǒng zhī",
    "english": "Conjunction: in short, in a word",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "总之，我们必须努力工作。",
        "pinyin": "Zǒng zhī, wǒmen bìxū nǔlì gōngzuò.",
        "english": "In short, we must work hard."
      }
    ]
  },
  {
    "hanzi": "祖国",
    "pinyin": "zǔ guó",
    "english": "Noun: fatherland, homeland",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们热爱自己的祖国。",
        "pinyin": "Wǒmen rè'ài zìjǐ de zǔguó.",
        "english": "We love our motherland."
      }
    ]
  },
  {
    "hanzi": "组合",
    "pinyin": "zǔ hé",
    "english": "Noun: association, combination Verb: to make up, to compose, to constitute",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是一个很好的颜色组合。",
        "pinyin": "Zhè shì yī ge hěn hǎo de yánsè zǔhé.",
        "english": "This is a very good color combination."
      }
    ]
  },
  {
    "hanzi": "祖先",
    "pinyin": "zǔ xiān",
    "english": "Noun: ancestor",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们不能忘记祖先的教诲。",
        "pinyin": "Wǒmen bù néng wàngjì zǔxiān de jiàohuì.",
        "english": "We cannot forget the teachings of our ancestors."
      }
    ]
  },
  {
    "hanzi": "阻止",
    "pinyin": "zǔ zhǐ",
    "english": "Verb: to prevent, to stop",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "你能阻止他做这件事吗？",
        "pinyin": "Nǐ néng zǔzhǐ tā zuò zhè jiàn shì ma?",
        "english": "Can you stop him from doing this?"
      }
    ]
  },
  {
    "hanzi": "醉",
    "pinyin": "zuì",
    "english": "Adjective: intoxicated, drunk",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "他喝太多酒，醉了。",
        "pinyin": "Tā hē tài duō jiǔ, zuìle.",
        "english": "He drank too much wine and got drunk."
      }
    ]
  },
  {
    "hanzi": "最初",
    "pinyin": "zuì chū",
    "english": "Time: first, initial",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我最初的想法很简单。",
        "pinyin": "Wǒ zuìchū de xiǎngfǎ hěn jiǎndān.",
        "english": "My initial idea was very simple."
      }
    ]
  },
  {
    "hanzi": "尊敬",
    "pinyin": "zūn jìng",
    "english": "Noun: respect, esteem Verb: to respect, to revere",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我们应该尊敬长辈。",
        "pinyin": "Wǒmen yīnggāi zūnjìng zhǎngbèi.",
        "english": "We should respect our elders."
      }
    ]
  },
  {
    "hanzi": "遵守",
    "pinyin": "zūn shǒu",
    "english": "Verb: to abide by, to comply with",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "每个人都必须遵守交通规则。",
        "pinyin": "Měi gèrén dōu bìxū zūnshǒu jiāotōng guīzé.",
        "english": "Everyone must comply with traffic rules."
      }
    ]
  },
  {
    "hanzi": "作品",
    "pinyin": "zuò pǐn",
    "english": "Noun: works  literature, art ",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "这是他最好的作品之一。",
        "pinyin": "Zhè shì tā zuì hǎo de zuòpǐn zhī yī.",
        "english": "This is one of his best works."
      }
    ]
  },
  {
    "hanzi": "作为",
    "pinyin": "zuò wéi",
    "english": "Noun: conduct, ac Verb: to accomplish, to act as, to take for Conjunction: as",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "作为学生，你应该努力学习。",
        "pinyin": "Zuòwéi xuésheng, nǐ yīnggāi nǔlì xuéxí.",
        "english": "As a student, you should study hard."
      }
    ]
  },
  {
    "hanzi": "作文",
    "pinyin": "zuò wén",
    "english": "Noun: composition Verb: to write an essay",
    "hsk": "HSK 5",
    "exampleSentences": [
      {
        "chinese": "我的中文作文得了高分。",
        "pinyin": "Wǒ de Zhōngwén zuòwén déle gāofēn.",
        "english": "My Chinese essay received a high score."
      }
    ]
  },

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
  
  const hanziSpan = document.createElement('span');
  hanziSpan.classList.add('hanzi-text');
  hanziSpan.textContent = row.hanzi;
  termDiv.appendChild(hanziSpan);

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
    speak(row.hanzi);
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
