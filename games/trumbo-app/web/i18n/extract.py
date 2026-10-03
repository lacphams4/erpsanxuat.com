# Lists the player-visible Vietnamese strings in the app's chapter pages (for translation).
# Template literals become patterns: `Ngọc ${prog}/5` -> "Ngọc {0}/5".
import re, sys, json
VI = re.compile(r"[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]", re.I)
def scan(src):
    out = []; i = 0; n = len(src); prev = ''
    while i < n:
        c = src[i]
        if c == '/' and src[i+1] == '/': i = src.index('\n', i); continue
        if c == '/' and src[i+1] == '*': i = src.index('*/', i) + 2; continue
        if c == '/' and prev in '(,=:[!&|?{};+-*%<>~^' :
            j = i + 1; cls = False
            while True:
                d = src[j]
                if d == '\\': j += 2; continue
                if d == '[': cls = True
                elif d == ']': cls = False
                elif d == '/' and not cls: break
                j += 1
            i = j + 1; prev = '/'; continue
        if c in '"\'':
            j = i + 1; buf = ''
            while src[j] != c:
                if src[j] == '\\': buf += src[j:j+2]; j += 2; continue
                buf += src[j]; j += 1
            out.append(('s', buf)); i = j + 1; prev = 'a'; continue
        if c == '`':
            j = i + 1; buf = ''; k = 0
            while src[j] != '`':
                if src[j] == '\\': buf += src[j:j+2]; j += 2; continue
                if src[j] == '$' and src[j+1] == '{':
                    depth = 1; j += 2; st = j
                    while depth:
                        if src[j] == '{': depth += 1
                        elif src[j] == '}': depth -= 1
                        elif src[j] in '\'"`':
                            q = src[j]; j += 1
                            while src[j] != q:
                                if src[j] == '\\': j += 1
                                j += 1
                        j += 1
                    inner = src[st:j-1]
                    out.extend(scan(inner))
                    buf += '{%d}' % k; k += 1; continue
                buf += src[j]; j += 1
            out.append(('t', buf)); i = j + 1; prev = 'a'; continue
        if not c.isspace(): prev = c
        i += 1
    return out
keys = {}
for f in sys.argv[1:]:
    html = open(f).read()
    js = [m for m in re.findall(r'<script>([\s\S]*?)</script>', html)][-1]
    for kind, s in scan(js):
        if VI.search(s): keys.setdefault(s.encode().decode('unicode_escape') if '\\u' in s else s.replace("\\'", "'"), set()).add(f.split('/')[-1])
json.dump({k: sorted(v) for k, v in sorted(keys.items())}, sys.stdout, ensure_ascii=False, indent=0)
