# helpers to locate/replace top-level JS functions by name (handles strings/templates/comments)
import re
def _end(src, i):
    # i at the '{' that opens the body; return index after matching '}'
    depth=0; n=len(src); stack=[]  # stack of contexts: 'code' or 'tpl'
    mode='code'; j=i
    while j<n:
        c=src[j]
        if mode=='code':
            if c=='/' and src[j+1]=='/': j=src.index('\n',j); continue
            if c=='/' and src[j+1]=='*': j=src.index('*/',j)+2; continue
            if c in '"\'':
                q=c; j+=1
                while src[j]!=q:
                    if src[j]=='\\': j+=1
                    j+=1
                j+=1; continue
            if c=='`': stack.append(('code',depth)); mode='tpl'; j+=1; continue
            if c=='{': depth+=1
            elif c=='}':
                depth-=1
                if stack and stack[-1][0]=='tplexpr' and depth==stack[-1][1]:
                    stack.pop(); mode='tpl'; j+=1; continue
                if depth==0: return j+1
            j+=1
        else: # template
            if c=='\\': j+=2; continue
            if c=='`': mode='code'; stack.pop(); j+=1; continue
            if c=='$' and src[j+1]=='{': stack.append(('tplexpr',depth)); depth+=1; mode='code'; j+=2; continue
            j+=1
    raise Exception('no end')
def span(src, name):
    m=re.search(r'(?m)^(async )?function '+re.escape(name)+r'\(', src)
    if not m: raise Exception('fn not found '+name)
    i=src.index('{', m.end()-1)
    # skip default params containing braces: find the ')' that closes params first
    p=m.end(); depth=1
    while depth:
        if src[p]=='(': depth+=1
        elif src[p]==')': depth-=1
        p+=1
    i=src.index('{', p)
    e=_end(src,i)
    if e<len(src) and src[e]=='\n': e+=1
    return m.start(), e
def replace_fn(src, name, new):
    a,b=span(src,name); return src[:a]+new.rstrip('\n')+'\n'+src[b:]
def remove_fn(src, name):
    a,b=span(src,name); return src[:a]+src[b:]
