# SaltyRTC Relayed Data Task for JavaScript

[![CircleCI](https://circleci.com/gh/saltyrtc/saltyrtc-task-relayed-data-js/tree/master.svg?style=shield)](https://circleci.com/gh/saltyrtc/saltyrtc-task-relayed-data-js/tree/master)
[![npm Version](https://img.shields.io/npm/v/@saltyrtc/task-relayed-data.svg?maxAge=2592000)](https://www.npmjs.com/package/@saltyrtc/task-relayed-data)
[![npm Downloads](https://img.shields.io/npm/dt/@saltyrtc/task-relayed-data.svg?maxAge=3600)](https://www.npmjs.com/package/@saltyrtc/task-relayed-data)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/saltyrtc/saltyrtc-task-relayed-data-js)
[![Join our chat on Gitter](https://badges.gitter.im/saltyrtc/Lobby.svg)](https://gitter.im/saltyrtc/Lobby)

This is a [SaltyRTC](https://saltyrtc.org/) Relayed Data task implementation for
JavaScript (ES5 / ES2015), written in TypeScript 2.


## Installing

### Via npm

You can install this library (and its peer dependencies) via `npm`:

    npm install --save @saltyrtc/task-relayed-data @saltyrtc/client tweetnacl msgpack-lite


## Usage

Create a new task instance:

    const task = new RelayedDataTask();

(If you want to enable debug console messages, you can pass `true` to the constructor:)

    const task = new RelayedDataTask(true);

Once the connection is established (when the `SaltyRTC` instance raises the
`state-change:task` event), you can send messages using the `sendMessage` method:

    task.sendMessage("hello");
    task.sendMessage({"type": "custom", "value": "You can also send objects"});

When a new message arrives from the peer, an event is emitted. You can register
and deregister event handlers with the `on`, `once` and `off` methods:

    task.on('data', (ev) => {
        console.log('New data message arrived:', ev.data);
    });

The following events are available:

* `data`: A new message from the peer was received.


## Testing

To run tests:

    npm run build_tests

Then open `tests/testsuite.html` in your browser.

To run linting checks:

    npm run lint

You can also install a pre-push hook to do the linting:

    echo -e '#!/bin/sh\nnpm run lint' > .git/hooks/pre-push
    chmod +x .git/hooks/pre-push


## Security

### Responsible Disclosure / Reporting Security Issues

Please report security issues directly to one or both of the following contacts:

- Danilo Bargen
    - Email: mail@dbrgn.ch
    - Threema: EBEP4UCA
    - GPG: [EA456E8BAF0109429583EED83578F667F2F3A5FA][keybase-dbrgn]
- Lennart Grahl
    - Email: lennart.grahl@gmail.com
    - Threema: MSFVEW6C
    - GPG: [3FDB14868A2B36D638F3C495F98FBED10482ABA6][keybase-lgrahl]

[keybase-dbrgn]: https://keybase.io/dbrgn
[keybase-lgrahl]: https://keybase.io/lgrahl


## License

MIT, see `LICENSE.md`.
