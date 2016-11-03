# The Graylog CLI dashboard

This is a [Graylog](http://www.graylog.org/) stream dashboard that runs in your shell. It is meant to be a perfect companion for example
when performing a release on the main monitor and having the dashboard on the second monitor to keep an eye on errors and exceptions on
your platform.

![screencast](https://github.com/Graylog2/cli-dashboard/blob/master/screencast.gif)

The most important library we use is [blessed-contrib](https://github.com/yaronn/blessed-contrib)
by [Yaron Naveh](https://twitter.com/YaronNaveh). Great job on that!

**The dashboard should run on Linux and OSX.** Please report any issues in the [issue tracker](https://github.com/Graylog2/cli-dashboard/issues).

## Installation

Install the dashboard: (You'll have to have [node.js](http://nodejs.org/download/) > 4.0 installed.
Protip: It's in [homebrew](http://brew.sh) if you are on OSX.)

    $ npm install graylog-cli-dashboard -g

View the options:

    $ graylog-cli-dashboard --help
    Usage: graylog-dashboard.js <command> [options]

    Options:
      --stream-title    Graylog Stream Title
      --server-url      Full Graylog REST API URL
      --poll-interval   How often (in ms) to poll the Graylog server [default: 1000]
      --username        Graylog username
      --password        Graylog password
      --cred-file-path  Path to an optional credentials file
                                   [default: "/Users/user/.graylog_dashboard"]
      --help            Show help                                          [boolean]

Full example:

    $ graylog-dashboard --stream-title "Production Webservers" --host http://graylog.example.org:12900

Make sure to run this with a recent version (>= 4) of node.js.

#### Credentials File

If you wish, you may place a YAML file containing any of the above options at a path of your choosing.
The default is `~/.graylog_dashboard`. For example:

    username: lennart
    password: sEcReT

If you do not provide this file, and do not provide required data via command options, you will be prompted.

#### Specifying a Stream

Choose one from the list on the right side of the screen, or specify a `--stream-title` in the command.

#### If the graylog-dashboard executable cannot be found

You must have the `graylog-dashboard` executable that gets installed by NPM in your `PATH`. This is usually the case after installing
NPM in the first place but the output of `npm install` should show you where it was installed if you cannot find it:

    /usr/local/share/npm/bin/graylog-dashboard -> /usr/local/share/npm/lib/node_modules/graylog-cli-dashboard/graylog-dashboard.js
    # In this OSX example graylog-dashboard has been linked to the graylog-dashboard.js file in /usr/local/share/npm/...
    # Execute /usr/local/share/npm/bin/graylog-dashboard to try it out

### The Dashboard in the Wild

Because this stuff looks like it is from space we suspect that people like to show it. **Send us a photo of your dashboard running somewhere**
and we are more than happy to publish it here. **Bonus points for messy desks or interesting stuff in the background.**

### Working with NPM

This is a few helpful notes for all of us who do not regularly work with the node/NPM ecosystem and can't remember how to do stuff.

#### Bumping and releasing a new version

    $ make version [major | minor | patch]
    $ make publish
