(function ($, Modernizr, window, igViewer, hljs) {
	var $window, $navContainer, $navButton;

	var svc = {

	    addImgResponsiveClass: function (element) {
	        var images = element.find('img');
	        images.each(function (imgIndex, img) {
	            var $img = $(img);
	            if (!$img.attr('class')) {
	                $img.addClass('img-responsive');
	            } else if ($img.attr('class').indexOf('img-responsive') === -1) {
	                $img.addClass('img-responsive');
	            }
	        });
	    },

	    addHashToJavaScriptProtocolLinks: function () {
	        // support middle click #227212
	        $('a[onclick^="javascript:navigate"]').attr('href', '#');
	    },

		errorHandler: function (error) {
			if (igViewer.common.isOnline) {
				igViewer.common.publishErrorToServer(error);
			}
			svc.hideLoader();
		},

		highlightCode: function (isInitialPageLoad) {
		    // switches XAML language class to XML
		    $('.language-xaml').addClass('language-xml').removeClass('language-xaml');
		    if (isInitialPageLoad) {
		        hljs.initHighlightingOnLoad();
		    } else {
		        $('pre code').each(function (i, block) {
		            hljs.highlightBlock(block);
		        });
		    }
		},

		showContent: function (content) {
		    var element, images;

			element = $(igViewer.common.contentContainerId);
			element.hide();
			svc.hideLoader();
			element.empty().html(content);

			// apply filters
			svc.filterContent(element);

			if (igViewer.common.isSmallDeviceWidth()) {
				svc.collapseNav();
			}

			svc.addImgResponsiveClass(element);

			svc.addHashToJavaScriptProtocolLinks();

			svc.highlightCode();
			
			igViewer.common.renderEmbedSample();
			
			igViewer.common.scrollToTop();
			images = element.find("img").one("load", function () {
				images--;
				if (images == 0) {
					igViewer.common.syncSidebarHeight();
				}
			}).length;

			element.fadeIn(function () {
				igViewer.common.syncSidebarHeight();
			});
		},

		collapseNav: function () {
			$navContainer.collapse('hide');
			$navButton.text(igViewer.locale.navShowLabel);
		},

		renderPage: function (fileName, hash, title, callback) {
			svc.showLoader();
			var pageInfo = igViewer.common.getPageInfo(fileName, title, hash);

			igViewer.contentService.getPageContents(pageInfo, function (markup, data) {
				igViewer.common.$errorPublishedMessage.fadeOut();
				svc.showContent(markup);
				igViewer.feedbackService.changePage();
				window.history.pushState({ topic: true }, '', pageInfo.path.navigation);

				// Update after location is set for GTM:
				igViewer.common.currentPageInfo(pageInfo);

				if (callback && typeof callback === "function") {
					callback(data);
				}
			}, svc.errorHandler);

		},
		
		/**
		 * An array of Content filter handlers. Functions take content container and a pageInfo object.
		 * @typedef {object} jQuery jQuery object
		 * @type {(function(jQuery):void)[]}
		 */
		contentFilters: [],

		/**
		 * Runs all the filter handlers.
		 * @param {jQuery} container
		 */
		filterContent: function (container) {
			for (var i = 0; i < this.contentFilters.length; i++) {
				this.contentFilters[i].call(this, container);
			}
		},

		showLoader: function () {
			var element = $(igViewer.common.contentContainerId);
			element.css("opacity", 0.3);			
			element.parent().igLoading().igLoading("show");
		},

		hideLoader: function () {
			var element = $(igViewer.common.contentContainerId);
			element.css("opacity", 1);
			if (element.parent().data("igLoading")) {
				element.parent().igLoading("hide");
			};
			
		}
	};

	$(function () {

		var $tree = $('#toc-tree'), 
			width,
			$element;

		$window = $(window);
		$navButton = $('#nav-button');
		$navContainer = $('#nav-container');

		$element = $(igViewer.common.contentContainerId);
		svc.addImgResponsiveClass($element);
		svc.addHashToJavaScriptProtocolLinks();

		var showOrHideNavigation = function () {
			if ($(window).width() == width) {
				return;
			}
			// cache width to stop misfires
			width = $window.width();

			if(window.matchMedia && window.matchMedia("print").matches) return;
			var mode = (igViewer.common.isSmallDeviceWidth()) ? 'hide' : 'show';
			$navContainer.collapse(mode);
			//$navContainer[mode](350); // jquery version
			igViewer.common.syncSidebarHeight();
		};

		//init collapse widget w/o toggle
		$navContainer.collapse({ toggle: false });
		showOrHideNavigation();

		$window.on('resize', showOrHideNavigation);

		$navButton.click(function (e) {
			$navContainer.collapse('toggle');
			//$navContainer.toggle(350); // jquery version

			var isHidden = parseInt($navContainer.height()) === 0,
				label = (isHidden) ? igViewer.locale.navHideLabel : igViewer.locale.navShowLabel;

			$navButton.text(label).blur();

			if (label === igViewer.locale.navShowLabel) {
				igViewer.common.scrollToTop();
			}

		});

		svc.highlightCode(true);

		$window.on('popstate', function (event) {
		    var ev = event.originalEvent;
			
		    igViewer.feedbackService.changePage();

			if (igViewer.common.isOnIndexPage()  || (ev.state && ev.state.topic)) {
				var current = igViewer.common.currentPageInfo();

				var fileName = igViewer.common.getPageNameFromLocation();
				var dest = igViewer.common.getPageInfo(fileName);

				if (current.pageName != dest.pageName) {
					svc.showLoader();
					igViewer.contentService.getPageContents(dest, function (markup) {
						svc.showContent(markup);
						igViewer.treeService.syncTreeWithCurrentPage($tree, dest);
						igViewer.common.$errorPublishedMessage.fadeOut();
						if (igViewer.common.hasLocationHash()) {
							setTimeout(igViewer.common.refreshHash, 400);
						}
					}, svc.errorHandler);
				}
			}
			else if (!igViewer.common.isCurrentPage()){
				// actually load the page if it's not a hash change:
			    window.location.reload();
			}
			else {
				history.replaceState({ topic: true }, undefined, location.hash);
			}
		});

		$(igViewer.common.contentContainerId).on("click", igViewer.common.contentElementId + " a", function (ev) {
			var origin = this.origin || this.protocol + "//" + this.host;
			var path = decodeURIComponent(this.pathname);
			var hash = '';
			var dest = '';

			if (igViewer.common.isCurrentPage(origin + path, this.search)) return true;

			if (igViewer.common.shouldUsePushState() &&
					this.href.startsWith(igViewer.common.baseURI) &&
					!this.href.startsWith(igViewer.common.baseURI + "api")) {
				ev.preventDefault();

				hash = igViewer.common.getHashFromHrefValue(this.getAttribute('href'));
				dest = igViewer.common.getPageInfo(path.split("/").pop() + igViewer.common.versionQuery(this.search));

				svc.renderPage(dest.fileName, hash, null, function (data) {
				    // tree sync will also fix page info without hash
				    if (!hash || hash.length === 0) {
					    igViewer.common.scrollToTop();
				    }

					igViewer.treeService.addDataNodes($tree, data);
					igViewer.treeService.syncTreeWithCurrentPage($tree, dest);
					if (igViewer.common.hasLocationHash()) {
					    igViewer.common.refreshHash();
					}
				});
			}
		});
	});

	igViewer = igViewer || {};
	igViewer.renderingService = svc;

}(jQuery, Modernizr, window, window.igViewer, hljs));