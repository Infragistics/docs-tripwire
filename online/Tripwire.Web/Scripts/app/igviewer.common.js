(function (window, $, Modernizr, ga) {
    Array.prototype.clean = function (deleteValue) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] == deleteValue) {
                this.splice(i, 1);
                i--;
            }
        }
        return this;
    };

    var originalrefreshPos = $.ui.igLoading.prototype.refreshPos;
    /* override igLoading to show in scrolled pages */
    $.ui.igLoading.prototype.refreshPos = function () {
        if (!this.options.includeVerticalOffset) {
            originalrefreshPos.call(this);
            return;
        }
        // this.element is already relative, window scroll only:
        var offset = this.element.offset(),
            elemHeight = this.element.innerHeight(),
            windowHeight = $(window).height(),
            scroll = $(window).scrollTop(),
            visibleTop = Math.max(offset.top, scroll),
            visibleBottom = Math.min(offset.top + elemHeight, scroll + windowHeight),
            top, left;

        top = visibleTop + (visibleBottom - visibleTop) / 2 - this._yShift;
        left = this.element.innerWidth() / 2;

        this._indicator.css("left", left).css("top", top);
    };

    var $window = $(window),
        $topButton = $('#top-button'),
        $sidebar = $('.nav-sidebar'),
        $body = $('body'),
        $content;

    var _private = {
        currentPageInfo: {}
    };

    var common = {

        contentContainerId: '#document-content-container',

        contentElementId: '#document-content',

		$footer: $("body > .scrollable-container > footer").first(),

        $errorPublishedMessage: $('#error-published-message'),

        contentFolderName: 'help',

        homePages: ["index", "home-page"],

        topicAPI: "",

        isOnline: false,

        baseURI: window.baseURI || "",

        baseURIRelative: '',

        getProductInfoFromLocation: function () {
            var ex = new RegExp('help\/(' + common.getProductListPattern() + ')\/(' + common.getSubProductsPattern() + ')\/');
            var matches = ex.exec(window.location.href);

            var result = {
                product: '',
                subproduct: '',
                hasSubProduct: false
            };

            if (matches && matches.length >= 3) {
                result.product = matches[1];
                result.subproduct = matches[2];
                result.hasSubProduct = true;
            } else if(!result.hasSubProduct){
                ex = new RegExp('help\/(' + common.getProductListPattern() + ')');
                matches = ex.exec(window.location.href);
                if(matches && matches.length >= 2) {
                    result.product = matches[1];
                }
            }

            return result;
        },

        detectBaseURI: function () {
            var uri = window.baseURI || "";

            var productInfo = common.getProductInfoFromLocation();


            if (productInfo.hasSubProduct) {
                uri += productInfo.subproduct + '/';
            }

            common.baseURIRelative = uri;
            common.baseURI = common.toAbsoluteURL(uri);
        },

        currentPageInfo: function (info) {
            if (!info) {
                // get:
                return _private.currentPageInfo;
            }

            // set:
            var initial = !_private.currentPageInfo.path;
                change = _private.currentPageInfo.pageName !== info.pageName;

            if (change) {
                //tabs:
                $('<div>', { id: 'Syntax-VBAll' }).append($('#Syntax-VB')).append('&nbsp;').append($('#Syntax-VBUsage')).appendTo('.TabContainer');
                $(".TabContainer").tabs({
                    active: 1,
                    activate: function (event, ui) {
                        if (ui.newTab.children('a').attr('href') == "#Syntax-CS") {
                            $("div.FilteredContentCS").show();
                            $("div.FilteredContentVB").hide()
                        }
                        else {
                            $("div.FilteredContentCS").hide();
                            $("div.FilteredContentVB").show()
                        }
                    }
                });
            }

            if (info.title && common.shouldUsePushState()) {
                window.document.title = igViewer.locale.pageTitleFormat.replace("{0}", info.title);
            }
            if (!initial && change) {
                // Google Tag Manager
                window.dataLayer.push({
                    'event': 'trackSPAPageview',
                    'pagePath': location.pathname,
                    'pageTitle': window.document.title
                });
            }

            _private.currentPageInfo = info;
        },

        getHashFromHrefValue: function (href) {
            var hash = href.split('#');
            hash = hash.length === 2 ? '#' + hash[1] : '';
            return hash;
        },

        versionQuery: function (q) {
            var query = q || window.location.search;
            var version = query.match(/[\?&]v=(\d\d?\.\d)/);
            if (version && version[1]) {
                return '?v=' + version[1];
            }
            return "";
        },

        isContentPage: function () {
            if (common.path && common.path.length) {
                return true;
            }

            if (common.isOnIndexPage()) {
                return true;
            }

            return false;
        },

        versionRegex: {
            hrefOrQueryString: /([\?&]v=|\/)([0-9]{1,2}\.[0-9])\/?/i,
            href: /\/[0-9]{1,2}\.[0-9]\//i,
            queryString: /[\?&]v=([0-9]{1,2}?\.[0-9])/i
        },

        getCurrentVersion: function() {
            var   version = ''
                , href = window.location.href
                , versionMatches
            ;
  
            versionMatches = href.match(common.versionRegex.hrefOrQueryString);
            if(versionMatches && versionMatches.length >= 2) {
                version = versionMatches[2];
            }
  
            return version;
        },

        getPageInfo: function (fileName, title, hash, version) {
            var   locationParts
                , pageName
                , ext
                , noExt
                , api
                , productInfo
                , info
                , tree
                , v
            ;

            version = version ? version : common.getCurrentVersion();

            v = version;

            if (!fileName) {
                locationParts = window.location.pathname.split('/');
                fileName = locationParts.pop();
                if (common.getProductList().indexOf(fileName) !== -1 ||
                    common.getSubProducts().indexOf(fileName) !== -1) {
                    fileName = common.homePages[0];
                }
            }

            hash = hash ? hash : '';
            title = title ? title : '';

            pageName = fileName.replace(common.versionRegex.queryString, '')
                                   .replace(/\.html$/i, '')
                                   .toLowerCase();

            if(version.length > 0){
                version += '/';
            }

            // TODO: better home pages handling
            if (common.isOnIndexPage(pageName) && !common.isOnline && common.baseURI) {
                common.baseURI = "../";
            }

            if (common.isOnIndexPage(pageName)) {
                pageName = common.homePages[1];
            }

            ext = common.baseURI + version + fileName;
            noExt = common.baseURI + version + pageName;
            api = common.topicAPI + pageName;
            productInfo = common.getProductInfoFromLocation();
			//TODO: This entire thing needs to go and have it generated by MVC
            tree = {
                fileName: common.baseURI + "apis/tree/" + fileName + (v ? '?v=' + v : ''),
                root: common.baseURI + "apis/tree/" + (v ? '?v=' + v : '')
            };

            if (productInfo.hasSubProduct) {
                api = api.replace(productInfo.product, productInfo.product + '/' + productInfo.subproduct);
            }

            info = {
                title: title,
                fileName: fileName,
                pageName: pageName,
                path: {
                    navigation: (common.isOnline ? noExt : ext) + hash,
                    service: common.isOnline ? api : ext,
                    noExt: noExt,
                    api: api,
                    ext: ext,
                    tree: tree
                },
                isContentPage: common.isContentPage()
            };

            return info;
        },

        getPageNameFromLocation: function () {
            var pathParts, name = common.isOnline ? "" : common.homePages[2];

            // D.P. 20 Sep 2016 Bug 225710:Back button doesn't work in browser
            if (window.location.pathname !== common.baseURIRelative) {
                pathParts = window.location.pathname.split('/');
                pathParts = pathParts.clean('');
                name = common.isOnline ? pathParts.pop().toLowerCase() : pathParts.pop();
            }

            if (name === '' && common.isOnline) {
                name = common.homePages[1];
            }

            //append version to the path:
            name += common.versionQuery();

            return decodeURIComponent(name);
        },

        isOnIndexPage: function (page) {
            if (!page) {
                var pathname = location.protocol + "//" + location.host + location.pathname;
                if (pathname === common.baseURI) {
                    return true;
                }
                page = pathname.replace(common.baseURI, "");
            }
            return jQuery.inArray(page, common.homePages) !== -1;
        },

        stripTrailingSlash: function (path) {
            // CS: strip trailing slash if exists (bug #228938)
            if (path[path.length - 1] === '/') {
                path = path.slice(0, -1);
            }
            return path;
        },

        isCurrentPage: function (path, query) {
            path = path || window.location.protocol + "//" + window.location.host + window.location.pathname;
            path += common.versionQuery(query);
            path = decodeURI(path).toLowerCase();
            path = common.stripTrailingSlash(path);
            var currentPath = common.stripTrailingSlash(common.currentPageInfo().path.navigation.toLowerCase());
            return currentPath === path;
        },

        isUsingWebServer: function () {
            var protocol = window.location.protocol;
            return (protocol === 'http:' || protocol === 'https:');
        },

        isSmallDeviceWidth: function () {
            return $window.width() < 768;
        },

        shouldUsePushState: function () {
            if (Modernizr.history) {
                return common.isUsingWebServer();
            }
            return false;
        },

        hasLocationHash: function () {
            return window.location.hash && window.location.hash.length > 0;
        },

        refreshHash: function () {
            //D.P. this actually works better than changing the hash back and forth, no extra history entries.
            if (common.hasLocationHash()) {
                // CS: this is a bit of a hack, but will work for now
                setTimeout(function () {
                    window.location.assign(decodeURI(window.location.href));
                }, 500);
            }
        },

        scrollToTop: function () {
			$('.scrollable-container').animate({ scrollTop: 0 }, 'fast');
        },

		/**
		 * Returns The visible portion of the footer in view or 0
		 */
        footerVisibleSize: function () {
        	var scrollTop = $window.scrollTop(),
                scrollPos = $window.height() + scrollTop,
				visible = scrollPos - this.$footer.offset().top /*-  common.footerTopPadding footer top padding */;
        	return visible > 0 ? visible : 0;
        },

        adjustFixedElemPos: function () {
        	var footerVisibleSize = common.footerVisibleSize(),
                atFooter = footerVisibleSize > 0;
            if (atFooter) {
                $topButton.css({ position: "absolute" });
            }
            else {
                $topButton.css({ position: "fixed" });
            }
            if (igViewer.treeService) {
            	igViewer.treeService.updatePosition( footerVisibleSize );
            }
        },

        publishErrorToServer: function (error) {
            var errorText;

            if (error.message) {
                errorText = ' Message: ' + error.message;
            }

            if (error.stack) {
                errorText += ' Stack: ' + error.stack;
            }

            var msg = {
                errorText: errorText,
                url: window.document.location.href
            };

            $.post('apis/error', msg);

            common.$errorPublishedMessage.fadeIn();
        },

        syncSidebarHeight: function () {
            $content = $content || $(common.contentContainerId).parent();
            $content.css("minHeight", "");
            $sidebar.css("minHeight", "");

            igViewer.treeService.updateOuterWidth($sidebar.outerWidth());

			/* need to update tree when page are relaoding, called in from showContent */
            igViewer.treeService.updatePosition(common.footerVisibleSize());
            igViewer.treeService.setTreeHeight(common.footerVisibleSize());

            if (common.isSmallDeviceWidth()) {
                $sidebar.css("minHeight", "");
                igViewer.treeService.unfixTree();
                return;
            }

            if ($sidebar.height() > $content.outerHeight()) {
                $content.css("minHeight", $sidebar.height())
            }
            $sidebar.css("minHeight", $content.outerHeight());
        },

        toAbsoluteURL: function (relative) {
            var a = window.document.createElement('a');
            a.href = relative;
            return a.href;
        },

        getProductListPattern: function () {
            var value = $body.attr('data-product-list');

            if (value === undefined) {
                value = '';
            }

            return value;
        },

        getProductList: function () {
            return common.getProductListPattern().split('|');
        },

        getSubProductsPattern: function () {
            var value = $body.attr('data-subproduct-list');

            if (value === undefined) {
                value = '';
            }

            return value;
        },

        getSubProducts: function () {
            return common.getSubProductsPattern().split('|');
        },

        renderEmbedSample: function () {
        	$(".embed-sample").ghEmbed();
        },

        getHeadersAndFooter: function () {         
            
            var url = this.igRootUrl + (this.igniteRootUrl ? '/navigation-ignite' : "/navigation");
            var isReveal = this.baseURI != null && this.baseURI.toString().contains("revealbi.io");

            if (isReveal) {
                var subdomain = "www.";
                if (this.baseURI.toString().contains("dev.")) {
                    subdomain = "dev.";
                } else if (this.baseURI.toString().contains("staging.")) {
                    subdomain = "staging."
                }
                url = "//" + subdomain + "revealbi.io/" + (this.baseURI.toString().contains("jp") ? "jp/" : "") + "navigation";

            }
            else {                
                if (this.baseURI != null && this.baseURI.toString().contains("co.kr")) {
                    var rootUrl = "infragistics.co.kr";

                    if (this.baseURI.contains("dev.")) {
                        rootUrl = "dev." + rootUrl;
                    }
                    else if (this.baseURI.contains("staging.")) {
                        rootUrl = "staging." + rootUrl;
                    }
                    else {
                        rootUrl = "www." + rootUrl;
                    }

                    url = "//" + rootUrl + (this.igniteRootUrl ? '/navigation-ignite' : "/navigation");
                }
            }

            $.ajax({
        		url: url,
        		type: 'get',
        		xhrFields: {
        			withCredentials: true
        		}
        	}).done(function (data) {
        		var nav = $(data);
        		var header = nav.find('#header')[0].outerHTML;
        		var footer = nav.find('footer')[0].outerHTML;
        		$('#header').replaceWith(header);
        		common.$footer.replaceWith(footer);
				common.$footer = $("body > .scrollable-container > footer").first();
        		$('#footer').replaceWith(nav.find('#footer'));
        		igNavigation.init();
        		//sign out
        		var logOutLink = $('#header').find("#logOutLink");
        		if (logOutLink.length) {
        			logOutLink.attr("href", logOutLink.attr("href").split("?")[0]);
        		}
        	}).fail(function () {
        		// try init on the cached version:
        		igNavigation.init();
        	});
        	if (this.igniteRootUrl) {
        		$.ajax({
        			url: this.igniteRootUrl + "/aspnet/home/secondary-nav?selected=help",
        			type: 'get'
        		}).done(function (data) {
        			$('#headerSecondary').replaceWith(data);
        		});
        	}
        }
    };

    $topButton.children('button').click(function (e) {
        common.scrollToTop();
        this.blur();
    });

    common.$errorPublishedMessage.on("click", ".close", function (e) {
        common.$errorPublishedMessage.fadeOut();
    });

    common.isOnline = $('body').attr('data-mode') === "online";

    common.detectBaseURI();

    common.currentPageInfo(common.getPageInfo(common.getPageNameFromLocation()));
    common.adjustFixedElemPos();
    common.refreshHash();
	$(".scrollable-container").scroll(common.adjustFixedElemPos);
    $window.one("load", function () {
    	common.renderEmbedSample();
    	common.syncSidebarHeight();
    	common.getHeadersAndFooter();
    });
    window.setTimeout(function () {
        $("#wrong-version").slideUp(500);
    }, 5000);
    window.FastClick.attach(window.document.body);

    window.igViewer = window.igViewer || {};
    window.igViewer.common = common;

} (window, jQuery, Modernizr, window.ga));

// carry over from old help viewer
var navigateToHelp2Keyword = function (Keyword, OnlineKeyword, ReplacePage) {
    var locale = /jp\.infragistics/i.test(window.location) ? 'JA-JP' : 'EN-US';
    //var url = "http://msdn.microsoft.com/query/dev10.query?appId=Dev10IDEF1&l=" + locale + "&k=k(" + OnlineKeyword + ")&rd=true";
    //https://msdn.microsoft.com/en-us/library/system.windows.forms.aspx
    var url = 'https://social.msdn.microsoft.com/Search/' + locale + '?query=' + OnlineKeyword;
    window.open(url, "_blank");
    return false;
};