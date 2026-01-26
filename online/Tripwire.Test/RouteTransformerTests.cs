using Microsoft.VisualStudio.TestTools.UnitTesting;
using Tripwire.Domain;

namespace Tripwire.Test
{
    [TestClass]
    public class RouteTransformerTests
    {
        const string ORIG = "http://help.infragistics.com/doc/jQuery/2014.1/CLR4.0/?page=jQuery_NA_jQuery.html";

        [TestMethod]
        public void Transform_does_not_return_an_empty_string()
        {
            var transformer = new RouteTransformer();
            var result = transformer.Transform("some-route");

            Assert.IsTrue(!string.IsNullOrEmpty(result));
        }

        [TestMethod]
        public void Transform_returns_original_string_if_no_transforms_are_performed()
        {
            var transformer = new RouteTransformer();
            var orig = "some-route";
            var result = transformer.Transform(orig);

            Assert.AreEqual(orig, result);
        }

        [TestMethod]
        public void Transform_turns_underscores_to_dashes()
        {
            var transformer = new RouteTransformer();
            var result = transformer.Transform(ORIG);

            Assert.IsTrue(!result.Contains("_"));
        }

        [TestMethod]
        public void Transform_removes_file_extension()
        {
            var transformer = new RouteTransformer();
            var result = transformer.Transform(ORIG);

            Assert.IsTrue(!result.Contains(".html"));
            Assert.IsTrue(!result.Contains(".htm"));
        }

        [TestMethod]
        public void Transform_removes_querystring_parameter()
        {
            var transformer = new RouteTransformer();
            var result = transformer.Transform(ORIG);

            Assert.IsTrue(!result.Contains("?page="));
        }
    }
}