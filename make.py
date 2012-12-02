#!/usr/bin/env python

import os, sys, shutil

build_folder = '_build'
tex_files = 'book trim outline'
cmds = [
    'pdflatex -shell-escape book.tex',
    'pdflatex -shell-escape book.tex',
    'pdflatex -jobname=outline-trimmed trim.tex'
]

try: shutil.rmtree(build_folder)
except: pass

os.mkdir(build_folder)

for f in tex_files.split():
    shutil.copy(f + '.tex', build_folder)

os.chdir(build_folder)

for cmd in cmds:
    if os.system(cmd):
        sys.exit(1)

print "Success!"
