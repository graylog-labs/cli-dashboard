1.0.0
-----

* Stream ID no longer required to start; instead, use first stream.
* Added Stream list to side of dash; use keys / mouse to switch streams.
* Updated all deps (some were very out of date).
* Main loop refactored to promises.
* Simplified some internal APIs.
* Removed need for credentials file (all arguments may be passed via args)
* Added `--help` option.
* Added `--cred-file-path` option.
* Credentials file may now contain any option.
* Added `--poll-interval` option (default `1000`).
* Renamed `--host` to `--server-url`.
* The user is now prompted for missing mandatory options, including password.


