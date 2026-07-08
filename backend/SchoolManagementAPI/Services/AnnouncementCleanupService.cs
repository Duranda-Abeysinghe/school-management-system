using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SchoolManagementAPI.Data;

namespace SchoolManagementAPI.Services;

/// <summary>
/// Background service that automatically deletes old announcements on startup.
/// Runs once when the application starts.
/// </summary>
public class AnnouncementCleanupService : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AnnouncementCleanupService> _logger;
    private const int DaysToKeep = 30; // Keep announcements for 30 days

    public AnnouncementCleanupService(IServiceProvider serviceProvider, ILogger<AnnouncementCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                // Calculate cutoff date (30 days ago)
                var cutoffDate = DateTime.Now.AddDays(-DaysToKeep);

                // Find old announcements
                var oldAnnouncements = dbContext.Announcements
                    .Where(a => a.CreatedAt < cutoffDate)
                    .ToList();

                if (oldAnnouncements.Any())
                {
                    _logger.LogInformation($"🗑️ Deleting {oldAnnouncements.Count} announcements older than {DaysToKeep} days");
                    
                    dbContext.Announcements.RemoveRange(oldAnnouncements);
                    await dbContext.SaveChangesAsync(cancellationToken);
                    
                    _logger.LogInformation($"✅ Successfully deleted {oldAnnouncements.Count} old announcements");
                }
                else
                {
                    _logger.LogInformation($"✅ No old announcements to delete (keeping last {DaysToKeep} days)");
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError($"❌ Error during announcement cleanup: {ex.Message}");
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
