/*
 * spa.model.js
 * モデル機能モジュール
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

/*global TAFFY, $, spa */

spa.model = (function () {
    // peopleオブジェクトAPI
    // ---------------------
    // peopleオブジェクトはspa.model.peopleで利用できる。
    // peopleオブジェクトはpersonオブジェクトの集合管理するためのメソッドとイベントを提供する。
    // peopleオブジェクトのパブリックメソッドは以下のとおり。
    //  * get_user() - 現在のpersonオブジェクトを返す。
    //  	             現在のユーザがサインインしていない場合には、匿名personオブジェクトを返す。
    //  * get_db() - あらかじめソートされたすべてのpersonオブジェクト（現在のユーザーを含む）の
    //	             TaffyDBデータベースを返す。
    //  * get_by_cid( <client_id> ) - 指定された一意のIDを持つpersonオブジェクトを返す。
    //  * login(<user_name>) - 指定のユーザ名を持つユーザとしてログインする。
    //  * logout() - 現在のユーザオブジェクトを匿名に戻す。
    //
    // このオブジェクトが発行するjQueryグローバルイベントの以下のとおり。
    //  * spa-login - ユーザのログイン処理が完了した時に発行される。
    //    更新されたユーザオブジェクトをデータとして提供する。
    //  * spa-logout - ログアウトの完了時に発行される。
    //    以前の(匿名)ユーザオブジェクトをデータとして提供する。
    //
    // それぞれの人はpersonオブジェクトで表される。
    //
    // personオブジェクトは以下のメソッドを提供する。
    //  * get_is_user() - オブジェクトが現在のユーザの場合にtrueを返す。
    //  * get_is_anon() - オブジェクトが匿名の場合にtrueを返す。
    // personオブジェクトの属性は以下の通り。
    //  * cid - クライアントID文字列。これは常に定義され、クライアントデータがバックエンドと
    //          同期していない場合のみid属性と異なる。
    //  * id - 一意のID。オブジェクトがバックエンドと同期していない場合には未定義になることがある。
    //  * name - ユーザ名の文字列。
    //  * css_map = アバター表現に使う属性のマップ



  'use strict';
  //---------------- モジュールスコープ変数↓ --------------
  var
    configMap = { anon_id : 'a0'},
    stateMap  = {
      anon_user	: null,   // 匿名personオブジェクトを格納
      people_cid_map : {},// クライアントIDをキーとしたpersonオブジェクトのマップ
      people_db		 : TAFFY() //personオブジェクトのTaffyDBコレクションを格納
    },

    isFakeData = true,

    personProto, makePerson, peaple, initModule;
  //----------------- モジュールスコープ変数↑ ---------------

  //------------------- ユーティリティメソッド↓ ------------------
  // example : getTrimmedString
  //-------------------- ユーティリティメソッド↑ -------------------

  //--------------------- DOMメソッド↓ --------------------
  //---------------------- DOMメソッド↑ ---------------------

  //------------------- イベントハンドラ↓ -------------------
  // example: onClickButton = ...
  //-------------------- イベントハンドラ↑ --------------------



  //------------------- パブリックメソッド↓ -------------------
  // パブリックメソッド /people/ ↓

  people = {
    get_db      : function () { return stateMap.people_db; },
    get_cid_map : function () { return stateMap.people_cid_map; },
  };

  // パブリックメソッド /initModule/ ↓
  // 目的     : モジュールを初期化する
  // 引数     : なし
  // 戻り値   : なし
  // 例外発行 : なし
  //
  initModule = function () {
    var i, people_list, person_map;

    // 匿名ユーザを初期化する
    stateMap.anon_user = makePerson({
      cid : configMap.anon_id,
      id  : configMap.anon_id,
      name: 'anonymous'
    });
    stateMap.user = stateMap.anon_user;

    if ( isFakeData ) {
      people_list = spa.fake.getPeopleList();
      for ( i = 0; i < people_list.length; i++ ){
          person_map = people_list[i];
          makePerson({
              cid		  : person_map._id,
              css_map	: person_map.css_map,
              id			: person_map._id,
              name		: person_map.name
          });
      }
    }
  };
  // パブリックメソッド /initModule/ ↑

  // パブリックメソッドを返す
  return {
    initModule  : initModule,
    people			: people
  };
  //------------------- パブリックメソッド↑ ---------------------
}());
