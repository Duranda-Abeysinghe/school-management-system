namespace SchoolManagementAPI.DTOs;

// Used by POST /api/students/with-account
// Creates both a Users row (login account) and a Students row in one transaction.
public class StudentWithAccountDto
{
    public string    FullName      { get; set; } = "";
    public string    Email         { get; set; } = "";
    public string    Password      { get; set; } = "";   // saved hashed to Users table
    public string?   Phone         { get; set; }
    public string?   Gender        { get; set; }
    public DateTime? DateOfBirth   { get; set; }
    public string?   Address       { get; set; }
    public string?   ParentName    { get; set; }
    public string?   ParentContact { get; set; }
    public int?      ClassId       { get; set; }
    public int?      AcademicYear  { get; set; }
}