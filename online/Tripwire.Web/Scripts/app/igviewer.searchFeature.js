(function (window, $, igViewer) {

    var $searchResults, $resultLinks, $searchButton, $searchText, $tree;

    $(function () {
        $searchResults = $('#search-grid');
        $searchButton = $('#search-button');
        $searchText = $('#search-text');
        $tree = $('#toc-tree');

        $searchButton.click(igViewer.searchFeature.doSearch);

        $searchResults.on('click', 'a[data-role="search-link"]', function (e) {
            e.stopPropagation();

            var
                $link = $(this),
                fileName = $link.attr('href'),
                title = $link.text();

            igViewer.renderingService.renderPage(fileName, '', title, function () {
                var pageInfo = igViewer.common.getPageInfo(fileName, title);
                igViewer.treeService.syncTreeWithCurrentPage($tree, pageInfo)
            });

            return false;
        }).on('click', 'ul.pagination a', function (e) {
            e.preventDefault();

            var page = parseInt(this.attributes['data-page'].value);
            if (igViewer.searchService.page != page) {
                igViewer.searchService.page = page;
                igViewer.searchFeature.doSearch();
            }

            return false;
        });
    });

    var feature = {

        doSearch: function() {
            igViewer.searchService.search($searchText.val(), function (results) {
                igViewer.searchFeature.displayResults(results);
                $searchResults.children("ul.pagination").children("li").removeClass("active")
                    .filter(function () {
                        return $(this).text() == igViewer.searchService.page;

                    }).addClass("active");
            }, function (error) {
                igViewer.common.publishErrorToServer(error);
            });
        },  

        displayResults: function (results) {
            var pages = [],
                counter = 5,
                lastPage = Math.ceil(results.TotalCount / igViewer.searchService.pageSize);

            var html = "<ul>";
            if (results.Items.length) {
                html +=  $.ig.tmpl('<li><a data-role="search-link" href="${Link}">${Title}</a></li>', results.Items);
            }
            else{
                html += igViewer.locale.noResults;
            }            
            html +=  "</ul>";

            for (var i = 2; i > 0; i--) {
                if (igViewer.searchService.page - i > 0) {
                    pages.push({index: igViewer.searchService.page - i});
                    counter--;
                }
            }

            pages.push({index: igViewer.searchService.page});

            for (var i = 1; i < counter; i++) {
                if (igViewer.searchService.page + i <= lastPage) {
                    pages.push({index: igViewer.searchService.page + i});
                }
            }


            if (pages.length){
                prevClass = igViewer.searchService.page > 1 ? "" : "disabled";
                lastClass = lastPage > pages[pages.length-1].index ? "" : "disabled";
                var pager = '<ul class="pagination pagination-md">' + 
                            '<li class="' + prevClass + '"><a data-page="1" href="#">&laquo;</a></li>';

                pager += $.ig.tmpl('<li><a data-page="${index}" href="#">${index}</a></li>', pages);

                pager += '<li class="' + lastClass + '"><a data-page="' + lastPage + '" href="#">&raquo;</a></li>';
                
                pager += '</ul>';
                html += pager;
            }

            $searchResults.html(html);
        }
    };

    igViewer = igViewer || {};
    igViewer.searchFeature = feature;

}(window, jQuery, window.igViewer));