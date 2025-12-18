using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;

namespace FinanceTracker.Api.Models
{
    public class Transaction
    {
        [BsonId]
        [BsonRepresentation(BsonType.String)]
        public string Id { get; set; } = string.Empty;

        public TransactionType Type { get; set; }
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
    }

    public enum TransactionType
    {
        Rent,
        Groceries,
        Entertainment
    }
}
