/*
 * spa.shell.js
 * SPAのシェルモジュール
*/

/*jslint  browser : true, continue : true,
  devel : true, indent :2, maxerr : 50,
  newcap: true, nomen :true, plusplus : true,
  regexp : true, sloppy : true, vars : false,
  white  : true
*/

/*global $, spa */

spa.shell =(function () {
  //-------- モジュールスコープ変数開始 ------------
  var configMap = {
    main_html : String()
	  + '<div class="spa-shell-head">'
	    + '<div class="spa-shell-head-logo">logo</div>'
	    + '<div class="spa-shell-head-acct">acct</div>'
	    + '<div class="spa-shell-head-search">search</div>'
	  + '</div>'
	  + '<div class="spa-shell-main">'
	    + '<div class="spa-shell-main-nav">nav</div>'
	    + '<div class="spa-shell-main-content">content</div>'
	  + '</div>'
	  + '<div class="spa-shell-foot">foot</div>'
	  + '<div class="spa-shell-chat">chat</div>'
	  + '<div class="spa-shell-modal">modal</div>'
  },
  stateMap = { $container : null },
  jqueryMap = {},
  
  setJqueryMap, initModule;
  //-------- モジュールスコープ変数終了 ------------
  //-------- ユーティリティメソッド開始 ------------
  //-------- ユーティリティメソッド終了 ------------
  //-------- DOMメソッド開始 ------------
  //DOMメソッド/setJqueryMap/開始 ------------
  setJqueryMap = function () {
	var $container = stateMap.$container;
	jqueryMap = { $container : $container };
  };
  //DOMメソッド/setJqueryMap/終了 ------------
  //-------- DOMメソッド終了 ------------

  //-------- イベントハンドラ開始 ------------
  //-------- イベントハンドラ終了 ------------
  //-------- パブリックメソッド開始 ------------
  //パブリックメソッド/initModule/開始 ------------
  initModule = function ( $container) {
	stateMap.$container = $container;
	$container.html( configMap.main_html );
	setJqueryMap();
  };
  //パブリックメソッド/initModule/終了 ------------
  return { initModule : initModule};
  //-------- パブリックメソッド終了 ------------
}());
