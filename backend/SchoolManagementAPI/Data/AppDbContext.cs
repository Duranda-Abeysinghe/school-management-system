using Microsoft.EntityFrameworkCore;
using SchoolManagementAPI.Models;

namespace SchoolManagementAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User>         Users         { get; set; }
    public DbSet<Student>      Students      { get; set; }
    public DbSet<Teacher>      Teachers      { get; set; }
    public DbSet<Class>        Classes       { get; set; }
    public DbSet<Subject>      Subjects      { get; set; }
    public DbSet<Attendance>   Attendance    { get; set; }
    public DbSet<Mark>         Marks         { get; set; }
    public DbSet<Schedule>     Schedules     { get; set; }
    public DbSet<Request>      Requests      { get; set; }
    public DbSet<Announcement> Announcements { get; set; }
    public DbSet<Donor>        Donors        { get; set; }
    public DbSet<DonorSchedule> DonorSchedules { get; set; }
    public DbSet<DonorFoodItem> DonorFoodItems { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Student>()
            .HasOne(s => s.Class)
            .WithMany(c => c.Students)
            .HasForeignKey(s => s.ClassId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<Class>()
            .HasOne(c => c.Teacher)
            .WithMany()
            .HasForeignKey(c => c.TeacherId)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<DonorSchedule>()
            .HasOne(s => s.Class1)
            .WithMany()
            .HasForeignKey(s => s.ClassId1)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<DonorSchedule>()
            .HasOne(s => s.Class2)
            .WithMany()
            .HasForeignKey(s => s.ClassId2)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<DonorSchedule>()
            .HasOne(s => s.Class3)
            .WithMany()
            .HasForeignKey(s => s.ClassId3)
            .OnDelete(DeleteBehavior.SetNull);

        modelBuilder.Entity<DonorSchedule>()
            .HasIndex(s => new { s.DonorId, s.Year, s.Month })
            .IsUnique();
    }
}