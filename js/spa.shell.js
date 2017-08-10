/*
 * spa.shell.js
 * SPA�̃V�F�����W���[��
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
	  + '<div class="spa-shell-modal">modal</div>',
    chat_extend_time	:1000,
    chat_retract_time	:300,
    chat_extend_height	:450,
    chat_retract_height	:15
  },
  stateMap = { $container : null },
  jqueryMap = {},
  
  setJqueryMap, toggleChat, initModule;
  //-------- モジュールスコープ変数終了 ------------
  //-------- ユーティリティメソッド開始 ------------
  //-------- ユーティリティメソッド終了 ------------
  //-------- DOMメソッド開始 ------------
  //DOMメソッド/setJqueryMap/開始 ------------
  setJqueryMap = function () {
	var $container = stateMap.$container;
	
	jqueryMap = { $container : $container,
	$chat : $container.find( '.spa-shell-chat')
	};
  };
  //DOMメソッド/setJqueryMap/終了 ------------

  //DOMメソッド/toggleChat/開始 ------------
  //目的：チャットスライダーの拡大および格納
  //引数：
  //  = do_extend - スライダーを拡大(true)または格納(false)
  //  = callback -アニメーショの最後に実行する関数（オプション）
  toggleChat= function () {
	var 
	  px_chat_ht =jqueryMap.$chat.height(),
	  is_open = px_chat_ht === configMap.chat_extend_height,
	  is_closed = px_chat_ht === configMap.chat_retract_height,
	  is_sliding =!is_open && !is_closed;
	
	// 競合状態を避ける
	if (is_sliding) {return false;}
	
	//スライダーの拡大
	if (do_extend) {
		jqueryMap.$chat.animate(
		  { height: configMap.chat_extend_height},
		  configMap.chat_extend_time,
		  function() {
		    if ( callback ){ callback(jequeryMap.$chat); }
		  }
	    );
	} 	
	// ↑スライダーの拡大

	//スライダーの格納
	jqueryMap.$chat.animate(
	  { height: configMap.chat_retract_height},
	  configMap.chat_retract_time,
	  function() {
		if ( callback ){ callback(jequeryMap.$chat); }
	  }
    );
	return true;
	// ↑スライダーの格納
	
	
	jqueryMap = { $container : $container,
	$chat : $container.find( '.spa-shell-chat')
	};
  };
  //DOMメソッド/setJqueryMap/終了 ------------
//-------- DOMメソッド終了 ------------

  //-------- イベントハンドラ開始 ------------
  //-------- イベントハンドラ終了 ------------
  //-------- パブリックメソッド開始 ------------
  //パブリックメソッド/initModule/開始 ------------
  initModule = function ( $container) {
	// HTMLをロードし、jQueryコレクションをマッピングする  
	stateMap.$container = $container;
	$container.html( configMap.main_html );
	setJqueryMap();
	
	//切り替えをテストする
	setTimeout( function() { toggleChat(true);}, 3000);
	setTimeout( function() { toggleChat(false);}, 8000);
  };
  //パブリックメソッド/initModule/終了 ------------
  return { initModule : initModule};
  //-------- パブリックメソッド終了 ------------
}());
