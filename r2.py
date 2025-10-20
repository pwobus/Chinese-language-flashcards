# Retry generation of contextual examples with robust execution guard.

import json

in_path = "vocab.json"
out_path = "new2.json"

# Load vocab
with open(in_path, "r", encoding="utf-8") as f:
    vocab = json.load(f)

# --- Lexicons and helpers (same as before) ---
particles = {"吗","吧","的","地","得","了","过","着","呢"}
question_words = {"什么","谁","哪儿","哪里","哪","怎么","为什么","多少","几","多久","多远","多大","哪边"}
pronouns = {"我","你","他","她","它","我们","你们","他们","她们","它们","自己"}
measure_words = {"个","本","张","只","条","件","杯","瓶","辆","次","年","月","天","日","位","口","朵","块","片","台","把","双"}
prepositions = {"在","对","给","从","到","跟","向","往","把","被","比","离","为","关于","根据"}
adverbs = {"也","都","还","又","再","才","就","已经","一直","马上","非常","很","太","更","比较"}
numbers = set(list("零一二三四五六七八九十百千万两几"))
time_words = {"今天","明天","昨天","现在","刚才","刚刚","上午","中午","下午","晚上","早上","今年","去年","明年","每天","每年","每周","周末"}
adj_keywords = {"big","small","hot","cold","busy","happy","sad","right","wrong","good","bad","new","old","tall","short","high","low","long","fast","slow","early","late","easy","difficult","hard","expensive","cheap","beautiful","pretty","smart","clever","important","simple","complex","clean","dirty","quiet","noisy","near","far","hungry","thirsty","tired"}

import re

def guess_pos(hanzi, english):
    e = (english or "").strip().lower()
    if hanzi in particles: return "particle"
    if hanzi in question_words: return "question"
    if hanzi in pronouns: return "pronoun"
    if hanzi in measure_words or "measure" in e or "classifier" in e: return "measure"
    if hanzi in prepositions or "preposition" in e: return "preposition"
    if hanzi in adverbs or "adverb" in e: return "adverb"
    if hanzi in numbers or re.fullmatch(r"\d+", hanzi): return "number"
    if hanzi in time_words or any(k in e for k in ["today","tomorrow","yesterday","morning","evening","year","month","week","day","now"]): return "time"
    if e.startswith("to ") or "(v" in e or "verb" in e: return "verb"
    if any(k in e for k in adj_keywords) or "(adj" in e or "adjective" in e: return "adjective"
    return "noun"

