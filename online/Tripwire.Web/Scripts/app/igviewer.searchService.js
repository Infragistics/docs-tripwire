(function (window, $, igViewer) {

    var svc = {
        page: 1,
        pageSize: 10,
        search: function (query, success, fail) {
            $.getJSON("search?query=" + query + "&page=" + this.page + "&pageSize=" + this.pageSize)
                .done(function (data) {
                    for (var i = 0; i < data.Items.length; i++) {
                        data.Items[i].Link = data.Items[i].Link.split('/').pop();
                    };
                    this.page = data.PageIndex;
                    this.pageSize = data.PageSize;
                    success(data);
                })
                .fail(fail);
        }

    };

    igViewer = igViewer || {};
    igViewer.searchService = svc;

    // Search tabs
    $("#search-container div.ui-tabs").tabs({
        active: window.activeAPI ? 1 : 0,
        activate: function (event, ui) {
            // Hide panels (visible while request is being made)
            ui.newPanel.hide();
            ui.oldPanel.hide();
            location = ui.newTab.children('a').attr('href');
        },
        create: function (event, ui) {
            ui.panel.hide();
        },
        beforeLoad: function (event, ui) { return false; } // you shall not make requests!
    });

}(window, jQuery, window.igViewer));