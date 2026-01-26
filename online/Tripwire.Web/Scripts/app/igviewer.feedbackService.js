(function (window, $) {

    var LOCAL_STORAGE_KEY = '_ig.8f265d97-d530-4452-94a5-2e1dfc43148a';
    var MONTH_DIFFERENCE = 1000 * 60 * 60 * 24 * 30;
    var DEFAULT_PRODUCT = 'igniteui';

    var $feedbackRatingSentMessage = {};
    var $feedbackCommentContainer = {};
    var $feedbackRatingMessage = {};
    var $feedbackButtonCancel = {};
    var $feedbackRating = {};
    var $feedbackButton = {};
    var $textbox = {};

    var svc = {

        latestVersion: 'unknown',
        culture: /jp\.(.*\.)?(infragistics|igniteui)/i.test(window.location.href) ? 'jp' : 'en',
        rating: null,
        id: null,
        feedback: {},
        isInitialized: false,

        text: {
            en: {
                title: 'Is this content useful?',
                button: 'Send Feedback',
                cancelButton: 'Cancel',
                positivePlaceholder: 'Please let us know what you like (optional)',
                negativePlaceholder: 'Please let us know what we can do better (optional)',
                ratingSent: 'Thank you for your feedback!',
                alreadyRated: 'Thank you for your feedback! You have rated this topic in the last 30 days.'
            },
            jp: {
                title: 'このコンテンツは役に立ちましたか？',
                button: 'フィードバックを送信',
                cancelButton: 'キャンセル',
                positivePlaceholder: 'このトピックで役に立った点をお知らせください。(オプション)',
                negativePlaceholder: 'このトピックの改善点があればお知らせください。(オプション)',
                ratingSent: '貴重なご意見ありがとうございました。',
                alreadyRated: 'ご意見ありがとうございました。あなたはこのトピックを過去 30日以内に評価しています。'
            }
        },

        getText: function(){
            return svc.text[svc.culture];
        },

        getFeedbackInfo: function (location, latestVersion) {
            var   version = latestVersion
                , product = DEFAULT_PRODUCT
                , platform = null
                , versionPattern = /[0-9]{2,4}\.[0-9]/i
            ;

            var productMatches = /help\/(.*)\//.exec(location);
            if (productMatches && productMatches.length >= 2) {
                var products = productMatches[1].split('/');
                product = products[0];
                platform = versionPattern.test(products[1]) ? '' : products[1];
            }

            var versionMatches = /\?v=(..?\..)/i.exec(location);
            if (versionMatches && versionMatches.length >= 2) {
                version = versionMatches[1];
            }
            
            versionMatches = versionPattern.exec(location);
            if (versionMatches && versionMatches.length >= 1) {
                version = versionMatches[0];
            }

            return {
                product: product,
                platform: platform,
                version: version
            };
        },

        canRateThisPage: function () {
            var returnValue = true;
            var key = svc.urlToKey(window.location.href);

            if (svc.feedback[key]) {
                var lastRatingDate = svc.feedback[key].date;

                if (lastRatingDate) {
                    lastRatingDate = new Date(lastRatingDate);
                } else {
                    lastRatingDate = new Date().setYear((new Date()).getYear() + 1);
                }

                var difference = (new Date()) - lastRatingDate;

                returnValue = difference >= MONTH_DIFFERENCE;
            }

            return returnValue;
        },

        feedbackValue: function () {
            var key = svc.urlToKey(window.location.href);
            return svc.feedback[key].value;
        },

        changePage: function () {

            $feedbackRatingSentMessage.hide();
            $feedbackCommentContainer.hide();
            $feedbackRatingMessage.hide();

            if (!svc.isInitialized) {
                svc.preInit();
            }

            svc.rating = null;
            svc.id = null;

            $('.feedback-rating-selected').removeClass('feedback-rating-selected');

            if (!svc.canRateThisPage()) {
                $('.feedback-rating[data-value=' + svc.feedbackValue() + ']').addClass('feedback-rating-selected');
            }
        },

        localize: function () {
            var text = svc.getText();
            $('.feedback-title').text(text.title);
            $('#feedback-rating-message').text(text.alreadyRated);
            $('#feedback-rating-sent-message').text(text.ratingSent);
            $feedbackButtonCancel.text(text.cancelButton);
            $feedbackButton.text(text.button);
        },

        getHash: function (value) {
            var hash = 0, i = 0, len = value.length, chr;
            while (i < len) {
                hash = ((hash << 5) - hash + value.charCodeAt(i++)) << 0;
            }
            hash = (hash + 2147483647) + 1
            return hash;
        },

        urlToKey: function(url) {
            url = url.replace(/\/|~|\.|:|-|_/g, '');
            return svc.getHash(url);
        },

        preInit: function () {
            if (window.localStorage[LOCAL_STORAGE_KEY]) {
                svc.feedback = JSON.parse(window.localStorage[LOCAL_STORAGE_KEY]);
            } else {
                svc.feedback = {};
            }
        },

        getRating: function () {
            var url = window.location.href;
            var feedbackInfo = svc.getFeedbackInfo(url, svc.latestVersion);

            return {
                isPositiveFeedback: svc.rating,
                product: feedbackInfo.product,
                platform: feedbackInfo.platform,
                version: feedbackInfo.version,
                culture: svc.culture,
                url: url
            };
        },

        saveFeedbackOnClient: function () {
            var key = svc.urlToKey(window.location.href);

            if (!svc.feedback[key]) {
                svc.feedback[key] = {};
            }

            svc.feedback[key].value = svc.rating;
            svc.feedback[key].date = new Date();
            window.localStorage[LOCAL_STORAGE_KEY] = JSON.stringify(svc.feedback);
        },

        sendFeedbackToServer: function (feedback) {
            $.get('/help/apis/topicfeedback/add', feedback);
        },

        init: function (latestVersion) {
            svc.preInit();
            svc.latestVersion = latestVersion;
            svc.isInitialized = true;
        }
    };

    $(function () {

        $feedbackRatingSentMessage = $('#feedback-rating-sent-message');
        $feedbackCommentContainer = $('.feedback-comment-container');
        $feedbackRatingMessage = $('#feedback-rating-message');
        $feedbackButtonCancel = $('#feedback-button-cancel');
        $feedbackRating = $('.feedback-rating');
        $feedbackButton = $('#feedback-button');
        $textbox = $('#feedback-textbox');

        $feedbackButtonCancel.click(function () {
            svc.rating = null;
            $('.feedback-comment-container').fadeOut();
        });

        $feedbackRating.click(function (e) {
            var $rating = $(e.currentTarget);

            if (svc.canRateThisPage()) {

                svc.rating = /true/i.test($rating.data('value'));

                var rating = svc.getRating();
                $.get('/help/apis/topicfeedback/addrating', rating)
                    .done(function (id) {
                        svc.id = id;
                        svc.saveFeedbackOnClient();
                    }).fail(function (error) {
                        console.log(error);
                    });

                $('.feedback-rating-selected').removeClass('feedback-rating-selected');
                $rating.addClass('feedback-rating-selected');

                var placeholder = svc.rating ? svc.getText().positivePlaceholder : svc.getText().negativePlaceholder;
                $textbox.attr('placeholder', placeholder);

                $('.feedback-comment-container').fadeIn();

            } else {
                $feedbackRatingSentMessage.hide();
                $feedbackRatingMessage.fadeIn(function () {
                    setTimeout(function () {
                        $feedbackRatingMessage.fadeOut();
                    }, 5000);
                });
            }
        });

        $feedbackButton.click(function () {
            var comments = $textbox.val();
            if (comments.length > 0) {

                var feedback = {
                    id: svc.id,
                    comments: comments
                };

                $.get('/help/apis/topicfeedback/addfeedback', feedback)
                    .fail(function (error) {
                        console.log(error);
                    });
            }

            svc.rating = null;
            svc.id = null;

            $('.feedback-comment-container').fadeOut(function () {
                $textbox.val('');

                $feedbackRatingSentMessage.fadeIn(function () {
                    setTimeout(function () {
                        $feedbackRatingSentMessage.fadeOut();
                    }, 5000);
                });
            });
        });

        svc.localize();

        svc.changePage();
    });

    window.igViewer = window.igViewer || {};
    window.igViewer.feedbackService = svc;

}(window, jQuery));