def gen_particle(hanzi, pinyin, english, hsk):
    if hanzi == "吗":
        return [{"chinese":"你现在忙吗？","pinyin":"Nǐ xiànzài máng ma?","english":"Are you busy now?"},
                {"chinese":"今天晚上一起吃饭，可以吗？","pinyin":"Jīntiān wǎnshang yìqǐ chīfàn, kěyǐ ma?","english":"Shall we have dinner together tonight, is that okay?"}]
    if hanzi == "吧":
        return [{"chinese":"太晚了，我们回家吧。","pinyin":"Tài wǎn le, wǒmen huíjiā ba.","english":"It's too late; let's go home."},
                {"chinese":"休息一下吧。","pinyin":"Xiūxi yíxià ba.","english":"Take a short break."}]
    if hanzi == "了":
        return [{"chinese":"我吃饭了。","pinyin":"Wǒ chīfàn le.","english":"I ate (already)."},
                {"chinese":"雨停了，我们出发吧。","pinyin":"Yǔ tíng le, wǒmen chūfā ba.","english":"The rain has stopped; let's set off."}]
    if hanzi == "过":
        return [{"chinese":"我去过北京。","pinyin":"Wǒ qù guo Běijīng.","english":"I have been to Beijing."},
                {"chinese":"你吃过四川菜吗？","pinyin":"Nǐ chī guo Sìchuān cài ma?","english":"Have you eaten Sichuan food before?"}]
    if hanzi == "着":
        return [{"chinese":"门开着呢。","pinyin":"Mén kāizhe ne.","english":"The door is open."},
                {"chinese":"他笑着跟我打招呼。","pinyin":"Tā xiàozhe gēn wǒ dǎzhāohu.","english":"He greeted me with a smile."}]
    if hanzi == "的":
        return [{"chinese":"这是我的书。","pinyin":"Zhè shì wǒ de shū.","english":"This is my book."},
                {"chinese":"她是我们班的新同学的姐姐。","pinyin":"Tā shì wǒmen bān de xīn tóngxué de jiějie.","english":"She is the older sister of the new classmate in our class."}]
    if hanzi == "得":
        return [{"chinese":"他说得很快。","pinyin":"Tā shuō de hěn kuài.","english":"He speaks very fast."},
                {"chinese":"你做得不错。","pinyin":"Nǐ zuò de búcuò.","english":"You did quite well."}]
    if hanzi == "地":
        return [{"chinese":"他认真地做作业。","pinyin":"Tā rènzhēn de zuò zuòyè.","english":"He does homework carefully."},
                {"chinese":"她高兴地唱起歌来。","pinyin":"Tā gāoxìng de chàng qǐ gē lái.","english":"She started to sing happily."}]
    if hanzi == "呢":
        return [{"chinese":"我在看书呢。","pinyin":"Wǒ zài kànshū ne.","english":"I'm reading (right now)."},
                {"chinese":"我说完了，你呢？","pinyin":"Wǒ shuō wán le, nǐ ne?","english":"I'm finished speaking. How about you?"}]
    return [
        {"chinese":f"我们走{hanzi}。","pinyin":f"Wǒmen zǒu {pinyin}.","english":"Let's go (soft tone)."},
        {"chinese":f"好{hanzi}，开始吧。","pinyin":f"Hǎo {pinyin}, kāishǐ ba.","english":"Okay then, let's start."}
    ]

def gen_measure(hanzi, pinyin, english, hsk):
    choices = {
        "个": [("一个苹果。","Yí gè píngguǒ.","one apple."),("三个人。","Sān gè rén.","three people.")],
        "本": [("两本书。","Liǎng běn shū.","two books."),("一本词典。","Yì běn cídiǎn.","one dictionary.")],
        "张": [("一张票。","Yì zhāng piào.","a ticket."),("一张桌子。","Yì zhāng zhuōzi.","a table.")],
        "只": [("一只猫。","Yì zhī māo.","a cat."),("两只手。","Liǎng zhī shǒu.","two hands.")],
        "条": [("一条裤子。","Yì tiáo kùzi.","a pair of pants."),("一条鱼。","Yì tiáo yú.","a fish.")],
        "件": [("一件衣服。","Yí jiàn yīfu.","a piece of clothing."),("一件事。","Yí jiàn shì.","a matter.")],
        "杯": [("一杯水。","Yì bēi shuǐ.","a glass of water."),("两杯咖啡。","Liǎng bēi kāfēi.","two cups of coffee.")],
        "瓶": [("一瓶牛奶。","Yì píng niúnǎi.","a bottle of milk."),("一瓶可乐。","Yì píng kělè.","a bottle of cola.")],
        "辆": [("一辆车。","Yí liàng chē.","a car."),("两辆自行车。","Liǎng liàng zìxíngchē.","two bicycles.")],
        "次": [("一次机会。","Yí cì jīhuì.","one chance."),("去过两次。","Qù guo liǎng cì.","(I've) been there twice.")],
        "双": [("一双鞋。","Yì shuāng xié.","a pair of shoes."),("一双筷子。","Yì shuāng kuàizi.","a pair of chopsticks.")]
    }
    if hanzi in choices:
        (cn1, py1, en1), (cn2, py2, en2) = choices[hanzi]
        return [{"chinese":cn1,"pinyin":py1,"english":en1},{"chinese":cn2,"pinyin":py2,"english":en2}]
    return [{"chinese":"一个苹果。","pinyin":"Yí gè píngguǒ.","english":"one apple."},
            {"chinese":"三个人。","pinyin":"Sān gè rén.","english":"three people."}]

