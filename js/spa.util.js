/*
 * spa.util.js
 * 汎用JavaScriptユーティリティ
 *
 * Michael S. Mikowski - mike.mikowski@gmail.com
 * Copyright (c) 2011-2012 Manning Publications Co.
 *
 * MITライセンス
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, spa */

spa.util = (function () {
  var makeError, setConfigMap;

  // パブリックコンストラクタ /makeError/ ↓
  // 目的    : エラーオブジェクトを作成するためのラッパー
  // 引数  :
  //   * name_text - エラー名
  //   * msg_text - 長いエラーメッセージ
  //   * data - エラーオブジェクトに付加するオプションのデータ
  // 戻り値    : 作成されたエラーオブジェクト
  // 例外発行     : なし
  //
  makeError = function ( name_text, msg_text, data ) {
    var error = new Error();
    error.name = name_text;
    error.message = msg_text;

    if ( data ){ error.data = data;}

    return error;
  };
  // パブリックコンストラクタ /makeError/ ↑

  // パブリックメソッド /setConfigMap/ ↓
  // 目的    : 機能モジュールで構成を行うための共通コード
  // 引数  :
  //   * input_map - 構成するキー値ペアのマップ
  //   * settable_map - 構成可能なキーのマップ
  //   * config_map - 構成を適用するマップ
  // 戻り値    : true
  // 例外発行     : 入力キーが許可されていない場合は例外を発行する
  //
  setConfigMap = function ( arg_map ) {
    var
      input_map = arg_map.input_map,
      settable_map = arg_map.settable_map,
      config_map = arg_map.config_map,
      key_name, error;

    for ( key_name in input_map){
      if ( input_map.hasOwnProperty (key_name )) {
        if ( settable_map.hasOwnProperty ( key_name )){
          config_map[key_name] = input_map[key_name];
        } else {
            error = makeError( 'Bad Input',
              'Setting config key |' + key_name + '| is not supported'
            );
            throw error;

        }
      }
    }
  };
  // パブリックメソッド /setConfigMap/ ↑

  return{
    makeError : makeError,
    setConfigMap : setConfigMap
  };
}());
