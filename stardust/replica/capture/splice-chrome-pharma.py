# Splice the canon chrome (header, footer-spacer + support band + footer) from the gated home
# prototype into the pharma prototype between the canon:* markers. Chrome markup must be identical
# across archetypes so deploy can template-slot it. Re-run whenever home-proposed.html changes.
import re, sys
root = '/Users/paolo/stardust/source/180926/sciex/sdt-sciex/stardust/prototypes/'
home = open(root + 'home-proposed.html').read()
me_path = root + 'applications-pharma-and-biopharma-proposed.html'
me = open(me_path).read()
hdr = re.search(r'<header class="site-header".*?</header>', home, re.S).group(0)
ftr = re.search(r'<div class="footer-spacer".*?</footer>', home, re.S).group(0)
me = re.sub(r'<!-- canon:header:start -->.*?<!-- canon:header:end -->', lambda m: '<!-- canon:header:start -->\n' + hdr + '\n<!-- canon:header:end -->', me, flags=re.S)
me = re.sub(r'<!-- canon:footer:start -->.*?<!-- canon:footer:end -->', lambda m: '<!-- canon:footer:start -->\n' + ftr + '\n<!-- canon:footer:end -->', me, flags=re.S)
# Page-level chrome delta (live footer XF on this template carries a different disclaimer code)
me = me.replace('<span>GEN-MKT-18-7897-A</span>', '<span data-deviation="footer disclaimer code varies per page XF: MKT-27286-A on application pages">MKT-27286-A</span>')
open(me_path, 'w').write(me)
print('spliced header', len(hdr), 'bytes; footer block', len(ftr), 'bytes')