def gen_pronoun(hanzi, pinyin, english, hsk):
    if hanzi=="我":
        return [{"chinese":"我喜欢学习中文。","pinyin":"Wǒ xǐhuān xuéxí Zhōngwén.","english":"I like studying Chinese."},
                {"chinese":"周末我常常去公园。","pinyin":"Zhōumò wǒ chángcháng qù gōngyuán.","english":"On weekends I often go to the park."}]
    if hanzi=="你":
        return [{"chinese":"你今天怎么样？","pinyin":"Nǐ jīntiān zěnmeyàng?","english":"How are you today?"},
                {"chinese":"这本书给你。","pinyin":"Zhè běn shū gěi nǐ.","english":"This book is for you."}]
    return [{"chinese":f"{hanzi}在听课。","pinyin":f"{pinyin} zài tīng kè.","english":f"{english.capitalize()} is attending class."},
            {"chinese":f"老师问了{hanzi}一个问题。","pinyin":f"Lǎoshī wèn le {pinyin} yí gè wèntí.","english":f"The teacher asked {english} a question."}]

def gen_question(hanzi, pinyin, english, hsk):
    mapping = {
        "什么": ("你在做什么？","Nǐ zài zuò shénme?","What are you doing?"),
        "谁": ("谁是你的老师？","Shéi shì nǐ de lǎoshī?","Who is your teacher?"),
        "哪儿": ("你住在哪儿？","Nǐ zhù zài nǎr?","Where do you live?"),
        "哪里": ("厕所在哪里？","Cèsuǒ zài nǎlǐ?","Where is the restroom?"),
        "哪": ("你要哪一个？","Nǐ yào nǎ yí gè?","Which one do you want?"),
        "怎么": ("这个字怎么写？","Zhège zì zěnme xiě?","How do you write this character?"),
        "为什么": ("你为什么迟到？","Nǐ wèishénme chídào?","Why are you late?"),
        "多少": ("这个多少钱？","Zhège duōshao qián?","How much is this?"),
        "几": ("现在几点？","Xiànzài jǐ diǎn?","What time is it now?")
    }
    if hanzi in mapping:
        c,p,e = mapping[hanzi]
        return [{"chinese":c,"pinyin":p,"english":e},
                {"chinese":f"{hanzi}时候出发最合适？","pinyin":f"{pinyin} shíhou chūfā zuì héshì?","english":"When is the best time to set off?"}]
    return [{"chinese":f"{hanzi}时候我们见面？","pinyin":f"{pinyin} shíhou wǒmen jiànmiàn?","english":"When shall we meet?"},
            {"chinese":"你想去哪儿？","pinyin":"Nǐ xiǎng qù nǎr?","english":"Where do you want to go?"}]

