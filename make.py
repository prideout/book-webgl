#!/usr/bin/env python

import os, sys

if os.system('pdflatex -shell-escape book.tex'):
    sys.exit(1)

if os.system('pdflatex -shell-escape book.tex'):
    sys.exit(1)

if os.system('pdflatex -jobname=outline-trimmed trim.tex'):
    sys.exit(1)
