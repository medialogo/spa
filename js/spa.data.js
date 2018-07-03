/*
 * spa.data.js
 * データモジュール
 *
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, spa */

spa.data = (function () {
    'use strict';
  //---------------- モジュールスコープ変数↓ --------------
  var
    stateMap  = { sio : null },
    makeSio, getSio, initModule;
  //----------------- モジュールスコープ変数↑ ---------------

  makeSio = function () {
      var socket = io.connect( '/chat' );

      return {
          emit : function( event_name, data ){
              socket.emit( event_name, function() {
                  callback( arguments );
              });
          }
      };
  };

  getSio = function (){
      if ( ! stateMap.sio ) { stateMap.sio = makeSio(); }
      return stateMap.sio;
  };

  // パブリックメソッド /initModule/ ↓
  // 目的    : モジュールを初期化する
  // 引数  :
  // 戻り値    : true
  // 例外発行     : なし
  //
  initModule = function () {};
  // パブリックメソッド /initModule/ ↑

  // パブリックメソッドを返す
  return {
    getSio : getSio,
    initModule   : initModule
  };

  //------------------- パブリックメソッド↑ ---------------------
}());
