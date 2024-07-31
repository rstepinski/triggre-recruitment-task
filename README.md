# Triggre test assignment

Library code is under `libx`. Demo code is under `demo`, simplest way to check it would be
to run `npx serve` in `demo` directory. Compiled library code is simply copied to `demo/lib` as I had
issues when trying to import it when using bundlers and decided not to waste time on troubleshooting.

If you wish to make any changes to the library, just use the provided script `./update_lib.sh` to run the
build process and copy compiled files to demo directory.

## Widgets

Widgets are by default in the `widgets` directory and the default resolver is configured that way. Feel free
to move things around, just remember to update the resolver. The base class (`BaseTestWidget` under `widgets/base.js`) is simply responsible for updating information about the widget's state in the form of `data-*` attributes. I highly recommend using it if you'd like to test your own widget, otherwise
its data simply won't show up.

Be careful about nesting a content widget inside another content widget. This library provides no guards
against potential infinite widget recursion (although it is something I'd like to implement given more time).

You can change initial widgets layout by changing `index.html`.

`dev.js` is the script responsible for displaying details about nodes, if you're interested.

## Other notes

I decided to change the provided interfaces slightly. Most notably, I'm not using callbacks in widget initialization methods in favor of promises. This way, the widget "decides" whether it was initialized or not by simply resolving or rejecting the promise.

Requirement 8 (automatic `this` bind) was not really clear to me at first. I understand that maybe it's phrased that way to check if the candidate is aware of DOM event listeners behavior, but it took me some time to understand the reason for it.

There's no way to manually set `done` state for every widget, this is directly caused by the design decision to use promises. If you wish to check this particular behavior, there's the `manual-done` widget prepared with this in mind.

Also, it is not really clear from the assignment what the states should be, exactly. I assumed that the widget lifecycle would be:
1. `init()` gets called
2. `init()` gets called on every child 
3. `afterSubtreeInit()` gets called 