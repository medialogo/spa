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
	  $append_target : null 
	  position_type  : 'closed',
	  px_per_em		 : 0,
	  slider_hidden_px : 0,
	  slider_closed_px : 0,
	  slider_opened_px : 0
    },
    jqueryMap = {},

    setJqueryMap, getEmSize, setPxSizes, setSliderPosition,
    onClickToggle, configModule, initModule;
  
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
      $append_target = stateMap.$append_target;
      $slider = $append_target.find( '.spa-chat');

    jqueryMap = { 
      $slider   : $slider,
      $head		: $slider.find('.spa-chat-head'),
      $toggle	: $slider.find('.spa-chat-head-toggle'),
      $title	: $slider.find('.spa-chat-head-title'),
      $sizer	: $slider.find('.spa-chat-sizer'),
      $msgs		: $slider.find('.spa-chat-msgs'),
      $box		: $slider.find('.spa-chat-box'),
      $input 	: $slider.find('.spa-chat-input input[type=tex]') };
  };
  // DOM メソッド /setJqueryMap/ ↑
  
  // DOM メソッド /setPxSize/↓
  setPxSize - function () {
	var px_per_em, opened_height_em;
	px_per_em = getEmSize ( jqueryMap.$slider.get(0) );
	
	opened_height_em = configMap.slider_opened_em;
	
	stateMap.px_per_em = px_per_em;
	stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
	stateMap.slider_opened_px = opened_height_em * px_per_em;
	jqueryMap.$sizer.css({
	  height ; ( opened_height_em - 2 ) * px_per_em
	})
  };
  // DOM メソッド /setPxSize/↑
  
  //---------------------- DOMメソッド↑ ---------------------

  //------------------- イベントハンドラ↓ -------------------
  // example: onClickButton = ...
  //-------------------- イベントハンドラ↑ --------------------



  //------------------- パブリックメソッド↓ -------------------
  // パブリックメソッド /configModule/↓
  // 用例 : spa.chat.configModule({ slider_open_em : 18 })
  // 目的 : 初期化前にモジュールを構成する
  // 引数 :
  //   * set_chat_anchor - オープンまたはクローズ状態を示すように
  //     URIアンカーを変更するコールバック。このコールバックrは要求された状態を
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
  //          JavaScriptエラーオブジェクトとスタックトレース

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
  // 目的    : モジュールを初期化する
  // 引数  :
  //  * $container この機能で使用する jQuery 要素
  // 戻り値    : true
  // 例外発行     : なし
  //
  initModule = function ( $container ) {
    $container.html( configMap.main_html);
    stateMap.$container = $container;
    setJqueryMap();
    return true;
  };
  // パブリックメソッド /initModule/ ↑

  // パブリックメソッド /setSliderPosition/ ↓
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
  // パブリックメソッド /setSliderPosition/ ↑

  // パブリックメソッドを返す
  return {
    configModule : configModule,
    initModule   : initModule
  };
  //------------------- パブリックメソッド↑ ---------------------
}());