var Connection = require('tedious').Connection;
var Request = require('tedious').Request;

/**
 * https://docs.microsoft.com/en-us/sql/connect/node-js/step-3-proof-of-concept-connecting-to-sql-using-node-js
 */
module.exports = {
    get: function(options, done) {
        var connectionString = options["connectionString"].split(";").filter(x => x);
        var productId = options["productId"];
        var connectionConfig = {};

        var query = `
            USE [CustomerGuidance.Database]
            
            SELECT
                [ComponentID]
                ,[Component].[Name] AS [ControlName]
                ,[ComponentGroup].[Name] AS [GroupName]
                ,[ComponentGroup].[NameJP] AS [GroupNameJP]
                ,[Component].[FriendlyName]
                ,[FriendlyNameJP]
                ,[GroupID]
                ,[ProductFamily].[Name] AS [ProductFamilyName]
            FROM 
                [Component]
            INNER JOIN [ComponentGroup] ON [ComponentGroup].[ComponentGroupID] = [Component].[GroupID]
            INNER JOIN [ProductFamily] ON [ProductFamily].[ProductFamilyID] = [Component].[ProductFamilyID]
                
            WHERE 
                [Component].[ProductFamilyID] = ${productId}`;

        // break down connectionString into settings
        connectionString = connectionString.reduce(function(map, str) {
            var pair = str.split("=");
            if (pair.length === 2) {
                map[ pair[0] ] = pair[1];
                return map;
            }
        }, {});

        connectionConfig["userName"] = connectionString["user id"];
        connectionConfig["password"] = connectionString["password"];
        connectionConfig["server"] = connectionString["data source"];
        connectionConfig["options"] = {};
        connectionConfig.options["database"] = connectionString["initial catalog"];

        var connection = new Connection(connectionConfig);  
        connection.on('connect', function(err) {
            if (err) {
                done(err);
                return;
            }
            // If no error, then good to proceed.
            executeStatement();
        });

        function executeStatement() {
            request = new Request(query, function(err) {  
                if (err) {
                    done("error");
                }
                connection.close();
            });
            var result = [];
            request.on('row', function(columns) {
                var row = {};
                columns.forEach(function(column) {
                    row[column.metadata.colName] = column.value;
                });
                /* Result objects like:
                public class ControlInfo
                {
                    public int ComponentID { get; set; }
                    public string ControlName { get; set; }
                    public string GroupName { get; set; }
                    public string GroupNameJP { get; set; }
                    public string FriendlyName { get; set; }
                    public string FriendlyNameJP { get; set; }
                    public int? GroupID { get; set; }
                    public string ProductFamilyName { get; set; }
                }
                */
                result.push(row);
            });
    
            /**
             * http://tediousjs.github.io/tedious/api-request.html#event_done
             * "If you are using execSql then SQL server may treat the multiple calls with the same query as a stored procedure.
             * When this occurs, the doneProc or doneInProc events may be emitted instead. "
             */
            request.on('done', function(rowCount, more, rows) {
                done(null, result);
            });

            request.on('doneProc', function(rowCount, more, rows) {
                if (!more) {
                    done(null, result);
                }
            });
            connection.execSql(request);
        } 
    }
}