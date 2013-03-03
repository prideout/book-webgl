#!/usr/bin/env python

import os, sys, shutil, argparse
from termcolor import colored

buildpath = '_build'
#roottex = 'book'
#roottex = 'akp7_5x9_25'
roottex = 'akp6x9'

styfiles = '''
../akp/akpbook
'''.split()

texfiles = '''
book
chapter01
chapter02
chapter03
chapter04
chapter05
chapter06
chapter07
chapter08
chapter09
chapter10
chapter11
../akp/front
../akp/preface
../akp/akp7_5x9_25
../akp/akp6x9
'''.split()

cmds = [
    'pdflatex -shell-escape %s.tex' % roottex,
    'pdflatex -shell-escape %s.tex' % roottex,
]

def clean(args):
    try: shutil.rmtree(buildpath)
    except: pass

def build(args):
    clean(args)
    os.mkdir(buildpath)
    for f in texfiles:
        shutil.copy(f + '.tex', buildpath)
    for f in styfiles:
        shutil.copy(f + '.sty', buildpath)
    os.chdir(buildpath)
    if args.index:
        cmds.append('makeindex %s' % roottex)
        cmds.append('pdflatex -shell-escape %s.tex' % roottex)
    if args.crop:
        cmd = 'pdfcrop %s.pdf -p 1.8 2.9 -u "in" > cropped.pdf' % roottex
        cmds.append(cmd)
    for cmd in cmds:
        print colored(cmd, 'yellow')
        if os.system(cmd):
            sys.exit(1)
    print
    print colored('Success!', 'green')
    if not args.index:
        print "To include the index, build again with -index."
    if args.refresh:
        os.system('osascript ../refresh.scpt')

def trim(args):
    texfiles.append('trim')
    cmds.append('pdflatex -jobname=trimmed trim.tex')
    build(args)

def refresh(args):
    os.system('osascript refresh.scpt')

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
parser_build.add_argument(
    '-index',
    help = 'include the index',
    action = 'store_true')
parser_build.add_argument(
    '-refresh',
    help = 'refresh OS X preview window',
    action = 'store_true')
parser_build.add_argument(
    '-crop',
    help = 'crop away margins for preview',
    action = 'store_true')
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
    help = 'specifies an alternate file',
    default = '%s.pdf' % roottex)
parser_view.set_defaults(func = view)

# Create the parser for the "refresh" command.
parser_refresh = subparsers.add_parser('refresh')
parser_refresh.set_defaults(func = refresh)

# Parse and execute!
args = parser.parse_args()
args.func(args)