def gen_preposition(hanzi, pinyin, english, hsk):
    mapping = {
        "在": [("我在家工作。","Wǒ zài jiā gōngzuò.","I work at home."),("她在图书馆看书。","Tā zài túshūguǎn kànshū.","She reads at the library.")],
        "对": [("我对历史很感兴趣。","Wǒ duì lìshǐ hěn gǎn xìngqù.","I'm very interested in history."),("这个决定对大家都有好处。","Zhège juédìng duì dàjiā dōu yǒu hǎochù.","This decision benefits everyone.")],
        "给": [("请给我一杯水。","Qǐng gěi wǒ yì bēi shuǐ.","Please give me a glass of water."),("医生给了我一些建议。","Yīshēng gěi le wǒ yìxiē jiànyì.","The doctor gave me some advice.")],
        "从": [("我从上海飞到北京。","Wǒ cóng Shànghǎi fēi dào Běijīng.","I flew from Shanghai to Beijing."),("他从小就喜欢音乐。","Tā cóng xiǎo jiù xǐhuān yīnyuè.","He has liked music since childhood.")],
        "到": [("我们到学校去。","Wǒmen dào xuéxiào qù.","We're going to the school."),("火车几点到？","Huǒchē jǐ diǎn dào?","What time does the train arrive?")],
        "跟": [("我跟他一起学习。","Wǒ gēn tā yìqǐ xuéxí.","I study together with him."),("跟我来。","Gēn wǒ lái.","Come with me.")],
        "向": [("他向老师请教问题。","Tā xiàng lǎoshī qǐngjiào wèntí.","He asks the teacher for guidance."),("请向右看。","Qǐng xiàng yòu kàn.","Please look to the right.")],
        "往": [("往左走，就到了。","Wǎng zuǒ zǒu, jiù dào le.","Go left and you'll be there."),("往前走三分钟就到了。","Wǎng qián zǒu sān fēnzhōng jiù dào le.","Walk forward three minutes and you'll arrive.")],
        "把": [("请把门关上。","Qǐng bǎ mén guān shàng.","Please close the door."),("我把作业放在桌子上了。","Wǒ bǎ zuòyè fàng zài zhuōzi shàng le.","I put the homework on the table.")],
        "被": [("他被雨淋湿了。","Tā bèi yǔ lín shī le.","He was soaked by the rain."),("窗户被风吹开了。","Chuānghu bèi fēng chuī kāi le.","The window was blown open by the wind.")],
        "比": [("今天比昨天冷。","Jīntiān bǐ zuótiān lěng.","Today is colder than yesterday."),("他比我高一点。","Tā bǐ wǒ gāo yìdiǎn.","He's a bit taller than me.")],
        "离": [("学校离我家不远。","Xuéxiào lí wǒ jiā bù yuǎn.","The school isn't far from my home."),("银行离地铁站很近。","Yínháng lí dìtiězhàn hěn jìn.","The bank is very close to the subway station.")]
    }
    if hanzi in mapping:
        return [{"chinese":a,"pinyin":b,"english":c} for a,b,c in mapping[hanzi]]
    return [{"chinese":"他在教室里学习。","pinyin":"Tā zài jiàoshì lǐ xuéxí.","english":"He studies in the classroom."},
            {"chinese":"我跟朋友一起吃饭。","pinyin":"Wǒ gēn péngyou yìqǐ chīfàn.","english":"I eat with friends."}]

def gen_adverb(hanzi, pinyin, english, hsk):
    mapping = {
        "也": [("我也是学生。","Wǒ yě shì xuésheng.","I'm also a student."),("他也会说中文。","Tā yě huì shuō Zhōngwén.","He can also speak Chinese.")],
        "都": [("我们都在等你。","Wǒmen dōu zài děng nǐ.","We're all waiting for you."),("他们都喜欢这部电影。","Tāmen dōu xǐhuān zhè bù diànyǐng.","They all like this movie.")],
        "还": [("我还没吃饭。","Wǒ hái méi chīfàn.","I haven't eaten yet."),("他还在开会。","Tā hái zài kāihuì.","He's still in a meeting.")],
        "又": [("又下雨了。","Yòu xià yǔ le.","It rained again."),("他又迟到了。","Tā yòu chídào le.","He was late again.")],
        "再": [("我们明天再说。","Wǒmen míngtiān zàishuō.","Let's talk about it tomorrow."),("请再读一遍。","Qǐng zài dú yí biàn.","Please read it once more.")],
        "就": [("你到了就给我打电话。","Nǐ dào le jiù gěi wǒ dǎ diànhuà.","Call me as soon as you arrive."),("我现在就去。","Wǒ xiànzài jiù qù.","I'll go right now.")],
        "已经": [("我已经买好票了。","Wǒ yǐjīng mǎi hǎo piào le.","I've already bought the tickets."),("他已经到公司了。","Tā yǐjīng dào gōngsī le.","He has already arrived at the company.")],
        "非常": [("这道菜非常好吃。","Zhè dào cài fēicháng hǎochī.","This dish is very tasty."),("他非常忙。","Tā fēicháng máng.","He's extremely busy.")],
        "太": [("这件衣服太贵了。","Zhè jiàn yīfu tài guì le.","This piece of clothing is too expensive."),("你太客气了。","Nǐ tài kèqi le.","You're too kind.")]
    }
    if hanzi in mapping:
        return [{"chinese":a,"pinyin":b,"english":c} for a,b,c in mapping[hanzi]]
    return [{"chinese":f"{hanzi}好。","pinyin":f"{pinyin} hǎo.","english":"That's fine."},
            {"chinese":f"他{hanzi}来了。","pinyin":f"Tā {pinyin} lái le.","english":"Then he came."}]

