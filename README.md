I think the session state isn't really working because I can start Safari and I'm still authenticated.

Deployment errors can be examined as follows:

    curl -u prideout https://webhooks.nodejitsu.com/1/status/prideout/changes/fe8e9d0ffd52369b0181c245070004b8 > temp.json
    cat temp.json | python -m json.tool > formatted.json
