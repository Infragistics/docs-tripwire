(function ($, window) {

    var $versionSelectorLabel,
        $versionSelectorCurrentLabel,
        $versionSelector,
        $selectorCombo;

    var svc = {

        versions: [],

        replaceVersion: function(oldVersion, newVersion) {
            var info = igViewer.common.getPageInfo(null, null, null, newVersion);
            return info.path.navigation;
        },

        loadPublishedVersions: function () {
            var $body = $('body');
            var versions = $body.attr('data-versions');
            versions = versions.split(',');

            svc.versions = [];
            $.each(versions, function (i, val) {
                svc.versions.push({ key: val, value: val });
            });
        },

        isLatestVersion: function (version) {
            return version === svc.versions[0].value;
        },

        getLatestVersion: function () {
            return svc.versions[0].value;
        },

        getSelectedVersion: function () {

            var   currentVersion = igViewer.common.getCurrentVersion()
                , latestVersion = svc.getLatestVersion()
            ;

            currentVersion = currentVersion ? currentVersion : latestVersion;

            if (svc.isLatestVersion(currentVersion)) {
                currentVersion += ' (' + igViewer.locale.latestLabel + ')';
            }

            return currentVersion;
        },

        navigateToSelectedVersion: function (newVersion) {
            var   newLocation
                , currentVersion
            ;

            // todo: test hash locations
            currentVersion =  igViewer.common.getCurrentVersion();
            newLocation = svc.replaceVersion(currentVersion, newVersion);

            newLocation = newLocation.replace(/home-page\/?/i, '');

            window.location.href = newLocation;
        },

        init: function () {
            $versionSelector = $('#version-selector');
            $versionSelectorLabel = $('#version-selector-label');
            $versionSelectorCurrentLabel = $('#version-selector-current-label');
            $selectorCombo = $('#selector-combo');

            var timeout;

            svc.loadPublishedVersions();

            $versionSelectorCurrentLabel.text(svc.getSelectedVersion());

            // D.P. 18th May 2016 Bug 218313: Version could not be selected on iOS device
            // Prevent Fastclick synthetic click, old combo uses mouse events!
            $.ui.igCombo.prototype.css.listItem += " needsclick";

            $selectorCombo.igCombo({
                dataSource: svc.versions,
                valueKey: 'key',
                textKey: 'value',
                width: '75px',
                placeHolder: "",
                enableClearButton: false,
                autoSelectFirstMatch : false,
                //mode: "dropdown",
                selectionChanged: function (e, ui) {
                    if (ui.items.length > 0) {
                        svc.navigateToSelectedVersion(ui.items[0].data.value);
                    }
                },
                dropDownClosed: function (e, ui) {
                    timeout = setTimeout(function () {
                        $selectorCombo.fadeOut(150, function () {
                            $versionSelectorLabel.fadeIn(150);
                        });
                    }, 2000);
                },
                dropDownOpening: function () {
                    clearTimeout(timeout);
                }
            }).click(function (e) {
                e.stopPropagation();
            })
            .igCombo("value", igViewer.common.getCurrentVersion() || svc.getLatestVersion())
            .hide();

            $versionSelector.click(function (e) {
                $versionSelectorLabel.fadeOut(150, function () {
                    $selectorCombo.fadeIn(150, function () {
                    	$selectorCombo.igCombo("textInput").focus();
                    	$selectorCombo.igCombo("openDropDown");
                    });
                });
            });
        }
    };

    $(svc.init);

    window.igViewer = window.igViewer || {};
    window.igViewer.versionSelector = svc;

}(jQuery, window));