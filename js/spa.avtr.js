/*
 * spa.avtr.js
 * アバター機能モジュール
 *
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, spa */

spa.avtr = (function () {
  'use strict';
  //---------------- モジュールスコープ変数↓ --------------
  var
    configMap = {

      chat_model	: null,
      people_model	: null,

      settable_map : {
        chat_model	: true,
        people_model : true,
      }
    },

    stateMap  = {
      drag_map 		: null,
      $drag_target : null,
      drag_bg_color	: undefined
    },

    jqueryMap = {},

    GetRandRgb,
    setJqueryMap,
    updateAvatar,
    onTapNav, 		onHeldstartNav,
    onHeldmoveNav,onHeldendNav,
    onSetchatee, 	onListchange,
    onLogout,
    configModule, initModule,

  //----------------- モジュールスコープ変数↑ ---------------

  //------------------- ユーティリティメソッド↓ ------------------
  getRandRgb = function(){
      var i, rgb_list = [];
      for ( i = 0; i < 3; i++ ){
          rgb_list.push( Math.floor( Math.random() * 128 ) + 128 );
      }
      return 'rgb(' + rgb_list.join(',') + ')';
  };
  //-------------------- ユーティリティメソッド↑ -------------------

  //--------------------- DOMメソッド↓ --------------------
  // DOM メソッド /setJqueryMap/↓
  setJqueryMap = function ( $container ) {
    jqueryMap = { $container : $container };
  };
  // DOM メソッド /setJqueryMap/ ↑


  updateAvatar = function ( $target ){
    var css_map, person_id;

    css_map = {
        top		: parseInt ( $target.css( 'top' ), 10 ),
        left	: parseInt ( $target.css( 'left' ), 10 ),
        'background-color'	: $target.css( 'background-color' )
    };
    person_id = $target.attr( 'data-id' );

    configMap.chat_model.update_avatar({
        person_id : person_id, css_map : css_map
    });
  };

  //---------------------- DOMメソッド↑ ---------------------

  //------------------- イベントハンドラ↓ -------------------
  //
  onTapNav = function ( event ) {
    var css_map,
            $target = $ ( event.elm_target ).closest('.spa-avtr-box');

    if ( $target.length === 0 ){ return false; }
    $target.css({ 'background-color' : getRandRgb()});
    updateAvatar( $target );
  };
///
  onTapList = function ( event ){
      var $tapped = $( event.elem_target ), chatee_id;
      if (! $tapped.hasClass('spa-chat-list-name') ) { return false; }

      chatee_id = $tapped.attr( 'data-id' );
      if ( ! chatee_id ) { return false; }

      configMap.chat_model.set_chatee( chatee_id );
      return false;
  };

  onSetchatee = function (event, arg_map) {
      var
          new_chatee = arg_map.new_chatee,
          old_chatee = arg_map.ole_chatee;

      jqueryMap.$input.focus();
      if ( ! new_chatee ) {
          if ( old_chatee ) {
              writeAlert ( old_chatee.name + 'さんが退室しました' );
          }
          else {
              writeAlert( 'お友達が退室しました' );
          }
          jqueryMap.$title.text( 'チャット' );
          return false;
      }

      jqueryMap.$list_box
          .find( 'spa-chat-list-name' )
          .removeClass( 'spa-x-select' )
          .end()
          .find( '[data-id=' + arg_map.new_chatee.id + ']' )
          .addClass( 'spa-x-select' );

      writeAlert( 'チャット相手は ' + arg_map.new_chatee.name + ' さんです' );
      jqueryMap.$title.text( 'チャット中 (' + arg_map.new_chatee.name + ')');
      return true;
  };

  onListchange = function ( event ) {
      var
          list_html = String(),
          people_db = configMap.people_model.get_db(),
          chatee = configMap.chat_model.get_chatee();

      people_db().each( function ( person, idx ) {
          var select_class = '';

          if ( person.get_is_anon() || person.get_is_user()) { return true; }

          if ( chatee && chatee.id === person.id ) {
              select_class = 'spa-x-select';
          }

          list_html
              += '<div class="spa-chat-list-name'
              + select_class + '" data-id="' + person.id + '">'
              + spa.util_b.encodeHtml( person.name ) + '</div>';
      });

      if ( ! list_html ) {
          list_html = String()
              + '<div class="spa-chat-list-note">'
              + 'To chat alone is the fate of all great souls...<br><br>'
              + 'No one is online'
              + '</div>';
          clearChat();
      }
      jqueryMap.$list_box.html( list_html );
  };

  onUpdatechat = function ( event, msg_map ) {
      var
          is_user,
          sender_id = msg_map.sender_id,
          msg_text = msg_map.msg_text,
          chatee = configMap.chat_model.get_chatee() || {},
          sender = configMap.people_model.get_by_cid( sender_id );

      if ( ! sender ) {
          writeAlert( msg_text );
          return false;
      }

      is_user = sender.get_is_user();

      if ( ! ( is_user || sender_id === chatee.id )) {
          configMap.chat_model.set_chatee( sender_id );
      }

      writeChat( sender.name, msg_text, is_user );

      if ( is_user ){
          jqueryMap.$input.val('');
          jqueryMap.$input.focus();
      }
  };


  onLogin = function ( event, login_user ) {
      configMap.set_chat_anchor( 'opened' );
  };

  onLogout = function ( event, logout_user ) {
      configMap.set_chat_anchor( 'closed' );
      jqueryMap.$title.text( 'chat' );
      clearChat();
  };

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
      var $list_box;

      // チャットスライダーHTMLとjQueryキャッシュをロードする
    stateMap.$append_target = $append_target;
    $append_target.append( configMap.main_html );
    setJqueryMap();
    setPxSizes();

    // チャットスライダーをデフォルトのタイトルと状態で初期化する
    jqueryMap.$toggle.prop( 'title', configMap.slider_closed_title );
//    jqueryMap.$head.click( onClickToggle );
    stateMap.position_type = 'closed';

    // $list_box でjQueryグローバルイベントに登録する
    $list_box = jqueryMap.$list_box;
    $.gevent.subscribe( $list_box, 'spa-listchange', onListchange );
    $.gevent.subscribe( $list_box, 'spa-setchatee', onSetchatee );
    $.gevent.subscribe( $list_box, 'spa-updatechat', onUpdatechat );
    $.gevent.subscribe( $list_box, 'spa-login', onLogin );
    $.gevent.subscribe( $list_box, 'spa-logout', onLogout );

    // ユーザー入力イベントをバインドする
    jqueryMap.$head.bind( 		'utap', onTapToggle );
    jqueryMap.$list_box.bind( 'utap', onTapList );
    jqueryMap.$send.bind( 		'utap', onSubmitMsg );
    jqueryMap.$form.bind( 	'submit', onSubmitMsg );

//    return true;
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

  // パブリックメソッド /handleResize/ ↓
  // 目的
  //  ウィンドウリサイズイベントに対し、必要に応じてこのモジュールが提供する表示を調整する
  // 動作
  //  ウィンドウの高さや幅が所定の閾値を下回ったら、
  //  縮小したウィンドウサイズに合わせてチャットスライダーのサイズを変更する
  // 戻り値    : ブール値
  //   * false - リサイズを考慮していない
  //   * true - リサイズを考慮した
  // 例外発行  : なし
  //
  handleResize = function () {
    // スライダーコンテントがなければ何もしない
    if ( ! jqueryMap.$slider ) {return false;}

    setPxSizes();
    if ( stateMap.position_type === 'opened') {
      jqueryMap.$slider.css({ height : stateMap.slider_opened_px });
    }

    return true;
  };
  // パブリックメソッド /handleResize/ ↑


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
