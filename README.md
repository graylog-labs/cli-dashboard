## The Graylog CLI dashboard



### Working with NPM

This is a few helpful notes for all of us who do not regularly work with the node/NPM ecosystem and can't remember how to do stuff.

#### Bumping and releasing a new version

    $ npm version [<newversion> | major | minor | patch]
    $ git push origin master && git push --tags
    $ npm publish