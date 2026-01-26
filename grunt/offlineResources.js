/*jslint node: true */
/*jshint esversion: 6 */

var path = require('path');
var args = require('yargs').argv;
var config = {};
var isMultiProduct = args.name;

if(isMultiProduct) {
  config = require('../config.js').get();
}

module.exports = {

    offlineResources:{
        options: {
          
        },
        files: [
        {
          /* DocumentX stylesheet */
          src: [
            './online/Tripwire.Web/Content/bootstrap.min.css',
            './online/Tripwire.Web/Content/themes/infragistics/infragistics.theme.min.css',
            isMultiProduct ? './online/Tripwire.Web/Content/multiplatform.css' : './online/Tripwire.Web/Content/igniteui.min.css',
            './offline/templates/multiproduct/template/stylesheets/offline-reset.css'
          ],
          dest: [
                  isMultiProduct ? path.join(config.topics.dest, 'stylesheets', 'dx.net.2012.css') : './offline/Tripwire.Offline/help/stylesheets/dx.net.2012.css',
                  isMultiProduct ? path.join(config.topics.dest, 'stylesheets', 'dx.ajax.2012.css') : './offline/Tripwire.Offline/help/stylesheets/dx.ajax.2012.css'
                ],

          replace: {
            "document-content(?!-)": "BodyContent",
            /* prevent UL style override */
            "BodyContent ul(?!\s* li)" : "not-used"
          }
        },
        {
          /* DocumentX + topics script */
          src: [
                isMultiProduct ? './offline/templates/multiproduct/template/script/jquery-1.7.2.min.js' : "./online/Tripwire.Web/scripts/jquery-1.11.1.min.js",
                isMultiProduct ? './offline/templates/multiproduct/template/script/jquery-ui-1.8.18.custom.min.js' : "./online/Tripwire.Web/scripts/jquery-ui-1.10.4.min.js",
                './online/Tripwire.Web/scripts/app/igviewer.offline.js'],

          dest: [
                isMultiProduct ? path.join(config.topics.dest, 'script', 'dx.net.jqueryplugins.2012.min.js') : './offline/Tripwire.Offline/help/script/dx.net.jqueryplugins.2012.min.js',
                isMultiProduct ? path.join(config.topics.dest, 'script', 'dx.ajax.jqueryplugins.2012.min.js') : './offline/Tripwire.Offline/help/script/dx.ajax.jqueryplugins.2012.min.js',
                isMultiProduct ? path.join(config.topics.dest, 'script', 'igviewer.offline.js') : './offline/Tripwire.Offline/help/script/igviewer.offline.js'],
        },
        {
          src: "./online/Tripwire.Web/scripts/modernizr-2.7.2.js",
          dest: isMultiProduct ? path.join(config.topics.dest, 'script', 'modernizr-2.7.2.js') : './offline/Tripwire.Offline/help/script/modernizr-2.7.2.js',
          copy: true
        },
        {
          src: "./online/Tripwire.Web/img/igniteui-trans.png",
          dest: isMultiProduct ? path.join(config.topics.dest, 'images', 'igniteui-trans.png') : './offline/Tripwire.Offline/help/images/igniteui-trans.png',
          copy: true
        },
        {
          src: "./online/Tripwire.Web/img/infragistics.png",
          dest: isMultiProduct ? path.join(config.topics.dest, 'images', 'infragistics.png') : "./offline/Tripwire.Offline/help/images/infragistics.png",
          copy: true
        },
        {
          src: "./online/Tripwire.Web/img/top-button.png",
          dest: isMultiProduct ? path.join(config.topics.dest, 'images', 'top-button.png') : "./offline/Tripwire.Offline/help/images/top-button.png",
          copy: true
        }]
    }
};