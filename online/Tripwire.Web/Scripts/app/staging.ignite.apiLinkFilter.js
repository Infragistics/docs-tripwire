/**
 * Content filter module specifically for dev/staging servers to strip the absolute part of API URLs.
 * Converts production jp/www.igniteui.com/help/api links to [jp.]staging.igniteui.com/help/api
 * depends on: igviewer.common, igviewer.renderingService
 */
(function ($, window, igViewer) {
	var apiLinkFilter = function (container) {
		var apiLinkReg = /^https?:\/\/(?:(jp\.)|www\.)igniteui.com\/help\/api/,
			replacePattern = "https://$1staging.igniteui.com/help/api",
			link, href, links;

		links = container.find('a[href]');
		for (var i = 0; i < links.length; i++) {
			link = links.eq(i);
			href = link.attr("href");
			if(apiLinkReg.test(href)) {
				link.attr("href", href.replace(apiLinkReg, replacePattern));
			}

		}
	}
	//register and self-execute
	if (igViewer && igViewer.renderingService) {
		igViewer.renderingService.contentFilters.push(apiLinkFilter);
	}
	apiLinkFilter($(igViewer.common.contentContainerId));

}(jQuery, window, window.igViewer));