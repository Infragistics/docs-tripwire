using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using Tripwire.Domain;

namespace Tripwire.Test
{
    [TestClass]
    public class TopicFeedbackRepositoryTests
    {
        [TestMethod]
        public void AddFeedback_inserts_data_to_database()
        {
            string connectionString = "Data Source=(local);Initial Catalog=CustomerFeedback;Integrated Security=True;";
            TopicFeedbackRepository repository = new TopicFeedbackRepository(connectionString);

            int id = repository.AddRating(false, "awesome-customer", "reportplus", "ios", "5.0", "en", "http://www.infragistics.com/help/reportplus/android/getting-started");
            Assert.IsNotNull(id);
        }

        [TestMethod]
        public void AddFeedback_updates_comments_in_the_database()
        {
            string connectionString = "Data Source=(local);Initial Catalog=CustomerFeedback;Integrated Security=True;";
            TopicFeedbackRepository repository = new TopicFeedbackRepository(connectionString);
            
            int id = repository.AddRating(false, "awesome-customer", "reportplus", "ios", "5.0", "en", "http://www.infragistics.com/help/reportplus/android/getting-started");
            repository.AddFeedback(id, "this IS super awesome content");
        }
    }
}
