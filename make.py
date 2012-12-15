#!/usr/bin/env python

import os, sys, shutil, argparse

buildpath = '_build'

texfiles = '''
book
chapter01
chapter02
'''.split()

cmds = [
    'pdflatex -shell-escape book.tex',
    'pdflatex -shell-escape book.tex',
]

def clean(args):
    try: shutil.rmtree(buildpath)
    except: pass

def build(args):
    clean(args)
    os.mkdir(buildpath)
    for f in texfiles:
        shutil.copy(f + '.tex', buildpath)
    os.chdir(buildpath)
    for cmd in cmds:
        if os.system(cmd):
            sys.exit(1)
    print "Success!"

def trim(args):
    texfiles.append('trim')
    cmds.append('pdflatex -jobname=trimmed trim.tex')
    build(args)

def view(args):
    fileToOpen = os.path.join(buildpath, args.file)
    if sys.platform.startswith('darwin'):
        os.system('open ' + fileToOpen)
    else:
        os.system('xdg-open ' + fileToOpen)

# Create the top-level parser.
parser = argparse.ArgumentParser()
subparsers = parser.add_subparsers()

# Create the parser for the "build" command.
parser_build = subparsers.add_parser('build')
parser_build.set_defaults(func = build)

# Create the parser for the "clean" command.
parser_clean = subparsers.add_parser('clean')
parser_clean.set_defaults(func = clean)

# Create the parser for the "trim" command.
parser_trim = subparsers.add_parser('trim')
parser_trim.set_defaults(func = trim)

# Create the parser for the "view" command.
parser_view = subparsers.add_parser('view')
parser_view.add_argument(
    '-file',
    default = 'book.pdf')
parser_view.set_defaults(func = view)

# Parse and execute!
args = parser.parse_args()
args.func(args)
