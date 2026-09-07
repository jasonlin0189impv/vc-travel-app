import zlib, struct

def read_png(p):
    d = open(p,'rb').read(); i = 8; w=h=None; idat=b''
    while i < len(d):
        ln = struct.unpack('>I', d[i:i+4])[0]; tag = d[i+4:i+8]; body = d[i+8:i+8+ln]
        if tag == b'IHDR': w,h = struct.unpack('>II', body[:8])
        elif tag == b'IDAT': idat += body
        i += 12+ln
    raw = zlib.decompress(idat); px=[]; stride=w*3; prev=bytearray(stride); o=0
    for y in range(h):
        f=raw[o]; o+=1; line=bytearray(raw[o:o+stride]); o+=stride
        for x in range(stride):
            a = line[x-3] if x>=3 else 0; b = prev[x]; c = prev[x-3] if x>=3 else 0
            if f==1: line[x]=(line[x]+a)&255
            elif f==2: line[x]=(line[x]+b)&255
            elif f==3: line[x]=(line[x]+(a+b)//2)&255
            elif f==4:
                pp=a+b-c; pa,pb,pc=abs(pp-a),abs(pp-b),abs(pp-c)
                pr = a if (pa<=pb and pa<=pc) else (b if pb<=pc else c)
                line[x]=(line[x]+pr)&255
        px.append([tuple(line[x*3:x*3+3]) for x in range(w)]); prev=line
    return w,h,px

def write_png(path, grid):
    h=len(grid); w=len(grid[0]); rows=bytearray()
    for r in grid:
        rows.append(0)
        for p in r: rows.extend(p)
    def ch(t,d): return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    open(path,'wb').write(b'\x89PNG\r\n\x1a\n'
        + ch(b'IHDR',struct.pack('>IIBBBBB',w,h,8,2,0,0,0))
        + ch(b'IDAT',zlib.compress(bytes(rows),9)) + ch(b'IEND',b''))

def box(px,w,h,n):
    s=w//n; out=[]
    for y in range(n):
        row=[]
        for x in range(n):
            acc=[0,0,0]
            for j in range(s):
                for i in range(s):
                    p=px[y*s+j][x*s+i]
                    for k in range(3): acc[k]+=p[k]
            row.append(tuple(v//(s*s) for v in acc))
        out.append(row)
    return out

def sizes_strip(src, dst, specs=((180,1),(36,5),(18,10)), gap=10, bg=(255,255,255)):
    w,h,px = read_png(src); tiles=[]
    for n,z in specs:
        g = px if n==w else box(px,w,h,n)
        tiles.append([[g[y//z][x//z] for x in range(n*z)] for y in range(n*z)])
    W=sum(len(t[0]) for t in tiles)+gap*(len(tiles)+1); H=max(len(t) for t in tiles)+gap*2
    cv=[[bg]*W for _ in range(H)]; x0=gap
    for t in tiles:
        for y,row in enumerate(t):
            for x,p in enumerate(row): cv[gap+y][x0+x]=p
        x0+=len(t[0])+gap
    write_png(dst,cv)

def crop_zoom(src,dst,x0,y0,x1,y1,z):
    w,h,px=read_png(src)
    g=[[px[y][x] for x in range(x0,x1)] for y in range(y0,y1)]
    write_png(dst,[[g[y//z][x//z] for x in range(len(g[0])*z)] for y in range(len(g)*z)])
