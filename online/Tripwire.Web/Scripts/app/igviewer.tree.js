(function ($, Modernizr, window, igViewer) {

    var svc = {
    	highlightNodes: '',
    	selectedNode: null,
    	$tree: null,
    	$navContainer: null,
        $window: null,
    	outerWidth: null,
    	isFixed: true,
    	initialized: false,
		minHeight: 500,
        highlightNonesOnExpand: function () {
            if (svc.highlightNodes) {
                svc.highlightNodes.removeClass("ui-igtree-expanded");
            }
            if (this.selectedNode && this.selectedNode.element) {
            	svc.highlightNodes = this.selectedNode.element.parents("li.ui-igtree-node");
            	svc.highlightNodes.addClass("ui-igtree-expanded");
            }
        },

        syncTreeWithCurrentPage: function ($tree, pageInfo) {
            var node;
            if (igViewer.common.isContentPage()) {

                if (pageInfo) {
                	// set current page initially before tree selection!
                	if (!pageInfo.title) {
                		pageInfo.title = $(igViewer.common.contentElementId + " h1").text();
                	}
                    igViewer.common.currentPageInfo(pageInfo);
                }
                if (igViewer.common.path.length) {
                    $tree.igTree("expandToNode", igViewer.common.path.join("_"), true);
                    this.selectedNode = $tree.igTree('selectedNode');
                    var data = this.selectedNode.data;
                    igViewer.common.currentPageInfo(igViewer.common.getPageInfo(data.fileName || data.NavigateUrl, data.title || data.Text));
                    svc.highlightNonesOnExpand();
                    return;
                }
            }

            node = $tree.igTree('nodeByPath', '0');
            $tree.igTree('expand', node);
            $tree.igTree('clearSelection');
            svc.highlightNonesOnExpand();
        }, 

        addDataNodes: function ($tree, data) {
            var ds = $tree.igTree("option", "dataSource");
            var newData = ds.root().data();
            for (var i = 0; i < igViewer.common.path.length; i++) {
                if (newData[igViewer.common.path[i]].children && !newData[igViewer.common.path[i]].children.length) {
                    newData[igViewer.common.path[i]].children = data[igViewer.common.path[i]].children;
                    return;
                }
                newData = newData[igViewer.common.path[i]].children;
                data = data[igViewer.common.path[i]].children;
            }
        },

        updateOuterWidth: function (width) {
        	if (this.$tree && this.outerWidth !== width) {
        		this.$tree.outerWidth(width);
        		$("#menubar").outerWidth(width);
        		//this.$navContainer.parent().width(); // use inner width for nav container instead
        		this.outerWidth = width;
        	}
        },

        updatePosition: function (footerVisibleSize) { 
        	if (!this.initialized || igViewer.common.isSmallDeviceWidth()) return;

        	var newHeight = this.$tree.height() - footerVisibleSize;

			// always fixed unless mobile
        	this.$navContainer.addClass('affix');
        	this.isFixed = true;

        	if (footerVisibleSize > 0 && newHeight < this.minHeight) {
        		this.$navContainer.addClass('bottom');
        	} else {
        		this.$navContainer.removeClass('bottom');
        		this.setTreeHeight();
        	}
        },

        setTreeHeight: function () {
        	if (!this.$tree) return;
        	var scrollTop = svc.$window.scrollTop(),
        		treeOffset = 100; /* search box */

        	if (!svc.isFixed) {
        		svc.$tree.css({ height: svc.$window.height() / 2 }); /* temp */
        	} else {
        		
        		svc.$tree.css({ height: svc.$window.height() - treeOffset - igViewer.common.footerVisibleSize() });
        	}
        	
        },

        unfixTree: function () {
        	if (!this.$tree) return;

        	if (this.isFixed) {
        		this.$navContainer.removeClass("affix");
        		this.isFixed = false;

        	}
        }
    };

    $(function () {
        
        var $tree, $treeLoader = $('#toc-tree-loader');
		svc.$window = $(".scrollable-container");
        svc.$tree = $tree = $('#toc-tree');
        svc.$navContainer = $('#nav-container');

        var isParentNode = function (node) {
            return node.data.children || node.data.Nodes;
        };
        
        var nodeClick = function (e, ui, toSelect) {
            // when parsed from html node is: /* Object {NavigateUrl: "html/*.html", Text: "*", Nodes: Array[n]} */            
            
            ui.node = ui.node || ui.newNodes[0];

            var fileName = ui.node.data.fileName,
                isParent = isParentNode(ui.node),
                fetchContent = true;

            if (isParent && toSelect) {
            	$tree.igTree('expand', ui.node.element);
            }

            fetchContent = (!igViewer.common.isSmallDeviceWidth()) ||
                           (igViewer.common.isSmallDeviceWidth() && !isParent);

            if (igViewer.common.currentPageInfo() &&
                fileName.toLowerCase() !== igViewer.common.currentPageInfo().pageName.toLowerCase()) {

                if (fetchContent) {
                    igViewer.renderingService.renderPage(fileName, '', ui.node.data.title || ui.node.data.Text, function () {
                        igViewer.feedbackService.changePage();
                        if (toSelect) {
                            $tree.igTree('select', ui.node.element);
                        }
                    });
                }
            }
            else if (toSelect) {
                $tree.igTree('select', ui.node.element);               
            }
        };

        var url;
        var pageInfo = igViewer.common.getPageInfo();
        
        $.ajax({
            url: pageInfo.path.tree.fileName,
            type: "GET",
            success: function (data) {
            	igViewer.common.path = data.path ? data.path.reverse() : [];
                $tree.igTree({
                    singleBranchExpand: true,
                    nodeClick: function (e, ui) {
                        // TODO: offline eval
                        // normal click handling without ajax
                        if (!igViewer.common.shouldUsePushState()) return true;
                        nodeClick(e, ui, true);
                        return false;
                    },
                    selectionChanging: nodeClick,
                    nodeExpanded: function (e, ui) {
                        ui.node.element.addClass("ui-igtree-expanded");
                        igViewer.common.syncSidebarHeight();
                    },
                    nodeCollapsed: function (e, ui) {
                        ui.node.element.removeClass("ui-igtree-expanded");
                        igViewer.common.syncSidebarHeight();
                    },
                    nodePopulating: function (e, ui) {
                        var pageInfo, hasVersion, dataSourceUrl;

                        pageInfo = igViewer.common.getPageInfo();
                        url = url || $tree.igTree("option", "dataSourceUrl");

                        if (ui.data.children && ui.data.children.length) {
                            $tree.igTree("option", "dataSourceUrl", null);
                        }
                        else {
                            hasVersion = /\?(.*)v=/i.test(pageInfo.path.tree.root);
                            dataSourceUrl = pageInfo.path.tree.root + (hasVersion ? '&' : '?') + 'tocPath=' + ui.path;
                            $tree.igTree("option", "dataSourceUrl", dataSourceUrl);
                        }
                    },
                    nodePopulated: function (e, ui) {
                        if(url){
                            $tree.igTree("option", "dataSourceUrl", url);
                        }
                    },
                    loadOnDemand: true,
                    dataSource: data.children || data,
                    bindings: {
                        textKey: 'title',
                        valueKey: 'fileName',
                        childDataProperty: 'children',
                        navigateUrlKey: 'fileName',
                        nodeContentTemplate: "<a href='${fileName}' title='${title}'>${title}</a>"
                    },
                    dataSourceUrl: igViewer.common.baseURI + "apis/tree"
                });

                if (igViewer.common.isContentPage()) {
                    window.history.replaceState({ topic: true }, '');
                }
            }
        });

        $tree.one("igtreerendered", function (evt, ui) {
        	svc.initialized = true;
            svc.syncTreeWithCurrentPage($tree);
            $treeLoader.fadeOut('fast');

            $tree.fadeIn(function () {
                igViewer.common.adjustFixedElemPos();
                if (svc.selectedNode) {
            	    $tree.animate({
            		    scrollTop: 
						    svc.selectedNode.element.offset().top - $tree.offset().top // actual position of node in tree
						    - $tree.height() / 2 // put it in the ~middle
            	    }, 250);
                }
            });
            svc.setTreeHeight();
        });

        svc.$window.on('resize', function() {
        	svc.setTreeHeight();
        });
    });

    igViewer = igViewer || {};
    igViewer.treeService = svc;

}(jQuery, Modernizr, window, window.igViewer));