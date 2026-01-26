using System;
using System.Data;
using System.Data.SqlClient;
using System.Text;
using System.Text.RegularExpressions;

namespace Tripwire.Domain
{
    public class TopicFeedbackRepository
    {
        private string _connectionString = string.Empty;

        public TopicFeedbackRepository(string connectionString)
        {
            this._connectionString = connectionString;
        }

        private void AddCommandParameter(object value, string name, SqlCommand command)
        {
            this.AddCommandParameter(value, name, command, SqlDbType.VarChar);
        }

        private void AddCommandParameter(object value, string name, SqlCommand command, SqlDbType type)
        {
            SqlParameter parameter = new SqlParameter("@" + name, value);

            if (name.IndexOf("_JP") > -1)
            {
                parameter.LocaleId = 1041; // Japanese
            }

            command.Parameters.Add(parameter);
        }

        private string GetPageUrl(string url)
        {
            // strip all forms of dev, staging and production domains
            return Regex.Replace(url, @"https?:\/\/(.*)\/help\/", "");
        }

        public void AddFeedback(int id, string comments)
        {
            this.Update(id, comments);
        }

        public int AddRating(bool isPositiveRating, string userName, string product, string platform, string version, string culture, string url)
        {
            return this.Insert(isPositiveRating, userName, product, platform, version, culture, url);
        }

        private void Update(int id, string comments)
        {
            bool hasComments;
            StringBuilder builder;
            SqlCommand command;
            SqlConnection connection;

            command = new SqlCommand();

            bool isJapanese = Regex.IsMatch(comments, "[ぁ-ゔゞァ-・ヽヾ゛゜ー]");

            hasComments = !(string.IsNullOrEmpty(comments) || string.IsNullOrWhiteSpace(comments));

            if (hasComments)
            {
                builder = new StringBuilder();

                builder.Append("UPDATE [dbo].[TopicFeedback]");
                builder.Append(" SET ");

                string name = isJapanese? "Comments_JP" : "Comments_EN";

                builder.Append("[" + name + "] = @" + name);


                if (isJapanese)
                {
                    this.AddCommandParameter(comments, name, command, SqlDbType.NVarChar);
                }
                else
                {
                    this.AddCommandParameter(comments, name, command, SqlDbType.NVarChar);
                }

                this.AddCommandParameter(id, "Id", command, SqlDbType.Int);

                builder.Append(" WHERE ");
                builder.Append("[Id] = @Id");

                command.CommandType = CommandType.Text;
                command.CommandText = builder.ToString();

                connection = new SqlConnection(this._connectionString);
                command.Connection = connection;

                connection.Open();
                command.ExecuteNonQuery();
                connection.Close();
            }
        }

        private int Insert(bool isPositiveRating, string userName, string product, string platform, string version, string culture, string url)
        {
            bool hasPlatform;
            bool hasUserName;
            bool hasPageUrl;

            StringBuilder builder;
            SqlCommand command;
            SqlConnection connection;
            string pageUrl;

            pageUrl = this.GetPageUrl(url);

            hasPlatform = !(string.IsNullOrEmpty(platform) || string.IsNullOrWhiteSpace(platform));
            hasUserName = !(string.IsNullOrEmpty(userName) || string.IsNullOrWhiteSpace(userName));
            hasPageUrl = pageUrl != string.Empty;

            builder = new StringBuilder();

            builder.Append("INSERT INTO [dbo].[TopicFeedback] (");
            builder.Append("IsPositiveRating,");

            if (hasUserName)
            {
                builder.Append("UserName,");
            }

            builder.Append("Product,");

            if (hasPlatform)
            {
                builder.Append("Platform,");
            }

            builder.Append("Version,");
            builder.Append("Culture,");
            builder.Append("RawUrl,");

            if (hasPageUrl)
            {
                builder.Append("PageUrl,");
            }

            builder.Append("InsertDate");
            builder.Append(") VALUES (");
            builder.Append("@IsPositiveRating,");

            if (hasUserName)
            {
                builder.Append("@UserName,");
            }

            builder.Append("@Product,");

            if (hasPlatform)
            {
                builder.Append("@Platform,");
            }

            builder.Append("@Version,");
            builder.Append("@Culture,");
            builder.Append("@RawUrl,");

            if (hasPageUrl)
            {
                builder.Append("@PageUrl,");
            }

            builder.Append("@InsertDate); ");
            builder.Append("SELECT SCOPE_IDENTITY() AS Id");

            command = new SqlCommand();
            command.CommandType = CommandType.Text;
            command.CommandText = builder.ToString();

            this.AddCommandParameter(isPositiveRating, "IsPositiveRating", command, SqlDbType.Bit);

            if (hasUserName)
            {
                this.AddCommandParameter(userName, "UserName", command);
            }

            this.AddCommandParameter(product, "Product", command);

            if (hasPlatform)
            {
                this.AddCommandParameter(platform, "Platform", command);
            }

            this.AddCommandParameter(version, "Version", command);
            this.AddCommandParameter(culture, "Culture", command);
            this.AddCommandParameter(url, "RawUrl", command);
            this.AddCommandParameter(pageUrl, "PageUrl", command);
            this.AddCommandParameter(DateTime.Now, "InsertDate", command, SqlDbType.DateTime);

            connection = new SqlConnection(this._connectionString);
            command.Connection = connection;

            connection.Open();
            int id = Convert.ToInt32(command.ExecuteScalar());
            connection.Close();

            return id;
        }
    }
}