(function (window) {

    var location = window.location.href;

    var redirects = {
"reportplus/data-visualizations#BulletGraphGauge": "reportplus/gauge-views#bulletgraphgauge", 
"reportplus/data-visualizations#ChartsVisualizations": "reportplus/chart-views", 
"reportplus/data-visualizations#CircularGauge": "reportplus/gauge-views#circulargauge", 
"reportplus/data-visualizations#GridView": "reportplus/grid-view", 
"reportplus/data-visualizations#HeatMapView": "reportplus/heat-map", 
"reportplus/data-visualizations#LinearGauge": "reportplus/gauge-views#lineargauge", 
"reportplus/data-visualizations#MapView": "reportplus/map-view", 
"reportplus/data-visualizations#TextGauge": "reportplus/gauge-views#textgauge", 
"reportplus/data-visualizations#TextView": "reportplus/text-view", 
"reportplus/data-visualizations#TreeMapView": "reportplus/tree-map", 
"reportplus/data-visualizations#WebView": "reportplus/web-view", 
//"reportplus/diy-visualization": "reportplus/do-it-yourself-visualization", // removed per request from L.R.
"reportplus/data-filters#_widget_editor": "reportplus/widget-editor", 
"reportplus/how-to-configure-data-sources#ExcelCSVGoogleSheets": "reportplus/excel-sheets-csv", 
"reportplus/dashboard-creating-process": "reportplus/dashboard-creation-process", 
"reportplus/dashboard-creating-process#_creating_a_new_data_source_connection": "reportplus/creating-new-datasource", 
"reportplus/configuration-settings#DashboardSettings": "reportplus/configuration-settings#dashboardsettings", 
"reportplus/getting-started#_view_edit_modes": "reportplus/getting-started#vieweditmodes", 
"reportplus/export-options": "reportplus/export-dashboards", 
"reportplus/dashboard-filters-and-binding#BindingSettings": "reportplus/widget-binding", 
"reportplus/getting-started#_opening_navigating_dashboards": "reportplus/getting-started#openingnavigatingdashboards", 
"reportplus/advanced-data-sources-configuration#WorkingwithCSVs": "reportplus/excel-sheets-csv#advanced-config-csv", 
"reportplus/advanced-data-sources-configuration#WorkingWithExcelandGoogleSheets": "reportplus/excel-sheets-csv#advanced-config-eg", 
"reportplus/advanced-data-sources-configuration#WorkingWithFacebook": "reportplus/facebook#advanced-config", 
"reportplus/advanced-data-sources-configuration#WorkingWithGoogleAnalytics": "reportplus/google-analytics#advanced-config", 
"reportplus/advanced-data-sources-configuration#WorkingWithMicrosoftReportingServices": "reportplus/microsoft-reporting-services#advanced-config", 
"reportplus/advanced-data-sources-configuration#WorkingWithTwitter": "reportplus/twitter#advanced-config", 
"reportplus/configuration-settings#WidgetGeneralSettings": "reportplus/configuration-settings#widgetgeneralsettings"
    };

    if (/help\/reportplus/i.test(location)) {
        var matches = location.match(/(https?:\/\/(localhost:[0-9]{2,6}|(jp\.)?(www|dev|staging)\.infragistics\.(com|local))\/help\/)(.+)/i)
            , key
            , base
        ;

        if (matches && matches.length >= 6) {
            key = matches[matches.length - 1];
            base = matches[1];

            if (redirects[key]) {
                window.location.href = base + redirects[key];
            }
        }
    }
} (window));