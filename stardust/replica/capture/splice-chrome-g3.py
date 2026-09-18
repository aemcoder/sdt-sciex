# Splice the canon chrome (header, footer-spacer + support band + footer) from the gated home
# prototype into a G3 prototype between the canon:* markers, then swap the per-page footer
# disclaimer marketing code (read from the page's sidecar). usage: splice-chrome-g3.py <slug> <code>
import re, sys
root = '/Users/paolo/stardust/source/180926/sciex/sdt-sciex/stardust/prototypes/'
slug, code = sys.argv[1], sys.argv[2]
legacy = '--legacy-footer' in sys.argv  # page-content/legacy templates ship the new-footer XF: take the gated kb-article footer block
home = open(root + 'home-proposed.html').read()
me_path = root + slug + '-proposed.html'
me = open(me_path).read()
hdr = re.search(r'<header class="site-header".*?</header>', home, re.S).group(0)
ftr = re.search(r'<div class="footer-spacer".*?</footer>', open(root + 'kb-article-proposed.html').read() if legacy else home, re.S).group(0)
me = re.sub(r'<!-- canon:header:start -->.*?<!-- canon:header:end -->', lambda m: '<!-- canon:header:start -->\n' + hdr + '\n<!-- canon:header:end -->', me, flags=re.S)
me = re.sub(r'<!-- canon:footer:start -->.*?<!-- canon:footer:end -->', lambda m: '<!-- canon:footer:start -->\n' + ftr + '\n<!-- canon:footer:end -->', me, flags=re.S)
if code != 'GEN-MKT-18-7897-A' and not legacy:
    me = me.replace('<span>GEN-MKT-18-7897-A</span>', f'<span data-deviation="footer disclaimer code varies per page XF: {code} on this page">{code}</span>')
open(me_path, 'w').write(me)
print('spliced', slug, 'header', len(hdr), 'bytes; footer block', len(ftr), 'bytes; code', code)
