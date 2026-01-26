(function (window, $) {

    var $window = $(window),
        $footer = $('footer.footerArea'),
        $topButton = $('.top-button');

    var common = {
         
        contentContainerId: '#document-content-container',

        contentElementId: '#document-content',

        scrollToTop: function () {
            $('html, body').animate({ scrollTop: 0 }, 'fast');
        },

        adjustTopLinkPos: function () {
            var scrollPos = $window.height() + $window.scrollTop();
            var footerTop = $footer.offset().top;
            if (scrollPos > footerTop) {
                $topButton.css({ position: "absolute" });
            }
            else {
                $topButton.css({ position: "fixed" });
            }
        }
    };

  
    if ( $topButton.length ) {
        $topButton.children('button').click(function (e) {
            common.scrollToTop();
            this.blur();
        });
        common.adjustTopLinkPos();
        $window.scroll(common.adjustTopLinkPos);
    }
    
     $(function () {
        //tabs:
        $('<div>', { id: 'Syntax-VBAll' }).append($('#Syntax-VB')).append('&nbsp;').append($('#Syntax-VBUsage')).appendTo('.TabContainer');
        var $tabContainer = $(".TabContainer");
        if($tabContainer.length) {
            $tabContainer.tabs({
                /* code below works with old 1.8 API and 1.10 */
                selected: 1, //1.8
                active: 1
            }).on( 'tabsshow tabsactivate', function (event, ui) {
                var tab = ui.tab ? $(ui.tab) : ui.newTab.children('a');
                if (tab.attr('href') == "#Syntax-CS") {
                    $("div.FilteredContentCS").show();
                    $("div.FilteredContentVB").hide()
                }
                else {
                    $("div.FilteredContentCS").hide();
                    $("div.FilteredContentVB").show()
                }
            });
            // Ensure tabs class for styling in older jQuery versions
            $tabContainer.children("ul").find("a").addClass( "ui-tabs-anchor" );
        }
    });
    
}(window, jQuery));

