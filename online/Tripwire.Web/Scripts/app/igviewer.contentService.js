(function (window, $, igViewer) {

    var svc = {

        getPageContents: function (pageInfo, success, failure) {

            return $.get(pageInfo.path.service).done(function (response) {
                if (!igViewer.common.isOnline) {
                    response = $(response).find(igViewer.common.contentElementId).html();
                };
                igViewer.common.path = response.path.reverse();                
                success(response.topicContent, response.children);
            }).fail(failure);
        }

    };

    igViewer = igViewer || {};
    igViewer.contentService = svc;

}(window, jQuery, window.igViewer));