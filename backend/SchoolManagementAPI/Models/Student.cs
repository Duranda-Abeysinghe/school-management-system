using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace SchoolManagementAPI.Models;

public class Student
{
    [Key]
    public int Id { get; set; }

    [MaxLength(20)]
    public string? AdmissionNo { get; set; }

    [Required, MaxLength(100)]
    public string FullName { get; set; } = "";

    [Required, MaxLength(100)]
    public string Email { get; set; } = "";

    [MaxLength(20)]
    public string Phone { get; set; } = "";

    [MaxLength(10)]
    public string Gender { get; set; } = "";

    public DateTime? DateOfBirth { get; set; }

    public string? Address { get; set; }

    [MaxLength(100)]
    public string ParentName { get; set; } = "";

    [MaxLength(20)]
    public string ParentContact { get; set; } = "";

    [MaxLength(10)]
    public string Status { get; set; } = "Active";

    public int? ClassId { get; set; }

    [ForeignKey("ClassId")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public Class? Class { get; set; }

    public int? UserId { get; set; }

    [ForeignKey("UserId")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public User? User { get; set; }

    public DateTime JoinDate { get; set; } = DateTime.Now;

    // INT not YEAR — avoids MySQL YEAR type mapping issues with EF Core
    public int? AcademicYear { get; set; }
}