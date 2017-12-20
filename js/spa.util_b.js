/*
 * spa.util_b.js
 * JavaScript ブラウザユーティリティ
 *
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, spa, getComputedStyle */

spa.utilb = (function () {

  //---------------- モジュールスコープ変数↓ --------------
  var
    configMap = {
      regex_encode_html : /[&"'><]/g,
      regex_encode_noamp : /["'><]/g,
      html__encode_map : {
        '&' : '&#38:',
        '"' : '&#34:',
        "'" : '&#39:',
        '>' : '&#62:',
        '<' : '&#60:',
       }
    },

    decodeHtml, encodeHtml, getEmSize;
  
  configMap.encode_noamp_map = $.extend(
    {}, configMap.html__encode_map 
  );
  //----------------- モジュールスコープ変数↑ ---------------

  //------------------- ユーティリティメソッド↓ ------------------
  // decodeHtml↓
  // HTML エンティティをブラウザに適した方法でデコードする
  // http://stackoveflow.com/questions/1912501/\
  //   unescape-html-entities-in-javascript を参照
  //
  decodeHtml = function ( str ) {
	return $('<div/>').html(str || '').text();
  };
  //decodeHtml↑
  
  // encodeHtml↓
  // これはhtmlエンティティのための単一パスエンコーダであり、
  // 任意の数の文字に対応する
  //
  encodeHtml = function ( input_arg_str, exclude_map ) {
	var
	  input_str = String( input_arg_str ),
	  regex, loolup_map;
	
	if ( exclude_amp ) {
	  lookup_map = configMap.encode_noamp_map;
	  regex = configMap.regex_encode_noamp;
	}
	else {
	  lookup_map = configMap.html_encode_map;
	  regex = configMap.regex_encode_html;
	}
	return input_str.replace(regex,
	  function ( match, name ) {
		return lookup_map[ match ] || '';
	  }
	);
  };
  // encodeHtml↑

  // getEmSize↓
  // emのサイズをピクセルで返す
  getEmSize = function ( elem ) {
    return Number(
      getComputedStyle( elem, '').fontSize.match(/\d*\.?\d*/)[0]
    );
  }  
  // getEmSize↑
  
  //-------------------- ユーティリティメソッド↑ -------------------

 /* 
  //--------------------- DOMメソッド↓ --------------------
  // DOM メソッド /setJqueryMap/↓
  setJqueryMap = function () {
    var $container = stateMap.$container;

    jqueryMap = { $container : $container };
  };
  // DOM メソッド /setJqueryMap/ ↑
  //---------------------- DOMメソッド↑ ---------------------

  //------------------- イベントハンドラ↓ -------------------
  // example: onClickButton = ...
  //-------------------- イベントハンドラ↑ --------------------



  //------------------- パブリックメソッド↓ -------------------
  // パブリックメソッド /configModule/ ↓
  // 目的    : 許可されたキーの構成を調整する
  // 引数  : 設定可能なキー値ペアのマップ
  //   * color_name - 使用する色
  // 設定   :
  //   * configMap.settable_map 許可されるキーを宣言
  // 戻り値    : true
  // 例外発行     : なし

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
    stateMap.$container = $container;
    setJqueryMap();
    return true;
  };
  // パブリックメソッド /initModule/ ↑
*/
  // パブリックメソッドを返す
  return {
    decodeHtml : decodeHtml,
    encodeHtml : encodeHtml,
    getEmSize   : getEmSize
  };
  
  //------------------- パブリックメソッド↑ ---------------------
}());