def gen_time(hanzi, pinyin, english, hsk):
    mapping = {
        "今天": [("今天下雨了。","Jīntiān xià yǔ le.","It rained today."),("我们今天晚上开会。","Wǒmen jīntiān wǎnshang kāihuì.","We have a meeting tonight.")],
        "明天": [("明天见。","Míngtiān jiàn.","See you tomorrow."),("明天我不在家。","Míngtiān wǒ bú zài jiā.","I won't be home tomorrow.")],
        "昨天": [("我昨天看了一部电影。","Wǒ zuótiān kàn le yí bù diànyǐng.","I watched a movie yesterday."),("昨天他请我吃饭。","Zuótiān tā qǐng wǒ chīfàn.","He treated me to a meal yesterday.")],
        "现在": [("现在几点？","Xiànzài jǐ diǎn?","What time is it now?"),("我现在在图书馆。","Wǒ xiànzài zài túshūguǎn.","I'm at the library now.")]
    }
    if hanzi in mapping:
        return [{"chinese":a,"pinyin":b,"english":c} for a,b,c in mapping[hanzi]]
    return [{"chinese":f"{hanzi}我们再联系。","pinyin":f"{pinyin} wǒmen zài liánxì.","english":"Let's be in touch then."},
            {"chinese":f"{hanzi}我要出门。","pinyin":f"{pinyin} wǒ yào chūmén.","english":"I'll head out then."}]

def gen_number(hanzi, pinyin, english, hsk):
    return [{"chinese":f"{hanzi}个人。","pinyin":f"{pinyin} gè rén.","english":f"{english.capitalize()} people." if english else "people."},
            {"chinese":f"{hanzi}杯水。","pinyin":f"{pinyin} bēi shuǐ.","english":f"{english.capitalize()} cups of water." if english else "cups of water."}]

def gen_adjective(hanzi, pinyin, english, hsk):
    special = {
        "大": [("这个房间很大。","Zhège fángjiān hěn dà.","This room is very big."),("这件衣服比那件大。","Zhè jiàn yīfu bǐ nà jiàn dà.","This piece of clothing is bigger than that one.")],
        "小": [("这只猫很小。","Zhè zhī māo hěn xiǎo.","This cat is very small."),("这个问题不小。","Zhège wèntí bù xiǎo.","This problem isn't small.")],
        "漂亮": [("这里风景很漂亮。","Zhèlǐ fēngjǐng hěn piàoliang.","The scenery here is beautiful."),("你的裙子真漂亮。","Nǐ de qúnzi zhēn piàoliang.","Your dress is really pretty.")],
        "好": [("这个主意很好。","Zhège zhǔyi hěn hǎo.","This idea is very good."),("今天的心情很好。","Jīntiān de xīnqíng hěn hǎo.","I'm in a good mood today.")],
        "忙": [("最近工作很忙。","Zuìjìn gōngzuò hěn máng.","Work has been busy lately."),("别现在打扰他，他正忙着。","Bié xiànzài dǎrǎo tā, tā zhèng mángzhe.","Don't bother him now; he's busy.")],
        "难": [("这道题很难。","Zhè dào tí hěn nán.","This problem is difficult."),("说起来容易做起来难。","Shuō qǐlái róngyì, zuò qǐlái nán.","Easy to say, hard to do.")]
    }
    if hanzi in special:
        return [{"chinese":a,"pinyin":b,"english":c} for a,b,c in special[hanzi]]
    return [{"chinese":f"这个地方很{hanzi}。","pinyin":f"Zhège dìfāng hěn {pinyin}.","english":f"This place is very {english}." if english else "This place is very ..."},
            {"chinese":f"这件事比我想的更{hanzi}。","pinyin":f"Zhè jiàn shì bǐ wǒ xiǎng de gèng {pinyin}.","english":f"This is even more {english} than I thought." if english else "This is even more ... than I thought."}]

