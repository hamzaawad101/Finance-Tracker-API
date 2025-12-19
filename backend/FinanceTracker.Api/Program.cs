using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using FinanceTracker.Api.Services;
using FinanceTracker.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure MongoDBSettings from appsettings.json
builder.Services.Configure<MongoDBSettings>(
    builder.Configuration.GetSection("MongoDBSettings"));

// Register MongoDbService with proper DI
builder.Services.AddSingleton<MongoDbService>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<MongoDBSettings>>();
    return new MongoDbService(settings);
});
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173") // React dev server
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
var app = builder.Build();


// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseMiddleware<TransactionAuthMiddleware>();
app.MapControllers();


app.Run();
