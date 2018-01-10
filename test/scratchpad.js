/*
 * This is a JavaScript Scratchpad.
 *
 * Enter some JavaScript, then Right Click or choose from the Execute Menu:
 * 1. Run to evaluate the selected text (Ctrl+R),
 * 2. Inspect to bring up an Object Inspector on the result (Ctrl+I), or,
 * 3. Display to insert the result in a comment after the selection. (Ctrl+L)
 */
var $t = $('<div/>');
$.gevent.subscribe($t, 'spa-login', function () {
  console.log('hello', arguments);
});
$.gevent.subscribe($t, 'spa-listchange', function () {
  console.log('*Listchange', arguments);
});
var currentUser = spa.model.people.get_user();
currentUser.get_is_anon();
/*
true
*/
spa.model.chat.join();
/*
false
*/
spa.model.people.login('Betty');

/*
Exception: ReferenceError: isFakeDate is not defined
join_chat@http://localhost/spa/js/spa.model.js:295:9
@Scratchpad/1:21:1
*/
/*
Exception: ReferenceError: isFakeDate is not defined
join_chat@http://localhost/spa/js/spa.model.js:295:9
@Scratchpad/1:21:1
*/