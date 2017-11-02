/*
 * module_template.js
 * ブラウザ機能モジュールテンプレート
 *
 * Michael S. Mikowski - mike.mikowski@gmail.com
 * Copyright (c) 2011-2012 Manning Publications Co.
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/

/*global $, spa */

spa.module = (function () {

  //---------------- モジュールスコープ変数↓ --------------
  var
    configMap = {
      settable_map : { color_name: true },
      color_name   : 'blue'
    },
    stateMap  = { $container : null },
    jqueryMap = {},

    setJqueryMap, configModule, initModule;
  //----------------- モジュールスコープ変数↑ ---------------

  //------------------- ユーティリティメソッド↓ ------------------
  // example : getTrimmedString
  //-------------------- ユーティリティメソッド↑ -------------------

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

  // パブリックメソッドを返す
  return {
    configModule : configModule,
    initModule   : initModule
  };
  //------------------- パブリックメソッド↑ ---------------------
}());
