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
	  + '<div class="spa-shell-modal">modal</div>',
    chat_extend_time	:500,
    chat_retract_time	:300,
    chat_extend_height	:450,
    chat_retract_height	:15,
    chat_extended_title :'クリックして格納',
    chat_retracted_title : 'クリックして拡大'
  },
  stateMap = { 
	$container : null,
	is_chat_retracted : true
  },
  jqueryMap = {},
  
  setJqueryMap, toggleChat, onClickChat, initModule;
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
  // 状態: stateMap.is_chat_retracted を設定する
  // * true -- スライダーは格納されている
  // * false -- スライダーは拡大されている
  //
  toggleChat= function (do_extend, callback) {
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
		  function (){
			jqueryMap.$chat.attr(
			  'title', configMap.chat_extended_title
		    );
		    stateMap.is_chat_retracted = false;
		    if ( callback ){ callback(jqueryMap.$chat); }
		  }
	    );
		return true;
	} 	
	// ↑スライダーの拡大

	//スライダーの格納
	jqueryMap.$chat.animate(
	  { height: configMap.chat_retract_height},
	  configMap.chat_retract_time,
	  function() {
		jqueryMap.$chat.attr(
		  'title', configMap.chat_retracted_title
	    );
	    stateMap.is_chat_retracted = true;
		if ( callback ){ callback(jqueryMap.$chat); }
	  }
    );
	return true;
  // ↑スライダーの格納
  };
  //DOMメソッド/toggleChat/終了 ------------
//-------- DOMメソッド終了 ------------

  //-------- イベントハンドラ開始 ------------
  onClickChat = function (event) {
	toggleChat(stateMap.is_chat_retracted);
	return false;
  };
  //-------- イベントハンドラ終了 ------------
  //-------- パブリックメソッド開始 ------------
  //パブリックメソッド/initModule/開始 ------------
  initModule = function ( $container) {
	// HTMLをロードし、jQueryコレクションをマッピングする  
	stateMap.$container = $container;
	$container.html( configMap.main_html );
	setJqueryMap();
	
	//チャットスライダーを初期化し、クリックハンドラをバインドする
	stateMap.is_chat_retracted = true;
	jqueryMap.$chat
	  .attr('title', configMap.chat_retracted_title)
	  .click( onClickChat);
	
	//切り替えをテストする
	//setTimeout( function() { toggleChat(true);}, 3000);
	//setTimeout( function() { toggleChat(false);}, 8000);
  };
  //パブリックメソッド/initModule/終了 ------------
  return { initModule : initModule};
  //-------- パブリックメソッド終了 ------------
}());
