using CustomerGuidanceService;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TaskTests
{
    [TestClass]
    public class CustomerGuidanceRepositoryTests
    {
        private string _connectionString = @"data source=db2.staging.infragistics.local;initial catalog=CustomerGuidance.Database;user id=WebStagingUser;password=bl@uel@bel;multipleactiveresultsets=True;";

        [TestMethod]
        public void Get_with_Dictionary_connection_string_returns_data()
        {
            var repository = new CustomerGuidanceRepository();

            IDictionary<string, object> config = new Dictionary<string, object>();

            config.Add("connectionString", _connectionString);

            Task<object> task = repository.Get(config);

            IList<ControlInfo> result = task.Result as IList<ControlInfo>;

            Assert.IsTrue(result.Count() > 0);
        }

        [TestMethod]
        public void Get_with_direct_connection_string_returns_data()
        {
            var repository = new CustomerGuidanceRepository();

            Task<IList<ControlInfo>> task = repository.GetWithConnectionString(_connectionString, "16");

            IEnumerable<ControlInfo> result = task.Result;

            Assert.IsTrue(result.Count() > 0);
        }
    }
}