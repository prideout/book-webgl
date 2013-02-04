Deployment errors can be examined as follows:

    curl -u prideout https://webhooks.nodejitsu.com/1/status/prideout/changes/fe8e9d0ffd52369b0181c245070004b8 > temp.json
    cat temp.json | python -m json.tool > formatted.json

Files can be copied from the master branch like this (but I think it doesn't take wildcards):

    git checkout server
    git checkout master giza/*.js
    git checkout master recipes/*.html
    git checkout master recipes/*.js
        Note that this will NOT check out newly created files!

In the server branch, I usually modify style.css and common.js to use CDN.

    git rm -rf lib/jquery
    git rm -rf lib/jqueryui
    git rm -f css/jquery-ui.css 
    git rm -f css/*.woff
    git rm -rf css/images
