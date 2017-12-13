/*
 * spa.chat.js
 * SPAのチャット機能モジュール
*/

/*jslint  browser : true, continue : true,
  devel : true, indent :2, maxerr : 50,
  newcap: true, nomen :true, plusplus : true,
  regexp : true, sloppy : true, vars : false,
  white  : true
*/

/*global $, spa */

spa.chat = (function () {

  //---------------- モジュールスコープ変数↓ --------------
  var
    configMap = {
      main_html : String()
        + '<div class="spa-chat">'
          + '<div class="spa-chat-head">'
            + '<div class="spa-chat-head-toggle">+</div>'
            + '<div class="spa-chat-head-title">'
              + 'チャット'
            + '</div>'
          + '</div>'
          + '<div class="spa-chat-closer">x</div>'
          + '<div class="spa-chat-sizer">'
          + '<div class="spa-chat-msgs"></div>'
          + '<div class="spa-chat-box">'
          + '<input type="text">'
          + '<div>送信</div>'
         + '</div>'
        + '</div>'
      + '</div>',
      
      settable_map : {
        slider_open_time : true,
        slider_close_time : true,
        slider_opened_em : true,
        slider_closed_em : true,
        slider_opened_title : true,
        slider_closed_title : true,
        
        chat_model	: true,
        people_model : true,
        set_chat_anchor : true
      },
      
      slider_open_time 	: 250,
      slider_close_time : 250,
      slider_opened_em	: 16,
      slider_closed_em	: 2,
      slider_opened_title : 'クリックして閉じる',
      slider_closed_title : 'クリックして開く',
      
      chat_model	: null,
      people_model	: null,
      set_chat_anchor : null
    },
    stateMap  = { 
	  $append_target : null, 
	  position_type  : 'closed',
	  px_per_em		 : 0,
	  slider_hidden_px : 0,
	  slider_closed_px : 0,
	  slider_opened_px : 0
    },
    jqueryMap = {},

    setJqueryMap, getEmSize, setPxSizes, setSliderPosition,
    onClickToggle, configModule, initModule,
    removeSlider, handleResize;
  
  //----------------- モジュールスコープ変数↑ ---------------

  //------------------- ユーティリティメソッド↓ ------------------
  //
  getEmSize = function ( elem ) {
    return Number(
      getComputedStyle( elem, '').fontSize.match(/\d*\.?\d*/)[0]
    );
  }
  //-------------------- ユーティリティメソッド↑ -------------------

  //--------------------- DOMメソッド↓ --------------------
  // DOM メソッド /setJqueryMap/↓
  setJqueryMap = function () {
    var 
      $append_target = stateMap.$append_target,
      $slider = $append_target.find( '.spa-chat');

    jqueryMap = { 
      $slider   : $slider,
      $head		: $slider.find('.spa-chat-head'),
      $toggle	: $slider.find('.spa-chat-head-toggle'),
      $title	: $slider.find('.spa-chat-head-title'),
      $sizer	: $slider.find('.spa-chat-sizer'),
      $msgs		: $slider.find('.spa-chat-msgs'),
      $box		: $slider.find('.spa-chat-box'),
      $input 	: $slider.find('.spa-chat-input input[type=text]') };
  };
  // DOM メソッド /setJqueryMap/ ↑
  
  // DOM メソッド /setPxSize/↓
  setPxSizes = function () {
	var px_per_em, opened_height_em;
	px_per_em = getEmSize ( jqueryMap.$slider.get(0) );
	
	opened_height_em = configMap.slider_opened_em;
	
	stateMap.px_per_em = px_per_em;
	stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
	stateMap.slider_opened_px = opened_height_em * px_per_em;
	jqueryMap.$sizer.css({
	  height : ( opened_height_em - 2 ) * px_per_em
	})
  };
  // DOM メソッド /setPxSize/↑
  
  // パブリックDOMメソッド /setSliderPosition/ ↓
  //
  // 用例 : spa.chat.setSliderPosition( 'closed' );
  // 目的 : チャットスライダーが要求された状態になるようにする
  // 引数 :
  //  * position_type - enum('closed', 'opened', または 'hidden')
  //  * callback - アニメーションの最後のオプションのコールバック
  //    (コールバックは引数としてスライダーDOM要素を受け取る)
  // 動作 :
  //   スライダーが要求に合致している場合は現在の状態のままにする。
  //   それ以外の場合はアニメーションを使って要求された状態にする。
  // 戻り値 :
  //   * true - 要求された状態を実現した
  //   * false - 要求された状態を実現していない
  // 例外発行 : なし
  //
  setSliderPosition = function (position_type, callback ){
	var
	  height_px, animate_time, slider_title, toggle_text;
	
	// スライダーがすでに要求された一にある場合は true を返す
	if ( stateMap.position_type == position_type ) {
	  return true;
	}
	
	// アニメーションパラメータを用意する
	switch ( position_type ) {
	  case 'opened' :
		height_px = stateMap.slider_opened_px;
		animate_time = configMap.slider_open_time;
		slider_title = configMap.slider_opened_title;
		toggle_text = '=';
	  break;
	  
	  case 'hidden' :
		height_px = 0;
		animate_time = configMap.slider_open_time;
		slider_title = '';
		toggle_text = '+';
	  break;
	  
	  case 'closed' :
		height_px = stateMap.slider_closed_px;
		animate_time = configMap.slider_close_time;
		slider_title = configMap.slider_closed_title;
		toggle_text = '+';
	  break;
	  // 未知の position_type に対処する
	  default : return false;
	}
	
	// スライダー位置をアニメーションで変更する
	stateMap.position_type = '';
	jqueryMap.$slider.animate(
	  { height : height_px },
	  animate_time,
	  function () {
		jqueryMap.$toggle.prop( 'title', slider_title );
		jqueryMap.$toggle.text( toggle_text );
		stateMap.position_type = position_type;
		if ( callback ) { callback (jqueryMap.$slider); }
      }
    );
	return true;	
  };
  // パブリックDOMメソッド /setSliderPosition/ ↑
  //---------------------- DOMメソッド↑ ---------------------

  //------------------- イベントハンドラ↓ -------------------
  //
  onClickToggle = function ( event ) {
	var set_chat_anchor = configMap.set_chat_anchor;
	if ( stateMap.position_type === 'opened' ){
	  set_chat_anchor( 'closed' );
	}
	else if ( stateMap.position_type === 'closed' ){
	  set_chat_anchor( 'opened' );
	}
	return false;
  }
  //-------------------- イベントハンドラ↑ --------------------


  //------------------- パブリックメソッド↓ -------------------
 // パブリックメソッド /configModule/↓
  // 用例 : spa.chat.configModule({ slider_open_em : 18 })
  // 目的 : 初期化前にモジュールを構成する
  // 引数 :
  //   * set_chat_anchor - オープンまたはクローズ状態を示すように
  //     URIアンカーを変更するコールバック。このコールバックは要求された状態を
  //     満たせない場合にはfalseを返さなければならない
  //   * chat_model - インスタントメッセージングと
  //     やり取りするメソッドを提供するチャットモデルオブジェクト。
  //   * people_model - モデルが保持する人々の
  //     リストを管理するメソッドを提供するピープルモデルオブジェクト。
  //   * slider_*構成 - すべてオプションのスカラー。
  //     完全なリストは mapConfig.settable_map を参照。
  //     用例 : slider_open_em はオープン時の高さ(em単位)。
  // 動作
  //   指定された引数で内部構成データ構造(configMap)を更新する。
  //   その他の動作は行わない。
  // 戻り値   : true
  // 例外発行  : 受け入れられない引数や、欠如した引数の場合
  //          JavaScriptエラーオブジェクトとスタックトレースを投げる

  configModule = function ( input_map ) {
    spa.util.setConfigMap({
      input_map    : input_map,
      settable_map : configMap.settable_map,
      config_map   : configMap
    });
    return true;
  };
  // パブリックメソッド /configModule/ ↑

  // パブリックメソッド /initModule/ ↓
  // 用例 : spa.chat.initModule ( $('#div_id') );
  // 目的    : ユーザーに機能を提供するようにチャットに指示する
  // 引数  :
  //  * $append_target (例: $('#div_id') );
  //  1つのDOMコンテナを表すjQueryコレクション
  // 動作 :
  //  指定されたコンテナにチャットスライダーを付加し、HTMLコンテンツで埋める
  //  そして、要素、イベント、ハンドラを初期化し、ユーザーにチャットルームインターフェイスを提供する。
  // 戻り値    : 成功時 true, 失敗時 false 
  // 例外発行     : なし
  //
  initModule = function ( $append_target ) {
	$append_target.append( configMap.main_html );
    stateMap.$append_target = $append_target;
    setJqueryMap();
    setPxSizes();
    
    // チャットスライダーをデフォルトのタイトルと状態で初期化する
    jqueryMap.$toggle.prop( 'title', configMap.slider_closed_title );
    jqueryMap.$head.click( onClickToggle );
    stateMap.position_type = 'closed';
    
    return true;
  };
  // パブリックメソッド /initModule/ ↑

  
  // パブリックメソッド /removeSlider/ ↓
  // 目的
  //  * DOM要素 chatSlider を削除する
  //  * 初期状態に戻す
  //  * コールバックや他のデータへのポインタを削除する
  // 引数  : なし
  // 戻り値    : true 
  // 例外発行  : なし
  //
  removeSlider = function () {
	// 初期化と状態を解除する
	// DOMコンテナを削除する。イベントのバインディングも削除する。
	if ( jqueryMap.$slider ) {
		jqueryMap.$slider.remove();
		jqueryMap = {};
	}
	stateMap.$append_target = null;
	stateMap.position_type = 'closed';
	
	// 主な構成を解除する
	configMap.chat_model = null;
	configMap.people_model = null;
	configMap.set_chat_anchor = null;
	return true;
  };
  // パブリックメソッド /removeSlider/ ↑

  // パブリックメソッドを返す
  return {
	setSliderPosition : setSliderPosition,
    configModule : configModule,
    initModule   : initModule,
    removeSlider : removeSlider,
    handleResize : handleResize
  };

  //------------------- パブリックメソッド↑ ---------------------
}());