def gen_verb(hanzi, pinyin, english, hsk):
    vmap = {
        "看": [("我在看书。","Wǒ zài kàn shū.","I'm reading."),("周末我们看电影。","Zhōumò wǒmen kàn diànyǐng.","We watch movies on weekends.")],
        "吃": [("我们一起吃早饭。","Wǒmen yìqǐ chī zǎofàn.","We eat breakfast together."),("别吃太快。","Bié chī tài kuài.","Don't eat too fast.")],
        "喝": [("多喝水。","Duō hē shuǐ.","Drink more water."),("他不喝咖啡。","Tā bù hē kāfēi.","He doesn't drink coffee.")],
        "学": [("我学中文。","Wǒ xué Zhōngwén.","I study Chinese."),("他学得很快。","Tā xué de hěn kuài.","He learns quickly.")],
        "学习": [("我在学校学习中文。","Wǒ zài xuéxiào xuéxí Zhōngwén.","I study Chinese at school."),("她学习得非常认真。","Tā xuéxí de fēicháng rènzhēn.","She studies very diligently.")],
        "买": [("我想买那件衣服。","Wǒ xiǎng mǎi nà jiàn yīfu.","I want to buy that piece of clothing."),("他买了一些水果。","Tā mǎi le yìxiē shuǐguǒ.","He bought some fruit.")],
        "去": [("我们去公园散步吧。","Wǒmen qù gōngyuán sànbù ba.","Let's go for a walk in the park."),("他明天去北京出差。","Tā míngtiān qù Běijīng chūchāi.","He's going to Beijing on a business trip tomorrow.")],
        "来": [("请你明天来我家。","Qǐng nǐ míngtiān lái wǒ jiā.","Please come to my place tomorrow."),("他刚来公司。","Tā gāng lái gōngsī.","He just came to the company.")],
        "有": [("我有两个问题。","Wǒ yǒu liǎng gè wèntí.","I have two questions."),("这里有很多人。","Zhèlǐ yǒu hěn duō rén.","There are many people here.")],
        "是": [("我是老师。","Wǒ shì lǎoshī.","I am a teacher."),("这些都是我的。","Zhèxiē dōu shì wǒ de.","These are all mine.")],
        "想": [("我想休息一下。","Wǒ xiǎng xiūxi yíxià.","I want to rest a bit."),("你想吃什么？","Nǐ xiǎng chī shénme?","What do you want to eat?")],
        "要": [("我要一杯奶茶。","Wǒ yào yì bēi nǎichá.","I want a cup of milk tea."),("他要出门了。","Tā yào chūmén le.","He's about to go out.")],
        "会": [("我会游泳。","Wǒ huì yóuyǒng.","I can swim."),("他不会开车。","Tā bú huì kāichē.","He can't drive.")],
        "能": [("你能帮我一下吗？","Nǐ néng bāng wǒ yíxià ma?","Can you help me for a moment?"),("今天不能迟到。","Jīntiān bù néng chídào.","We mustn't be late today.")],
        "说": [("请慢慢说。","Qǐng mànman shuō.","Please speak slowly."),("他在电话里说话。","Tā zài diànhuà lǐ shuōhuà.","He's speaking on the phone.")],
        "用": [("我用电脑工作。","Wǒ yòng diànnǎo gōngzuò.","I work with a computer."),("请用中文回答。","Qǐng yòng Zhōngwén huídá.","Please answer in Chinese.")]
    }
    if hanzi in vmap:
        return [{"chinese":a,"pinyin":b,"english":c} for a,b,c in vmap[hanzi]]
    return [{"chinese":f"我常常{hanzi}。","pinyin":f"Wǒ chángcháng {pinyin}.","english":f"I often {english}." if english else "I often do this."},
            {"chinese":f"周末我会{hanzi}一下。","pinyin":f"Zhōumò wǒ huì {pinyin} yíxià.","english":f"I usually {english} a bit on weekends." if english else "I usually do it a bit on weekends."}]

