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
      is_connected : false, // ユーザーが現在チャットルームにいるかどうか
    },

    isFakeData = false, // true,

    personProto, makeCid, clearPeopleDb, completeLogin,
    makePerson, removePerson, people, chat, initModule;
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

      // チャットに参加
      chat.join();
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
      var user = stateMap.user;

      //チャットルームから退出
      chat._leave();
      stateMap.user = stateMap.anon_user;
      clearPeopleDb();

      $.gevent.publish( 'spa-logout', [ user ]);
    };

    return {
      get_by_cid	: get_by_cid,
      get_db			: get_db,
      get_user		: get_user,
      login				: login,
      logout			: logout
    };
  }());
  // パブリックメソッド /people/ ↑

  // chatオブジェクトAPI
  // --------------------
  // chatオブジェクトはspa.modelchatで利用できる
  // chatオブジェクトはチャットメッセージングを管理するためのメソッドとイベントを提供する。
  // chatオブジェのパブリックメソッドは以下のとおり。
  //  * join() - チャットルームに参加する。このルーチンは、
  //   「spa-listchange」と「spaupdatechat」グローバルカスタムイベントのための
  //    パブリッシャを含むバックエンドとのチャットプロトコルを確立する。
  //    現在のユーザが匿名の場合、join()は中断してfalseを返す。
  //  * get_chatee() - ユーザがチャットしている相手のpersonオブジェクトを返す。
  //    チャット相手がいない場合はnullを返す。
  //  * set_chatee(<person_id>) - チャット相手をperson_idで特定されるユーザに設定する。
  //    person_idがユーザリストに存在しない場合は、チャット相手をnullに設定する。
  //    「spa-chatee」グローバルカスタムイベントを発行する。
  //  * send_msg( <msg_text> ) - チャット相手にメッセージを送信する。
  //    「spa-updatechat」グローバルカスタムイベントを発行する。
  //    ユーザが匿名またはチャット相手がnullの場合には、中断してfalseを返す。
  //  * update_avatar( <update_avtr_map> )  - バックエンドに
  //  　update_avtr_map - を送信する。これにより、更新されたユーザリストと
  //    アバター情報(psersonオブジェクトのcss_map）を含む「spa-listchange」イベントが発行される。
  //    update_avtr_mapは以下のような形式であること。
  //    { person_id : person_id, css_map : css_map }
  //
  //  このオブジェクトが発行するjQueryグローバルカスタムイベントは以下の通り。
  //  * spa-setchatee - 新しいチャット相手が設定されたときに発行される。
  //   以下の形式のマップをデータとして提供する。
  //     { old_chatee : <old_chatee_person_object>,
  //       new_chatee : <new_chatee_person_object>
  //     }
  //  * spa-listchange - オンラインユーザのリスト長が変ったとき
  //  （ユーザがチャットに参加または退出したとき）、または内容が変ったとき
  //  （ユーザのアバター詳細が変ったとき）に発行される。
  //   このイベントへの登録者は、更新データとしてpeopleモデルからpeople_dbを取得すべき。
  //  * spa-updatechat - 新しいメッセージを送受信したときに発行される。
  //   以下の形式のマップをデータとして提供する。
  //     { dest_id   : <chatee_id>,
  //       dest_name : <chatee_name>,
  //       sender_id : <sender_id>,
  //       msg_text  : <message_content>
  //     }

  chat = (function () {
    var
      _publish_listchange, _publish_updatechat,
      _update_list, _leave_chat,

      get_chatee, join_chat, send_msg,
      set_chatee, update_avatar,
      chatee = null;

    // 内部メソッド↓
    _update_list = function( arg_list ) {
      var i, person_map, make_person_map, person,
        people_list = arg_list[0],
        is_chatee_online = false;

      clearPeopleDb();

      PERSON:
      for ( i = 0; i < people_list.length; i++ ){
        person_map = people_list[ i ];

        if ( ! person_map.name ) { continue PERSON; }

        // ユーザを特定したら、css_mapを更新して残りを跳ばす
        if ( stateMap.user && stateMap.user.id === person_map._id ) {
            stateMap.user.css_map = person_map.css_map;
            continue PERSON;
        }

        make_person_map = {
          cid		  : person_map._id,
          css_map : person_map.css_map,
          id			: person_map._id,
          name		: person_map.name
        };
        person = makePerson( make_person_map );

        if ( chatee && chatee.id === make_person_map.id ) {
          is_chatee_online = true;
          chatee = person;
        }
        //makePerson( make_person_map );
      }
      stateMap.people_db.sort( 'name' );
      // チャット相手がオンラインでなくなっている場合は、チャット相手を解除する。
      // その結果、「spa-setchatee」グローバルイベントが発行される。
      if ( chatee && ! is_chatee_online ) { set_chatee(''); }
    };

    _publish_listchange = function (arg_list ){
        _update_list( arg_list);
        $.gevent.publish( 'spa-listchange', [arg_list] );
    };

    _publish_updatechat = function( arg_list ){
        var msg_map = arg_list[0];

        if (! chatee ) { set_chatee( msg_map.sender_id ); }
        else if ( msg_map.sender_id !== stateMap.user.id
                     && msg_map.sender_id !== chatee.id ) {
            set_chatee( msg_map.sender_id );
        }
        $.gevent.publish( 'spa-updatechat', [ msg_map ] );

    };
    // 内部メソッド↑

    _leave_chat = function () {
        var sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
        stateMap.is_connected = false;
        if ( sio ) { sio.emit( 'leavechat' ); }
    };

    get_chatee = function() { return chatee; };

    join_chat = function() {
        var  sio;

        if ( stateMap.is_connected ) { return false; }

        if ( stateMap.user.get_is_anon() ) {
            console.warn( 'User must be defined before joining chat');
            return false;
        }

        sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();
        sio.on( 'listchange', _publish_listchange );
        sio.on( 'updatechat', _publish_updatechat );
        stateMap.is_connected = true;
        return true;
    };

    send_msg = function( msg_text ) {
        var msg_map,
                sio = isFakeData ? spa.fake.mockSio : spa.data.getSio();

        if ( ! sio ) { return false; }
        if ( ! ( stateMap.user && chatee )) { return false; }

        msg_map = {
            dest_id		: chatee.id,
            dest_name	: chatee.name,
            sender_id	: stateMap.user.id,
            msg_text	: msg_text
        };

        // updatechatを発行したので、送信メッセージを表示できる
        _publish_updatechat( [msg_map] );
        sio.emit( 'updatechat', msg_map );
        return true;
    };

    set_chatee = function ( person_id ){
        var new_chatee;
        new_chatee = stateMap.people_cid_map[ person_id ];
        if ( new_chatee ) {
            if ( chatee && chatee.id === new_chatee.id ){
                // チャット相手が現在のオブジェクトと同じ
                return false;
            }
        }
        else {
            new_chatee = null;
        }

        $.gevent.publish( 'spa-setchatee',
                { old_chatee : chatee,  new_chatee : new_chatee }
        );
        chatee = new_chatee;
        return true;
    };

    // avatar_update_map は以下の形式を持つべき。
    // { person_id : <string>, css_map : {
    //   top : <int>, left : <int>,
    //   'background-color' : <string>
    //  }};
    //
    update_avatar = function ( avatar_update_map ){
        var sio = isFakeData ? spa.fake.mockSio : spa.data.getSid();
        if ( sio ) {
            sio.emit( 'updateavatar', avatar_update_map );
        }
    };

    return {
        _leave 			: _leave_chat,
        get_chatee 	: get_chatee,
        join 				: join_chat,
        send_msg		: send_msg,
        set_chatee	: set_chatee,
        update_avatar : update_avatar
    };



  }());

  // パブリックメソッド /initModule/ ↓
  // 目的     : モジュールを初期化する
  // 引数     : なし
  // 戻り値   : なし
  // 例外発行 : なし
  //
  initModule = function () {
    //var i, people_list, person_map;

    // 匿名ユーザを初期化する
    stateMap.anon_user = makePerson({
      cid : configMap.anon_id,
      id  : configMap.anon_id,
      name: 'anonymous'
    });
    stateMap.user = stateMap.anon_user; // 現在のユーザの初期値は匿名ユーザ


  };
  // パブリックメソッド /initModule/ ↑

  // パブリックメソッドを返す
  return {
    initModule  : initModule,
    chat				: chat,
    people			: people
  };
  //------------------- パブリックメソッド↑ ---------------------
}());
