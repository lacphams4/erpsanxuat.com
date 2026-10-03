# Builds web/fonts/cjk.woff2: the Chinese characters TRUMBO uses, cut from Fusion Pixel 12px Proportional SC
# (SIL Open Font License; npm package @fontsource/fusion-pixel-12px-proportional-sc).
# Usage: python3 make-font.py path/to/fusion-pixel-12px-proportional-sc-latin-400-normal.woff2
import sys, os, re, json
from fontTools import subset
here = os.path.dirname(os.path.abspath(__file__))
web = os.path.dirname(here)
text = json.dumps(json.load(open(os.path.join(here, 'zh.json'), encoding='utf-8')), ensure_ascii=False)
for f in ('index.html', 'app.js'):
    text += open(os.path.join(web, f), encoding='utf-8').read()
chars = sorted(set(c for c in text if re.match(r'[⺀-鿿豈-﫿︰-﹏＀-￯]', c)))
# keep a common set too, so short player names typed in Chinese mostly render in the pixel font
common = '的一是不了人我在有他这中大来上国个到说们为子和你地出道也时年得就那要下以生会自着去之过家学对可她里后小么心多天而能好都然没日于起还发成事只作当想看文无开手十用主行方又如前所本见经头面公同三已老从动两长知民样现分将外但身些与高意进把法此实回二理美点月明其种声全工己话儿者向情部正名定女问力机给等几很业最间新什打便位因重被走电四第门相次东政海口使教西再平真听世气信北少关并内加化由却代军产入先山五太水万市眼体别处总才场师书比住员九笑性通目华报立马命张活难神数件安表原车白应路期叫死常提感金何更反合放做系计或司利受光王果亲界及今京务制解各任至清物台象记边共风战干接它许八特觉望直服毛林题建南度统色字请交爱让认算论百吃义科怎元社术结六功指思非流每青管夫连远资队跟带花快条院变联言权往展该领传近留红治决周保达办运武半候七必城父强步完革深区即求品士转量空甚众技轻程告江语英基派满式李息写呢识极令黄德收脸钱党倒未持取设始版双历越史商千片容研像找友孩站广改议形委早房音火际则首单据导影失拿网香似斯专石若兵弟谁校读志飞观争究包组造落视济喜离虽坏兴切争'
chars = sorted(set(chars) | set(common) | set('，。！？：；、（）“”‘’…—《》·'))
out = os.path.join(web, 'fonts', 'cjk.woff2')
opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True
font = subset.load_font(sys.argv[1], opts)
s = subset.Subsetter(opts); s.populate(text=''.join(chars)); s.subset(font)
subset.save_font(font, out, opts)
print(len(chars), 'chars ->', out, os.path.getsize(out), 'bytes')