def gen_noun(hanzi, pinyin, english, hsk):
    nmap = {
        "朋友": [("我是你的朋友。","Wǒ shì nǐ de péngyou.","I'm your friend."),("我和朋友一起旅行。","Wǒ hé péngyou yìqǐ lǚxíng.","I travel with friends.")],
        "中国": [("我想去中国旅游。","Wǒ xiǎng qù Zhōngguó lǚyóu.","I want to travel to China."),("中国菜很好吃。","Zhōngguó cài hěn hǎochī.","Chinese food is delicious.")],
        "北京": [("北京的冬天很冷。","Běijīng de dōngtiān hěn lěng.","Beijing winters are very cold."),("我在北京工作过。","Wǒ zài Běijīng gōngzuò guo.","I have worked in Beijing.")],
        "学校": [("学校在公园旁边。","Xuéxiào zài gōngyuán pángbiān.","The school is next to the park."),("放学后我回学校图书馆。","Fàngxué hòu wǒ huí xuéxiào túshūguǎn.","After class I go back to the school library.")],
        "超市": [("我去超市买菜。","Wǒ qù chāoshì mǎi cài.","I go to the supermarket to buy groceries."),("超市里人很多。","Chāoshì lǐ rén hěn duō.","There are many people in the supermarket.")],
        "医院": [("我在医院看医生。","Wǒ zài yīyuàn kàn yīshēng.","I see a doctor at the hospital."),("医院在右边。","Yīyuàn zài yòubian.","The hospital is on the right.")],
        "家": [("我想回家休息。","Wǒ xiǎng huíjiā xiūxi.","I want to go home and rest."),("欢迎来我家玩。","Huānyíng lái wǒ jiā wán.","Welcome to visit my home.")],
        "水": [("我每天喝很多水。","Wǒ měitiān hē hěn duō shuǐ.","I drink a lot of water every day."),("等会儿给你一杯水。","Děnghuìr gěi nǐ yì bēi shuǐ.","I'll get you a glass of water later.")]
    }
    if hanzi in nmap:
        return [{"chinese":a,"pinyin":b,"english":c} for a,b,c in nmap[hanzi]]
    return [{"chinese":f"这是{hanzi}。","pinyin":f"Zhè shì {pinyin}.","english":f"This is {english}." if english else "This is it."},
            {"chinese":f"我喜欢{hanzi}。","pinyin":f"Wǒ xǐhuān {pinyin}.","english":f"I like {english}." if english else "I like it."}]

def generate_examples(hanzi, pinyin, english, hsk):
    pos = guess_pos(hanzi, english)
    if pos == "particle": return gen_particle(hanzi, pinyin, english, hsk)
    if pos == "measure": return gen_measure(hanzi, pinyin, english, hsk)
    if pos == "pronoun": return gen_pronoun(hanzi, pinyin, english, hsk)
    if pos == "question": return gen_question(hanzi, pinyin, english, hsk)
    if pos == "preposition": return gen_preposition(hanzi, pinyin, english, hsk)
    if pos == "adverb": return gen_adverb(hanzi, pinyin, english, hsk)
    if pos == "time": return gen_time(hanzi, pinyin, english, hsk)
    if pos == "number": return gen_number(hanzi, pinyin, english, hsk)
    if pos == "adjective": return gen_adjective(hanzi, pinyin, english, hsk)
    if pos == "verb": return gen_verb(hanzi, pinyin, english, hsk)
    return gen_noun(hanzi, pinyin, english, hsk)

# Build output
out = []
for item in vocab:
    hanzi = item.get("hanzi") or item.get("hanza") or ""
    pinyin = item.get("pinyin") or ""
    english = item.get("english") or ""
    hsk = item.get("hsk") or ""
    out.append({
        "hanzi": hanzi,
        "pinyin": pinyin,
        "english": english,
        "hsk": hsk,
        "exampleSentences": generate_examples(hanzi, pinyin, english, hsk)
    })

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

(out_path, len(out))

