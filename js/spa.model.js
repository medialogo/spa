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

  'use strict';
  //---------------- モジュールスコープ変数↓ --------------
  var
    configMap = { anon_id : 'a0'},
    stateMap  = {
      anon_user	: null,   // 匿名personオブジェクトを格納
      cid_serial: 0,
      people_cid_map : {},// クライアントIDをキーとしたpersonオブジェクトのマップ
      people_db		 : TAFFY(), //personオブジェクトのTaffyDBコレクションを格納
      user			: null,
    },

    isFakeData = true,

    personProto, makeCid, clearPeopleDb, completeLogin,
    makePerson, removePerson, people, initModule;
  //----------------- モジュールスコープ変数↑ ---------------

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

  personProto = {
      get_is_user : function () { // オブジェクトが現在のユーザの場合にtrueを返す
          return this.cid === stateMap.user.cid;
      },
      get_is_anon : function () { // オブジェクトが匿名ユーザの場合にtrueを返す
          return this.cid === stateMap.anon_user.cid;
      }
  };

  makeCid = function (){
      return 'c' + String( stateMap.cid_serial++ );
  };

  clearPeopleDb = function (){
      var user = stateMap.user;
      stateMap.people_db = TAFFY();
      stateMap.people_cid_map = {};
      if ( user ) {
          stateMap.people_db.insert( user );
          stateMap.people_cid_map[ user.cid ] = user;
      }
  };

  completeLogin = function ( user_list ) {
      var user_map = user_list[0];
      delete stateMap.people_cid_map[ user_map.cid ];
      stateMap.user.cid = user_map._id;
      stateMap.user.id = user_map._id;
      stateMap.user.css_map = user_map.css_map;
      stateMap.people_cid_map[ user_map._id ] = stateMap.user;

      // チャットを追加するときは、ここで参加すべき
      $.gevent.publish( 'spa-login', [ stateMap.user ]);
  };


  makePerson = function ( person_map ) {
    var person,
          cid			= person_map.cid,
          css_map = person_map.css_map,
          id 			= person_map.id,
          name		= person_map.name;

    if ( cid === undefined || !name ) {
        throw 'クライアントid と名前が必要です';
    }

    // personオブジェクトを作成
    person			= Object.create( personProto );
    person.cid	= cid;
    person.name = name;
    person.css_map = css_map;

    if ( id ) { person.id = id; }

    stateMap.people_cid_map[ cid ] = person;
    stateMap.people_db.insert( person );

    return person;
  };

  removePerson = function ( person ){
      if ( ! person ){ return false; }
      // 匿名ユーザは削除できない
      if ( person.id === configMap.anon_id ){
          return false;
      }

      stateMap.people_db({ cid : person.cid }).remove();
      if ( person.cid ){
          delete stateMap.people_cid_map[ person.cid ];
      }
      return true;
  };

  //------------------- パブリックメソッド↓ -------------------
  // パブリックメソッド /people/ ↓
  people = (function (){
    var get_by_cid, get_db, get_user, login, logout;

    get_by_cid = function ( cid ){
        return stateMap.people_cid_map[ cid ];
    };

    get_db = function () { return stateMap.people_db; };

    get_user = function () { return stateMap.user; };

    login = function ( name ) {
      var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

      stateMap.user = makePerson({
          cid : makeCid(),
          css_map : {top : 25, left : 25, 'background-color':'#8f8'},
          name : name
      });

      sio.on( 'userupdate', completeLogin );

      sio.emit( 'adduser', {
          cid 	 : stateMap.user.cid,
          css_map: stateMap.user.css_map,
          name	 : stateMap.user.name
      });
    };

    logout = function () {
      var is_removed, user = stateMap.user;
      //チャットを追加するときには、ここでチャットルームから出るべき

      is_removed		= removePerson( user );
      stateMap.user = stateMap.anon_user;

      $.gevent.publish( 'spa-logout', [ user ]);
      return is_removed;
    };

    return {
      bet_by_cid	: get_by_cid,
      get_db			: get_db,
      get_user		: get_user,
      login				: login,
      logout			: logout
    };
  }());

  // パブリックメソッド /people/ ↑

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
    stateMap.user = stateMap.anon_user; // 現在のユーザの初期値は匿名ユーザ

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
