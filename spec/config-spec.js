const productConfigurationReader = require('../tasks/productConfigurationReader.js');

describe('productConfigurationReader', (done) => {

    var xml = '';
    var result;
    var configFilePath = './spec/data/DocsConfig.xml';

    describe('getConfiguration', (done) => {
        productConfigurationReader.getConfiguration(configFilePath).then((config, error) => {
            expect(error).not.toBeDefined();
            expect(config).toBeDefined();
        });
    });

    xml = productConfigurationReader.getXml(configFilePath);

    result = {};
    productConfigurationReader.read(xml).then((obj) => { 

        result.obj = obj;

        describe('getXml', () => {
            it('reads text from file system', () => {
                expect(xml.length).toBeGreaterThan(0);
            });
        });

        describe('read', () => {
            it('reads xml into a JavaScript object', () => {
                expect(result.error).not.toBeDefined();
                expect(result.obj).toBeDefined();
            });
        });

        describe('getConfigFromDefinition', () => {
            var configuration = productConfigurationReader.getConfigFromDefinition(result.obj);

            it('should have buildFlags defined', () => {
                expect(configuration.buildFlags).toBeDefined();
                expect(configuration.buildFlags.length).toBeGreaterThan(0);
                expect(configuration.buildFlags[0].color).toBeDefined();
                expect(configuration.buildFlags[0].id).toBeDefined();
                expect(configuration.buildFlags[0].isObsolete).toBeDefined();
                expect(configuration.buildFlags[0].purpose).toBeDefined();
            });

            it('should have products defined', () => {
                expect(configuration.products).toBeDefined();
                expect(configuration.products.wpf.isObsolete).toBeDefined();
                expect(configuration.products.wpf.buildFlags).toBeDefined();
            });

            it('should have variables defined', () => {
                expect(configuration.variables).toBeDefined();
                expect(configuration.variables['win-forms']).toBeDefined();
                expect(configuration.variables['asp-net']).toBeDefined();
                expect(configuration.variables.wpf).toBeDefined();

                expect(configuration.variables.wpf.ProductVersion).toBeDefined();
                expect(configuration.variables.wpf.PlatformName).toBeDefined();

                expect(configuration.variables.sl).not.toBeDefined();
                expect(configuration.variables['win-phone']).not.toBeDefined();
                expect(configuration.variables['winrt']).not.toBeDefined();
            });
        });
    });
});