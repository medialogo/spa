/*
 * spa.shell.js
 * SPA�̃V�F�����W���[��
*/

/*jslint  browser : true, continue : true,
  devel : true, indent :2, maxerr : 50,
  newcap: true, nomen :true, plusplus : true,
  regexp : true, sloppy : true, vars : false,
  white  : true
*/

/*global $, spa */

spa.shell =(function () {
  //-------- ���W���[���X�R�[�v�ϐ��J�n ------------
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
	  + '<div class="spa-shell-modal">modal</div>'
  },
  stateMap = { $container : null },
  jqueryMap = {},
  
  setJqueryMap, initModule;
  //-------- ���W���[���X�R�[�v�ϐ��I�� ------------
  //-------- ���[�e�B���e�B���\�b�h�J�n ------------
  //-------- ���[�e�B���e�B���\�b�h�I�� ------------
  //-------- DOM���\�b�h�J�n ------------
  //DOM���\�b�h/setJqueryMap/�J�n ------------
  setJqueryMap = function () {
	var $container = stateMap.$container;
	jqueryMap = { $container : $container };
  };
  //DOM���\�b�h/setJqueryMap/�I�� ------------
  //-------- DOM���\�b�h�I�� ------------

  //-------- �C�x���g�n���h���J�n ------------
  //-------- �C�x���g�n���h���I�� ------------
  //-------- �p�u���b�N���\�b�h�J�n ------------
  //�p�u���b�N���\�b�h/initModule/�J�n ------------
  initModule = function ( $container) {
	stateMap.$container = $container;
	$container.html( configMap.main_html );
	setJqueryMap();
  };
  //�p�u���b�N���\�b�h/initModule/�I�� ------------
  return { initModule : initModule};
  //-------- �p�u���b�N���\�b�h�I�� ------------
}());
