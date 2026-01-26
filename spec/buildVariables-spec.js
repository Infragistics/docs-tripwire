const buildVariables = require('../tasks/transforms/postConversionRules/buildVariables.js');
const productConfigurationReader = require('../tasks/productConfigurationReader.js');

var configPath = './spec/data/DocsConfig.xml';

productConfigurationReader.getConfiguration(configPath).then((productConfiguration, error) => {

    var variables = productConfiguration.variables;

    describe('buildVariables', () => {

        describe('replace', () => {
            
            it('replaces correct values for WPF', () => {
                var source = `= This is a test\n\n{PlatformIDE} {InstallPath}
                {GeoMapLink}`;
                var expected = `= This is a test\n\nVisual Studio 2013-2015 C:\\Program Files (x86)\\Infragistics\\2016.2\\WPF
                InfragisticsWPF4.Controls.Maps.XamGeographicMap.v16.2~Infragistics.Controls.Maps`;

                var replaced = buildVariables.replace(source, { variables: variables['wpf'] });
                expect(replaced).toEqual(expected);
            });        

            it('replaces correct values for Android', () => {
                var source = `= This is a test\n\n{PlatformIDE} {InstallPath}
                {GeoMapLink}`;
                var expected = `= This is a test\n\nAndroid Studio v1.3.2 C:\\Program Files (x86)\\Infragistics\\2016.2\\Android
                Infragistics.GeographicMap~com.infragistics.controls`;

                var replaced = buildVariables.replace(source, { variables: variables['android'] });
                expect(replaced).toEqual(expected);
            });

            it('replaces DataChartLink and ApiProp', () => {
                var source, expected, actual;

                source = '{DataChartLink}.Axis{ApiProp}CrossingAxis.html';

                // wpf
                expected = 'InfragisticsWPF4.Controls.Charts.XamDataChart.v16.2~Infragistics.Controls.Charts.Axis~CrossingAxis.html';
                actual = buildVariables.replace(source, { variables: variables['wpf'] });
                expect(actual).toEqual(expected);

                // win-forms
                expected = 'Infragistics4.Win.DataVisualization.UltraDataChart.v16.2~Infragistics.Win.DataVisualization.Axis~CrossingAxis.html';
                actual = buildVariables.replace(source, { variables: variables['win-forms'] });
                expect(actual).toEqual(expected);

                // win-universal
                expected = 'InfragisticsUWP.Controls.Charts.XamDataChart.v16.2~Infragistics.Controls.Charts.Axis~CrossingAxis.html';
                actual = buildVariables.replace(source, { variables: variables['win-universal'] });
                expect(actual).toEqual(expected);

                // xamarin-forms
                expected = 'InfragisticsXF.Controls.Charts~Infragistics.XF.Controls.Axis~CrossingAxis.html';
                actual = buildVariables.replace(source, { variables: variables['xamarin'] });
                expect(actual).toEqual(expected);

                // android
                expected = 'Infragistics.DataChart~com.infragistics.controls.Axis~setCrossingAxis.html';
                actual = buildVariables.replace(source, { variables: variables['android'] });
                expect(actual).toEqual(expected);
            });

            it('replaces DataChartLink and ApiProp', () => {
                var source, expected, actual;

                source = '{DataChartLink}.{DataChartName}{ApiProp}HorizontalZoomable.html';

                // wpf
                expected = 'InfragisticsWPF4.Controls.Charts.XamDataChart.v16.2~Infragistics.Controls.Charts.XamDataChart~HorizontalZoomable.html';
                actual = buildVariables.replace(source, { variables: variables['wpf'] });
                expect(actual).toEqual(expected);

                // win-forms
                expected = 'Infragistics4.Win.DataVisualization.UltraDataChart.v16.2~Infragistics.Win.DataVisualization.UltraDataChart~HorizontalZoomable.html';
                actual = buildVariables.replace(source, { variables: variables['win-forms'] });
                expect(actual).toEqual(expected);

                // win-universal
                expected = 'InfragisticsUWP.Controls.Charts.XamDataChart.v16.2~Infragistics.Controls.Charts.XamDataChart~HorizontalZoomable.html';
                actual = buildVariables.replace(source, { variables: variables['win-universal'] });
                expect(actual).toEqual(expected);

                // xamarin
                expected = 'InfragisticsXF.Controls.Charts~Infragistics.XF.Controls.XFDataChart~HorizontalZoomable.html';
                actual = buildVariables.replace(source, { variables: variables['xamarin'] });
                expect(actual).toEqual(expected);

                // android
                expected = 'Infragistics.DataChart~com.infragistics.controls.DataChartView~setHorizontalZoomable.html';
                actual = buildVariables.replace(source, { variables: variables['android'] });
                expect(actual).toEqual(expected);
            });
        });
    });
});