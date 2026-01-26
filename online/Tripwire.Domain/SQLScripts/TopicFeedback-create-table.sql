CREATE TABLE [dbo].[TopicFeedback] (
    [Id]				INT           IDENTITY (1, 1) NOT NULL,
    [IsPositiveRating]	BIT           NULL,
	[Comments_EN]		NVARCHAR (MAX) NULL,
	[Comments_JP]		NVARCHAR (MAX) NULL,
    [UserName]			VARCHAR (50)  NULL,
    [Product]			VARCHAR (50)  NULL,
    [Platform]			VARCHAR (50)  NULL,
    [Version]			VARCHAR (50)  NULL,
    [Culture]			VARCHAR (50)  NULL,
    [RawUrl]			VARCHAR (MAX) NULL,
	[PageUrl]			VARCHAR (MAX) NULL,
    [InsertDate]		DATETIME      NOT NULL
);