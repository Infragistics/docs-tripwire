using Dapper;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Threading.Tasks;
using System.Linq;

namespace CustomerGuidanceService
{
    public class CustomerGuidanceRepository
    {
        public async Task<object> Get(object input)
        {
            var config = (IDictionary<string, object>)input;
            if (config == null) throw new ArgumentException("config parameter is null");

            var connectionString = (string)config["connectionString"];
			var productId = (string)config["productId"];
            if (string.IsNullOrEmpty(connectionString)) throw new ArgumentException("connectionStrings is empty");
			if (string.IsNullOrEmpty(productId)) throw new ArgumentException("productId is empty");

			return await GetWithConnectionString(connectionString, productId);
        }
        public async Task<IList<ControlInfo>> GetWithConnectionString(string connectionString, string productId)
        {
            string query = @"
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
	[Component].[ProductFamilyID] = " + productId;

            using (var connection = new SqlConnection(connectionString))
            {
                connection.Open();
                IEnumerable<ControlInfo> controls = await (connection.QueryAsync<ControlInfo>(query));
                return controls.ToList();
            }
        }
    }
}